"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { languages, ExtensionContext, workspace, Disposable } from "vscode";
import EditProvider from "./prettyhtmlEditProvider";

let formatterHandler: undefined | Disposable;
let rangeFormatterHandler: undefined | Disposable;

/**
 * Dispose formatters
 */
function disposeHandlers() {
  if (formatterHandler) {
    formatterHandler.dispose();
  }
  if (rangeFormatterHandler) {
    rangeFormatterHandler.dispose();
  }
  formatterHandler = undefined;
  rangeFormatterHandler = undefined;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  const editProvider = new EditProvider();

  function registerFormatter() {
    disposeHandlers();
    rangeFormatterHandler = languages.registerDocumentRangeFormattingEditProvider(
      [{ language: 'html', scheme: 'file' }, { language: 'html', scheme: 'untitled' }],
      editProvider
    );
    formatterHandler = languages.registerDocumentFormattingEditProvider(
      [{ language: 'html', scheme: 'file' }, { language: 'html', scheme: 'untitled' }],
      editProvider
    );
  }
  registerFormatter();
  context.subscriptions.push(
    workspace.onDidChangeWorkspaceFolders(registerFormatter),
    {
      dispose: disposeHandlers
    }
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
