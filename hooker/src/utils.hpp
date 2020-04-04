#include <Windows.h>
#include <string>
#include <locale>
#include <codecvt>

EXTERN_C IMAGE_DOS_HEADER __ImageBase;


namespace win_utils
{

inline std::wstring fromUtf8(const std::string &str)
{
    std::wstring_convert<std::codecvt_utf8_utf16<wchar_t>> converter;
    return converter.from_bytes(str);
}

inline std::string toUtf8(const wchar_t *wstr, int size = -1)
{
    std::string str;
    if (size < 0)
    {
        size = (int)wcslen(wstr);
    }
    int bytesNeed = WideCharToMultiByte(CP_UTF8, NULL, wstr, size, NULL, 0, NULL, FALSE);
    str.resize(bytesNeed);
    WideCharToMultiByte(CP_UTF8, NULL, wstr, size, const_cast<char *>(str.c_str()), bytesNeed, NULL, FALSE);
    return str;
}

inline std::string toUtf8(const std::wstring &wstr)
{
    return toUtf8(wstr.c_str(), wstr.size());
}

inline bool createProcess(const std::wstring& path, const std::wstring& argument)
{
    PROCESS_INFORMATION ProcInfo = { 0 };
    STARTUPINFO StartupInfo = { 0 };

    std::wstring dir = path;
    dir.erase(path.find_last_of('\\'));
    std::wstring cmdLine = L"\"";
    cmdLine.append(path).append(L"\" ").append(argument);

    BOOL ret = CreateProcessW(path.c_str(), (LPWSTR)(cmdLine.c_str()), NULL, NULL, FALSE, 0, NULL, dir.c_str(), &StartupInfo, &ProcInfo);

    if (ProcInfo.hProcess != NULL)
    {
        CloseHandle(ProcInfo.hProcess);
    }
    if (ProcInfo.hThread != NULL)
    {
        CloseHandle(ProcInfo.hThread);
    }

    return ret == TRUE;
}

} // namespace win_utils
