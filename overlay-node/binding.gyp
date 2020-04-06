{
    "targets": [
        {
            "target_name": "overlay",
            "cflags!": ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"],
            "include_dirs": [
                "./src",
                "./src/3rd",
                "./fb",
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            "sources": [
                "./src/ipc/tinyipc.h",
                "./src/ipc/ipclink.h",
                "./src/ipc/ipclink.cc",
                "./src/ipc/ipccenter.h",
                "./src/ipc/ipccenter.cc",
                "./src/overlay.h",
                "./src/utils/n-utils.h",
                "./src/utils/win-utils.h",
                "./src/utils/node_async_call.h",
                "./src/utils/node_async_call.cc",
                "./src/main.cc"
            ],
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