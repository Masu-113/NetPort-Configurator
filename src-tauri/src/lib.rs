
pub async fn ejecutar_powershell() -> Result<String, String> {
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
