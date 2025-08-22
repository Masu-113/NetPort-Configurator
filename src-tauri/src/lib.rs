// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::path::PathBuf;
use std::process::Command;

#[tauri::command]
async fn ejecutar_powershell() -> Result<String, String> {
    let script_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../src-ps1/get_network_info.ps1");

    let output = tauri::async_runtime::spawn_blocking(move || {
        std::process::Command::new("powershell.exe")
            .args(&["-ExecutionPolicy", "Bypass", "-File", script_path.to_str().unwrap()])
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

    println!("Datos enviados: nombre={}, ip={}, mask={}, vlan={}", nombre, ip, mask, vlan);
    let script_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../src-ps1/change_conf_port.ps1");

    let output = Command::new("powershell.exe")
        .arg("-ExecutionPolicy")
        .arg("Bypass")
        .arg("-NoProfile")
        .arg("-Command")
        .arg(format!("& '{}' -nombre '{}' -ip '{}' -mask '{}' -vlan '{}'",
            script_path.to_str().unwrap(),
            nombre, ip, mask, vlan
        ))
        .output()
        .expect("Failed to execute command");

    if output.status.success() {
        let success_message = String::from_utf8_lossy(&output.stdout);
        println!("Salida del script: {}", success_message);
        Ok(())
    } else {
        let error_message = String::from_utf8_lossy(&output.stderr);
        Err(format!("Error al modificar la configuración del puerto: {}", error_message))
    }
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![ejecutar_powershell, cambiar_config_puerto])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
