module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-cond-assign": [
            "error",
            "always"
        ],
        "no-console": [
            "error"
        ],
        "no-debugger": [
            "error"
        ],
        "no-empty": [
            "error",
            { "allowEmptyCatch": false }
        ],
        "no-unreachable": [
            "error"
        ],
        "no-empty-function": [
            "error",
            { "allow": [] }
        ],
        "no-eval": [
            "error",
            {"allowIndirect": true}
        ],
        "no-fallthrough": [
            "error",
            { "commentPattern": "break[\\s\\w]*omitted" }
        ],
        "strict": [
            "error",
            "global"
        ],
        "new-cap": [
            "error",
            { "newIsCap": true }
        ],
        "arrow-body-style": [
            "error",
            "as-needed"
        ],
        "no-extra-semi": [
            "error"
        ]

    }
};