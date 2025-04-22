// Check if Ollama is running when the page loads
window.onload = function() {
  checkOllamaStatus();
  
  // Periodically check status
  setInterval(checkOllamaStatus, 30000); // Check every 30 seconds
};

let currentRequest = null;

function checkOllamaStatus() {
  fetch('/status')
    .then(res => res.json())
    .then(data => {
      console.log("Status data:", data);
      const statusIndicator = document.getElementById('status-indicator');
      if (data.ollama_service === 'running') {
        statusIndicator.textContent = '✅ Ollama is running';
        statusIndicator.className = 'status-ok';
        
        // Show available models
        if (data.available_models && data.available_models.length > 0) {
          statusIndicator.textContent += ` (Models: ${data.available_models.join(', ')})`;
        }
      } else {
        statusIndicator.textContent = '❌ Ollama is not running';
        statusIndicator.className = 'status-error';
        
        // Show error details if available
        if (data.status_info && data.status_info.error) {
          statusIndicator.textContent += ` (${data.status_info.error})`;
        }
      }
    })
    .catch((error) => {
      console.error("Status check error:", error);
      const statusIndicator = document.getElementById('status-indicator');
      statusIndicator.textContent = '❓ Cannot determine Ollama status';
      statusIndicator.className = 'status-unknown';
    });
}

function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(tab => {
    tab.style.display = "none";
  });
  document.getElementById(tabId).style.display = "block";
}

function sendPrompt(tab) {
  // Cancel any ongoing request
  if (currentRequest) {
    currentRequest.abort();
  }
  
  let endpoint = `/ask/${tab}`;
  let responseElement = document.getElementById(`${tab}Response`);
  
  // Show loading state with animation
  responseElement.innerHTML = '<div class="loading">Loading response<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>';
  
  // Add cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'cancel';
  cancelBtn.onclick = cancelRequest;
  responseElement.parentNode.insertBefore(cancelBtn, responseElement.nextSibling);
  
  if (tab === "docs") {
    const fileInput = document.getElementById("fileUpload");
    if (!fileInput.files || fileInput.files.length === 0) {
      responseElement.textContent = "Please select a file first.";
      cancelBtn.remove();
      return;
    }
    
    const file = fileInput.files[0];
    const question = document.getElementById("docQuestion").value;
    
    if (!question.trim()) {
      responseElement.textContent = "Please enter a question about the document.";
      cancelBtn.remove();
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("question", question);

    currentRequest = new AbortController();
    
    fetch(endpoint, {
      method: "POST",
      body: formData,
      signal: currentRequest.signal
    })
    .then(res => res.json())
    .then(data => {
      console.log("Response data:", data);
      responseElement.textContent = data.response;
      cancelBtn.remove();
      currentRequest = null;
    })
    .catch(error => {
      handleError(error, responseElement);
      cancelBtn.remove();
    });
    return;
  }

  // For writing and code tabs
  let inputElement = tab === "writing" ? "writingInput" : "codeInput";
  let prompt = document.getElementById(inputElement).value;
  
  if (!prompt.trim()) {
    responseElement.textContent = "Please enter a prompt first.";
    cancelBtn.remove();
    return;
  }

  currentRequest = new AbortController();
  
  // Create EventSource for streaming
  if (tab !== "docs") {
    const eventSource = new EventSource(`${endpoint}?prompt=${encodeURIComponent(prompt)}`);
    let fullResponse = '';
    
    eventSource.onmessage = function(e) {
      const data = JSON.parse(e.data);
      if (data.error) {
        responseElement.textContent = data.error;
        eventSource.close();
        cancelBtn.remove();
        return;
      }
      fullResponse += data.response;
      responseElement.textContent = fullResponse;
    };
    
    eventSource.onerror = function() {
      eventSource.close();
      if (fullResponse === '') {
        responseElement.textContent = "Error receiving streamed response";
      }
      cancelBtn.remove();
    };
    
    return;
  }

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
    signal: currentRequest.signal
  })
    .then(res => res.json())
    .then(data => {
      responseElement.textContent = data.response;
      cancelBtn.remove();
      currentRequest = null;
    })
    .catch(error => {
      handleError(error, responseElement);
      cancelBtn.remove();
    });
}

function handleError(error, element) {
  if (error.name === 'AbortError') {
    element.textContent = "Request canceled";
  } else {
    console.error("Request error:", error);
    element.textContent = "Error: " + error.message;
  }
  currentRequest = null;
}

function cancelRequest() {
  if (currentRequest) {
    currentRequest.abort();
    currentRequest = null;
  }
}

// Debug function for direct testing
function debugOllama() {
  if (currentRequest) {
    currentRequest.abort();
  }
  
  const model = document.getElementById('debugModel').value;
  const endpoint = document.getElementById('debugEndpoint').value;
  const prompt = document.getElementById('debugPrompt').value;
  const responseElement = document.getElementById('debugResponse');
  
  responseElement.innerHTML = '<div class="loading">Sending request<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'cancel';
  cancelBtn.onclick = cancelRequest;
  responseElement.parentNode.insertBefore(cancelBtn, responseElement.nextSibling);
  
  currentRequest = new AbortController();
  
  fetch('/debug/ollama', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, endpoint, prompt }),
    signal: currentRequest.signal
  })
    .then(res => res.json())
    .then(data => {
      responseElement.textContent = JSON.stringify(data, null, 2);
      cancelBtn.remove();
      currentRequest = null;
    })
    .catch(error => {
      handleError(error, responseElement);
      cancelBtn.remove();
    });
}