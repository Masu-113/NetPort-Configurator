# === Configuración inicial ===

# Obtener nombre del equipo
$Equipo = $env:COMPUTERNAME

# Preguntar usuario con permisos elevados
$Usuario = Read-Host "Ingrese el usuario con permisos administrativos (por ejemplo $Equipo\Administrador)"

# Obtener ruta de este script (.ps1)
$ScriptPath = $MyInvocation.MyCommand.Definition

# Ruta donde está instalada la app (ejecutable .exe)
# Si el script está junto a la app, usamos la carpeta actual:
$AppDir = Split-Path -Parent $ScriptPath
$AppExe = Join-Path $AppDir "TuApp.exe"  # Cambia por el nombre real

# === Ejecución con runas y credenciales guardadas ===
Write-Host "Ejecutando la aplicación como $Usuario..."
Start-Process "runas" "/savecred /user:$Usuario `"$AppExe`""

# === Crear acceso directo en el escritorio ===
$Shell = New-Object -ComObject WScript.Shell
$Desktop = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $Desktop "MiAppElevada.lnk"
$Shortcut = $Shell.CreateShortcut($ShortcutPath)

# El acceso directo ejecutará PowerShell para lanzar este script
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$ScriptPath`""
$Shortcut.WorkingDirectory = $AppDir
$Shortcut.WindowStyle = 1
$Shortcut.IconLocation = "$AppExe,0"
$Shortcut.Save()

Write-Host "Acceso directo creado en el escritorio."
# === Configuración inicial ===

# Obtener nombre del equipo
$Equipo = $env:COMPUTERNAME

# Preguntar usuario con permisos elevados
$Usuario = Read-Host "Ingrese el usuario con permisos administrativos (por ejemplo $Equipo\Administrador)"

# Obtener ruta de este script (.ps1)
$ScriptPath = $MyInvocation.MyCommand.Definition

# Ruta donde está instalada la app (ejecutable .exe)
# Si el script está junto a la app, usamos la carpeta actual:
$AppDir = Split-Path -Parent $ScriptPath
$AppExe = Join-Path $AppDir "TuApp.exe"  # Cambia por el nombre real

# === Ejecución con runas y credenciales guardadas ===
Write-Host "Ejecutando la aplicación como $Usuario..."
Start-Process "runas" "/savecred /user:$Usuario `"$AppExe`""

# === Crear acceso directo en el escritorio ===
$Shell = New-Object -ComObject WScript.Shell
$Desktop = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $Desktop "MiAppElevada.lnk"
$Shortcut = $Shell.CreateShortcut($ShortcutPath)

# El acceso directo ejecutará PowerShell para lanzar este script
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$ScriptPath`""
$Shortcut.WorkingDirectory = $AppDir
$Shortcut.WindowStyle = 1
$Shortcut.IconLocation = "$AppExe,0"
$Shortcut.Save()

Write-Host "Acceso directo creado en el escritorio."
