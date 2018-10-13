import React from 'react';
import { observer } from 'mobx-react';
import MonacoEditor from 'react-monaco-editor';
import monacoEditor, {
    CompletionItemProvider,
    IDisposable,
    IRange,
    Position,
    Selection,
    Uri,
} from 'monaco-editor';
import { Flex, FlexProps } from 'reflexy';
import classNames from 'classnames';
import { Omit } from 'typelevel-ts';
import { ServerStructure } from 'services';
import { languageDef, configuration } from './Clickhouse';
import { themeCobalt } from './Cobalt';
import { themeVsDark } from './Vsdark';
import Toolbar, { Props as ToolbarProps } from './Toolbar';
import css from './SqlEditor.css';

const monacoEditorOptions: monacoEditor.editor.IEditorConstructionOptions = {
    language: 'clickhouse',
    theme: 'cobalt',
    minimap: { enabled: false },
    selectOnLineNumbers: true,
    automaticLayout: true,
    formatOnPaste: true,
    fontFamily: 'Monaco,Menlo,Ubuntu Mono,Consolas,"source-code-pro","monospace"',
    fontSize: 14,
    fontWeight: 'lighter',
};

/**
 * Global todo:
 * [-] Повесить эвент и переиминовывать кнопку -"Выполнить" : tab.buttonTitle = editor.getSelectedText() !== '' ? 'Run selected ⌘ + ⏎' : 'Run all ⇧ + ⌘ + ⏎';
 * [-] Выполнять updateEditorStructure после инициализации данных от сервера
 * [-] Подпиться на IModelTokensChangedEvent
 * [-] https://github.com/Microsoft/monaco-editor/issues/593
 */
type Monaco = typeof monacoEditor;
export type CodeEditor = monacoEditor.editor.IStandaloneCodeEditor;
export type ITextModel = monacoEditor.editor.ITextModel;
export type IReadOnlyModel = monacoEditor.editor.IReadOnlyModel;
// export interface modelInstance {
//   currentDatabase: string;
// }
export interface TabixCommand {
    type: string;
    text: string;
}

export interface Variable {
    name: string;
    value: string;
}
export interface monacoGlobalDisposable {
    completionProvider: IDisposable | null;
    tokensProvider: IDisposable | null;
}
export interface Query {
    id: string;
    tokens: any; // splitRange['tokens']
    sql: string;
    sqlOriginal: string;
    isExecutable: boolean;
    range: monacoEditor.Range;
    inCursor: boolean;
    inSelected: boolean;
    numQuery: number;
    numCommand: number;
    commands: Array<TabixCommand>;
    showProgressQuery: string;
    isOperationCAD: boolean; // CreateAlterDrop
    format: string;
    isFormatSet: boolean;
    variables: Array<Variable> | null;
}
// export interface MapModel {
//   currentDatabase: string | undefined;
// }

export interface SqlEditorProps extends Omit<ToolbarProps, 'databases'> {
    content: string;
    onContentChange: (content: string) => void;
    editorRef?: (editor?: CodeEditor) => void;
    serverStructure: ServerStructure.Server;
}

const modelMap = new WeakMap<Uri, SqlEditor>();

function providerCompletionItems(model: IReadOnlyModel): CompletionItemProvider {
    const completionItems: Array<monacoEditor.languages.CompletionItem> = [];

    // const map: MapModel | undefined = this.editorMapModel.get(model);
    // console.log('call.providerCompletionItems', model.id, map);
    const sqlEditor = modelMap.get(model.uri);
    console.log('call.providerCompletionItems', sqlEditor && sqlEditor.props.currentDatabase);

    // const textUntilPosition = model.getValueInRange({
    //     startLineNumber: position.lineNumber,
    //     startColumn: 1,
    //     endLineNumber: position.lineNumber,
    //     endColumn: position.column
    // });
    //
    // const [keyword, value] = textUntilPosition.split(':').map(x => x.trim());
    // const suggestions = keywords.get(keyword);
    //
    // if (suggestions) {
    //     return suggestions.values.map(x => ({
    //         label: x.name,
    //         kind: monaco.languages.CompletionItemKind.Enum,
    //         insertText: ` ${x.name}`,
    //         documentation: x.description,
    //         range: {
    //             startLineNumber: position.lineNumber,
    //             startColumn: keyword.length + 2,
    //             endLineNumber: position.lineNumber,
    //             endColumn: position.column
    //         }
    //     }));
    // }
    //
    // return Array.from(keywords.values()).map(property => ({
    //     label: property.name,
    //     kind: monaco.languages.CompletionItemKind.Property,
    //     documentation: property.description,
    //     insertText: `${property.name}: `
    // }));
    //
    return completionItems;
}

