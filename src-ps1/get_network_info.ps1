# Obtener todos los adaptadores de red
$adapters = Get-NetAdapter

# Crear una lista para almacenar los resultados
$resultados = @()

foreach ($adapter in $adapters) {
    # Obtener la configuración IP para cada adaptador
    $ipConfig = Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4 | Select-Object -First 1
    
    # Obtener el VLAN ID
    $vlanID = ($adapter | Get-NetAdapterAdvancedProperty -DisplayName "VLAN ID" -ErrorAction SilentlyContinue).DisplayValue
    
    # Preparar los valores para el output
    $nombre = $adapter.Name
    $ip = if ($ipConfig) { $ipConfig.IPAddress } else { "No IP" }
    $mask = if ($ipConfig) { $ipConfig.PrefixLength } else { "No Mask" }
    $vlan = if ($vlanID) { $vlanID } else { "Null" }
    
    # Agregar los resultados a la lista
    $resultados += "$nombre|$ip|$mask|$vlan"
}

# Mostrar los resultados
Write-Output $resultados

