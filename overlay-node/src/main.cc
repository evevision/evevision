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

    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)