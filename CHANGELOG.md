# Changelog

## [1.0.0] - 2024-09-05

### Added

- Initial release of **VSCode GPT Project Loader**.
- Converts project contents into structured text format, preserving file structure.
- Added support for exclude specific files and directories from the file selection using the `gptProjectLoader.exclude` setting. Default: `[".git"]`.
- Files with extensions listed in [here](https://github.com/kentayamada-dev/vscode-gpt-project-loader/blob/main/src/binary-extensions.json) is marked as `Not Viewable`.
- User can select specific files from the project to include in the output.
- Outputs formatted text, ready for GPT-based code reviews or documentation generation.
