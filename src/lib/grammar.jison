%lex
%%

[-+]?([0-9]+(\.[0-9]*)?|\.[0-9]+)             return 'NUMBER';
\"(?!FUNCTION:|\$).*?\"                       return 'STRING';
\"((?:\\.|[^"\\])*)\"                         return 'PATH';
"FUNCTION:"                                   return 'FUNCTION_PREFIX';
[ \t\r\n]+                                    /* Ignore spaces, tabs, newlines */
"{"                                           return '{';
"}"                                           return '}';
"["                                           return '[';
"]"                                           return ']';
":"                                           return ':';
","                                           return ',';

/lex

%%

prg:
    '{' pairs '}'
    ;

pairs:
    pair
    | pair ',' pairs
    ;

pair:
    PATH ':' value
    ;

value:
    STRING
    | PATH
    | NUMBER
    | array
    | function_value
    ;

array:
    '[' path_list ',' function_value ']'
    ;

path_list:
    PATH
    | path_list ',' PATH
    ;

function_value:
    FUNCTION_PREFIX STRING
    ;
