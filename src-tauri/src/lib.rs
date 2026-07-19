// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use futures_util::StreamExt;
use std::sync::Mutex;
use std::time::Duration;
use tauri::Emitter;

#[derive(Default)]
struct OllamaState {
    url: Mutex<Option<String>>,
    model: Mutex<Option<String>>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(serde::Deserialize)]
struct OllamaTagsResponse {
    models: Vec<OllamaModelRaw>,
}

#[derive(serde::Deserialize)]
struct OllamaModelRaw {
    name: String,
    #[serde(default)]
    size: u64,
}

#[derive(serde::Serialize, Clone)]
struct OllamaModel {
    name: String,
    size: u64,
}

#[derive(serde::Deserialize)]
struct OllamaChatChunk {
    message: Option<ChatMessage>,
    #[serde(default)]
    done: bool,
}

#[tauri::command]
async fn ollama_test_connection(url: String) -> Result<(), String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(4))
        .build()
        .map_err(|e| e.to_string())?;

    let res = client
        .get(format!("{}/api/tags", url.trim_end_matches('/')))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        Ok(())
    } else {
        Err(format!("Ollama respondeu {}", res.status()))
    }
}

#[tauri::command]
async fn ollama_list_models(url: String) -> Result<Vec<OllamaModel>, String> {
    let client = reqwest::Client::new();
    let res = client
        .get(format!("{}/api/tags", url.trim_end_matches('/')))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        return Err(format!("Ollama respondeu {}", res.status()));
    }

    let parsed: OllamaTagsResponse = res.json().await.map_err(|e| e.to_string())?;
    Ok(parsed
        .models
        .into_iter()
        .map(|m| OllamaModel {
            name: m.name,
            size: m.size,
        })
        .collect())
}

#[tauri::command]
fn ollama_select_model(
    state: tauri::State<OllamaState>,
    url: String,
    model: String,
) -> Result<(), String> {
    *state.url.lock().map_err(|e| e.to_string())? = Some(url);
    *state.model.lock().map_err(|e| e.to_string())? = Some(model);
    Ok(())
}

#[tauri::command]
async fn ollama_chat(
    window: tauri::Window,
    state: tauri::State<'_, OllamaState>,
    messages: Vec<ChatMessage>,
) -> Result<(), String> {
    let url = state
        .url
        .lock()
        .map_err(|e| e.to_string())?
        .clone()
        .ok_or_else(|| "Nenhuma URL do Ollama configurada".to_string())?;
    let model = state
        .model
        .lock()
        .map_err(|e| e.to_string())?
        .clone()
        .ok_or_else(|| "Nenhum modelo selecionado".to_string())?;

    let client = reqwest::Client::new();
    let res = client
        .post(format!("{}/api/chat", url.trim_end_matches('/')))
        .json(&serde_json::json!({
            "model": model,
            "messages": messages,
            "stream": true,
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        return Err(format!("Ollama respondeu {}: {}", status, body));
    }

    let mut stream = res.bytes_stream();
    let mut buffer = String::new();

    while let Some(chunk) = stream.next().await {
        let bytes = chunk.map_err(|e| e.to_string())?;
        buffer.push_str(&String::from_utf8_lossy(&bytes));

        while let Some(pos) = buffer.find('\n') {
            let line = buffer[..pos].trim().to_string();
            buffer.drain(..=pos);
            if line.is_empty() {
                continue;
            }

            let parsed: OllamaChatChunk = serde_json::from_str(&line).map_err(|e| e.to_string())?;
            if let Some(msg) = parsed.message {
                window.emit("ollama-chunk", msg.content).map_err(|e| e.to_string())?;
            }
            if parsed.done {
                window.emit("ollama-done", ()).map_err(|e| e.to_string())?;
                return Ok(());
            }
        }
    }

    window.emit("ollama-done", ()).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(OllamaState::default())
        .invoke_handler(tauri::generate_handler![
            ollama_test_connection,
            ollama_list_models,
            ollama_select_model,
            ollama_chat
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
