import vscode from 'vscode';
import { readFile, readdir, stat } from 'node:fs/promises';
import { relative, join } from 'path';
import binaryExtensions from './binary-extensions.json';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('vscode-gpt-project-loader.convertProjectToText', async () => {
    const folderUri = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      defaultUri: vscode.workspace.workspaceFolders?.[0]?.uri || vscode.Uri.file(process.cwd())
    });
    const selectedDir = folderUri?.[0]?.path;
    if (selectedDir) {
      const excludeFiles = vscode.workspace.getConfiguration('gptProjectLoader').get<string[]>('exclude', []);

      const allFiles = await getAllFiles(selectedDir, excludeFiles);

      const includedFiles = await vscode.window.showQuickPick(allFiles, {
        canPickMany: true,
        placeHolder: 'Select files to include in the output'
      });

      if (includedFiles) {
        const content = await convertProjectToText(selectedDir, includedFiles);
        const doc = await vscode.workspace.openTextDocument({
          content
        });
        vscode.window.showTextDocument(doc);
      }
    }
  });
  context.subscriptions.push(disposable);
}

async function getAllFiles(dir: string, excludeFiles: string[]): Promise<string[]> {
  const files: string[] = [];
  const processDir = async (currentDir: string) => {
    const dirItems = await readdir(currentDir);
    for (const item of dirItems) {
      const fullPath = join(currentDir, item);

      if (excludeFiles.some((file) => fullPath.includes(file))) {
        continue;
      }

      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await processDir(fullPath);
      } else {
        files.push(relative(dir, fullPath));
      }
    }
  };
  await processDir(dir);
  return files;
}

async function convertProjectToText(baseDir: string, includedFiles: string[]): Promise<string> {
  let output =
    'The following text is a project with code. The structure of the text are sections that begin with ----, followed by a single line containing the file path and file name, followed by a variable amount of lines containing the file contents. The text representing the project ends when the symbols --END-- are encountered. Any further text beyond --END-- are meant to be interpreted as instructions using the aforementioned project as context.\n\n';

  for (const relativeFilePath of includedFiles) {
    const fileExtension = getFileExtension(relativeFilePath);

    output += '----\n';
    output += `${relativeFilePath}\n`;

    if (binaryExtensions.includes(fileExtension)) {
      output += 'Not Viewable\n\n';
    } else {
      const fileContent = await readFile(`${baseDir}/${relativeFilePath}`);
      output += fileContent + '\n';
    }
  }
  output += '--END--';
  return output;
}

function getFileExtension(fileName: string) {
  const lastIndexOfFileName = fileName.lastIndexOf('.');

  return fileName.startsWith('.') && lastIndexOfFileName === 0
    ? fileName.substring(1)
    : fileName.substring(lastIndexOfFileName + 1);
}
