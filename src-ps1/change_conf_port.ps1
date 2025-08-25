param(
    [string]$nombre,
    [string]$ip,
    [string]$mask,
    [string]$vlan,
    [string]$gateway
)

# Verificar los datos que estan llegando
Write-Output "Modificacion del puerto: $nombre"
Write-Output "Nueva IP: $ip"
Write-Output "Nueva Mascara: $mask"
Write-Output "Nuevo VLAN ID: $vlan"
write-output "Nueva puerta de enlace: $gateway"

try {
    Write-Output "Deshabilitando DHCP en la interfaz $nombre..."
    Get-NetIPInterface -InterfaceAlias $nombre -AddressFamily "IPv4" | Set-NetIPInterface -Dhcp Disabled
    
    Write-Output "Configurando VLAN ID: $vlan..."
    Set-NetAdapterAdvancedProperty -Name $nombre -DisplayName "VLAN ID" -DisplayValue $vlan

    # Usar netsh para configurar la IP y la máscara
    Write-Output "Configurando direccion IP y mascara usando netsh..."
    $cmd = "netsh interface ip set address name=`"$nombre`" static $ip $mask $gateway"
    Invoke-Expression $cmd

    Write-Output "Configuracion completada para el puerto: $nombre"
} catch {
    Write-Output "Error al aplicar la configuración: $_"
    exit 1
}

# Verificar la configuración aplicada
$ipConfig = Get-NetIPAddress -InterfaceAlias $nombre
Write-Output "Configuracion actual:"
Write-Output "IP: $($ipConfig.IPAddress)"
Write-Output "Mscara: $($ipConfig.PrefixLength)"
Write-Output "VLAN ID: $($vlanID = ($adapter | Get-NetAdapterAdvancedProperty -DisplayName "VLAN ID" -ErrorAction SilentlyContinue).DisplayValue)"
write-output "Puerta de Enlace: $($gateway)"

# Salida del script
exit 0
