import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { Uri } from 'vscode';
const prettyhtml = require("@starptech/prettyhtml");

/**
 * loads and format a file.
 * @param file path relative to base URI (a workspaceFolder's URI)
 * @param base base URI
 * @returns source code and resulting code
 */
export function format(
    file: string,
    base: Uri = vscode.workspace.workspaceFolders![0].uri
) {
    const absPath = path.join(base.fsPath, file);
    return vscode.workspace.openTextDocument(absPath).then(doc => {
        const text = doc.getText();
        return vscode.window.showTextDocument(doc).then(
            () => {
                console.time(file);
                return vscode.commands
                    .executeCommand('editor.action.formatDocument')
                    .then(() => {
                        console.timeEnd(file);
                        return { result: doc.getText(), source: text };
                    });
            },
            e => console.error(e)
        );
    });
}

/**
 * Compare prettyhtml's output (default settings)
 * with the output from extension.
 * @param file path relative to workspace root
 */
function formatSameAsPrettyhtml(file: string) {
    return format(file).then(result => {
        const prettierFormatted = prettyhtml(result.source);
        assert.equal(result.result, prettierFormatted);
    });
}

suite('Test format Document', function() {
    test('it formats html', () =>
    formatSameAsPrettyhtml('fixtures/ugly.html'));
});