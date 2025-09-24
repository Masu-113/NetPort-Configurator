# Changelog

Todas las versiones importantes de este proyecto serán documentadas aquí.

## [Unreleased]
### Agregado 
- Funcionalidad para modificar la Ipv6, Longitud de prefijo, puerta de enlace y vlan ID mediante scrips de powershell.

### Cambiado
- Mejora en el diseño de la interfaz.
- Estructuracion y manejo de las vistas.

### Arreglado
- Estructuracion y manejo de las vistas.



## [1.0.0] - 2025-09-09
### Agregado
- Visualización de todos los puertos de red configurados en la computadora.
- Funcionalidad para modificar la dirección IPv4, máscara de subred, puerta de enlace y VLAN ID mediante scripts de PowerShell.
- Verificación del estado del puerto (conectado/desconectado).

### Cambiado
- Interfaz amigable con el usuario para facilitar el uso de la aplicacion.

### Arreglado
- Correccion de validaciones menores al visualizar y modificar los puertos

### Notas de la plataforma
- **Compatibilidad**: Esta versión es compatible exclusivamente con `Windows 10/11` . No se garantiza la funcionalidad en otros sistemas operativos.

### Licencia
- **Esta version De NetPort-Configurator cuanta con licencia MIT.**

## [1.1.0] - 2025--09-17
### Agregado
- El programa detecta los privilegios del usuario que inicia el programa y limitando las acciones que puede hacer si no tiene privilegios elevados.
- En la vista se puede ver el Nombre del usuario que ejecuto la aplicacion.

### Cambiado
- Pequeños cambios en la interfaz.

### Arreglado
- Unica instancia de la aplicacion se maximisa si esta minimisada al tocar el icono del escritorio.

### Licencia
- **Esta version De NetPort-Configurator cuanta con licencia MIT.**