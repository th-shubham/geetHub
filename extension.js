import * as vscode from 'vscode';
import * as child_process from 'child_process';

function getCommitOwner(filePath, lineNumber) {
    return new Promise((resolve) => {
        const gitShowCommand = `git blame -p -L ${lineNumber},${lineNumber} "${filePath}"`;
        child_process.exec(gitShowCommand, (error, stdout) => {
            if (error) {
                console.error(error);
                resolve(undefined);
            } else {
                const match = /author (.+) <.*> (\d+)/.exec(stdout);
                if (match) {
                    const author = match[1];
                    resolve(author);
                } else {
                    resolve(undefined);
                }
            }
        });
    });
}

export function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.showCommitOwner', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active text editor.');
            return;
        }

        const document = editor.document;
        const selection = editor.selection;
        const lineNumber = selection.active.line + 1;
        const filePath = document.fileName;

        const commitOwner = await getCommitOwner(filePath, lineNumber);
        if (commitOwner) {
            vscode.window.showInformationMessage(`Commit Owner: ${commitOwner}`);
        } else {
            vscode.window.showWarningMessage('Commit owner not found for this line.');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
