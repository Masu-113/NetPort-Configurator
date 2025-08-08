// Prevents additional console window on Windows in release, DO NOT REMOVE!! 
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Builder;

// Define the command function
#[tauri::command]
fn ejecutar_powershell() -> String {
    "Powershell command executed".to_string()
}

fn main() {
    Builder::default()
        .invoke_handler(tauri::generate_handler![ejecutar_powershell]) // Registra el comando
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
