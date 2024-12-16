# Sherpa Coder - VS Code Extension
Visit [www.sherpacoder.dev](https://www.sherpacoder.dev)

![Sherpa Coder Cover Image](images/sherpa-cover.png)

🚀 Welcome to the Sherpa Coder extension for Visual Studio Code! ✨ This extension is designed to enhance your coding experience by integrating OpenAI assistants directly into your VS Code environment. 🤖

## Getting Started

### 1. Create Your Account
To begin using Sherpa Coder, you'll need to create an account. Simply provide an alias for your account name and enter your OpenAI API Key. All information is stored locally on your machine - there are no external servers involved, only direct communication with the OpenAI API. This will enable you to access all the powerful features of the extension.

![Creating Account](images/1-create_account.png)

### 2. Select Your Account
Once your account is set up, choose it from the accounts list to start using the extension.

![Choosing Account](images/2-choose_account.png)

### 3. Wait for your account to load
We will stablish connection to OpenAI using the provided API Key.

![Choosing Account](images/3-account_loaded.png)

### 4. Access the Chat Interface
Navigate to the chat tab to initiate a new conversation with the AI assistant.

![Creating Conversation](images/4-create_conversation.png)

### 5. Give your conversation a name
Give your conversation a meaningful name to help you organize and track your interactions.

![Naming Conversation](images/5-conversation_dialog.png)

### 6. Explore the chat dialog
You will see the chat dialog of your new conversation

![Naming Conversation](images/6-chat.png)

### 7. Customize Your Experience
Click on settings to choose your preferred AI model and assistant for each message, tailoring the interaction to your specific needs.

![Model Selection](images/7-choosing_model.png)

![Assistant Selection](images/7-choosing_assistant.png)

### 8. Write your first message

![First message](images/8-writing_prompt.png)

### 9. Your assistant answer will be streamed

![Assistant answers](images/9-answer.png)

### 10. Enhance with File Attachments
Take advantage of the powerful file attachment feature:
- Attach files directly from your workspace
- Generate and attach a markdown file containing your entire workspace's source code
- Provide context-rich information to the AI assistant

![File Attachments](images/10-attachments.png)

You can also attach the full source code of the current workspace. For this we will create a markdown file containing your source code. We will omit the files from gitignore and binary files that you might have in your workspace.

![Code Base Attachment](images/10-source_code.png)


## Important Notes

### File Search Capability
To utilize the attachments feature effectively, ensure that your OpenAI assistants have the "search in files" feature activated in their assistant settings.

![Activating File Search Functionality](images/11-extra.png)

### Files Retention Policy
Files stored in threads are subject to OpenAI API's default retention policy. For more information, please refer to the [OpenAI documentation](https://platform.openai.com/docs/assistants/tools/file-search)

## Contributing
This is an open source project and contributions are welcome! If you'd like to contribute, feel free to submit a pull request or open an issue.

## Support the Project
If you find this extension helpful, you can support its development by buying me a coffee:

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://buymeacoffee.com/mbustosp)