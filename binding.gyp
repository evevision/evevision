{
    "targets": [
        {
            "target_name": "overlay",
            "cflags!": ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"],
            "include_dirs": [
                "./native",
                "./output/flatbuffers",
                "./flatbuffers/include",
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            "sources": [
                "./native/main.cc",
                "./native/ipc/ipclink.cc",
                "./native/ipc/ipccenter.cc",
                "./native/utils/node_async_call.cc",
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
