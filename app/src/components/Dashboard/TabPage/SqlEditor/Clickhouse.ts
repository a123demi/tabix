import { languages } from 'monaco-editor';
// This config defines the editor's view.
// export const options = {
//     lineNumbers: false,
//     scrollBeyondLastLine: false,
//     readOnly: false,
//     fontSize: 12,
// };
// https://bitwiser.in/monaco-themes/
// https://microsoft.github.io/monaco-editor/monarch.html
// https://github.com/Microsoft/monaco-editor/issues/74
// Auto
// https://gist.github.com/mwrouse/05d8c11cd3872c19c684bd1904a2202e
// Optimizations in Syntax Highlighting: https://code.visualstudio.com/blogs/2017/02/08/syntax-highlighting-optimizations
// registerFoldingProvider
// https://github.com/Microsoft/vscode/blob/master/extensions/sql/syntaxes/sql.tmLanguage.json

// https://code.visualstudio.com/docs/extensions/themes-snippets-colorizers#_create-a-new-color-theme
// https://github.com/brijeshb42/monaco-themes/tree/master/themes
// https://github.com/Microsoft/vscode/blob/master/src/vs/editor/standalone/common/themes.ts#L13
// This config defines how the language is displayed in the editor.
// https://stackoverflow.com/questions/43014131/monaco-editor-match-an-arbitrary-number-of-arguments-on-the-same-row-using-a-r
// https://www.bountysource.com/issues/36158910-trigger-auto-complete-suggestions-programmatically
// https://github.com/Microsoft/vscode/blob/master/extensions/sql/syntaxes/sql.tmLanguage.json
// https://www.snip2code.com/Snippet/3196855/Example-of-a-completion-provider-for-ngx/

