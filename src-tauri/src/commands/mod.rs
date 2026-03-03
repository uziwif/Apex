use std::fs;
use std::path::PathBuf;
use std::process::{Command, Stdio};

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[cfg(target_os = "windows")]
use winapi::um::winbase::CREATE_SUSPENDED;

#[cfg(target_os = "windows")]
fn inject_dll(pid: u32, dll_path: &str) -> Result<(), String> {
    use std::ffi::CString;
    use std::ptr;
    use winapi::shared::minwindef::LPVOID;
    use winapi::um::libloaderapi::{GetModuleHandleA, GetProcAddress};
    use winapi::um::memoryapi::{VirtualAllocEx, WriteProcessMemory};
    use winapi::um::processthreadsapi::{CreateRemoteThread, OpenProcess};
    use winapi::um::winnt::{MEM_COMMIT, MEM_RESERVE, PAGE_EXECUTE_READWRITE, PROCESS_ALL_ACCESS};

    unsafe {
        let h_process = OpenProcess(PROCESS_ALL_ACCESS, 0, pid);
        if h_process.is_null() {
            return Err("Failed to open target process".into());
        }

        let dll_path_c = CString::new(dll_path).map_err(|_| "Invalid DLL path")?;
        let alloc_size = dll_path_c.as_bytes_with_nul().len();

        let remote_mem = VirtualAllocEx(
            h_process,
            ptr::null_mut(),
            alloc_size,
            MEM_COMMIT | MEM_RESERVE,
            PAGE_EXECUTE_READWRITE,
        );
        if remote_mem.is_null() {
            winapi::um::handleapi::CloseHandle(h_process);
            return Err("Failed to allocate remote memory".into());
        }

        if WriteProcessMemory(
            h_process,
            remote_mem,
            dll_path_c.as_ptr() as LPVOID,
            alloc_size,
            ptr::null_mut(),
        ) == 0
        {
            winapi::um::handleapi::CloseHandle(h_process);
            return Err("Failed to write DLL path to process memory".into());
        }

        let kernel32 = CString::new("kernel32.dll").unwrap();
        let h_kernel32 = GetModuleHandleA(kernel32.as_ptr());
        let load_library = CString::new("LoadLibraryA").unwrap();
        let h_load_library = GetProcAddress(h_kernel32, load_library.as_ptr());

        let thread = CreateRemoteThread(
            h_process,
            ptr::null_mut(),
            0,
            Some(std::mem::transmute(h_load_library)),
            remote_mem,
            0,
            ptr::null_mut(),
        );

        if thread.is_null() {
            winapi::um::handleapi::CloseHandle(h_process);
            return Err("Failed to create remote thread".into());
        }

        winapi::um::synchapi::WaitForSingleObject(thread, 10000);
        winapi::um::handleapi::CloseHandle(thread);
        winapi::um::handleapi::CloseHandle(h_process);
    }
    Ok(())
}

