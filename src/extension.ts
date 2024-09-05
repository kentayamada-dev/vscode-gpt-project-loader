import * as vscode from "vscode";
import * as fs from "node:fs/promises";
import * as path from "path";
import * as os from "os";
import binaryExtensions from "./binary-extensions.json";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "vscode-gpt-project-loader.convertProjectToText",
    async () => {
      const folderUri = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        defaultUri: vscode.Uri.file(os.homedir()),
      });
      const selectedDir = folderUri?.[0]?.fsPath;
      if (selectedDir) {
        const config = vscode.workspace.getConfiguration("gptProjectLoader");
        const ignoredFiles = config.get<string[]>("exclude", []);

        const allFiles = await getAllFiles(selectedDir, ignoredFiles);

        const includedFiles = await vscode.window.showQuickPick(allFiles, {
          canPickMany: true,
          placeHolder: "Select files to include in the output",
        });

        if (includedFiles) {
          const content = await convertProjectToText(
            selectedDir,
            includedFiles
          );
          const doc = await vscode.workspace.openTextDocument({
            content,
          });
          vscode.window.showTextDocument(doc);
        }
      }
    }
  );
  context.subscriptions.push(disposable);
}

async function getAllFiles(
  dir: string,
  ignoredFiles: string[]
): Promise<string[]> {
  const files: string[] = [];
  const processDir = async (currentDir: string) => {
    const dirItems = await fs.readdir(currentDir);
    for (const item of dirItems) {
      const fullPath = path.join(currentDir, item);
      const stats = await fs.stat(fullPath);

      if (ignoredFiles.some((ignored) => fullPath.includes(ignored))) {
        continue;
      }

      if (stats.isDirectory()) {
        await processDir(fullPath);
      } else {
        const relativePath = path.relative(dir, fullPath);
        files.push(relativePath);
      }
    }
  };
  await processDir(dir);
  return files;
}

async function convertProjectToText(
  baseDir: string,
  includedFiles: string[]
): Promise<string> {
  let output =
    "The following text is a project with code. The structure of the text are sections that begin with ----, followed by a single line containing the file path and file name, followed by a variable amount of lines containing the file contents. The text representing the project ends when the symbols --END-- are encountered. Any further text beyond --END-- are meant to be interpreted as instructions using the aforementioned project as context.\n\n";

  for (const relativeFilePath of includedFiles) {
    const absoluteFilePath = path.join(baseDir, relativeFilePath);
    const fileExtension = getFileExtension(absoluteFilePath);

    output += "----\n";
    output += `${relativeFilePath}\n`;

    if (binaryExtensions.includes(fileExtension)) {
      output += "Not Viewable\n\n";
    } else {
      const fileContent = await fs.readFile(absoluteFilePath);
      output += fileContent + "\n";
    }
  }
  output += "--END--";
  return output;
}

function getFileExtension(filePath: string) {
  const fileName = path.basename(filePath);

  if (
    fileName.startsWith(".") &&
    fileName.indexOf(".") === 0 &&
    fileName.lastIndexOf(".") === 0
  ) {
    return fileName.substring(1);
  }

  return path.extname(filePath).substring(1);
}

export function deactivate() {}
