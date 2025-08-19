param(
    [string]$nombre,
    [string]$ip,
    [string]$mask,
    [string]$vlan
)

# Mostrar los datos recibidos
Write-Host "Modificación del puerto: $nombre"
Write-Host "Nueva IP: $ip"
Write-Host "Nueva Máscara: $mask"
Write-Host "Nuevo VLAN ID: $vlan"

try {
    # Deshabilitar DHCP en la interfaz
    Set-NetIPInterface -InterfaceAlias $nombre -Dhcp Disabled -ErrorAction Stop

    # Configurar la VLAN
    Set-NetAdapterAdvancedProperty -Name $nombre -DisplayName "VLAN ID" -DisplayValue $vlan -ErrorAction Stop

    # Agregar la dirección IP
    New-NetIPAddress -InterfaceAlias $nombre -IPAddress $ip -PrefixLength (ConvertTo-SubnetPrefix $mask) -ErrorAction Stop

    # Confirmación de configuración
    Write-Host "Configuración completada para el puerto: $nombre"
} catch {
    Write-Host "Error al aplicar la configuración: $_"
    exit 1
}

# Verificar la configuración aplicada
$ipConfig = Get-NetIPAddress -InterfaceAlias $nombre
Write-Host "Configuración actual:"
Write-Host "IP: $($ipConfig.IPAddress)"
Write-Host "Máscara: $($ipConfig.PrefixLength)"
Write-Host "VLAN ID: $(Get-NetAdapter -Name $nombre | Select-Object -ExpandProperty VLANID)"

# Salida del script
exit 0

# Función para convertir la máscara de subred a longitud de prefijo
function ConvertTo-SubnetPrefix {
    param (
        [string]$SubnetMask
    )
    $subnetPrefix = [System.Net.IPAddress]::Parse($SubnetMask).GetAddressBytes() | 
                    ForEach-Object { [Convert]::ToString($_, 2).PadLeft(8, '0') } |
                    Out-String -Stream | 
                    Measure-Object -Character | 
                    Select-Object -ExpandProperty Characters
    return $subnetPrefix
}
