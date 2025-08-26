// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::os::windows::process::CommandExt;

#[tauri::command]
async fn ejecutar_powershell() -> Result<String, String> {
    let script_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../src-ps1/get_network_info.ps1");

    let output = tauri::async_runtime::spawn_blocking(move || {
        std::process::Command::new("powershell.exe")
            .args(&["-WindowStyle", "Hidden", "-File", script_path.to_str().unwrap()])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .creation_flags(0x08000000)
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
fn cambiar_config_puerto(datos: serde_json::Value) -> Result<(), String> {
    let nombre = datos["nombre"].as_str().unwrap_or("");
    let ip = datos["ip"].as_str().unwrap_or("");
    let mask = datos["mask"].as_str().unwrap_or("");
    let vlan = datos["vlan"].as_str().unwrap_or("");
    let gateway = datos["gateway"].as_str().unwrap_or("");

    println!("Datos enviados: nombre={}, ip={}, mask={}, vlan={}, gateway={}", nombre, ip, mask, vlan, gateway);
    let script_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../src-ps1/change_conf_port.ps1");

    let output = Command::new("powershell.exe")
        .args(&["-WindowStyle", "Hidden", "-File", script_path.to_str().unwrap()])
        .args(&["-nombre", nombre, "-ip", ip, "-mask", mask, "-vlan", vlan, "-gateway", gateway])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .creation_flags(0x08000000)
        .output()
        .expect("failed to execut command");

    if output.status.success() {
        let success_message = String::from_utf8_lossy(&output.stdout);
        println!("Salida del script: {}", success_message);
        Ok(())
    } else {
        let error_message = String::from_utf8_lossy(&output.stderr);
        Err(format!("Error al modificar la configuración del puerto: {}", error_message))
    }
}

#[tauri::command]
fn configurar_puerto_dhcp(nombre: &str) -> Result<(), String> {
    println!("Configurando el puerto '{}' en DHCP", nombre);
    let script_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../src-ps1/configurar_puerto_dhcp.ps1");

    let output = Command::new("powershell.exe")
        .args(&["-WindowStyle", "Hidden", "-File", script_path.to_str().unwrap()])
        .args(&["-nombre", nombre])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .creation_flags(0x08000000)
        .output()
        .expect("failed to execute command");

    if output.status.success() {
        let success_message = String::from_utf8_lossy(&output.stdout);
        println!("Salida del script: {}", success_message);
        Ok(())
    } else {
        let error_message = String::from_utf8_lossy(&output.stderr);
        Err(format!("Error al configurar el puerto en DHCP: {}", error_message))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![ejecutar_powershell, cambiar_config_puerto, configurar_puerto_dhcp])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
