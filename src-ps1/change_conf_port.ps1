param(
    [string]$nombre = "Ethernet 3",
    [string]$ip = "192.168.97.10",
    [string]$mask = "255.255.0.0",
    [string]$vlan = "20",
    [string]$gateway = "192.168.10.2"
)

# Mostrar los datos recibidos
Write-Output "Modificacion del puerto: $nombre"
Write-Output "Nueva IP: $ip"
Write-Output "Nueva Mascara: $mask"
Write-Output "Nuevo VLAN ID: $vlan"

try {
    Write-Output "Deshabilitando DHCP en la interfaz $nombre..."
    Get-NetIPInterface -InterfaceAlias $nombre -AddressFamily "IPv4" | Set-NetIPInterface -Dhcp Disabled
    
    Write-Output "Configurando VLAN ID: $vlan..."
    Set-NetAdapterAdvancedProperty -Name $nombre -DisplayName "VLAN ID" -DisplayValue $vlan

    # Usar netsh para configurar la IP y la máscara
    Write-Output "Configurando dirección IP y mascara usando netsh..."
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
Write-Output "VLAN ID: $(Get-NetAdapter -Name $nombre | Select-Object -ExpandProperty VLANID)"
write-output "Puerta de Enlace: $($getaway)"

# Salida del script
exit 0
