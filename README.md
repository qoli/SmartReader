# SmartReader (Eison’s AI)

SmartReader is a powerful Safari Web Extension for macOS and iOS that uses AI to summarize web content instantly. By integrating Readability and ChatGPT API, it helps users quickly grasp the core ideas of any webpage.

## Features

- **AI Summarization**: Generate concise summaries and key points for the current webpage using the ChatGPT API.
- **Readability Integration**: Uses `Readability.js` to extract the main content, removing ads and distractions.
- **Multi-Platform**: Seamlessly works on both macOS and iOS Safari.
- **Customizable Modes**:
  - **Mini Icon**: A subtle floating icon to trigger summaries.
  - **Auto Summary**: Automatically generates summaries when you visit a page (configurable).
  - **Hidden**: Keep the UI clean until you need it.
- **Custom AI Configuration**: Fully customizable API URL, Key, Model, and Prompts.
- **Markdown Support**: Beautifully rendered summaries using `marked.js`.

## Project Structure

- `iOS (App)` / `macOS (App)`: Native wrappers for the extension on Apple platforms.
- `Shared (Extension)`: The core logic of the Safari Web Extension, including:
  - `Readability.js`: Content extraction logic.
  - `chatgpt-api.js`: AI interaction and streaming response handling.
  - `popup.html/js`: The main UI for the extension.
  - `settings.html/js`: Configuration page for API settings.

## Getting Started

### Prerequisites

- macOS with Xcode installed.
- An OpenAI API Key (or a compatible ChatGPT API provider).

### Installation

1. Clone this repository.
2. Open `SmartReader.xcodeproj` in Xcode.
3. Select the target (`SmartReader (macOS)` or `SmartReader (iOS)`).
4. Build and Run the project.
5. In Safari, go to `Settings` > `Extensions` and enable **SmartReader**.

### Configuration

Before using the extension, you need to configure your AI settings:
1. Click the SmartReader icon in Safari and select **Open Settings**.
2. Enter your **API URL**, **API Key**, and **Model** (e.g., `gpt-3.5-turbo` or `gpt-4`).
3. (Optional) Customize the **System Text** and **Prompt** to change how the AI summarizes content.
4. Click **Check** to verify your settings, then **Save**.

## Usage

Once configured, simply click the **AI Summary** button in the extension popup or use the trigger icon on any webpage to generate a summary. The summary will include:
1. A brief one-sentence overview.
2. Multiple key points with decorative emojis.

*Note: By default, the AI is prompted to translate the summary into **Traditional Chinese** regardless of the source language.*

## Technologies Used

- [Readability.js](https://github.com/mozilla/readability)
- [marked.js](https://github.com/markedjs/marked)
- [OpenAI API](https://openai.com/api/)
- Apple Safari Web Extensions API

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
