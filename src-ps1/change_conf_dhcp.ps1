param (
    [string]$nombre
)

# Verificar si el nombre del adaptador es proporcionado
if (-not $nombre) {
    Write-Error "No se ha proporcionado un nombre de adaptador."
    exit 1
}

# Configurar el adaptador de red para que use DHCP
try {
    # Obtener el adaptador de red por su nombre
    $adapter = Get-NetAdapter -Name $nombre -ErrorAction Stop

    # Configurar el adaptador para obtener una dirección IP automáticamente
    Set-NetIPInterface -InterfaceAlias $adapter.Name -Dhcp Enabled

    # Configurar el adaptador para obtener la configuración DNS automáticamente
    Set-DnsClientServerAddress -InterfaceAlias $adapter.Name -ResetServerAddresses

    Write-Output "El adaptador '$nombre' ha sido configurado para usar DHCP."
} catch {
    Write-Error "Error al configurar el adaptador: $_"
    exit 1
}
