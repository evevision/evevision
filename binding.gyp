{
    "targets": [
        {
            "target_name": "overlay",
            "cflags!": ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"],
            "include_dirs": [
                "./overlay",
                "./overlay/3rd",
                "./fb",
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            "sources": [
                "./overlay/ipc/tinyipc.h",
                "./overlay/ipc/ipclink.h",
                "./overlay/ipc/ipclink.cc",
                "./overlay/ipc/ipccenter.h",
                "./overlay/ipc/ipccenter.cc",
                "./overlay/overlay.h",
                "./overlay/utils/n-utils.h",
                "./overlay/utils/win-utils.h",
                "./overlay/utils/node_async_call.h",
                "./overlay/utils/node_async_call.cc",
                "./overlay/main.cc"
            ],
            "libraries": ["user32.lib", "Psapi.lib"],
            "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS", "UNICODE"],
            "cflags!": [
                "-fno-exceptions"
            ],
            "cflags_cc!": [
                "-fno-exceptions"
            ],
            "conditions": [
                [
                    "OS=='win'", {
                        "defines": [
                            "_UNICODE",
                            "_WIN32_WINNT=0x0601"
                        ],
                        "configurations": {
                            "Release": {
                                "msvs_settings": {
                                    "VCCLCompilerTool": {
                                        "ExceptionHandling": 1,
                                        "AdditionalOptions": ["/std:c++latest", "/Zc:__cplusplus"]
                                    }
                                }
                            },
                            "Debug": {
                                "msvs_settings": {
                                    "VCCLCompilerTool": {
                                        "ExceptionHandling": 1,
                                        "AdditionalOptions": ["/std:c++latest", "/Zc:__cplusplus"]
                                    }
                                }
                            }
                        }
                    }
                ]
            ]
        }
    ]
}
