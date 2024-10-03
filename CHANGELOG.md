# Changelog

## [1.0.2] - 2024-10-03

### Fixes

- **Fixed Path Handling on Windows**: Resolved an issue with incorrect path concatenation that led to errors when running the extension on Windows.

### Improvements

- **Cross-Platform Compatibility**: Improved how the extension manages paths and directories, ensuring consistent behavior across both Unix-like systems and Windows.

## [1.0.1] - 2024-09-19

### Improvements

- **Simplified Imports**: Optimized how the extension loads required functions, improving performance.
- **Improved File Selection**: The folder picker now automatically opens in your current project folder instead of your home directory, making file selection more intuitive.
- **Enhanced Path Handling**: Streamlined how file paths are handled, making the extension more reliable and faster.
- **General Cleanup**: Minor adjustments to the code for better efficiency and maintainability.

## [1.0.0] - 2024-09-05

### Added

- Initial release of **VSCode GPT Project Loader**.
- Converts project contents into structured text format, preserving file structure.
- Added support for exclude specific files and directories from the file selection using the `gptProjectLoader.exclude` setting. Default: `[".git"]`.
- Files with extensions listed in [here](https://github.com/kentayamada-dev/vscode-gpt-project-loader/blob/main/src/binary-extensions.json) is marked as `Not Viewable`.
- User can select specific files from the project to include in the output.
- Outputs formatted text, ready for GPT-based code reviews or documentation generation.
