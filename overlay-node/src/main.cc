// TODO: DEAR GOD FIX THE TABS IN THIS FILE REEEEE

#include "overlay.h"

namespace overlay
{

std::map<std::string, std::shared_ptr<OverlayMain>> overlays;

Napi::Value start(const Napi::CallbackInfo &info)
{
  std::string characterName = info[0].ToString();
  std::cout << "starting " << characterName << std::endl;
  for(std::map<std::string, std::shared_ptr<OverlayMain>>::iterator it = overlays.begin(); it != overlays.end(); ++it)
  {
    if (it->first == characterName)
    {
        overlays.erase(it);
    }
  }
  auto newOverlay = std::make_shared<OverlayMain>();
  overlays.insert(std::make_pair(characterName, newOverlay));
  newOverlay->start(characterName);

  return info.Env().Undefined();
}

Napi::Value stop(const Napi::CallbackInfo &info)
{
  std::string characterName = info[0].ToString();

  for(std::map<std::string, std::shared_ptr<OverlayMain>>::iterator it = overlays.begin(); it != overlays.end(); ++it)
  {
    if (it->first == characterName)
    {
        overlays.erase(it);
    }
  }

  return info.Env().Undefined();
}

Napi::Value setEventCallback(const Napi::CallbackInfo &info)
{
  std::string characterName = info[0].ToString();
  for(std::map<std::string, std::shared_ptr<OverlayMain>>::iterator it = overlays.begin(); it != overlays.end(); ++it)
  {
    if (it->first == characterName)
    {
        return it->second->setEventCallback(info);
    }
  }
  return info.Env().Undefined();
}

Napi::Value addWindow(const Napi::CallbackInfo &info)
{
  std::string characterName = info[0].ToString();
  for(std::map<std::string, std::shared_ptr<OverlayMain>>::iterator it = overlays.begin(); it != overlays.end(); ++it)
  {
    if (it->first == characterName)
    {
        return it->second->addWindow(info);
    }
  }
  return info.Env().Undefined();
}

Napi::Value closeWindow(const Napi::CallbackInfo &info)
{
  std::string characterName = info[0].ToString();
  for(std::map<std::string, std::shared_ptr<OverlayMain>>::iterator it = overlays.begin(); it != overlays.end(); ++it)
  {
    if (it->first == characterName)
    {
        return it->second->closeWindow(info);
    }
  }
  return info.Env().Undefined();
}

Napi::Value setWindowPosition(const Napi::CallbackInfo &info)
{
  std::string characterName = info[0].ToString();
  for(std::map<std::string, std::shared_ptr<OverlayMain>>::iterator it = overlays.begin(); it != overlays.end(); ++it)
  {
    if (it->first == characterName)
    {
        return it->second->setWindowPosition(info);
    }
  }
  return info.Env().Undefined();
}

Napi::Value sendCommand(const Napi::CallbackInfo &info)
{
  std::string characterName = info[0].ToString();
  for(std::map<std::string, std::shared_ptr<OverlayMain>>::iterator it = overlays.begin(); it != overlays.end(); ++it)
  {
    if (it->first == characterName)
    {
        return it->second->sendCommand(info);
    }
  }
  return info.Env().Undefined();
}

Napi::Value sendFrameBuffer(const Napi::CallbackInfo &info)
{
  std::string characterName = info[0].ToString();
  for(std::map<std::string, std::shared_ptr<OverlayMain>>::iterator it = overlays.begin(); it != overlays.end(); ++it)
  {
    if (it->first == characterName)
    {
        return it->second->sendFrameBuffer(info);
    }
  }
  return info.Env().Undefined();
}

Napi::Value translateInputEvent(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    Napi::Object object = Napi::Object::New(env);
    Napi::Object eventData = info[0].ToObject();

    std::uint32_t msg = eventData.Get("msg").ToNumber();
    std::uint32_t wparam = eventData.Get("wparam").ToNumber();
    std::uint32_t lparam = eventData.Get("lparam").ToNumber();

    static WCHAR utf16Code = 0;
    assert(!utf16Code || (utf16Code && msg == WM_CHAR));

    if ((msg >= WM_KEYFIRST && msg <= WM_KEYLAST)
        || (msg >= WM_SYSKEYDOWN && msg <= WM_SYSDEADCHAR))
    {
        if (msg == WM_KEYDOWN || msg == WM_SYSKEYDOWN)
        {
            object.Set("type", "keyDown");
            object.Set("keyCode", getKeyCode(wparam));
        }
        else if (msg == WM_KEYUP || msg == WM_SYSKEYUP)
        {
            object.Set("type", "keyUp");
            object.Set("keyCode", getKeyCode(wparam));
        }
        else if (msg == WM_CHAR)
        {
            object.Set("type", "char");
            WCHAR code = wparam;

            if (0xD800 <= code && code <= 0xDBFF)
            {
                utf16Code = code;
            }
            else
            {
                std::wstring keyCode;
                if (utf16Code && (0xDC00 <= code && code <= 0xDFFF))
                {
                    keyCode = std::wstring(1, utf16Code);
                    keyCode.append(std::wstring(1, code));

                }
                else
                {
                    keyCode = std::wstring(1, code);
                }

                utf16Code = 0;
                object.Set("keyCode", Windows::toUtf8(keyCode));
            }
        }

        auto modifiersVec = getKeyboardModifiers(wparam, lparam);

        Napi::Array modifiers = Napi::Array::New(env, modifiersVec.size());

        for (auto i = 0; i != modifiersVec.size(); ++i)
        {
            modifiers.Set(i, modifiersVec[i]);
        }

        object.Set("modifiers", modifiers);
    }

    else if (msg >= WM_MOUSEFIRST && msg <= WM_MOUSELAST)
    {
        auto modifiersVec = getMouseModifiers(wparam, lparam);

        if (msg == WM_LBUTTONDOWN || msg == WM_RBUTTONDOWN
            ||msg == WM_MBUTTONDOWN || msg == WM_XBUTTONDOWN
            || msg == WM_LBUTTONDBLCLK || msg == WM_RBUTTONDBLCLK
            || msg == WM_MBUTTONDBLCLK || msg == WM_XBUTTONDBLCLK
            )
        {
            object.Set("type", "mouseDown");

            if (msg == WM_LBUTTONDBLCLK || msg == WM_RBUTTONDBLCLK
                || msg == WM_MBUTTONDBLCLK || msg == WM_XBUTTONDBLCLK)
            {
                object.Set("clickCount", 2);
            }
            else
            {
                object.Set("clickCount", 1);
            }


        }
        else if (msg == WM_LBUTTONUP || msg == WM_RBUTTONUP
            || msg == WM_MBUTTONUP || msg == WM_XBUTTONUP)
        {
            object.Set("type", "mouseUp");
            object.Set("clickCount", 1);
        }
        else if (msg == WM_MOUSEMOVE)
        {
            object.Set("type", "mouseMove");
        }
        else if (msg == WM_MOUSEWHEEL)
        {
            object.Set("type", "mouseWheel");

            int delta = GET_WHEEL_DELTA_WPARAM(wparam) / 2;
            object.Set("deltaY", delta);
            object.Set("canScroll ", true);
        }

        //for mousewheel the cord is already translated

        int x = LOWORD(lparam);
        int y = HIWORD(lparam);
        object.Set("x", x);
        object.Set("y", y);

        if (msg == WM_LBUTTONDOWN || msg == WM_LBUTTONUP || msg == WM_LBUTTONDBLCLK)
        {
            object.Set("button", "left");
        }
        else if (msg == WM_RBUTTONDOWN || msg == WM_RBUTTONUP || msg == WM_RBUTTONDBLCLK)
        {
            object.Set("button", "right");
        }
        else if (msg == WM_MBUTTONDOWN || msg == WM_MBUTTONUP || msg == WM_MBUTTONDBLCLK)
        {
            object.Set("button", "middle");
        }

        Napi::Array modifiers = Napi::Array::New(env, modifiersVec.size());

        for (auto i = 0; i != modifiersVec.size(); ++i)
        {
            modifiers.Set(i, modifiersVec[i]);
        }

        object.Set("modifiers", modifiers);

    }

    if (utf16Code)
    {
        return env.Undefined();
    }
    else
    {
        return object;
    }
}

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
    infoObject.Set("title", Napi::Value::From(env, Windows::toUtf8(info.title)));
    infoObject.Set("exeName", Napi::Value::From(env, Windows::toUtf8(info.exeName)));
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
  const std::wstring dll_path = Windows::fromUtf8(object.Get("dllPath").ToString().Utf8Value());

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

