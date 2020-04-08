#include <napi.h>
#include <Windows.h>
#include <psapi.h>
#include <string>
#include <vector>
#include <iostream>
#include "utils.hpp"
#include <Shellapi.h>
#include <TlHelp32.h>
#include <iostream>

int g_waitCount = 5;

const WCHAR k_inject_dll[] = L"evevision_overlay.dll";

struct win_scope_handle
{
  HANDLE handle = nullptr;

  win_scope_handle(HANDLE h = nullptr)
      : handle(h)
  {
  }

  ~win_scope_handle()
  {
    ::CloseHandle(this->handle);
  }

  win_scope_handle &operator=(HANDLE h)
  {
    if (this->handle)
    {
      ::CloseHandle(this->handle);
    }
    this->handle = h;
    return *this;
  }

  operator bool() const
  {
    return !!handle;
  }
};

struct window_hook_info
{
  HWND hwnd;
  std::wstring title;
  DWORD processId;
  DWORD threadId;
  std::wstring exeName;
};

static inline bool file_exists(const std::wstring& file)
{
    WIN32_FILE_ATTRIBUTE_DATA findData;
    return 0 != ::GetFileAttributesEx(file.c_str(), GetFileExInfoStandard, &findData);
}


static bool check_window_valid(HWND window)
{
  DWORD styles, ex_styles;
  RECT rect;

  GetClientRect(window, &rect);
  styles = (DWORD)GetWindowLongPtr(window, GWL_STYLE);
  ex_styles = (DWORD)GetWindowLongPtr(window, GWL_EXSTYLE);

  if (ex_styles & WS_EX_TOOLWINDOW)
    return false;
  if (styles & WS_CHILD)
    return false;

  return true;
}

static inline HWND next_window(HWND window)
{
  while (true)
  {
    window = GetNextWindow(window, GW_HWNDNEXT);
    if (!window || check_window_valid(window))
      break;
  }

  return window;
}

static inline HWND first_window()
{
  HWND window = GetWindow(GetDesktopWindow(), GW_CHILD);
  if (!check_window_valid(window))
    window = next_window(window);
  return window;
}

static void get_window_title(std::wstring &name, HWND hwnd)
{
  int len = GetWindowTextLengthW(hwnd);
  if (!len)
    return;
  name.resize(len);
  GetWindowTextW(hwnd, const_cast<wchar_t *>(name.c_str()), len + 1);
}

static bool fill_window_info(window_hook_info &info, HWND hwnd)
{
  wchar_t wname[MAX_PATH];
  win_scope_handle process;
  DWORD processId = 0;
  DWORD threadId = GetWindowThreadProcessId(hwnd, &processId);
  if (!threadId)
    return false;

  if (threadId == GetCurrentProcessId())
    return false;

  process = ::OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, FALSE, processId);
  if (!process)
  {
    // std::cout << "err:" << GetLastError() << std::endl;
    return false;
  }

  if (!GetProcessImageFileNameW(process.handle, wname, MAX_PATH))
    return false;

  info.hwnd = hwnd;
  info.processId = processId;
  info.threadId = threadId;
  info.exeName = wname;

  get_window_title(info.title, hwnd);

  return true;
}

Napi::Value getTopWindows(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  bool include_minimized = true;

  std::vector<window_hook_info> windows;
  auto window = first_window();
  while (window)
  {
    window_hook_info info = {0};
    if (fill_window_info(info, window))
    {
      windows.push_back(info);
    }
    window = next_window(window);
  }

  auto arr = Napi::Array::New(env, windows.size());
  for (auto i = 0; i != windows.size(); ++i)
  {
    const auto &info = windows[i];
    auto infoObject = Napi::Object::New(env);

    infoObject.Set("windowId", Napi::Value::From(env, (std::uint32_t)(std::uint64_t)info.hwnd));
    infoObject.Set("processId", Napi::Value::From(env, (std::uint32_t)info.processId));
    infoObject.Set("threadId", Napi::Value::From(env, (std::uint32_t)info.threadId));
    infoObject.Set("title", Napi::Value::From(env, win_utils::toUtf8(info.title)));
    infoObject.Set("exeName", Napi::Value::From(env, win_utils::toUtf8(info.exeName)));
    arr.Set(i, infoObject);
  }

  return arr;
}

