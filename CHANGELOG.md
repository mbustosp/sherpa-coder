## Change Log

All notable changes to the "sherpa-coder" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.1.0] - 2024-12-16

### Added
- 🎨 The extension now adapts to the VS Code theme color palette, enhancing visual integration.
- 🔄 Added the option to reload models and assistants in the settings dialog for improved flexibility.
- 📂 Messages now display used attachments, which can be clicked to open the file in VS Code.

### Changed
- 🛠 Reworked the state handler for better performance and reliability, with added unit tests to ensure stability.
- 📅 Conversations are now sorted by the timestamp of the last sent message, improving conversation management.
- 🚫 The process for canceling an assistant response has been reworked for a smoother user experience.
- 🔔 Error messages are now displayed using VS Code toasts, providing a more consistent notification experience.
- 💡 User experience improvements: forms can now be submitted using the Enter key, and selected attachments have visual indicators.


## [1.0.0] - 2024-12-03

### Added
- 🚀 Initial release of Sherpa Coder
- Support for OpenAI assistants with chat functionality
- File attachment support with workspace integration
- Math expression rendering with KaTeX
- Syntax highlighted code rendering
- Local storage for conversations
- Integration with VS Code editor
- Ability to clear all locally stored data