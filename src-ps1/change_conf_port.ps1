param(
    [string]$nombre,
    [string]$ip,
    [string]$mask,
    [string]$vlan,
    [string]$gateway
)

# Verificar los datos que están llegando
Write-Output "Modificación del puerto: $nombre"
Write-Output "Nueva IP: $ip"
Write-Output "Nueva Máscara: $mask"
Write-Output "Nuevo VLAN ID: $vlan"
Write-Output "Nueva puerta de enlace: $gateway"

try {
    Write-Output "Deshabilitando DHCP en la interfaz $nombre..."
    Get-NetIPInterface -InterfaceAlias $nombre -AddressFamily "IPv4" | Set-NetIPInterface -Dhcp Disabled

    # Lógica para manejar VLAN
    if ($vlan -ne $null -and $vlan -ne "") {
        Write-Output "Configurando VLAN ID: $vlan..."
        Set-NetAdapterAdvancedProperty -Name $nombre -DisplayName "VLAN ID" -DisplayValue $vlan
    } else {
        Write-Output "Eliminando configuración de VLAN para el puerto $nombre..."
        Set-NetAdapterAdvancedProperty -Name $nombre -DisplayName "VLAN ID" -DisplayValue 0  # O el valor que indique eliminación
    }

    # Usar netsh para configurar la IP y la máscara
    if ($gateway -eq $null -or $gateway -eq "NULL" -or $gateway -eq "Null") {
        Write-Output "Configurando dirección IP sin puerta de enlace usando netsh..."
        $cmd = "netsh interface ip set address name=`"$nombre`" static $ip $mask"
        cmd.exe /c $cmd
    } else {
        Write-Output "Configurando dirección IP y máscara usando netsh..."
        $cmd = "netsh interface ip set address name=`"$nombre`" static $ip $mask $gateway"
        cmd.exe /c $cmd
    }

    Write-Output "Configuración completada para el puerto: $nombre"
} catch {
    Write-Output "Error al aplicar la configuración: $_"
    exit 1
}

# Verificar la configuración aplicada
$ipConfig = Get-NetIPAddress -InterfaceAlias $nombre
Write-Output "Configuración actual:"
Write-Output "IP: $($ipConfig.IPAddress)"
Write-Output "Máscara: $($ipConfig.PrefixLength)"
$vlanID = (Get-NetAdapterAdvancedProperty -Name $nombre -DisplayName "VLAN ID" -ErrorAction SilentlyContinue).DisplayValue
Write-Output "VLAN ID: $vlanID"
Write-Output "Puerta de Enlace: $gateway"

# Salida del script
exit 0
