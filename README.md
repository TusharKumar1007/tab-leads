Smart Link Saver Chrome Extension

Official Repository: Maintained by Your Name

Project URL: YOUR_GITHUB_USERNAME/smart-link-saver

A lightweight and powerful Chrome Extension that helps you save, rename, and manage your favorite links right from your browser. Designed for developers, students, and professionals who need a quick and efficient way to organize their browsing workflow.

⚡ Features

💾 Save Input: Manually add custom links or notes.

🌐 Save Tab: Instantly save the current browser tab’s URL.

✏️ Rename Links: Edit and rename saved links for clarity.

🗑️ Delete Links: Remove old or unnecessary links in one click.

📁 Persistent Storage: Saved links remain available even after restarting the browser.

🎨 Clean UI: Simple, intuitive, and user-friendly interface.

⚙️ Lightweight: Minimal resource usage and fast performance.

🧩 Installation (Manual)

Download the latest release from the Releases
 page.

Unzip the downloaded file.

Open Chrome and go to:

```bash
chrome://extensions/
```

Enable Developer Mode (toggle in the top right corner).

Click Load Unpacked and select the unzipped folder.

The extension icon will appear in your Chrome toolbar — ready to use!


📂 Project Structure
.
├── manifest.json          # Extension configuration and permissions
├── popup.html             # UI layout for popup window
├── popup.js               # Core logic (save, delete, rename links)
├── style.css              # Custom styles for popup
├── icons/                 # Extension icons
└── README.md              # Documentation (this file)

🚀 Usage

Click the Smart Link Saver icon in your Chrome toolbar.

Type a link manually or click Save Tab to store the current tab’s URL.

Rename saved links with the ✏️ icon.

Delete any saved link using the 🗑️ button.

Click Delete All to clear your entire list (optional).

Simple, fast, and perfect for keeping your digital workspace organized!

🧪 Tech Stack

HTML5 – UI structure

CSS3 – Custom styling

JavaScript (Vanilla) – Core extension logic

Chrome Storage API – Persistent data management

🧰 Permissions Used

tabs – To capture the current tab’s URL

storage – To store user-saved links locally

⚙️ Future Enhancements

🔖 Add link categorization / folders

☁️ Cloud sync support via Google Drive

🔍 Search and filter saved links

🌙 Dark mode UI

🤝 Contributing

Pull requests and feature suggestions are welcome!
If you’d like to contribute:

Fork the repository.

Create a new feature branch.

Submit a pull request after testing your changes.
