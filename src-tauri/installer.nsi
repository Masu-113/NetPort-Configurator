!macro customInstall
  ; Ruta del .ps1 que quieres instalar junto a la app
  File /oname=$INSTDIR\shortcut.ps1 "path\to\shortcut.ps1"

  ; Crear acceso directo en el escritorio que ejecuta el .ps1
  CreateShortCut "$DESKTOP\MiAppElevada.lnk" \
    "powershell.exe" \
    "-ExecutionPolicy Bypass -File `"$INSTDIR\shortcut.ps1`"" \
    "$INSTDIR\MiApp.exe" 0
!macroend
