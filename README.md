# VSCode GPT Project Loader

The **VSCode GPT Project Loader** is a Visual Studio Code extension that converts the contents of a selected project into a structured text format, making it perfect for GPT-based tasks like code review, documentation generation, or AI-assisted development.

## Features

- Convert project contents into text while preserving the file structure.
- Exclude specified files and folders from the file selection using the `gptProjectLoader.exclude` setting.
- Files with extensions listed in [here](https://github.com/kentayamada-dev/vscode-gpt-project-loader/blob/main/src/binary-extensions.json) is marked as `Not Viewable`.
- Select specific files from the project to include in the output.
- Outputs formatted text, ready for GPT or AI-assisted workflows.

## Generated output

```
The following text is a project with code. The structure of the text are sections that begin with ----, followed by a single line containing the file path and file name, followed by a variable amount of lines containing the file contents. The text representing the project ends when the symbols --END-- are encountered. Any further text beyond --END-- are meant to be interpreted as instructions using the aforementioned project as context.

----
src/factorial.py
def factorial(n):
    # Base case: if n is 0 or 1, return 1
    if n == 0 or n == 1:
        return 1
    # Recursive case: n * factorial of (n-1)
    else:
        return n * factorial(n - 1)

----
assets/logo.png
Not Viewable

--END--
```

### Demo

![Demo Gif](https://github.com/kentayamada-dev/vscode-gpt-project-loader/raw/main/assets/demo.gif)

## Requirements

This extension does not have any additional dependencies. It requires Visual Studio Code version 1.71.0 or higher.

## Extension Settings

This extension contributes the following settings:

- `gptProjectLoader.exclude`: Specify files or directories to exclude from the file selection. Default: `[".git"]`.

## Known Issues

- No issues have been reported yet. Please report any issues you encounter via the [GitHub issues page](https://github.com/kentayamada-dev/vscode-gpt-project-loader/issues).

## Release Notes

### 1.0.0

- Initial release of **VSCode GPT Project Loader**.
- Project content to text conversion with file structure preservation.
- Added support for ignoring specific files and marking binary files as `Not Viewable`.
- User-selectable files for output generation.
