$userName = Read-Host "Ingrese el nombre de usuario"
$computerName = $env:COMPUTERNAME
$command = "runas /noprofile /user:`"$computerName\$userName`""
Invoke-Expression $command