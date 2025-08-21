{
    "targets": [
        {
            "target_name": "addon",
            "sources": ["src/bin/WinKeyServer/main.cpp"],
            "include_dirs": [
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            "dependencies": [
                "<!(node -p \"require('node-addon-api').gyp\")"
            ],
            "cflags!": ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"],
            "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
            "xcode_settings": {
                "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
                "CLANG_CXX_LIBRARY": "libc++",
                "MACOSX_DEPLOYMENT_TARGET": "10.7"
            },
            "msvs_settings": {
                "VCCLCompilerTool": {"ExceptionHandling": 1}
            },
            "conditions": [
                ['OS=="win"', {
                    "link_settings": {
                        "libraries": [
                            "-luser32"
                        ]
                    }
                }]
            ]
        }
    ]
}
