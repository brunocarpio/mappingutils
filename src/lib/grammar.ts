export let grammar = {
    lex: {
        rules: [
            ["\\[", "return '[';"],
            ["\\]", "return ']';"],
            ["\\,", "return ',';"],
            ["[ \t\r\n]+", "/* Ignore spaces, tabs, newlines */"],
            ["[-+]?(\\d+(\\.\\d*)?|\\.\\d+)", "return 'NUMBER';"],
            ['\"\\$\\..*?(\\[.*?\\])?\"', "return 'PATH';"],
            ['\"(?!\\$\.|,|FUNCTION:).*?\"', "return 'STRING';"],
            ['"FUNCTION:', "return 'FUNCTION_PREFIX';"],
            [".", "/* Ignore everything else */"],
        ],
    },
    start: "prg",
    bnf: {
        prg: ["[ values ]"],
        values: ["value", "values , value"],
        value: ["STRING", "PATH", "NUMBER", "array", "function_value"],
        array: ["[ path_list , function_value ]"],
        path_list: ["PATH", "path_list , PATH"],
        function_value: ["FUNCTION_PREFIX STRING"],
    },
};
