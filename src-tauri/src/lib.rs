// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::Command;

#[tauri::command]
#[allow(dead_code)]

fn ejecutar_powershell(port_name: String, ip_address: String, subnet_mask: String, vlan: String) -> Result<String, String> {
    // Comando de PowerShell
    let output = Command::new("powershell.exe")
        .args(&["-ExecutionPolicy", "Bypass", "-File", r"C:\Users\msuarez\Downloads\Prueba runas\Test_runas.bat", &port_name, &ip_address, &subnet_mask, &vlan])
        .output()
        .map_err(|e| e.to_string())?;   

    // Verifica si el comando fue exitoso
    if output.status.success() {
        let result = String::from_utf8_lossy(&output.stdout);
        Ok(result.to_string())
    } else {
        let error = String::from_utf8_lossy(&output.stderr);
        Err(error.to_string())
    }
}
