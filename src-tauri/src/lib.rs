// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn ejecutar_powershell() -> Result<String, String> {
    let script_path = r"C:\Users\msuarez\tauri-app\src-ps1\get_network_info.ps1".to_string();

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
async fn cambiar_vlan(interface_name: String, new_vlan_id: String) -> Result<String, String> {
    let script = format!(
        r#"
        $interfaceName = "{}"
        $newVlanId = {}
        
        try {{
            Set-NetAdapterAdvancedProperty -Name $interfaceName -DisplayName "VLAN ID" -DisplayValue $newVlanId
            "VLAN ID cambiado a: $newVlanId"
        }} catch {{
            "No se pudo cambiar el VLAN ID: $_"
        }}
        "#,
        interface_name, new_vlan_id
    );

    let output = tauri::async_runtime::spawn_blocking(move || {
        std::process::Command::new("powershell.exe")
            .args(&["-ExecutionPolicy", "Bypass", "-Command", &script])
            .output()
    })
    .await
    .map_err(|e| e.to_string())?
    .map_err(|e| e.to_string())?;

    if output.status.success() {
        let s = String::from_utf8_lossy(&output.stdout).to_string();
        Ok(s.trim().to_string())
    } else {
        let s = String::from_utf8_lossy(&output.stderr).to_string();
        Err(s.trim().to_string())
    }
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![ejecutar_powershell, cambiar_vlan])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
