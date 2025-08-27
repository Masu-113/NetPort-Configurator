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
