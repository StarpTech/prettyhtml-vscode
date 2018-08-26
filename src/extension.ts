"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { languages, ExtensionContext } from "vscode";
import EditProvider from "./prettyhtmlEditProvider";
import { clearConfigCache } from "prettier";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  const editProvider = new EditProvider();
  let disposable = languages.registerDocumentFormattingEditProvider(
    ["html"],
    editProvider
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
  clearConfigCache();
}