  result.Set("injectDll", Napi::Value::From(env, Windows::toUtf8(dll_path)));
  result.Set("injectSucceed", Napi::Value::From(env, injected));
  return Napi::Value::From(env, result);
}

} // namespace overlay

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    exports.Set(Napi::String::New(env, "start"), Napi::Function::New(env, overlay::start));
    exports.Set(Napi::String::New(env, "stop"), Napi::Function::New(env, overlay::stop));
    exports.Set(Napi::String::New(env, "setEventCallback"), Napi::Function::New(env, overlay::setEventCallback));
    exports.Set(Napi::String::New(env, "sendCommand"), Napi::Function::New(env, overlay::sendCommand));
    exports.Set(Napi::String::New(env, "addWindow"), Napi::Function::New(env, overlay::addWindow));
    exports.Set(Napi::String::New(env, "closeWindow"), Napi::Function::New(env, overlay::closeWindow));
    exports.Set(Napi::String::New(env, "setWindowPosition"), Napi::Function::New(env, overlay::setWindowPosition));
    exports.Set(Napi::String::New(env, "sendFrameBuffer"), Napi::Function::New(env, overlay::sendFrameBuffer));
    exports.Set(Napi::String::New(env, "translateInputEvent"), Napi::Function::New(env, overlay::translateInputEvent));
    exports.Set(Napi::String::New(env, "getTopWindows"), Napi::Function::New(env, overlay::getTopWindows));
    exports.Set(Napi::String::New(env, "injectProcess"), Napi::Function::New(env, overlay::injectProcess));

    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)