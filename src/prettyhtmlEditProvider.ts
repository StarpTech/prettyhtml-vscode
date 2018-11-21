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

function getConfig(uri?: Uri): Object {
  return workspace.getConfiguration("prettyhtml", uri) as any;
}

async function format(
  text: string,
  { uri }: TextDocument,
  options: { [index: string]: any },
  prettyhtmlOptions: { [index: string]: any }
): Promise<string> {
  const localPrettierOptions = await resolveConfig(uri.path);

  return await prettyhtml(text, {
    useTabs: prettyhtmlOptions.useTabs,
    tabWidth: prettyhtmlOptions.tabWidth,
    printWidth: prettyhtmlOptions.printWidth,
    singleQuote: prettyhtmlOptions.singleQuote,
    prettier: localPrettierOptions,
    wrapAttributes: prettyhtmlOptions.wrapAttributes,
    sortAttributes: prettyhtmlOptions.sortAttributes
  }).contents;
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
    const prettyhtmlOptions: any = await getConfig(document.uri);
    if (prettyhtmlOptions.enable === false) {
      console.info(
        "Prettyhtml is not enabled. Set 'prettyhtml.enable' to true"
      );
      return [];
    }
    const code = await format(
      document.getText(),
      document,
      options,
      prettyhtmlOptions
    );
    return [TextEdit.replace(fullDocumentRange(document), code)];
  }
}

export default PrettyhtmlEditProvider;