@observer
export default class SqlEditor extends React.Component<SqlEditorProps & FlexProps> {
    componentWillUnmount() {
        const { editorRef } = this.props;
        editorRef && editorRef(undefined);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps && nextProps.serverStructure !== this.props.serverStructure) {
            // @todo: где тут взять глобальный monaco?
            this.updateGlobalEditorStructure(nextProps.serverStructure, monaco);
        }
    }
    private isInitGlobalEditorStructure: boolean = false;
    // private completionItemsDisposable:IDisposable|null = null;

    private onEditorWillMount = (monaco: Monaco) => {
        monaco.editor.defineTheme('cobalt', themeCobalt);
        monaco.editor.defineTheme('vs-dark', themeVsDark);
        monaco.editor.setTheme('cobalt');

        if (!monaco.languages.getLanguages().some(({ id }) => id === 'clickhouse')) {
            // Register a new language
            monaco.languages.register({
                id: 'clickhouse',
                extensions: ['.sql'],
                aliases: ['chsql'],
            });
            // Register a tokens provider for the language
            monaco.languages.setMonarchTokensProvider('clickhouse', languageDef as any);
            // Set the editing configuration for the language
            monaco.languages.setLanguageConfiguration('clickhouse', configuration);
            // registerCompletionItemProvider
            // this.completionItemsDisposable =
            monaco.languages.registerCompletionItemProvider('clickhouse', {
                provideCompletionItems: providerCompletionItems,
            });
            console.log('monaco - register ClickHouseLanguage');
        }
    };

    private updateGlobalEditorStructure = (
        serverStructure: ServerStructure.Server,
        monaco: Monaco
    ): void => {
        if (this.isInitGlobalEditorStructure) return;
        this.isInitGlobalEditorStructure = true;

        console.info('call.updateEditorStructure');
        const languageSettings: any = languageDef;
        languageSettings.builtinFunctions = [];
        // languageSettings.keywords
        // languageSettings.typeKeywords
        // languageSettings.drawCommands
        //

        const completionItems: Array<monacoEditor.languages.CompletionItem> = [];

        serverStructure.databases.forEach((db: ServerStructure.Database) => {
            // Completion:dbName
            completionItems.push({
                label: db.name,
                insertText: db.name,
                kind: monaco.languages.CompletionItemKind.Reference,
                detail: `database`,
            });
            // Completion:Tables
            db.tables.forEach((table: ServerStructure.Table) => {
                // table
                completionItems.push({
                    label: table.name,
                    insertText: `${table.database}.${table.insertName}`,
                    kind: monaco.languages.CompletionItemKind.Interface,
                    detail: `table:${table.engine}`,
                    documentation: table.id,
                });

                completionItems.push({
                    label: `${table.database}.${table.insertName}`,
                    insertText: `${table.database}.${table.insertName}`,
                    kind: monaco.languages.CompletionItemKind.Interface,
                    detail: `table:${table.engine}`,
                    documentation: table.id,
                });

                // language.settings.tables
                // languageSettings.tables.push(`${table.database}.${table.insertName}`);
                // languageSettings.tables.push(`${table.insertName}`);
                // languageSettings.tables.push(`${db.name}`);
            });
        });
        // Completion:Functions
        serverStructure.editorRules.builtinFunctions.forEach((func: any) => {
            languageSettings.builtinFunctions.push(func.name);
            completionItems.push(
                // interface CompletionItem
                {
                    //  {name: "isNotNull", isaggr: 0, score: 101, comb: false, origin: "isNotNull"}
                    label: func.name,
                    insertText: `${func.name}()`,
                    kind: monaco.languages.CompletionItemKind.Function,
                    detail: `function`,
                }
            );
        });
        // @todo: Completion:Dictionaries, need load Dictionaries

        // @todo: Need refactor, когда hotReload или обновление структуры нужно удалить через dispose() созданные элементы
        // Видимо это нужно в rootScope вынести ?
        // window - это быстро костылик ) monaco - региструется глобавльно

        if (!window['monacoGlobalProvider']) {
            window['monacoGlobalProvider'] = {
                completionProvider: null,
                tokensProvider: null,
            };
        } else {
            // Если
            if (window['monacoGlobalProvider']['tokensProvider']) {
                window['monacoGlobalProvider']['tokensProvider'].dispose();
            }
            if (window['monacoGlobalProvider']['completionProvider']) {
                window['monacoGlobalProvider']['completionProvider'].dispose();
            }
        }
        // Запоминаем путь к IDispose() интерфейсу
        // update MonarchTokens
        window['monacoGlobalProvider'][
            'tokensProvider'
        ] = monaco.languages.setMonarchTokensProvider('clickhouse', languageSettings as any);
        // update Completion
        window['monacoGlobalProvider'][
            'completionProvider'
        ] = monaco.languages.registerCompletionItemProvider('clickhouse', {
            provideCompletionItems: function() {
                return completionItems;
            },
        });
    };

    private bindKeys = (editor: CodeEditor, monaco: Monaco) => {
        const self = this;

        const KM = monaco.KeyMod;
        const KC = monaco.KeyCode;

        // ======== Command-Enter ========
        editor.addAction({
            id: 'my-exec-code',
            label: 'Exec current code',
            keybindings: [KM.CtrlCmd | KC.Enter],
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run(editor) {
                self.executeCommand('current', editor, monaco);
            },
        });
        // ======== Shift-Command-Enter ========
        editor.addAction({
            id: 'my-exec-all',
            label: 'Exec All',
            keybindings: [KM.Shift | KM.CtrlCmd | KC.Enter],
            precondition: undefined,
            keybindingContext: undefined,
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run(editor) {
                self.executeCommand('all', editor, monaco);
            },
        });
        // ======== Command+Shift+- / Command+Shift+= ========
        editor.addCommand(
            KM.chord(KM.Shift | KM.CtrlCmd | KC.US_MINUS, 0),
            () => {
                editor.getAction('editor.foldAll').run();
            },
            ''
        );
        editor.addCommand(
            KM.chord(KM.Shift | KM.CtrlCmd | KC.US_EQUAL, 0),
            () => {
                editor.getAction('editor.unfoldAll').run();
            },
            ''
        );
        // ======== Shift-CtrlCmd-F ========
        editor.addCommand(
            KM.chord(KM.Shift | KM.CtrlCmd | KC.KEY_F, 0),
            () => {
                editor.getAction('editor.action.formatDocument').run();
            },
            ''
        );
        // ======== Cmd-Y ========
        editor.addCommand(
            KM.chord(KM.CtrlCmd | KC.KEY_Y, 0),
            () => {
                editor.getAction('editor.action.deleteLines').run();
            },
            ''
        );

        // @todo: Command-Shift-[NUM]
        // for (let i = 0; i < 9; i++) {
        //     editor.addCommand(monaco.KeyMod.chord( monaco.KeyMod.Shift | monaco.KeyMod.CtrlCmd | monaco.KeyCode['KEY_'+i]), function() {
        //         console.warn('actionChangeTab',i);
        //         self.actionChangeTab(i);
        //     });
        // }

        // @todo:  Command-Left | Command-Right | Shift-Alt-Command-Right | Shift-Alt-Command-Right

        editor.focus();
    };

    private onEditorDidMount = (editor: CodeEditor, monaco: Monaco) => {
        const { editorRef } = this.props;
        editorRef && editorRef(editor);

        // Save current component instance to map
        const modelUri = editor.getModel().uri;
        modelMap.set(modelUri, this);
        // Replace model uri when changed
        editor.onDidChangeModel(({ newModelUrl, oldModelUrl }) => {
            modelMap.delete(oldModelUrl);
            modelMap.set(newModelUrl, this);
        });
        // Clear current component instance from map
        editor.onDidDispose(() => {
            modelMap.delete(modelUri);
        });

        // Зная editorRef.getModel().id - можно узнать какой обьект связан [Tab]
        // console.log('modelId', editor.getModel().id);
        // -----------------------------------------
        // Нужно наблюдать для каждой вкладки за обновлением serverStructure and currentDatabase -> если изменились для этого редактора нужно обновить [editorMapModel.currentDatabase]
        // this.editorMapModel.set(editor.getModel(), {
        //     currentDatabase: this.props.currentDatabase,
        // });
        // Bind keys to Editor
        this.bindKeys(editor, monaco);
    };

    private makeQueryId = (): string => {
        let text: string = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 9; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text.toLocaleLowerCase();
    };

    /**
     * tokenize all text in editor
     *
     *
     * @param {Monaco} monaco
     * @param {monacoEditor.editor.ICodeEditor} editor
     * @returns {Array<Query>}
     */
    private tokenizeEditor = (
        monaco: Monaco,
        editor: monacoEditor.editor.ICodeEditor
    ): Array<Query> => {
        //

        /**
         *
         * Получаем ВЕСЬ текст (editor),
         * 1) Токинизируем, с разбивкой на ключевые составляющие которые нужны: KeyWords[SELECT,DELETE], TabixCommands
         * 2) Определяем выделенную область после токинизации
         * 3) Определяем какой текст выполнять
         *
         *
         */
        const splitterQueryToken = 'warn-token.sql'; // Токен разбития на запросы
        const splitterTabixToken = 'tabix.sql'; // Токен разбития на запросы
        let countTabixCommandsInQuery: number = 0; // Кол-во tabix комманд запросе

        const cursorPosition: Position = editor.getPosition(); // Позиция курсора
        const selection: Selection = editor.getSelection(); // Выбранная область
        let tokensList: any[] = [];
        const tokens = monaco.editor.tokenize(editor.getValue(), 'clickhouse'); // ВЕСЬ текст редактора
        let countQuery: number = 0; // Кол-во запросов в тексте
        const splits: any[] = [];
        let splitToken = {
            line: 1,
            offset: 1,
            type: '',
            language: '',
        };
        let previousToken = {
            line: 1,
            offset: 1,
            type: '',
            language: '',
        };

        // Идем по токенам
        tokens.forEach((lineTokens, i) => {
            const line = i + 1;
            lineTokens.forEach(token => {
                const typeToken = token.type;
                // Если указан преведущий токен, вырезаем значение между текущим и преведущим
                if (previousToken.type) {
                    const ll_range = new monaco.Range(
                        previousToken.line,
                        previousToken.offset,
                        line,
                        token.offset + 1 // ? + 1
                    );

                    const tokenText = editor.getModel().getValueInRange(ll_range); // Тут нужно выбирать из запроса
                    const fetchToken = {
                        ...previousToken,
                        text: tokenText,
                        range: ll_range,
                        inCursor: ll_range.containsPosition(cursorPosition),
                        inSelected: ll_range.containsRange(selection),
                    };

                    tokensList.push(fetchToken);
                }

                previousToken = {
                    ...token,
                    line,
                    offset: token.offset + 1,
                };
                // Для разрезки, первый токен всегда начало
                if (!splitToken.type) {
                    splitToken.line = line;
                    splitToken = previousToken;
                }

                if (typeToken === splitterQueryToken || typeToken === splitterTabixToken) {
                    // Если это токен раздиления запросов
                    // Значит все что было до него это оединый запрос
                    let trimCharTokens = 0;
                    splits.push({
                        numQuery: countQuery,
                        numCommand: countTabixCommandsInQuery,
                        startLineNumber: splitToken.line,
                        startColumn: splitToken.offset,
                        endLineNumber: line,
                        endColumn: token.offset + 1,
                        tokens: tokensList,
                    });
                    if (typeToken === splitterTabixToken) {
                        countTabixCommandsInQuery++;
                    } else {
                        countQuery++;
                        trimCharTokens = 2;
                        countTabixCommandsInQuery = 0;
                    }
                    tokensList = [];
                    // @ts-ignore
                    splitToken = token;
                    splitToken.type = token.type;
                    splitToken.line = line;
                    splitToken.offset = 1 + token.offset + trimCharTokens;
                }
            });
        });

        // push last or all
        splits.push({
            numQuery: countQuery,
            numCommand: countTabixCommandsInQuery,
            startLineNumber: splitToken.line,
            startColumn: splitToken.offset,
            endLineNumber: Number.MAX_VALUE,
            endColumn: Number.MAX_VALUE,
            tokens: tokensList,
        });

        // Прошлись по токенам 1 раз
        // Режем
        const listQuery: Array<Query> = [];

        splits.forEach(splitRange => {
            const numQuery = splitRange.numQuery;
            const range = new monaco.Range(
                splitRange.startLineNumber,
                splitRange.startColumn,
                splitRange.endLineNumber,
                splitRange.endColumn
            );

            const text = editor.getModel().getValueInRange(range);
            const inCursor = range.containsPosition(cursorPosition);
            let inSelected = selection.containsRange(range);
            if (range.containsPosition(selection.getEndPosition())) {
                inSelected = true;
            }
            if (range.containsPosition(selection.getStartPosition())) {
                inSelected = true;
            }
            if (range.containsPosition(selection.getPosition())) {
                inSelected = true;
            }

            if (splitRange.numCommand == 0) {
                // это запрос

                // Проходим по всем Tokens одного запроса
                let isFormatSet: boolean = false;
                let isOperationCAD: boolean = false;
                let findSelectQuery: boolean = false;
                let format: string = 'FORMAT JSON';

                //
                if (splitRange.tokens) {
                    // @ts-ignore
                    splitRange.tokens.forEach(oToken => {
                        if (oToken.type === 'storage.sql') {
                            isFormatSet = true;
                            format = oToken.text.trim();
                        }
                        if (oToken.type === 'keyword.sql') {
                            if (['SELECT'].indexOf(oToken.text.toUpperCase()) != -1) {
                                findSelectQuery = true;
                            }
                            if (
                                ['DROP', 'CREATE', 'ALTER'].indexOf(oToken.text.toUpperCase()) != -1
                            ) {
                                isOperationCAD = true;
                                findSelectQuery = false;
                            }
                        }
                    });
                }

                if (!findSelectQuery) {
                    format = '';
                    isFormatSet = false;
                }

                listQuery[numQuery] = {
                    ...splitRange,
                    id: this.makeQueryId(),
                    isExecutable: !(text.trim().length < 1),
                    inCursor,
                    sql: text,
                    sqlOriginal: text,
                    range,
                    tokens: splitRange.tokens,
                    numCommand: splitRange.numCommand,
                    numQuery,
                    inSelected,
                    showProgressQuery: text.replace(/(\r\n|\n|\r)$/gm, '').substr(0, 130),
                    isOperationCAD,
                    variables: null,
                    format,
                    isFormatSet,
                    commands: [],
                };
            } else {
                // это комманда
                if (!listQuery[numQuery].commands) {
                    listQuery[numQuery].commands = [];
                }
                // Находим typeOfCommand через поиск токена 'tabix.sql', его содержимое есть type
                let typeOfCommand = '';
                if (splitRange.tokens) {
                    // @ts-ignore
                    splitRange.tokens.forEach(oToken => {
                        if (oToken.type === 'tabix.sql') {
                            typeOfCommand = oToken.text;
                        }
                    });
                }
                listQuery[numQuery].commands.push({
                    ...splitRange,
                    type: typeOfCommand,
                    code: text,
                    inCursor,
                    range,
                    tokens: splitRange.tokens,
                    numCommand: splitRange.numCommand,
                    numQuery,
                    inSelected,
                });
                // Если курсор на draw -> вся комманда на cursor
                if (inCursor && listQuery[numQuery] && !listQuery[numQuery].inCursor) {
                    listQuery[numQuery].inCursor = true;
                }
            }
        });

        return listQuery;
    };

    /**
     * execute command
     *
     *
     * @param {string} typeCommand
     * @param {monacoEditor.editor.ICodeEditor} editor
     * @param {Monaco} _monaco
     */
    private executeCommand = (
        typeCommand: string,
        editor: monacoEditor.editor.ICodeEditor,
        _monaco: Monaco
    ) => {
        console.info(`%c------------>>> executeCommand >>>--------------`, 'color: red');
        // is user select text? yes - overwrite typeCommand
        const userSelection: IRange = editor.getSelection();
        const selectedText = editor.getModel().getValueInRange(userSelection);
        if (selectedText && selectedText.trim()) {
            if (typeCommand == 'current') {
                typeCommand = 'select';
            }
        }

        // Split all editor text to sql query, by tokens, result is queryParseList:Array<Query>
        const queryParseList = this.tokenizeEditor(_monaco, editor);

        // console.info('Result tokenizeEditor');
        // console.table(queryParseList);

        const queryExecList: Array<Query> = [];

        queryParseList.forEach((query: Query) => {
            // skip empty
            if (!query.isExecutable) return;
            // if need only current
            // Если комманда исполнить текущий и выделен текст -> пропускаем все пока не найдем подходящий
            if (typeCommand == 'current') {
                if (!query.inCursor) return;
            }
            if (typeCommand == 'select') {
                if (!query.inSelected) return;
            }

            if (typeCommand == 'select') {
                // Переписываем область / Достаем выделенную область
                const intersect: IRange = query.range.intersectRanges(userSelection);
                const sqlSelect = editor.getModel().getValueInRange(intersect);
                query.sql = sqlSelect;
                query.isFormatSet = false;
                query.format = 'FORMAT JSON';
            }

            // insert TABIX_QUERY_ID
            query.sql = `/*TABIX_QUERY_ID_${query.id}*/ ${query.sql}`;

            if (!query.isFormatSet) {
                // Если у запроса НЕ указан формат
                query.sql = `${query.sql} ${query.format}`;
            }
            queryExecList.push(query);
        });

        // Запросы которые необходимо отправть
        queryExecList.forEach((query: Query) => {
            console.info(`%c${query.sql}`, 'color: #bada55');
        });

        // const position = editor.getPosition();
        // const allValue = editor.getValue();
    };

    render() {
        const {
            serverStructure,
            currentDatabase,
            onDatabaseChange,
            content,
            onContentChange,
            editorRef,
            onAction,
            className,
            ...rest
        } = this.props;

        return (
            <Flex column className={classNames(css.root, className)} {...rest}>
                <Flex grow fill className={css.editor}>
                    <MonacoEditor
                        options={monacoEditorOptions}
                        editorWillMount={this.onEditorWillMount}
                        editorDidMount={this.onEditorDidMount}
                        value={content}
                        onChange={onContentChange}
                    />
                </Flex>

                <Toolbar
                    className={css.toolbar}
                    databases={serverStructure.databases}
                    currentDatabase={currentDatabase}
                    onDatabaseChange={onDatabaseChange}
                    onAction={onAction}
                />
            </Flex>
        );
    }
}