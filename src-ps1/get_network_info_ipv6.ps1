# Obtener todos los adaptadores de red
        $adapters = Get-NetAdapter

        # Crear una lista para almacenar los resultados
        $resultados = @()

        foreach ($adapter in $adapters) {
            # Obtener la configuración IP para cada adaptador (IPv6)
            $ipConfig = Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv6 | Select-Object -First 1

            # Obtener VLAN ID y estado
            $vlanID = ($adapter | Get-NetAdapterAdvancedProperty -DisplayName "VLAN ID" -ErrorAction SilentlyContinue).DisplayValue
            $status = $adapter.Status

            # Obtener puerta de enlace (gateway)
            $gateway = (Get-NetRoute -InterfaceIndex $adapter.ifIndex -DestinationPrefix '::/0' -ErrorAction SilentlyContinue | 
                        Select-Object -ExpandProperty NextHop -First 1)
            if (-not $gateway) { $gateway = "NULL" }

            # Preparar los valores
            $nombre = $adapter.Name
            $ip = if ($ipConfig) { $ipConfig.IPAddress } else { "No IP" }
            $prefixlength = if ($ipConfig) { $ipConfig.PrefixLength } else { "No prefixlength" }
            $vlan = if ($vlanID) { $vlanID } else { "Null" }

            # Agregar a los resultados
            $resultados += "$nombre|$ip|$prefixlength|$vlan|$status|$gateway"
        }

        # Mostrar los resultados
        Write-Output $resultados