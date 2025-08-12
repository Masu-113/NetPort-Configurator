// Prevents additional console window on Windows in release, DO NOT REMOVE!! 
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Builder;

#[tauri::command]
async fn ejecutar_powershell(script_name: &str) -> Result<String, String> {
    let script_path = format!(r"C:\Users\msuarez\tauri-app\src-ps1\{}.ps1", script_name);

    let output = tauri::async_runtime::spawn_blocking(move || {
        std::process::Command::new("powershell.exe")
            .args(&["-ExecutionPolicy", "Bypass", "-File", &script_path])
            .output()
    })
    .await
    .map_err(|e| e.to_string())?
    .map_err(|e| e.to_string())?;

    println!("RAW stdout: {:?}", output.stdout);
    println!("RAW stderr: {:?}", output.stderr);

    if output.status.success() {
        let s = String::from_utf8_lossy(&output.stdout).to_string();
        println!("stdout text: {:?}", s);
        Ok(s.trim().to_string())
    } else {
        let s = String::from_utf8_lossy(&output.stderr).to_string();
        println!("stderr text: {:?}", s);
        Err(s.trim().to_string())
    }
}

#[tauri::command]
async fn mostrar_puertos_red() -> Result<String, String> {
    ejecutar_powershell("get_network_info").await
}

#[tauri::command]
async fn cambiar_vlan() -> Result<String, String> {
    ejecutar_powershell("cambiar_vlan").await
}

fn main() {
    Builder::default()
        .invoke_handler(tauri::generate_handler![mostrar_puertos_red, cambiar_vlan]) 
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
