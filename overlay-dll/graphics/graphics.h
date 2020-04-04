#pragma once

namespace
{
static const char k_overlayIWindow[] = "evevision_overlay_win_x0y1x2";
}


typedef HRESULT(WINAPI *pFnCreateDXGIFactory1)(REFIID riid, void **ppFactory);

typedef HRESULT(WINAPI *pFnD3D11CreateDeviceAndSwapChain)(
    __in_opt IDXGIAdapter *pAdapter,
    D3D_DRIVER_TYPE DriverType,
    HMODULE Software,
    UINT Flags,
    __in_ecount_opt(FeatureLevels) CONST D3D_FEATURE_LEVEL *pFeatureLevels,
    UINT FeatureLevels,
    UINT SDKVersion,
    __in_opt CONST DXGI_SWAP_CHAIN_DESC *pSwapChainDesc,
    __out_opt IDXGISwapChain **ppSwapChain,
    __out_opt ID3D11Device **ppDevice,
    __out_opt D3D_FEATURE_LEVEL *pFeatureLevel,
    __out_opt ID3D11DeviceContext **ppImmediateContext);

typedef HRESULT(STDMETHODCALLTYPE *DXGISwapChainPresentType)(IDXGISwapChain *, UINT, UINT);
typedef HRESULT(STDMETHODCALLTYPE *DXGISwapChainResizeBuffersType)(IDXGISwapChain *, UINT, UINT, UINT, DXGI_FORMAT, UINT);
typedef HRESULT(STDMETHODCALLTYPE *DXGISwapChainResizeTargetType)(IDXGISwapChain *, const DXGI_MODE_DESC *);
typedef HRESULT(STDMETHODCALLTYPE *DXGISwapChainPresent1Type)(IDXGISwapChain1 *swapChain, UINT SyncInterval, UINT PresentFlags, _In_ const DXGI_PRESENT_PARAMETERS *pPresentParameters);



inline DXGI_FORMAT fixCopyTextureFormat(DXGI_FORMAT format)
{
    switch (format)
    {
    case DXGI_FORMAT_B8G8R8A8_UNORM_SRGB: return DXGI_FORMAT_B8G8R8A8_UNORM;
    case DXGI_FORMAT_R8G8B8A8_UNORM_SRGB: return DXGI_FORMAT_R8G8B8A8_UNORM;
    }

    return format;
}


inline bool isSRGBFormat(DXGI_FORMAT format)
{
    return format == DXGI_FORMAT_B8G8R8A8_UNORM_SRGB ||
        format == DXGI_FORMAT_R8G8B8A8_UNORM_SRGB;
}
