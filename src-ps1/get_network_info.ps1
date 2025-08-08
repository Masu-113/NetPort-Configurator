$adapter = Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | Select-Object -First 1
$ipConfig = Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4 | Select-Object -First 1
$vlanID = ($adapter | Get-NetAdapterAdvancedProperty -DisplayName "VLAN ID" -ErrorAction SilentlyContinue).DisplayValue

$nombre = $adapter.Name
$ip = $ipConfig.IPAddress
$mask = $ipConfig.PrefixLength
$vlan = if ($vlanID) { $vlanID } else { "Null" }

Write-Output "$nombre|$ip|$mask|$vlan"
