// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use futures_util::StreamExt;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::Duration;
use tauri::Emitter;

struct OllamaState {
    url: Mutex<Option<String>>,
    model: Mutex<Option<String>>,
    client: reqwest::Client,
}

impl Default for OllamaState {
    fn default() -> Self {
        let client = reqwest::Client::builder()
            .pool_idle_timeout(Duration::from_secs(90))
            .pool_max_idle_per_host(10)
            .tcp_keepalive(Duration::from_secs(60))
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());
        Self {
            url: Mutex::new(None),
            model: Mutex::new(None),
            client,
        }
    }
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
async fn ollama_test_connection(
    state: tauri::State<'_, OllamaState>,
    url: String,
) -> Result<(), String> {
    let res = state
        .client
        .get(format!("{}/api/tags", url.trim_end_matches('/')))
        .timeout(Duration::from_secs(4))
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
async fn ollama_list_models(
    state: tauri::State<'_, OllamaState>,
    url: String,
) -> Result<Vec<OllamaModel>, String> {
    let res = state
        .client
        .get(format!("{}/api/tags", url.trim_end_matches('/')))
        .timeout(Duration::from_secs(5))
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

    let res = state
        .client
        .post(format!("{}/api/chat", url.trim_end_matches('/')))
        .json(&serde_json::json!({
            "model": model,
            "messages": messages,
            "stream": true,
            "keep_alive": "30m"
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

            if let Ok(parsed) = serde_json::from_str::<OllamaChatChunk>(&line) {
                if let Some(msg) = parsed.message {
                    if !msg.content.is_empty() {
                        let _ = window.emit("ollama-chunk", msg.content);
                    }
                }
                if parsed.done {
                    let _ = window.emit("ollama-done", ());
                    return Ok(());
                }
            }
        }
    }

    let _ = window.emit("ollama-done", ());
    Ok(())
}

// ---------------------------------------------------------------------------
// Path validation utilities
// ---------------------------------------------------------------------------

/// Validates that `path` (possibly relative) stays within `working_dir`.
/// Uses `canonicalize` to resolve symlinks, so both the working_dir and the
/// target path must already exist on disk.
/// Returns the absolute, canonicalized PathBuf or a descriptive error.
fn validate_path(path: &str, working_dir: &str) -> Result<PathBuf, String> {
    let base = Path::new(working_dir)
        .canonicalize()
        .map_err(|e| format!("Diretório de trabalho inválido: {e}"))?;

    let candidate = if Path::new(path).is_absolute() {
        PathBuf::from(path)
    } else {
        base.join(path)
    };

    let resolved = candidate
        .canonicalize()
        .map_err(|e| format!("Caminho não encontrado: {e}"))?;

    if !resolved.starts_with(&base) {
        return Err(format!(
            "Acesso negado: o caminho '{path}' está fora do diretório de trabalho permitido."
        ));
    }

    Ok(resolved)
}

/// Variant for write operations: accepts paths that do not yet exist by using
/// lexical normalisation instead of `canonicalize`.
fn validate_path_for_write(path: &str, working_dir: &str) -> Result<PathBuf, String> {
    let base = Path::new(working_dir)
        .canonicalize()
        .map_err(|e| format!("Diretório de trabalho inválido: {e}"))?;

    let candidate = if Path::new(path).is_absolute() {
        PathBuf::from(path)
    } else {
        base.join(path)
    };

    let normalized = normalize_path(&candidate);

    if !normalized.starts_with(&base) {
        return Err(format!(
            "Acesso negado: o caminho '{path}' está fora do diretório de trabalho permitido."
        ));
    }

    Ok(normalized)
}

/// Lexical path normalisation: resolves `.` and `..` components without
/// requiring the path to exist on disk.
fn normalize_path(path: &Path) -> PathBuf {
    let mut components: Vec<std::path::Component> = Vec::new();
    for comp in path.components() {
        match comp {
            std::path::Component::ParentDir => {
                components.pop();
            }
            std::path::Component::CurDir => {}
            other => {
                components.push(other);
            }
        }
    }
    components.iter().collect()
}

// ---------------------------------------------------------------------------
// Filesystem structs
// ---------------------------------------------------------------------------

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct WriteResult {
    pub path: String,
    pub bytes_written: u64,
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum EntryKind {
    File,
    Directory,
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct DirEntry {
    pub name: String,
    pub path: String,
    pub kind: EntryKind,
    pub size: u64,
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct ListResult {
    pub entries: Vec<DirEntry>,
    pub truncated: bool,
}

// ---------------------------------------------------------------------------
// Filesystem commands: fs_read_file, fs_write_file
// ---------------------------------------------------------------------------

#[tauri::command]
async fn fs_read_file(path: String, working_dir: String) -> Result<String, String> {
    const MAX_SIZE: u64 = 10 * 1024 * 1024; // 10 MB

    let resolved = validate_path(&path, &working_dir)?;

    let metadata = std::fs::metadata(&resolved)
        .map_err(|e| format!("Erro ao acessar metadados: {e}"))?;

    if metadata.len() > MAX_SIZE {
        return Err(format!(
            "Arquivo excede o limite de 10 MB (tamanho: {} bytes).",
            metadata.len()
        ));
    }

    std::fs::read_to_string(&resolved)
        .map_err(|e| format!("Erro ao ler arquivo: {e}"))
}

#[tauri::command]
async fn fs_write_file(
    path: String,
    content: String,
    working_dir: String,
) -> Result<WriteResult, String> {
    let resolved = validate_path_for_write(&path, &working_dir)?;

    // Create intermediate directories if needed
    if let Some(parent) = resolved.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Erro ao criar diretórios intermediários: {e}"))?;
    }

    // Write UTF-8 without BOM
    let bytes = content.as_bytes();
    std::fs::write(&resolved, bytes)
        .map_err(|e| format!("Erro ao escrever arquivo: {e}"))?;

    Ok(WriteResult {
        path: resolved.to_string_lossy().into_owned(),
        bytes_written: bytes.len() as u64,
    })
}

#[tauri::command]
async fn fs_list_directory(
    path: String,
    working_dir: String,
    depth: u8,
) -> Result<ListResult, String> {
    use ignore::WalkBuilder;

    const MAX_ITEMS: usize = 1000;
    const MAX_DEPTH: u8 = 10;

    let resolved = validate_path(&path, &working_dir)?;
    let base = std::path::Path::new(&working_dir)
        .canonicalize()
        .map_err(|e| format!("Diretório de trabalho inválido: {e}"))?;

    let effective_depth = depth.min(MAX_DEPTH) as usize;

    let mut entries: Vec<DirEntry> = Vec::new();
    let mut truncated = false;

    let walker = WalkBuilder::new(&resolved)
        .max_depth(Some(effective_depth))
        .sort_by_file_name(|a, b| a.cmp(b))
        .build();

    for result in walker {
        let entry = result.map_err(|e| format!("Erro ao listar: {e}"))?;

        if entry.path() == resolved {
            continue;
        }

        if entries.len() >= MAX_ITEMS {
            truncated = true;
            break;
        }

        let meta = entry.metadata().map_err(|e| e.to_string())?;
        let rel_path = entry
            .path()
            .strip_prefix(&base)
            .map(|p| p.to_string_lossy().into_owned())
            .unwrap_or_default();

        entries.push(DirEntry {
            name: entry.file_name().to_string_lossy().into_owned(),
            path: rel_path,
            kind: if meta.is_dir() {
                EntryKind::Directory
            } else {
                EntryKind::File
            },
            size: if meta.is_file() { meta.len() } else { 0 },
        });
    }

    Ok(ListResult { entries, truncated })
}

// ---------------------------------------------------------------------------
// Filesystem commands: fs_run_script, fs_select_directory, fs_verify_permission
// ---------------------------------------------------------------------------

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct ScriptResult {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
}

#[tauri::command]
async fn fs_run_script(command: String, working_dir: String) -> Result<ScriptResult, String> {
    use tokio::process::Command;
    use tokio::time::{timeout, Duration};

    let base = std::path::Path::new(&working_dir)
        .canonicalize()
        .map_err(|e| format!("Diretório de trabalho inválido ou inacessível: {e}"))?;

    let trimmed = command.trim();
    if trimmed.is_empty() {
        return Err("Comando não pode ser vazio.".to_string());
    }
    if trimmed.contains("..") {
        return Err(
            "Comando não pode conter sequências de traversal de diretório ('..').".to_string(),
        );
    }

    let default_shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".to_string());

    let child = Command::new(&default_shell)
        .arg("-l")
        .arg("-c")
        .arg(trimmed)
        .current_dir(&base)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Erro ao iniciar processo com {default_shell}: {e}"))?;

    let result = timeout(Duration::from_secs(120), child.wait_with_output()).await;

    match result {
        Err(_) => Err("Tempo limite de execução atingido (120s).".to_string()),
        Ok(Err(e)) => Err(format!("Erro ao aguardar processo: {e}")),
        Ok(Ok(output)) => Ok(ScriptResult {
            stdout: String::from_utf8_lossy(&output.stdout).into_owned(),
            stderr: String::from_utf8_lossy(&output.stderr).into_owned(),
            exit_code: output.status.code().unwrap_or(-1),
        }),
    }
}

#[tauri::command]
async fn fs_open_system_terminal(working_dir: String) -> Result<(), String> {
    use tokio::process::Command;
    let base = std::path::Path::new(&working_dir)
        .canonicalize()
        .map_err(|e| format!("Diretório de trabalho inválido: {e}"))?;

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg("-a")
            .arg("Terminal")
            .arg(&base)
            .spawn()
            .map_err(|e| format!("Erro ao abrir Terminal do sistema: {e}"))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("x-terminal-emulator")
            .current_dir(&base)
            .spawn()
            .or_else(|_| Command::new("gnome-terminal").current_dir(&base).spawn())
            .map_err(|e| format!("Erro ao abrir terminal no Linux: {e}"))?;
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .arg("/c")
            .arg("start")
            .arg("cmd.exe")
            .current_dir(&base)
            .spawn()
            .map_err(|e| format!("Erro ao abrir terminal no Windows: {e}"))?;
    }

    Ok(())
}

#[tauri::command]
async fn fs_select_directory(app: tauri::AppHandle) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    let dir = app
        .dialog()
        .file()
        .set_title("Selecionar diretório de trabalho")
        .blocking_pick_folder();

    match dir {
        Some(path) => Ok(path.to_string()),
        None => Err("Nenhum diretório selecionado.".to_string()),
    }
}

#[tauri::command]
async fn fs_verify_permission(working_dir: String) -> Result<bool, String> {
    let base = std::path::Path::new(&working_dir)
        .canonicalize()
        .map_err(|_| false.to_string())?;

    let test_file = base.join(".kiro-permission-test");

    let write_ok = std::fs::write(&test_file, b"ok").is_ok();
    let read_ok = write_ok && std::fs::read(&test_file).is_ok();
    let _ = std::fs::remove_file(&test_file);

    Ok(write_ok && read_ok)
}

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    /// Creates a temporary directory for testing and returns its canonicalized path.
    fn temp_working_dir(name: &str) -> String {
        let dir = std::env::temp_dir().join(name);
        fs::create_dir_all(&dir).expect("failed to create temp dir");
        dir.canonicalize()
            .expect("failed to canonicalize temp dir")
            .to_string_lossy()
            .into_owned()
    }

    // --- validate_path tests ---

    #[test]
    fn test_validate_path_rejects_dotdot_traversal() {
        let wd = temp_working_dir("test_vp_dotdot");
        // A path starting with `..` must be rejected regardless of what follows.
        // `validate_path` may return either "Acesso negado" (if the traversal target
        // exists but is outside the base) or "Caminho não encontrado" (if the OS
        // cannot canonicalize the path at all). Both cases are correct rejections.
        let result = validate_path("../outside_file.txt", &wd);
        assert!(
            result.is_err(),
            "Expected Err for '../outside_file.txt', got Ok"
        );
    }

    #[test]
    fn test_validate_path_rejects_absolute_path_outside_working_dir() {
        let wd = temp_working_dir("test_vp_absolute");
        // An absolute path pointing outside the working_dir must be rejected
        let outside = "/tmp/totally_outside_path_xyz";
        let result = validate_path(outside, &wd);
        // Either the path doesn't exist (canonicalize fails) or it is outside the base
        assert!(
            result.is_err(),
            "Expected Err for absolute path outside working_dir, got Ok"
        );
    }

    #[test]
    fn test_validate_path_accepts_valid_relative_path() {
        let wd = temp_working_dir("test_vp_valid");
        // Create a file inside the working_dir so canonicalize can resolve it
        let file_path = std::path::Path::new(&wd).join("hello.txt");
        fs::write(&file_path, b"hi").expect("failed to write test file");

        let result = validate_path("hello.txt", &wd);
        assert!(
            result.is_ok(),
            "Expected Ok for valid relative path, got Err: {:?}",
            result.err()
        );
        let resolved = result.unwrap();
        assert!(
            resolved.starts_with(&wd),
            "Resolved path '{}' should start with working_dir '{wd}'",
            resolved.display()
        );
    }

    // --- validate_path_for_write tests ---

    #[test]
    fn test_validate_path_for_write_rejects_dotdot_traversal() {
        let wd = temp_working_dir("test_vpw_dotdot");
        let result = validate_path_for_write("../../outside.txt", &wd);
        assert!(
            result.is_err(),
            "Expected Err for '../../outside.txt', got Ok"
        );
        let msg = result.unwrap_err();
        assert!(
            msg.contains("Acesso negado") || msg.contains("fora do diretório"),
            "Unexpected error message: {msg}"
        );
    }

    #[test]
    fn test_validate_path_for_write_rejects_absolute_path_outside() {
        let wd = temp_working_dir("test_vpw_absolute");
        let result = validate_path_for_write("/etc/passwd", &wd);
        assert!(
            result.is_err(),
            "Expected Err for absolute path '/etc/passwd', got Ok"
        );
    }

    #[test]
    fn test_validate_path_for_write_accepts_nonexistent_relative_path() {
        let wd = temp_working_dir("test_vpw_new");
        // The file does not yet exist — write variant must still accept it
        let result = validate_path_for_write("new_file.txt", &wd);
        assert!(
            result.is_ok(),
            "Expected Ok for non-existent relative path, got Err: {:?}",
            result.err()
        );
        let resolved = result.unwrap();
        assert!(
            resolved.starts_with(&wd),
            "Resolved path '{}' should start with working_dir '{wd}'",
            resolved.display()
        );
    }

    // --- normalize_path tests ---

    #[test]
    fn test_normalize_path_removes_dot_components() {
        let p = Path::new("/a/b/./c");
        let normalized = normalize_path(p);
        assert_eq!(normalized, PathBuf::from("/a/b/c"));
    }

    #[test]
    fn test_normalize_path_resolves_dotdot() {
        let p = Path::new("/a/b/../c");
        let normalized = normalize_path(p);
        assert_eq!(normalized, PathBuf::from("/a/c"));
    }

    #[test]
    fn test_normalize_path_multiple_dotdot() {
        let p = Path::new("/a/b/c/../../d");
        let normalized = normalize_path(p);
        assert_eq!(normalized, PathBuf::from("/a/d"));
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(OllamaState::default())
        .invoke_handler(tauri::generate_handler![
            ollama_test_connection,
            ollama_list_models,
            ollama_select_model,
            ollama_chat,
            fs_read_file,
            fs_write_file,
            fs_list_directory,
            fs_run_script,
            fs_open_system_terminal,
            fs_select_directory,
            fs_verify_permission,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
