{
    "targets": [
        {
            "target_name": "hooker",
            "cflags!": ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"],
            "include_dirs": [
                "<!@(node -p \"require('node-addon-api').include\")",
                "./src",
            ],
            'defines': ['NAPI_DISABLE_CPP_EXCEPTIONS', 'UNICODE'],
            "sources": [
                "./src/utils.hpp",
                "./src/main.cc"
                ],
            "libraries": ["user32.lib", "Psapi.lib"]
        }
    ]
}
