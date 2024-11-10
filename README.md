# Log Assistant

A powerful, flexible logging application that helps users create custom AI-powered logging assistants for various purposes. Built with React, TypeScript, and modern web technologies.


## Features

- **Custom Logging Assistants**: Create specialized AI assistants tailored to your specific logging needs
- **Multiple Log Management**: Create and manage multiple logs per assistant
- **Multimodal Input Support**:
  - Voice input with transcription (OpenAI Whisper or local Whisper.cpp)
  - Image analysis and logging
  - Markdown formatting support
- **Flexible AI Backend**:
  - OpenAI integration
  - Local AI support via Ollama
- **Data Export Options**:
  - Download logs in JSON format
  - Export data to CSV
  - Automatic local backup
- **User-Friendly Interface**:
  - Intuitive chat interface
  - Real-time message streaming
  - Markdown formatting
- **Google Calendar Integration**: Set reminders for logging tasks

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- (Optional) OpenAI Account with API Key
- (Optional) Ollama for local AI support
- (Optional) Whisper.cpp for local voice transcription

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jetro30087/Ollogger
   cd Olloger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Configuration

1. **OpenAI Setup** (Optional):
   - Obtain an API key from OpenAI
   - Enter your API key in the settings menu

2. **Ollama Setup** (Optional):
   - Install Ollama on your system (https://ollama.com/)
   - Start the Ollama server *tested with llama3.2-vision
   - Enable Ollama in the settings menu
   - Configure the endpoint (default: http://localhost:11434)

3. **Whisper.cpp Setup** (Optional):
   - Set up a Whisper server *tested with Whisper.cpp (https://github.com/ggerganov/whisper.cpp)
   - Enable in settings when using Ollama
   - Configure the endpoint (default: http://localhost:8080)

## Usage

### Creating a Custom Assistant

1. Click the "Create Assistant" button
2. Describe your logging needs to the assistant
3. Follow the guided process to define:
   - Log categories
   - Data fields
   - Formatting preferences
   - Custom requirements

### Managing Logs

- Create new logs using the "+Create Assistant" button in the sidebar
- Switch between logs using the sidebar
- Rename or delete logs as needed
- Export logs in JSON or CSV format

### Voice and Image Input

- Click the microphone icon for voice input
- Use the image icon to upload and analyze images
- Voice messages can be automatically sent after transcription

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Vite
- OpenAI API
- Ollama
- Lucide Icons
- Date-fns

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for their API
- Ollama team for local AI support
- Whisper.cpp team for local voice transcription
- All contributors and users of this project

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
