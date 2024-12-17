# Sherpa Coder - VS Code Extension

Visit [www.sherpacoder.dev](https://www.sherpacoder.dev)

![Sherpa Coder Cover Image](images/sherpa-cover.png)

🚀 Welcome to the Sherpa Coder extension for Visual Studio Code! ✨ This extension is designed to enhance your coding experience by integrating OpenAI assistants directly into your VS Code environment. 🤖

## Getting Started

<details>
<summary>1. Create Your Account</summary>
To begin using Sherpa Coder, you'll need to create an account. Simply provide an alias for your account name and enter your OpenAI API Key. All information is stored locally on your machine - there are no external servers involved, only direct communication with the OpenAI API. This will enable you to access all the powerful features of the extension.

![Creating Account](images/1-create_account.png)

</details>

<details>
<summary>2. Select Your Account</summary>
Once your account is set up, choose it from the accounts list to start using the extension.

![Choosing Account](images/2-choose_account.png)

</details>

<details>
<summary>3. Wait for your account to load</summary>

We will stablish connection to OpenAI using the provided API Key.

![Choosing Account](images/3-account_loaded.png)

</details>

<details>
<summary>4. Access the Chat Interface</summary>

Navigate to the chat tab to initiate a new conversation with the AI assistant.

![Creating Conversation](images/4-create_conversation.png)

</details>

<details>
<summary>5. Give your conversation a name</summary>

Give your conversation a meaningful name to help you organize and track your interactions.

![Naming Conversation](images/5-conversation_dialog.png)

</details>

<details>
<summary>6. Explore the chat dialog</summary>

You will see the chat dialog of your new conversation

![Naming Conversation](images/6-chat.png)

</details>

<details>
<summary>7. Customize Your Experience</summary>
Click on settings to choose your preferred AI model and assistant for each message, tailoring the interaction to your specific needs.

![Model Selection](images/7-choosing_model.png)

![Assistant Selection](images/7-choosing_assistant.png)

</details>

<details>
<summary>8. Write your first message</summary>

![First message](images/8-writing_prompt.png)

</details>

<details>
<summary>9. Your assistant answer will be streamed</summary>

![Assistant answers](images/9-answer.png)

</details>

<details>
<summary>10. Enhance with File Attachments</summary>

Take advantage of the powerful file attachment feature:

- Attach files directly from your workspace
- Generate and attach a markdown file containing your entire workspace's source code
- Provide context-rich information to the AI assistant

![File Attachments](images/10-attachments.png)

You can also attach the full source code of the current workspace. For this we will create a markdown file containing your source code. We will omit the files from gitignore and binary files that you might have in your workspace.

![Code Base Attachment](images/10-source_code.png)

</details>
<details>
<summary>Important Notes</summary>

### File Search Capability

To utilize the attachments feature effectively, ensure that your OpenAI assistants have the "search in files" feature activated in their assistant settings.

![Activating File Search Functionality](images/11-extra.png)

### Files Retention Policy

Files stored in threads are subject to OpenAI API's default retention policy. For more information, please refer to the [OpenAI documentation](https://platform.openai.com/docs/assistants/tools/file-search)

</details>

## How to Contribute

We welcome contributions to **Sherpa Coder**! Folow these steps to get started:

1. **Fork the Repository**

   - Click the **Fork** button at the top-right corner of the repository page.

2. **Clone Your Fork Locally**
   - Open a terminal and run:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sherpa-coder.git
   cd sherpa-coder
   ```
3. **Set Up the Project**

   - Install dependencies

   ```bash
   yarn install
   // Or
   npm install
   ```

   - Open the project in VS Code and ensure it's working as expected.

4. **Create a New Branch**
5. **Make Your Changes**
6. **Commit Your Changes**
7. **Push to Your Fork**
8. **Submit a Pull Request**

## Support the Project

If you find this extension helpful, you can support its development by buying me a coffee:

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://buymeacoffee.com/mbustosp)
