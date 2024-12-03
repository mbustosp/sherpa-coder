# Sherpa Coder - VS Code Extension

Welcome to the Sherpa Coder extension for Visual Studio Code! This extension is designed to enhance your coding experience by integrating OpenAI assistants directly into your VS Code environment.

## What's in the Folder

- **`package.json`**: The manifest file where you declare your extension and command. It registers commands and defines their titles and command names, allowing VS Code to display them in the command palette.

- **`src/extension.ts`**: The main file for implementing your extension's functionality. It exports an `activate` function, which is called the first time your extension is activated. This function is responsible for setting up your extension, including registering commands.

- **`src/core/EventHandler.ts`**: Contains the `VSCodeEventHandler` class, which manages events within the extension.

## Getting Started

### Run Your Extension

1. Press `F5` to open a new window with the Sherpa Coder extension loaded.
2. Execute your command from the command palette by pressing `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and typing the command name.
3. Set breakpoints in `src/extension.ts` to debug your extension.
4. View output from your extension in the debug console.

### Make Changes

- Relaunch the extension from the debug toolbar after modifying code in `src/extension.ts`.
- Reload the VS Code window with your extension using `Ctrl+R` (or `Cmd+R` on Mac) to apply changes.

## TODO

- [x] Add tests to ensure the functionality and reliability of the extension.
- [x] Improve documentation to provide more comprehensive guidance on using and developing the extension.

---

This README provides an overview to help you get started with developing and using the Sherpa Coder extension. For more detailed information, refer to the official [VS Code Extension API documentation](https://code.visualstudio.com/api).
