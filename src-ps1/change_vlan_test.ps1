$interfaceName = "{}"
$newVlanId = {}

try{{
    Set-NetAdapterAdvancedProperty  -name $interfaceName -DisplayName "VLAN ID" -DisplayValue $newVlanId
    Write-Output "VLAN ID cambiado a: $newVlanId"
}}
catch{{
    Write-Output "No se pudo cambiar el Vlan Id del puerto de red $_."
}}