#[tauri::command]
pub async fn launch_game(
    game_path: String,
    backend_path: String,
    _redirect_path: String,
    _gameserver_path: String,
    backend_host: String,
    backend_port: u16,
) -> Result<String, String> {
    let game = PathBuf::from(&game_path);

    // Paks directory sanity check (from Flux-Launcher: avoid launching with wrong/corrupt install)
    let paks_dir = game.join("FortniteGame").join("Content").join("Paks");
    if paks_dir.exists() && paks_dir.is_dir() {
        let file_count = fs::read_dir(&paks_dir).map_err(|e| format!("Failed to read Paks directory: {}", e))?.filter_map(|e| e.ok()).filter(|e| e.path().is_file()).count();
        if file_count > 56 {
            return Err(format!("Too many files in Paks directory ({} files). Install may be corrupted or wrong version.", file_count));
        }
    }

    // Remove NVIDIA Aftermath DLL if present to avoid launch issues (from Flux-Launcher)
    let aftermath_dll = game.join("Engine").join("Binaries").join("ThirdParty").join("NVIDIA").join("NVaftermath").join("Win64").join("GFSDK_Aftermath_Lib.x64.dll");
    if aftermath_dll.exists() {
        for attempt in 0..50 {
            match fs::remove_file(&aftermath_dll) {
                Ok(_) => break,
                Err(e) if attempt >= 49 => return Err(format!("Failed to remove Aftermath DLL after 50 attempts: {}", e)),
                _ => {
                    if !aftermath_dll.exists() {
                        break;
                    }
                    std::thread::sleep(std::time::Duration::from_millis(20));
                }
            }
        }
    }
    let aftermath_dir = game.join("Engine").join("Binaries").join("ThirdParty").join("NVIDIA").join("NVaftermath").join("Win64");
    if !aftermath_dir.exists() {
        fs::create_dir_all(&aftermath_dir).map_err(|e| format!("Failed to create directory for DLL: {}", e))?;
    }

    let shipping_exe = game
        .join("FortniteGame")
        .join("Binaries")
        .join("Win64")
        .join("FortniteClient-Win64-Shipping.exe");

    if !shipping_exe.exists() {
        return Err(format!(
            "FortniteClient-Win64-Shipping.exe not found at {}",
            shipping_exe.display()
        ));
    }

    let launcher_exe = game
        .join("FortniteGame")
        .join("Binaries")
        .join("Win64")
        .join("FortniteLauncher.exe");

    let be_exe = game
        .join("FortniteGame")
        .join("Binaries")
        .join("Win64")
        .join("FortniteClient-Win64-Shipping_BE.exe");

    let auth_password = format!("-AUTH_PASSWORD={}", "apex");

    let fort_args: Vec<&str> = vec![
        "-epicapp=Fortnite",
        "-epicenv=Prod",
        "-epiclocale=en-us",
        "-epicportal",
        "-nobe",
        "-nouac",
        "-nocodeguards",
        "-fromfl=eac",
        "-fltoken=3db3ba5dcbd2e16703f3978d",
        "-caldera=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiYmU5ZGE1YzJmYmVhNDQwN2IyZjQwZWJhYWQ4NTlhZDQiLCJnZW5lcmF0ZWQiOjE2Mzg3MTcyNzgsImNhbGRlcmFHdWlkIjoiMzgxMGI4NjMtMmE2NS00NDU3LTliNTgtNGRhYjNiNDgyYTg2IiwiYWNQcm92aWRlciI6IkVhc3lBbnRpQ2hlYXQiLCJub3RlcyI6IiIsImZhbGxiYWNrIjpmYWxzZX0.VAWQB67RTxhiWOxx7DBjnzDnXyyEnX7OljJm-j2d88G_WgwQ9wrE6lwMEHZHjBd1ISJdUO1UVUqkfLdU5nofBQs",
        "-skippatchcheck",
        "-AUTH_LOGIN=",
        "-AUTH_TYPE=exchangecode",
    ];

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;

        let child = Command::new(&shipping_exe)
            .creation_flags(CREATE_NO_WINDOW)
            .args(&fort_args)
            .arg(&auth_password)
            .stdout(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start FortniteClient: {}", e))?;

        let game_pid = child.id();

        if launcher_exe.exists() {
            let _ = Command::new(&launcher_exe)
                .creation_flags(CREATE_NO_WINDOW | CREATE_SUSPENDED)
                .args(&fort_args)
                .stdout(Stdio::piped())
                .spawn();
        }

        if be_exe.exists() {
            let _ = Command::new(&be_exe)
                .creation_flags(CREATE_NO_WINDOW | CREATE_SUSPENDED)
                .args(&fort_args)
                .stdout(Stdio::piped())
                .spawn();
        }

        // Start backend (LawinServer via Node.js)
        let backend = PathBuf::from(&backend_path);
        if backend.exists() {
            let index_js = backend.join("index.js");
            if index_js.exists() {
                let _ = Command::new("node")
                    .arg(&index_js)
                    .current_dir(&backend)
                    .creation_flags(CREATE_NO_WINDOW)
                    .spawn();
            }
        }

        // Inject DLL after a short delay
        let dll_path = get_dll_path();
        if let Some(dll) = dll_path {
            if dll.exists() {
                let dll_str = dll.to_string_lossy().to_string();
                std::thread::spawn(move || {
                    std::thread::sleep(std::time::Duration::from_secs(3));
                    if let Err(e) = inject_dll(game_pid, &dll_str) {
                        eprintln!("DLL injection failed: {}", e);
                    }
                });
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = Command::new(&shipping_exe)
            .args(&fort_args)
            .arg(&auth_password)
            .spawn()
            .map_err(|e| format!("Failed to start FortniteClient: {}", e))?;
    }

    Ok(format!(
        "Game launched (backend: {}:{})",
        backend_host, backend_port
    ))
}

fn get_dll_path() -> Option<PathBuf> {
    dirs::data_local_dir().map(|d| d.join("com.apex.launcher").join("Resources").join("redirect.dll"))
}

#[tauri::command]
pub async fn close_game() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let targets = [
            "FortniteClient-Win64-Shipping.exe",
            "FortniteLauncher.exe",
            "FortniteClient-Win64-Shipping_BE.exe",
            "FortniteClient-Win64-Shipping_EAC.exe",
            "node.exe",
        ];

        for target in targets {
            let _ = Command::new("taskkill")
                .args(["/F", "/IM", target])
                .output();
        }
    }

    Ok("Closed".into())
}

#[tauri::command]
pub async fn download_component(
    component: String,
    url: String,
    dest: String,
) -> Result<String, String> {
    let dest_path = PathBuf::from(&dest);
    if let Some(parent) = dest_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    let zip_path = dest_path.with_extension("zip");

    let response = reqwest::blocking::get(&url)
        .map_err(|e| format!("Download failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("HTTP {}", response.status()));
    }

    let bytes = response.bytes().map_err(|e| format!("Failed to read response: {}", e))?;
    std::fs::write(&zip_path, &bytes).map_err(|e| format!("Failed to write zip: {}", e))?;

    let file = std::fs::File::open(&zip_path).map_err(|e| format!("Failed to open zip: {}", e))?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| format!("Invalid zip: {}", e))?;

    if dest_path.exists() {
        let _ = std::fs::remove_dir_all(&dest_path);
    }
    std::fs::create_dir_all(&dest_path).map_err(|e| format!("Failed to create dest: {}", e))?;

    for i in 0..archive.len() {
        let mut entry = archive.by_index(i).map_err(|e| format!("Zip entry error: {}", e))?;
        let raw_name = entry.name().to_string();

        // Strip the top-level directory (e.g. "LawinServer-main/")
        let stripped = raw_name
            .splitn(2, '/')
            .nth(1)
            .unwrap_or(&raw_name);

        if stripped.is_empty() {
            continue;
        }

        let out_path = dest_path.join(stripped);

        if entry.is_dir() {
            std::fs::create_dir_all(&out_path).ok();
        } else {
            if let Some(parent) = out_path.parent() {
                std::fs::create_dir_all(parent).ok();
            }
            let mut outfile = std::fs::File::create(&out_path)
                .map_err(|e| format!("Failed to create file: {}", e))?;
            std::io::copy(&mut entry, &mut outfile)
                .map_err(|e| format!("Failed to extract: {}", e))?;
        }
    }

    let _ = std::fs::remove_file(&zip_path);

    Ok(format!("{} downloaded to {}", component, dest))
}

#[tauri::command]
pub async fn open_directory(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }
    Ok(())
}
