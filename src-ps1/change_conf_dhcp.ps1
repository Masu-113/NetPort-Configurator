param (
    [string]$nombre
)

# Verificar si el nombre del adaptador es proporcionado
if (-not $nombre) {
    Write-Error "No se ha proporcionado un nombre de adaptador."
    exit 1
}

try {
    # Obtener el adaptador de red
    $adapter = Get-NetAdapter -Name $nombre -ErrorAction Stop

    # Eliminar rutas de puerta de enlace existentes
    $routes = Get-NetRoute -InterfaceAlias $adapter.Name -ErrorAction SilentlyContinue | Where-Object { $_.DestinationPrefix -eq "0.0.0.0/0" }
    foreach ($route in $routes) {
        Remove-NetRoute -InterfaceAlias $adapter.Name -DestinationPrefix $route.DestinationPrefix -NextHop $route.NextHop -Confirm:$false
    }

    # Configurar el adaptador para activar el dhcp
    Set-NetIPInterface -InterfaceAlias $adapter.Name -Dhcp Enabled

    # Configurar DNS automatico (en caso de que se hara configurado)
    Set-DnsClientServerAddress -InterfaceAlias $adapter.Name -ResetServerAddresses

    #configurar vlan
    $vlanProp = Get-NetAdapterAdvancedProperty -Name $adapter.Name -ErrorAction SilentlyContinue | Where-Object {$_.DisplayName -match "VLAN"}
    if ($vlanProp) {
        Set-NetAdapterAdvancedProperty -Name $adapter.Name -DisplayName $vlanProp.DisplayName -DisplayValue "0"
        Write-Output "La VLAN del adaptador '$nombre' fue restablecida a 0 (sin VLAN)."
    } else {
        Write-Output "El adaptador '$nombre' no tiene VLAN asignada."
    }

    Write-Output "El adaptador '$nombre' ha sido configurado correctamente para usar DHCP."
} catch {
    Write-Error "Error al configurar el adaptador: $_"
    exit 1
}
