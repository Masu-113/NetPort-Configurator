# Nombre de la interfaz de red
$interfaceName = "Ethernet 3"
                                
# Intentar obtener el VLAN ID actual
try {
    $currentVlanId = Get-NetAdapterAdvancedProperty -Name $interfaceName -DisplayName "VLAN ID"
    Write-Host "VLAN ID actual: $($currentVlanId.DisplayValue)"
} catch {
    Write-Host "No se pudo obtener el VLAN ID: $_"
}

# Nuevo VLAN ID a establecer
$newVlanId = 55

# Intentar cambiar el VLAN ID
try {
    Set-NetAdapterAdvancedProperty -Name $interfaceName -DisplayName "VLAN ID" -DisplayValue $newVlanId
    Write-Host "VLAN ID cambiado a: $newVlanId"
} catch {
    Write-Host "No se pudo cambiar el VLAN ID: $_"
}

# Reiniciar la interfaz (opcional)
try {
    Disable-NetAdapter -Name $interfaceName -Confirm:$false
    Enable-NetAdapter -Name $interfaceName -Confirm:$false
    Write-Host "Interfaz reiniciada."
} catch {
    Write-Host "Error al reiniciar la interfaz: $_"
}