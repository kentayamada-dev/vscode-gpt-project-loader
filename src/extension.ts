import vscode from 'vscode';
import { join, relative } from 'path';
import binaryExtensions from './binary-extensions.json';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('vscode-gpt-project-loader.convertProjectToText', async () => {
    const folderUri = await vscode.window.showOpenDialog({
      canSelectFolders: true
    });

    const selectedFolderPath = folderUri?.[0]?.fsPath;

    if (!selectedFolderPath) {
      vscode.window.showErrorMessage('No folder selected');
      return;
    }

    const exclusions = vscode.workspace.getConfiguration('gptProjectLoader').get<string[]>('exclude', []);

    let fileUris: { uri: vscode.Uri; relativePath: string }[] = [];

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        cancellable: false
      },
      async (progress) => {
        progress.report({ message: 'Scanning directories...' });
        fileUris = await getAllFiles(selectedFolderPath, exclusions);
      }
    );

    if (fileUris.length === 0) {
      vscode.window.showErrorMessage('No files found in the selected folder');
      return;
    }

    const selectedFileUris = await vscode.window.showQuickPick(
      fileUris.map((fileUri) => ({
        label: fileUri.relativePath,
        uri: fileUri.uri
      })),
      {
        placeHolder: 'Select files to include in the output',
        canPickMany: true
      }
    );

    if (!selectedFileUris || selectedFileUris.length === 0) {
      vscode.window.showErrorMessage('No files selected');
      return;
    }

    let output =
      'The following text is a project with code. The structure of the text are sections that begin with ----, followed by a single line containing the file path and file name, followed by a variable amount of lines containing the file contents. The text representing the project ends when the symbols --END-- are encountered. Any further text beyond --END-- are meant to be interpreted as instructions using the aforementioned project as context.\n\n';

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        cancellable: false
      },
      async (progress) => {
        for (const selectedFile of selectedFileUris) {
          let fileContentString: string;
          if (binaryExtensions.includes(getFileExtension(selectedFile.uri.fsPath))) {
            fileContentString = 'Not Viewable\n';
          } else {
            const fileContent = await vscode.workspace.fs.readFile(selectedFile.uri);
            fileContentString = fileContent.toString();
          }

          output += `----\n${selectedFile.label}\n${fileContentString}\n`;
        }
        output += '--END--';

        progress.report({ message: 'Generating output...' });
      }
    );

    const document = await vscode.workspace.openTextDocument({ content: output });
    await vscode.window.showTextDocument(document);
  });

  context.subscriptions.push(disposable);
}

async function getAllFiles(
  dirPath: string,
  exclusions: string[]
): Promise<{ uri: vscode.Uri; relativePath: string }[]> {
  const filesAndFolders = await vscode.workspace.fs.readDirectory(vscode.Uri.file(dirPath));
  const fileUris: { uri: vscode.Uri; relativePath: string }[] = [];

  for (const [name, type] of filesAndFolders) {
    if (exclusions.includes(name)) {
      continue;
    }

    const fullPath = join(dirPath, name);
    const relativePath = relative(dirPath, fullPath);

    if (type === vscode.FileType.File) {
      fileUris.push({
        uri: vscode.Uri.file(fullPath),
        relativePath
      });
    } else if (type === vscode.FileType.Directory) {
      const nestedFiles = await getAllFiles(fullPath, exclusions);

      nestedFiles.forEach((file) => {
        file.relativePath = join(name, file.relativePath);
        fileUris.push(file);
      });
    }
  }

  return fileUris;
}

function getFileExtension(filename: string): string {
  const baseName = filename.split('/').pop();

  if (!baseName) return '';

  const dotIndex = baseName.lastIndexOf('.');

  if (dotIndex === 0) {
    return baseName.substring(1);
  }

  if (dotIndex === -1 || dotIndex === 0) {
    return baseName;
  }

  return baseName.substring(dotIndex + 1);
}