export const languageDef = {
    base: 'sql',
    defaultToken: '',
    tokenPostfix: '.sql',
    ignoreCase: true,
    number: /\d+(\.\d+)?/,
    brackets: [
        { open: '[', close: ']', token: 'delimiter.square' },
        { open: '(', close: ')', token: 'delimiter.parenthesis' },
    ],
    keywordsDouble: [

    ],
    tabixCommands:[

    ],
    keywords: [
        'SELECT',
        'CASE',
        'THEN',
        'DISTINCT',
        'INSERT',
        'UPDATE',
        'DELETE',
        'WHERE',
        'AND',
        'OR',
        'OFFSET',
        'HAVING',
        'AS',
        'FROM',
        'WHEN',
        'ELSE',
        'USING',
        'END',
        'TYPE',
        'LEFT',
        'RIGHT',
        'JOIN',
        'ON',
        'OUTER',
        'DESC',
        'ASC',
        'UNION',
        'CREATE',
        'TABLE',
        'PRIMARY',
        'KEY FOREIGN',
        'NOT',
        'REFERENCES',
        'INNER',
        'CROSS',
        'NATURAL',
        'DATABASE',
        'DROP',
        'GRANT',
        'ARRAY JOIN',
        'ANY',
        'BETWEEN',
        'ENGINE',
        'ATTACH',
        'DETACH',
        'CAST',
        'WITH',
        'BIT_AND',
        'BIT_OR',
        'TO',
        'BIT_XOR',
        'DESCRIBE',
        'OPTIMIZE',
        'PREWHERE',
        'TOTALS',
        'DATABASES',
        'PROCESSLIST',
        'SHOW',
        'IF',

        // FORM
        'FORMAT JSON',
        'FORMAT JSONCompact',
        'FORMAT JSONEachRow',
        'FORMAT TSV',
        'FORMAT TabSeparated',
        'FORMAT TabSeparatedWithNames',
        'FORMAT TabSeparatedWithNamesAndTypes',
        'FORMAT TabSeparatedRaw',
        'FORMAT BlockTabSeparated',
        'FORMAT TSKV',
        'FORMAT CSV',
        'FORMAT CSVWithNames',
        // SYS
        'SYSTEM RELOAD CONFIG',
        'DROP TEMPORARY TABLE',
        'EXISTS TEMPORARY TABLE',
        'SYSTEM RELOAD DICTIONARY',
        'SYSTEM RELOAD DICTIONARIES',
        'SYSTEM DROP DNS CACHE',
        'SYSTEM SHUTDOWN',
        'SYSTEM KILL',
        'CLEAR COLUMN IN PARTITION',
    ],
    typeKeywords: [
        'date',
        'integer',
        'uint8',
        'uint16',
        'uint32',
        'uint64',
        'int8',
        'int16',
        'int32',
        'int64',
        'float32',
        'float64',
        'datetime',
        'enum8',
        'enum16',
        'fixedstring',
        'array',
        'tuple',
        'string',
        'Distributed',
        'Tinylog',
        'MergeTree',
        'SummingMergeTree',
        'ReplacingMergeTree',
        'ReplicatedMergeTree',
        'Buffer',
        'ReplicatedCollapsingMergeTree',
        'CollapsingMergeTree',
        'AggregatingMergeTree',
        'Merge',
        'Memory',
        'GraphiteMergeTree',
        'ReplicatedAggregatingMergeTree',
        'ReplicatedSummingMergeTree',
    ],
    operators: [
        // Logical
        'ALL',
        'AND',
        'ANY',
        'BETWEEN',
        'EXISTS',
        'IN',
        'LIKE',
        'NOT',
        'OR',
        'SOME',
        // Set
        'EXCEPT',
        'INTERSECT',
        'UNION',
        // Join
        'APPLY',
        'CROSS',
        'FULL',
        'INNER',
        'JOIN',
        'LEFT',
        'OUTER',
        'RIGHT',
        // Predicates
        'CONTAINS',
        'FREETEXT',
        'IS',
        'NULL',
    ],
    builtinFunctions: [
        // Aggregate
        'AVG',
        'CHECKSUM_AGG',
        'COUNT',
        'COUNT_BIG',
        'GROUPING',
        'GROUPING_ID',
        'MAX',
        'MIN',
        'SUM',
        'STDEV',
        'STDEVP',
        'VAR',
        'VARP',
        // Analytic
        'CUME_DIST',
    ],
    //
    // formatResult: [
    //     'FORMAT JSON',
    //     'FORMAT JSONCompact',
    //     'FORMAT JSONEachRow',
    //     'FORMAT TSV',
    //     'FORMAT TabSeparated',
    //     'FORMAT TabSeparatedWithNames',
    //     'FORMAT TabSeparatedWithNamesAndTypes',
    //     'FORMAT TabSeparatedRaw',
    //     'FORMAT BlockTabSeparated',
    //     'FORMAT TSKV',
    //     'FORMAT CSV',
    //     'FORMAT CSVWithNames',
    // ],

    builtinVariables: ['true', 'false', 'NULL'],
    pseudoColumns: ['$ROWGUID', '$PARTITION'],
    drawCommands: ['DRAW_CHART', 'DRAW_BAR', '$ROWGUID', '$PARTITION'],
    tokenizer: {
        root: [
            { include: '@comments' },
            { include: '@whitespace' },
            { include: '@keywordsDouble' },
            { include: '@pseudoColumns' },
            { include: '@numbers' },
            { include: '@strings' },
            { include: '@complexIdentifiers' },
            { include: '@scopes' },
            [/;;/, 'warn-token'],
            [/[;,.]/, 'delimiter'],
            [/[()]/, '@brackets'],
            [
                /[\w@#$]+/,
                {
                    cases: {
                        '@typeKeywords': 'keyword.type',
                        '@keywords': 'keyword',
                        '@operators': 'operator',
                        '@builtinVariables': 'predefined',
                        '@builtinFunctions': 'predefined',
                        '@drawCommands': 'tabix',
                        '@default': 'identifier',
                    },
                },

            ],
            [/[<>=!%&+\-*/|~^]/, 'operator'],
        ],
        whitespace: [[/\s+/, 'white']],
        comments: [[/--+.*/, 'comment'], [/\/\*/, { token: 'comment.quote', next: '@comment' }]],
        comment: [
            [/[^*/]+/, 'comment'],
            // Not supporting nested comments, as nested comments seem to not be standard?
            // i.e. http://stackoverflow.com/questions/728172/are-there-multiline-comment-delimiters-in-sql-that-are-vendor-agnostic
            // [/\/\*/, { token: 'comment.quote', next: '@push' }],    // nested comment not allowed :-(
            [/\*\//, { token: 'comment.quote', next: '@pop' }],
            [/./, 'comment'],
        ],
        keywordsDouble: [
            [
                "INSERT\\W+INTO|RENAME\\W+TABLE|IF\\W+NOT\\W+EXISTS|IF\\W+EXISTS",
                {
                    cases: {
                        '@default': 'keyword',
                    },
                },
            ],
            [
                "FORMAT\\W+Vertical|FORMAT\\W+JSONCompact|FORMAT\\W+TSV|FORMAT\\W+JSONEachRow|FORMAT\\W+TSKV|FORMAT\\W+TabSeparatedWithNames|FORMAT\\W+TabSeparatedWithNamesAndTypes|FORMAT\\W+TabSeparatedRaw|FORMAT\\W+BlockTabSeparated|FORMAT\\W+CSVWithNames|FORMAT\\W+CSV|FORMAT\\W+JSON|FORMAT\\W+TabSeparated",
                {
                    cases: {
                        '@default': 'storage',
                    },
                },
            ]
        ],
        pseudoColumns: [
            [
                /[$][A-Za-z_][\w@#$]*/,
                {
                    cases: {
                        '@pseudoColumns': 'predefined',
                        '@default': 'identifier',
                    },
                },
            ],
        ],
        numbers: [
            [/0[xX][0-9a-fA-F]*/, 'number'],
            [/[$][+-]*\d*(\.\d*)?/, 'number'],
            [/((\d+(\.\d*)?)|(\.\d+))([eE][\-+]?\d+)?/, 'number'],
        ],
        strings: [
            [/N'/, { token: 'string', next: '@string' }],
            [/'/, { token: 'string', next: '@string' }],
        ],
        string: [[/[^']+/, 'string'], [/''/, 'string'], [/'/, { token: 'string', next: '@pop' }]],
        complexIdentifiers: [
            [/\[/, { token: 'identifier.quote', next: '@bracketedIdentifier' }],
            [/"/, { token: 'identifier.quote', next: '@quotedIdentifier' }],
        ],
        bracketedIdentifier: [
            [/[^\]]+/, 'identifier'],
            [/]]/, 'identifier'],
            [/]/, { token: 'identifier.quote', next: '@pop' }],
        ],
        quotedIdentifier: [
            [/[^"]+/, 'identifier'],
            [/""/, 'identifier'],
            [/"/, { token: 'identifier.quote', next: '@pop' }],
        ],
        scopes: [
            [/BEGIN\s+(DISTRIBUTED\s+)?TRAN(SACTION)?\b/i, 'keyword'],
            [/BEGIN\s+TRY\b/i, { token: 'keyword.try' }],
            [/END\s+TRY\b/i, { token: 'keyword.try' }],
            [/BEGIN\s+CATCH\b/i, { token: 'keyword.catch' }],
            [/END\s+CATCH\b/i, { token: 'keyword.catch' }],
            [/(BEGIN|CASE)\b/i, { token: 'keyword.block' }],
            [/END\b/i, { token: 'keyword.block' }],
            [/WHEN\b/i, { token: 'keyword.choice' }],
            [/THEN\b/i, { token: 'keyword.choice' }],
        ],
    },
};

// This config defines the editor's behavior.
export const configuration: languages.LanguageConfiguration = {
    comments: {
        lineComment: '--',
        blockComment: ['/*', '*/'],
    },
    brackets: [['{', '}'], ['[', ']'], ['(', ')']],
    folding: {
        markers: {
            // start: new RegExp("^\\s*(#|\/\/)region\\b"),
            // start: /^\s*{\b/,
            start: /\(/,
            end: /\)/,
            // end: /^\s*}\b/
        },
    },
    autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: "`", close: "`" },
    ],
    surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: "`", close: "`" },
    ],
    // wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
};