#ifndef MAKEULONGLONG
#define MAKEULONGLONG(ldw, hdw) ((ULONGLONG(hdw) << 32) | ((ldw)&0xFFFFFFFF))
#endif

#ifndef MAXULONGLONG
#define MAXULONGLONG ((ULONGLONG) ~((ULONGLONG)0))
#endif

DWORD getProcMainThreadId(DWORD dwProcID)
{
    DWORD dwMainThreadID = 0;
    ULONGLONG ullMinCreateTime = MAXULONGLONG;

    HANDLE hThreadSnap = CreateToolhelp32Snapshot(TH32CS_SNAPTHREAD, 0);
    if (hThreadSnap != INVALID_HANDLE_VALUE)
    {
        THREADENTRY32 th32;
        th32.dwSize = sizeof(THREADENTRY32);
        BOOL bOK = TRUE;
        for (bOK = Thread32First(hThreadSnap, &th32); bOK;
             bOK = Thread32Next(hThreadSnap, &th32))
        {
            if (dwMainThreadID == 0)
            {
                dwMainThreadID = th32.th32ThreadID;
            }
            if (th32.th32OwnerProcessID == dwProcID)
            {
                HANDLE hThread = OpenThread(THREAD_QUERY_INFORMATION,
                                            TRUE, th32.th32ThreadID);

                if (hThread)
                {
                    FILETIME afTimes[4] = {0};
                    if (GetThreadTimes(hThread,
                                       &afTimes[0], &afTimes[1], &afTimes[2], &afTimes[3]))
                    {
                        ULONGLONG ullTest = MAKEULONGLONG(afTimes[0].dwLowDateTime,
                                                          afTimes[0].dwHighDateTime);
                        if (ullTest && ullTest < ullMinCreateTime)
                        {
                            ullMinCreateTime = ullTest;
                            dwMainThreadID = th32.th32ThreadID; // let it be main... :)
                        }
                    }
                    CloseHandle(hThread);
                }
            }
        }
        CloseHandle(hThreadSnap);
    }
    return dwMainThreadID;
}

bool unsafeInjectDll(DWORD dwProcessId, PCWSTR pszLibFile)
{
    bool bOk = false; // Assume that the function fails
    HANDLE hProcess = NULL, hThread = NULL;
    PWSTR pszLibFileRemote = NULL;

    __try
    {
        // Get a handle for the target process.
        hProcess = OpenProcess(
            PROCESS_QUERY_INFORMATION | // Required by Alpha
                PROCESS_CREATE_THREAD | // For CreateRemoteThread
                PROCESS_VM_OPERATION |  // For VirtualAllocEx/VirtualFreeEx
                PROCESS_VM_WRITE,       // For WriteProcessMemory
            FALSE, dwProcessId);
        if (hProcess == NULL)
            __leave;

        // Calculate the number of bytes needed for the DLL's pathname
        int cch = 1 + lstrlenW(pszLibFile);
        int cb = cch * sizeof(wchar_t);

        // Allocate space in the remote process for the pathname
        pszLibFileRemote = (PWSTR)
            VirtualAllocEx(hProcess, NULL, cb, MEM_COMMIT, PAGE_READWRITE);
        if (pszLibFileRemote == NULL)
            __leave;

        // Copy the DLL's pathname to the remote process' address space
        if (!WriteProcessMemory(hProcess, pszLibFileRemote,
                                (PVOID)pszLibFile, cb, NULL))
            __leave;

        // Get the real address of LoadLibraryW in Kernel32.dll
        PTHREAD_START_ROUTINE pfnThreadRtn = (PTHREAD_START_ROUTINE)
            GetProcAddress(GetModuleHandle(TEXT("Kernel32")), "LoadLibraryW");
        if (pfnThreadRtn == NULL)
            __leave;

        // Create a remote thread that calls LoadLibraryW(DLLPathname)
        hThread = CreateRemoteThread(hProcess, NULL, 0,
                                     pfnThreadRtn, pszLibFileRemote, 0, NULL);
        if (hThread == NULL)
            __leave;

        // Wait for the remote thread to terminate
        WaitForSingleObject(hThread, INFINITE);

        bOk = true; // Everything executed successfully
    }
    __finally
    { // Now, we can clean everything up

        // Free the remote memory that contained the DLL's pathname
        if (pszLibFileRemote != NULL)
            VirtualFreeEx(hProcess, pszLibFileRemote, 0, MEM_RELEASE);

        if (hThread != NULL)
            CloseHandle(hThread);

        if (hProcess != NULL)
            CloseHandle(hProcess);
    }

    return (bOk);
}

