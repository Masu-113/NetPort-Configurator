// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::os::windows::process::CommandExt;
use std::process::{Command, Stdio};
use tauri::Manager;

#[tauri::command]
async fn ejecutar_powershell() -> Result<String, String> {
    let script = r#"
        # Obtener todos los adaptadores de red
        $adapters = Get-NetAdapter

        # Crear una lista para almacenar los resultados
        $resultados = @()

        # Función para convertir longitud de prefijo a máscara decimal con punto
        function Convert-PrefixToSubnetMask {
            param ([int]$prefixLength)

            $mask = [uint32]0
            for ($i = 0; $i -lt $prefixLength; $i++) {
                $mask = $mask -bor (1 -shl (31 - $i))
            }

            # Reordenar los bytes para el formato correcto
            $bytes = [BitConverter]::GetBytes([UInt32]$mask)
            if ([BitConverter]::IsLittleEndian) {
                [Array]::Reverse($bytes)
            }

            return ($bytes -join '.')
        }

        foreach ($adapter in $adapters) {
            # Obtener la configuración IP para cada adaptador
            $ipConfig = Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4 | Select-Object -First 1

            # Obtener VLAN ID y estado
            $vlanID = ($adapter | Get-NetAdapterAdvancedProperty -DisplayName "VLAN ID" -ErrorAction SilentlyContinue).DisplayValue
            $status = $adapter.Status

            # Obtener puerta de enlace (gateway)
            $gateway = (Get-NetRoute -InterfaceIndex $adapter.ifIndex -DestinationPrefix '0.0.0.0/0' -ErrorAction SilentlyContinue | 
                        Select-Object -ExpandProperty NextHop -First 1)
            if (-not $gateway) { $gateway = "NULL" }

            # Preparar los valores
            $nombre = $adapter.Name
            $ip = if ($ipConfig) { $ipConfig.IPAddress } else { "No IP" }
            $mask = if ($ipConfig) { Convert-PrefixToSubnetMask $ipConfig.PrefixLength } else { "No Mask" }
            $vlan = if ($vlanID) { $vlanID } else { "Null" }

            # Agregar a los resultados
            $resultados += "$nombre|$ip|$mask|$vlan|$status|$gateway"
        }

        # Mostrar los resultados
        Write-Output $resultados
    "#;

    let output = tauri::async_runtime::spawn_blocking(move || {
        Command::new("powershell.exe")
            .args(&[
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-Command",
                script,
            ])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .creation_flags(0x08000000)
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

#[tauri::command]
fn cambiar_config_puerto(datos: serde_json::Value) -> Result<(), String> {
    let nombre = datos["nombre"].as_str().unwrap_or("");
    let ip = datos["ip"].as_str().unwrap_or("");
    let mask = datos["mask"].as_str().unwrap_or("");
    let vlan = datos["vlan"].as_str().unwrap_or("");
    let gateway = datos["gateway"].as_str().unwrap_or("");

    println!(
        "Datos enviados: nombre={}, ip={}, mask={}, vlan={}, gateway={}",
        nombre, ip, mask, vlan, gateway
    );

    let script = format!(
        r#"
        Write-Output "Modificacion del puerto: {nombre}"
        Write-Output "Nueva IP: {ip}"
        Write-Output "Nueva Máscara: {mask}"
        Write-Output "Nuevo VLAN ID: {vlan}"
        Write-Output "Nueva puerta de enlace: {gateway}"

        try {{
            Write-Output "Deshabilitando DHCP en la interfaz {nombre}..."
            Get-NetIPInterface -InterfaceAlias "{nombre}" -AddressFamily "IPv4" | Set-NetIPInterface -Dhcp Disabled

            # Lógica para manejar VLAN
            if ("{vlan}" -ne "" -and "{vlan}" -ne "NULL" -and "{vlan}" -ne "Null") {{
                Write-Output "Configurando VLAN ID: {vlan}..."
                Set-NetAdapterAdvancedProperty -Name "{nombre}" -DisplayName "VLAN ID" -DisplayValue "{vlan}"
            }} else {{
                Write-Output "Eliminando configuración de VLAN para el puerto {nombre}..."
                Set-NetAdapterAdvancedProperty -Name "{nombre}" -DisplayName "VLAN ID" -DisplayValue 0
            }}

            # Usar netsh para configurar IP y máscara
            if ("{gateway}" -eq "" -or "{gateway}" -eq "NULL" -or "{gateway}" -eq "Null") {{
                Write-Output "Configurando dirección IP sin puerta de enlace usando netsh..."
                cmd.exe /c "netsh interface ip set address name=""{nombre}"" static {ip} {mask}"
            }} else {{
                Write-Output "Configurando dirección IP y máscara usando netsh..."
                cmd.exe /c "netsh interface ip set address name=""{nombre}"" static {ip} {mask} {gateway}"
            }}

            Write-Output "Configuración completada para el puerto: {nombre}"
        }} catch {{
            Write-Output "Error al aplicar la configuración: $_"
            exit 1
        }}

        $ipConfig = Get-NetIPAddress -InterfaceAlias "{nombre}"
        Write-Output "Configuración actual:"
        Write-Output "IP: $($ipConfig.IPAddress)"
        Write-Output "Máscara: $($ipConfig.PrefixLength)"
        $vlanID = (Get-NetAdapterAdvancedProperty -Name "{nombre}" -DisplayName "VLAN ID" -ErrorAction SilentlyContinue).DisplayValue
        Write-Output "VLAN ID: $vlanID"
        Write-Output "Puerta de Enlace: {gateway}"
        exit 0
    "#
    );

    let output = Command::new("powershell.exe")
        .args(&["-WindowStyle", "Hidden", "-Command", &script])
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
        Err(format!(
            "Error al modificar la configuración del puerto: {}",
            error_message
        ))
    }
}

#[tauri::command]
fn configurar_puerto_dhcp(nombre: &str) -> Result<(), String> {
    println!("Configurando el puerto '{}' en DHCP", nombre);
    let script = format!(
        r#"
        if (-not "{nombre}") {{
            Write-Error "No se ha proporcionado un nombre de adaptador."
            exit 1
        }}

        try {{
            # Obtener el adaptador de red
            $adapter = Get-NetAdapter -Name "{nombre}" -ErrorAction Stop

            # Eliminar rutas de puerta de enlace existentes
            $routes = Get-NetRoute -InterfaceAlias $adapter.Name -ErrorAction SilentlyContinue | Where-Object {{ $_.DestinationPrefix -eq "0.0.0.0/0" }}
            foreach ($route in $routes) {{
                Remove-NetRoute -InterfaceAlias $adapter.Name -DestinationPrefix $route.DestinationPrefix -NextHop $route.NextHop -Confirm:$false
            }}

            # Configurar el adaptador para activar DHCP
            Set-NetIPInterface -InterfaceAlias $adapter.Name -Dhcp Enabled

            # Configurar DNS automático
            Set-DnsClientServerAddress -InterfaceAlias $adapter.Name -ResetServerAddresses

            # Resetear VLAN (si está configurada)
            $vlanProp = Get-NetAdapterAdvancedProperty -Name $adapter.Name -ErrorAction SilentlyContinue | Where-Object {{ $_.DisplayName -match "VLAN" }}
            if ($vlanProp) {{
                Set-NetAdapterAdvancedProperty -Name $adapter.Name -DisplayName $vlanProp.DisplayName -DisplayValue "0"
                Write-Output "La VLAN del adaptador '{nombre}' fue restablecida a 0 (sin VLAN)."
            }} else {{
                Write-Output "El adaptador '{nombre}' no tiene VLAN asignada."
            }}

            Write-Output "El adaptador '{nombre}' ha sido configurado correctamente para usar DHCP."
        }} catch {{
            Write-Error "Error al configurar el adaptador: $_"
            exit 1
        }}
    "#
    );
    let output = Command::new("powershell.exe")
        .args(&["-WindowStyle", "Hidden", "-Command", &script])
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
        Err(format!(
            "Error al configurar el puerto en DHCP: {}",
            error_message
        ))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _event, _payload| {
            // Intenta obtener la ventana principal
            if let Some(main_window) = app.get_webview_window("main") {
                // Restaura la ventana si está minimizada
                let _ = main_window.show();
                let _ = main_window.set_focus();
            }
        }))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            ejecutar_powershell,
            cambiar_config_puerto,
            configurar_puerto_dhcp
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}




