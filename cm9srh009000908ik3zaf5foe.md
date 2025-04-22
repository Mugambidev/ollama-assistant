---
title: "Building a Local AI Assistant with Ollama and Flask"
seoTitle: "Build a Local AI Assistant with Ollama and Flask"
seoDescription: "Learn how to build a privacy-focused AI assistant using Ollama, Flask, and LlamaIndex. Enjoy local LLM access, real-time responses, and offline document Q&A"
datePublished: Tue Apr 22 2025 17:10:46 GMT+0000 (Coordinated Universal Time)
cuid: cm9srh009000908ik3zaf5foe
slug: building-a-local-ai-assistant-with-ollama-and-flask
cover: https://cdn.hashnode.com/res/hashnode/image/stock/unsplash/vII7qKAk-9A/upload/5c4b79e640047287629fa616b23d768f.jpeg
ogImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1745340306463/6c31f96e-87c9-484d-8edb-450fce6a5232.png
tags: ai-flask-ollama-llm-python-opensource-privacyfirst

---

## Introduction

In the era of AI assistants, privacy concerns often take a backseat to convenience. Tools like ChatGPT and Claude offer incredible capabilities, but at the cost of sending your data to third-party servers. What if you could have similar functionality completely offline, running on your own hardware?

Enter Ollama Assistant - a web application I built that brings the power of large language models to your local machine. In this article, I'll share how I created this tool, how it works, and how you can deploy it yourself.

## What is Ollama Assistant?

Ollama Assistant is a web-based interface for interacting with Ollama - an excellent tool for running large language models locally. My application provides a clean, intuitive UI with specialized tools for:

* **Writing assistance** - Help with creative writing, emails, and content generation
    
* **Code assistance** - Debugging, optimization, and code generation
    
* **Document Q&A** - Upload documents and ask questions about their content
    
* **API debugging** - Direct testing of the Ollama API
    

What makes this project special is that **everything runs locally** - your data never leaves your machine, providing complete privacy while still leveraging the power of AI.

## The Technical Stack

The application uses:

* **Backend**: Flask (Python) - Handles API requests and routes them to Ollama
    
* **Frontend**: Pure HTML, CSS, and JavaScript - No frameworks needed
    
* **LLM Interface**: Ollama API - For running models like Mistral and CodeLlama
    
* **Document Processing**: LlamaIndex - For document indexing and semantic search
    

## Key Features Explained

### Real-time Streaming Responses

One of the most satisfying aspects of modern AI assistants is seeing responses generated in real-time. I implemented this using Server-Sent Events (SSE):

```plaintext
javascriptconst eventSource = new EventSource(`${endpoint}?prompt=${encodeURIComponent(prompt)}`);
let fullResponse = '';

eventSource.onmessage = function(e) {
  const data = JSON.parse(e.data);
  fullResponse += data.response;
  responseElement.textContent = fullResponse;
};
```

This creates a one-way channel from server to client, allowing the application to stream tokens as they're generated, rather than waiting for the complete response.

### Document Q&A System

The Document Q&A feature uses LlamaIndex to create vector embeddings of uploaded documents:

```plaintext
pythondocuments = SimpleDirectoryReader(tmpdirname).load_data()
llm = Ollama(model="mistral", request_timeout=REQUEST_TIMEOUT)
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine(llm=llm)
response = query_engine.query(question)
```

This allows users to ask questions about any document they upload, and get AI-powered answers based on the document's content - all without sending sensitive documents to external services.

### Multi-Model Support

Different tasks require different models. The application uses:

* **Mistral** for general writing tasks and document Q&A
    
* **CodeLlama** for code-related tasks
    

This specialization ensures you get the best possible responses for each type of query.

## Deploying Ollama Assistant

### Method 1: Local Installation

```plaintext
bash# Clone the repository
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

### Method 2: Docker Deployment

For a cleaner, containerized setup:

```plaintext
bashdocker-compose up -d
```

This starts both Ollama and the Flask application in containers, with proper networking between them.

## Real-World Use Cases

Here are some practical ways I've been using Ollama Assistant:

1. **Writing blog posts** - Brainstorming ideas and improving drafts
    
2. **Code troubleshooting** - Debugging issues in my projects
    
3. **Learning from documentation** - Uploading technical papers and asking questions
    
4. **Email composition** - Getting help with professional communication
    

The key advantage is that my personal and professional data never leaves my machine - I get AI assistance without privacy concerns.

## Performance Considerations

Running LLMs locally does have some trade-offs:

1. **Hardware requirements** - You'll need a decent GPU for optimal performance
    
2. **Model size limitations** - Larger models might be too heavy for consumer hardware
    
3. **Speed** - Responses may be slower than cloud-based alternatives
    

However, for many use cases, the privacy benefits significantly outweigh these limitations.

## Future Improvements

I'm planning several enhancements:

1. **Model management interface** - Download and switch models from the UI
    
2. **Context memory** - Maintain conversation history
    
3. **Custom fine-tuning** - Allow users to fine-tune models on their own data
    
4. **Voice interface** - Add speech-to-text and text-to-speech capabilities
    

## Conclusion

Building Ollama Assistant has transformed how I interact with AI tools. Instead of using cloud-based services for everything, I now have a privacy-preserving alternative that runs entirely on my machine.

The project demonstrates that with relatively simple tools like Flask and Ollama, we can create powerful AI applications that respect user privacy while still delivering impressive capabilities.

If you're interested in trying it yourself, the full source code is available on [GitHub](https://github.com/Mugambidev/ollama-assistant). I welcome contributions and feedback!