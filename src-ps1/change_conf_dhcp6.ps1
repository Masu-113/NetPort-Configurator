param(
    [string] $nombre = "Ethernet 3"
)

if (-not $nombre) {
    Write-Error "No se ha proporcionado un nombre de adaptador."
    exit 1
}

try {
    # Obtener el adaptador de red
    $adapter = Get-NetAdapter -Name $nombre -ErrorAction Stop

    # Eliminar rutas de puerta de enlace existentes del IPv6
    $routes = Get-NetRoute -InterfaceAlias $adapter.Name -ErrorAction SilentlyContinue | Where-Object { $_.DestinationPrefix -eq "::/0" }
    foreach ($route in $routes) {
        Remove-NetRoute -InterfaceAlias $adapter.Name -DestinationPrefix $route.DestinationPrefix -NextHop $route.NextHop -Confirm:$false
    }

    # Configurar el adaptador para activar el DHCP
    Disable-NetAdapterBinding -Name $adapter.Name -ComponentID ms_tcpip6
    Start-Sleep -Seconds 5
    Enable-NetAdapterBinding -Name $adapter.Name -ComponentID ms_tcpip6

    # Configurar DNS automático para IPv6
    Set-DnsClientServerAddress -InterfaceAlias $adapter.Name -ResetServerAddresses
    
    # Configurar el adaptador para obtener dirección IPv6 automáticamente
    #cmd.exe /c "netsh interface ipv6 set interface "$nombre" automatic"

    Write-Output "El adaptador '$nombre' ha sido configurado correctamente para el DHCP del IPv6."
} catch {
    Write-Error "Error al configurar el adaptador: $_"
    exit 1
}
