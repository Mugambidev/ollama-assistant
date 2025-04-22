# 🧠 Ollama Local Assistant

A web-based interface for interacting with local LLMs powered by Ollama. This assistant provides specialized help for writing, coding, document Q&A, and API debugging in a clean, intuitive interface.

<div align="center">
  <img src="Images/Screenshot from 2025-04-22 15-48-11.png" alt="Project Screenshot" width="600">
</div>

## Features

- ✍️ **Writing Assistant**: Get help with creative writing, emails, and text generation
- 💻 **Code Helper**: Troubleshoot, optimize, or generate code with CodeLlama
- 📚 **Document Q&A**: Upload documents and ask questions about their content
- 🔧 **Debug Mode**: Test Ollama API directly with custom parameters
- 🔄 **Streaming Responses**: Real-time streaming responses for faster feedback
- 🌐 **100% Local**: All processing happens on your machine for privacy

## Prerequisites

- [Ollama](https://ollama.ai) installed and running on your machine
- Python 3.8+ for the web interface
- Required models:
  - mistral (`ollama pull mistral`)
  - codellama (`ollama pull codellama`)

## Quick Start

### Option 1: Local Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ollama-assistant.git
cd ollama-assistant

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Ollama in another terminal
ollama serve

# Start the Flask app
python app.py
```

Open your browser and navigate to `http://localhost:5000`

### Option 2: Docker Deployment

```bash
# Clone the repository
git clone https://github.com/yourusername/ollama-assistant.git
cd ollama-assistant

# Start with Docker Compose
docker-compose up -d

# First run will take longer as it downloads models
```

Open your browser and navigate to `http://localhost:5000`

## Usage Guide

### Writing Assistant

1. Select the "Writing" tab
2. Enter your prompt (e.g., "Write a professional email requesting a deadline extension")
3. Click "Ask" and see the streamed response

### Code Helper

1. Select the "Code" tab
2. Paste your code or describe what you need help with
3. Click "Ask" for code suggestions or debugging help

### Document Q&A

1. Select the "Doc Q&A" tab
2. Upload a document (PDF, TXT, DOCX, etc.)
3. Enter a question about the document
4. Click "Ask" to get answers based on the document content

### Debug Mode

1. Select the "Debug" tab
2. Choose model and endpoint
3. Enter your prompt
4. Click "Send Request" to see raw API response

## Troubleshooting

- **Ollama Not Running**: Ensure Ollama is running with `ollama serve`
- **Missing Models**: Pull required models with `ollama pull mistral` and `ollama pull codellama`
- **Slow Responses**: Large documents or complex prompts may take longer to process
- **Connection Errors**: Check that Ollama is accessible at `http://localhost:11434`

## Technical Details

- Built with Flask for the backend API
- Uses Ollama API for local LLM inference
- LlamaIndex for document indexing and querying
- Pure JavaScript frontend with no dependencies

## Customization

- Edit `app.py` to change models or endpoint configurations
- Modify `static/style.css` to customize the UI
- Add new tabs in `index.html` and corresponding endpoints in `app.py`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See LICENSE file for details.