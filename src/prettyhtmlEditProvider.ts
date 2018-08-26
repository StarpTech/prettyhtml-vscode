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

function getPrettyhtmlConfig(uri?: Uri): Object {
  return workspace.getConfiguration("prettyhtml", uri) as any;
}

async function format(
  text: string,
  { uri }: TextDocument,
  options: Object
): Promise<string> {
  const localPrettierOptions = await resolveConfig(uri.path);
  const prettyhtmlOptions: any = await getPrettyhtmlConfig(uri);

  return await prettyhtml(text, {
    useTabs: prettyhtmlOptions.useTabs,
    tabWidth: prettyhtmlOptions.tabWidth,
    printWidth: prettyhtmlOptions.printWidth,
    singleQuote: prettyhtmlOptions.singleQuote,
    prettier: localPrettierOptions
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
