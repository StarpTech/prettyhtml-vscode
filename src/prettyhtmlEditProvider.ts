import {
  DocumentRangeFormattingEditProvider,
  DocumentFormattingEditProvider,
  Range,
  TextDocument,
  FormattingOptions,
  CancellationToken,
  TextEdit,
  Uri,
  workspace
} from "vscode";
import { resolveConfig } from "prettier";
const prettyhtml = require("@starptech/prettyhtml");

function getPrettierConfig(uri?: Uri): Object {
  return workspace.getConfiguration("prettier", uri) as any;
}

function getPrettyhtmlConfig(uri?: Uri): Object {
  return workspace.getConfiguration("prettyhtml", uri) as any;
}

async function format(
  text: string,
  { uri }: TextDocument,
  options: Object
): Promise<string> {
  const vscodeConfig: any = getPrettierConfig(uri);
  const localPrettierOptions = await resolveConfig(uri.path);
  const prettierOptions = {
    printWidth: vscodeConfig.printWidth,
    tabWidth: vscodeConfig.tabWidth,
    singleQuote: vscodeConfig.singleQuote,
    trailingComma: vscodeConfig.trailingComma,
    bracketSpacing: vscodeConfig.bracketSpacing,
    jsxBracketSameLine: vscodeConfig.jsxBracketSameLine,
    // parser: parser,
    semi: vscodeConfig.semi,
    useTabs: vscodeConfig.useTabs,
    proseWrap: vscodeConfig.proseWrap,
    arrowParens: vscodeConfig.arrowParens,

    ...localPrettierOptions
  };
  const prettyhtmlOptions: any = await getPrettyhtmlConfig(uri);

  return await prettyhtml(text, {
    useTabs: prettyhtmlOptions.useTabs,
    tabWidth: prettyhtmlOptions.tabWidth,
    printWidth: prettyhtmlOptions.printWidth,
    singleQuote: prettyhtmlOptions.singleQuote,
    prettier: prettierOptions
  });
}

function fullDocumentRange(document: TextDocument): Range {
  const lastLineId = document.lineCount - 1;
  return new Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}

class PrettyhtmlEditProvider
  implements
    DocumentRangeFormattingEditProvider,
    DocumentFormattingEditProvider {
  constructor() {}

  provideDocumentRangeFormattingEdits(
    document: TextDocument,
    range: Range,
    options: FormattingOptions,
    token: CancellationToken
  ): Promise<TextEdit[]> {
    return this._provideEdits(document, {
      rangeStart: document.offsetAt(range.start),
      rangeEnd: document.offsetAt(range.end)
    });
  }

  provideDocumentFormattingEdits(
    document: TextDocument,
    options: FormattingOptions,
    token: CancellationToken
  ): Promise<TextEdit[]> {
    return this._provideEdits(document, options);
  }

  private async _provideEdits(document: TextDocument, options: Object) {
    const code = await format(document.getText(), document, options);
    return [TextEdit.replace(fullDocumentRange(document), code)];
  }
}

export default PrettyhtmlEditProvider;
