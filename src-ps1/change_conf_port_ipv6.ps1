param(
    [string]$nombre = "Ethernet 3",
    [string]$ip = "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
    [string]$mask = 63,
    [string]$vlan = 10,
    [string]$gateway = "2001:0db8:1234:5678:abcd:ef01:2345:6789"
)

# Verificar los datos que están llegando
Write-Output "Modificación del puerto: $nombre"
Write-Output "Nueva IP: $ip"
Write-Output "Nueva Máscara: $mask"
Write-Output "Nuevo VLAN ID: $vlan"
Write-Output "Nueva puerta de enlace: $gateway"

try {
    # Deshabilitar DHCP en la interfaz IPv6
    Write-Output "Deshabilitando DHCP en la interfaz $nombre..."
    Get-NetIPInterface -InterfaceAlias $nombre -AddressFamily "IPv6" | Set-NetIPInterface -Dhcp Disabled

    #logica para manejar la vlan
    if ($vlan -ne $null -and $vlan -ne "" -and $vlan -ne "NULL" -and $vlan -ne "Null"){
        Write-Output "Configurando Vlan id: $vlan..."
        Set-NetAdapterAdvancedProperty -Name $nombre -DisplayName "VLAN ID" -DisplayValue $vlan
    } else {
        Write-Output "Eliminando configuracion de VLAN para el puerto $nombre..."
        Set-NetAdapterAdvancedProperty -Name $nombre -DisplayName "VLAN ID" -DisplayValue 0
    }

    # Verificar si hay una dirección IPv6 existente
    $existingIPv6 = Get-NetIPAddress -InterfaceAlias $nombre -AddressFamily "IPv6" -ErrorAction SilentlyContinue

    if ($existingIPv6) {
        Write-Output "Eliminando dirección IPv6 existente: $($existingIPv6.IPAddress)..."
        # Eliminar la dirección IPv6 existente
        Remove-NetIPAddress -InterfaceAlias $nombre -IPAddress $existingIPv6.IPAddress -Confirm:$false
    }

    # Configurar la nueva dirección IPv6
    Write-Output "Configurando nueva dirección IPv6: $ip con máscara $mask..."
    New-NetIPAddress -InterfaceAlias $nombre -IPAddress $ip -PrefixLength $mask -AddressFamily IPv6

    # Configurar la puerta de enlace, si se proporciona
    if ($gateway -ne $null -and $gateway -ne "" -and $gateway -ne "NULL" -and $gateway -ne "Null") {
        Write-Output "Configurando puerta de enlace: $gateway..."

        $existingRoute = Get-NetRoute -InterfaceAlias $nombre -DestinationPrefix '::/0' -ErrorAction SilentlyContinue
        if(-not $existingRoute){
            New-NetRoute -InterfaceAlias $nombre -DestinationPrefix '::/0' -NextHop $gateway -AddressFamily IPv6
        } else {
            Write-Output "La ruta ya existe, no se necesita crear una nueva"
        }
    }

    Write-Output "Configuración completada para el puerto: $nombre"
} catch {
    Write-Output "Error al aplicar la configuración: $_"
    exit 1
}

# Verificar la configuración aplicada
$ipConfig = Get-NetIPAddress -InterfaceAlias $nombre -AddressFamily IPv6
Write-Output "Configuración actual:"
Write-Output "IP: $($ipConfig.IPAddress)"
Write-Output "Máscara: $($ipConfig.PrefixLength)"
$vlanID = (Get-NetAdapterAdvancedProperty -Name $nombre -DisplayName "VLAN ID" -ErrorAction SilentlyContinue).DisplayValue
Write-Output "VLAN ID: $vlanID"
Write-Output "Puerta de Enlace: $gateway"

# Salida del script
exit 0