bool safeInjectDll(DWORD pid, const std::wstring &dll)
{
    typedef HHOOK(WINAPI * fn)(int, HOOKPROC, HINSTANCE, DWORD);
    HMODULE user32 = GetModuleHandleW(L"USER32");
    fn set_windows_hook_ex;
    HMODULE lib = LoadLibraryW(dll.c_str());
    LPVOID proc;
    HHOOK hook;

    if (!lib || !user32)
    {
        if (!lib)
        {
            std::wcout << L"LoadLibraryW failed:" << dll;
        }
        if (!user32)
        {
            std::wcout << L"USER32 module not found:" << dll;
        }
        return false;
    }

    proc = GetProcAddress(lib, "msg_hook_proc_ov");

    if (!proc)
    {
        std::wcout << L"GetProcAddress msg_hook_proc_ov failed";
        return false;
    }

    set_windows_hook_ex = (fn)GetProcAddress(user32, "SetWindowsHookExA");

    DWORD threadId = getProcMainThreadId(pid);

    std::wcout << "hook "
               << "pid: " << pid << ", thread:" << threadId;

    hook = set_windows_hook_ex(WH_GETMESSAGE, (HOOKPROC)proc, lib, threadId);
    if (!hook)
    {
        DWORD err = GetLastError();
        std::wcout << L"SetWindowsHookEx failed: " << err;
        return false;
    }

    for (auto i = 0; i < g_waitCount; i++)
    {
        Sleep(1000);
        PostThreadMessage(threadId, WM_USER + 432, 0, (LPARAM)hook);
    }
    return true;
}

Napi::Value injectProcess(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  if (info.Length() != 1)
  {
    Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
    return env.Null();
  }

  Napi::Object object = info[0].ToObject();
  const std::uint32_t processId = object.Get("processId").ToNumber().Uint32Value();
  const std::uint32_t threadId = object.Get("threadId").ToNumber().Uint32Value();
  const std::wstring dll_path = win_utils::fromUtf8(object.Get("dllPath").ToString().Utf8Value());

  const bool inject_dll_exist = file_exists(dll_path);
  if (!inject_dll_exist) {
    Napi::TypeError::New(env, "DLL not found: " + object.Get("dllPath").ToString().Utf8Value()).ThrowAsJavaScriptException();
    return env.Null();
  }

  win_scope_handle process = OpenProcess(
      PROCESS_QUERY_INFORMATION | PROCESS_VM_READ,
      false, processId);
  if (!process)
  {
    Napi::TypeError::New(env, "Process not found").ThrowAsJavaScriptException();
    return env.Null();
  }

  std::wstring args = std::to_wstring(processId) + L" " + std::to_wstring(threadId) + L" \"" + dll_path + L"\"";

  std::cout << "unsafe injecting " << processId << "," << threadId << std::endl;

  const bool injected = unsafeInjectDll(processId, dll_path.c_str());
  
  auto result = Napi::Object::New(env);

  result.Set("injectDll", Napi::Value::From(env, win_utils::toUtf8(dll_path)));
  result.Set("injectSucceed", Napi::Value::From(env, injected));
  return Napi::Value::From(env, result);
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  exports.Set(Napi::String::New(env, "getTopWindows"),
              Napi::Function::New(env, getTopWindows));

  exports.Set(Napi::String::New(env, "injectProcess"),
              Napi::Function::New(env, injectProcess));
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
