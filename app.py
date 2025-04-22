from flask import Flask, request, jsonify, send_from_directory, render_template, Response
from flask_cors import CORS
import requests
import os
import tempfile
import time
import json
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.llms.ollama import Ollama

app = Flask(__name__, static_url_path='/static', static_folder='static')
CORS(app)

# Configuration
OLLAMA_BASE_URL = "http://localhost:11434"
MAX_RETRIES = 3
REQUEST_TIMEOUT = 120  # Increased timeout in seconds

def is_ollama_running():
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            return True, response.json()
        else:
            return False, {"error": f"Status code: {response.status_code}"}
    except requests.exceptions.RequestException as e:
        return False, {"error": str(e)}

@app.route('/status', methods=['GET'])
def status():
    running, status_info = is_ollama_running()
    
    models = []
    if running:
        try:
            for model in ["mistral", "codellama"]:
                try:
                    response = requests.post(
                        f"{OLLAMA_BASE_URL}/api/generate",
                        json={"model": model, "prompt": "test"},
                        timeout=5
                    )
                    if response.status_code == 200:
                        models.append(model)
                except:
                    pass
        except:
            pass
    
    return jsonify({
        'flask_app': 'running',
        'ollama_service': 'running' if running else 'not_running',
        'status_info': status_info,
        'ollama_version': '0.6.5',
        'available_models': models
    })

@app.route('/ask/writing', methods=['POST', 'GET'])
def ask_writing():
    if request.method == 'GET':
        # Handle streaming request
        prompt = request.args.get('prompt', '')
        
        def generate():
            try:
                response = requests.post(
                    f"{OLLAMA_BASE_URL}/api/generate",
                    json={"model": "mistral", "prompt": prompt, "stream": True},
                    stream=True,
                    timeout=REQUEST_TIMEOUT
                )
                
                for chunk in response.iter_lines():
                    if chunk:
                        try:
                            data = json.loads(chunk.decode('utf-8'))
                            yield f"data: {json.dumps({'response': data.get('response', '')})}\n\n"
                        except json.JSONDecodeError:
                            continue
            
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return Response(generate(), mimetype='text/event-stream')
    
    # Fallback for POST
    data = request.get_json()
    prompt = data.get('prompt', '')
    response = requests.post(
        f"{OLLAMA_BASE_URL}/api/generate",
        json={"model": "mistral", "prompt": prompt},
        timeout=REQUEST_TIMEOUT
    ).json()
    return jsonify({'response': response.get('response', '')})

@app.route('/ask/code', methods=['POST', 'GET'])
def ask_code():
    if request.method == 'GET':
        prompt = request.args.get('prompt', '')
        
        def generate():
            try:
                response = requests.post(
                    f"{OLLAMA_BASE_URL}/api/generate",
                    json={"model": "codellama", "prompt": prompt, "stream": True},
                    stream=True,
                    timeout=REQUEST_TIMEOUT
                )
                
                for chunk in response.iter_lines():
                    if chunk:
                        try:
                            data = json.loads(chunk.decode('utf-8'))
                            yield f"data: {json.dumps({'response': data.get('response', '')})}\n\n"
                        except json.JSONDecodeError:
                            continue
            
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return Response(generate(), mimetype='text/event-stream')
    
    data = request.get_json()
    prompt = data.get('prompt', '')
    response = requests.post(
        f"{OLLAMA_BASE_URL}/api/generate",
        json={"model": "codellama", "prompt": prompt},
        timeout=REQUEST_TIMEOUT
    ).json()
    return jsonify({'response': response.get('response', '')})

@app.route('/ask/docs', methods=['POST'])
def ask_docs():
    try:
        if 'file' not in request.files:
            return jsonify({'response': 'Error: No file uploaded'})
            
        file = request.files['file']
        question = request.form['question']

        with tempfile.TemporaryDirectory() as tmpdirname:
            filepath = os.path.join(tmpdirname, file.filename)
            file.save(filepath)

            running, status_info = is_ollama_running()
            if not running:
                return jsonify({'response': f'Error: Ollama service is not running. Status info: {json.dumps(status_info)}'})

            try:
                documents = SimpleDirectoryReader(tmpdirname).load_data()
                llm = Ollama(
                    model="mistral", 
                    request_timeout=REQUEST_TIMEOUT
                )
                index = VectorStoreIndex.from_documents(documents)
                query_engine = index.as_query_engine(llm=llm)
                response = query_engine.query(question)
                return jsonify({'response': str(response)})
                
            except Exception as e:
                return jsonify({'response': f'Error processing document: {str(e)}'})
                
    except Exception as e:
        return jsonify({'response': f'Error: {str(e)}'})

@app.route('/debug/ollama', methods=['POST'])
def debug_ollama():
    data = request.get_json()
    model = data.get('model', 'mistral')
    endpoint = data.get('endpoint', 'generate')
    prompt = data.get('prompt', 'Hello')
    
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/{endpoint}",
            json={"model": model, "prompt": prompt},
            timeout=REQUEST_TIMEOUT
        )
        
        result = {
            "status_code": response.status_code,
            "headers": dict(response.headers),
        }
        
        try:
            result["json"] = response.json()
        except:
            result["text"] = response.text[:500]
            
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)