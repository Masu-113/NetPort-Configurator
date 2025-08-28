<!-- Logo del proyecto -->
<p align="center">
  <img src="src\assets\logo_NetPort_big.png" alt="NetPort Configurator Logo" width="350">
</p>

---

<h1 align="center">NetPort Configurator</h1>

<p align="center">
  Aplicación de escritorio para <b>Windows</b> desarrollada con <b>Tauri</b> y <b>HTML/CSS/JavaScript</b> para visualizar y modificar configuraciones de puertos de red.
</p>

<!-- Badges -->
<p align="center">
  <img src="https://img.shields.io/badge/Plataforma-Windows-blue?style=flat-square" alt="Windows">
  <img src="https://img.shields.io/badge/Tauri-v2.x-orange?style=flat-square" alt="Tauri v2">
  <img src="https://img.shields.io/badge/Licencia-Pendiente-lightgrey?style=flat-square" alt="Licencia">
  <img src="https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=flat-square" alt="Estado">
</p>

---

# NetPort Configurator

Aplicación de escritorio para **Windows**, desarrollada con **Tauri** y **HTML/CSS/JavaScript**, diseñada para visualizar y modificar configuraciones de puertos de red de manera sencilla a través de una interfaz gráfica.

Esta herramienta permite a los administradores y técnicos de redes cambiar rápidamente parámetros clave como:

- **VLAN ID**
- **Dirección IP**
- **Máscara de subred**
- **Puerta de enlace**
- **DHCP**

Incluye scripts **PowerShell (.ps1)** integrados que se ejecutan con permisos elevados para realizar las configuraciones directamente en el sistema.

---

## Características

- Visualización de puertos de red disponibles en el equipo.
- Configuración rápida de VLAN ID, IP, máscara y gateway.
- Integración con scripts `.ps1` para aplicar cambios.
- Ejecución con permisos elevados mediante acceso directo configurado con `runas`.
- Interfaz gráfica ligera y optimizada con HTML/CSS/JS.
- Compatible con **Windows 10/11** (soporte para Linux/Mac con adaptación de scripts).

---

## Requisitos previos

Antes de ejecutar o compilar el proyecto, asegúrate de tener instalado:

| Requisito          | Versión recomendada | Notas |
|--------------------|--------------------|-------|
| [Node.js](https://nodejs.org/) | LTS (>= 16) | Necesario para gestionar dependencias y scripts. |
| [Rust](https://www.rust-lang.org/) | >= 1.70 | Requerido por Tauri para compilar. |
| [Tauri CLI](https://tauri.app/) | v2.x | Instalar con `npm install -g @tauri-apps/cli` o `npx`. |
| **Windows 10/11**  | - | Optimizado para este sistema. |

---

## Instalación para desarrollo

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/usuario/netport-configurator.git
   cd netport-configurator

2. **Instalar Dependencias**
    ```bash
    npm install
3. **Ejecutar modo desarrollo**
    ```bash
    npm run tauiri dev

---

## Modificar Iconos de la Aplicacion

La aplicacion de tauri por defecto ya trae iconos, para ocupar iconos personalizados:

1. **Descargar una imagen `.ico`**

2. **Pagina de donde saque el icono de mi aplicacion: [icon-icons.com](https://icon-icons.com/).**

3. **Ocupar el comando:**
    ```bash
    npm run tauri icon --source ./src-tauri/icons/nombre_archivo.ico

Este comando selecciona una imagen.ico personalizada que se haya descargado o creado, crea varias versiones del icono en distintos tamaños para utilizarlos en la aplicacion, genera un archivo `.icns` y carpetas con iconos para android y ios.

4. **Una vez generados los iconos que se utilizaran se debe de modificar el archivo `tuari.conf.json`**
    ```bash
    {
        "bundle": {
            "icon": [
            "icons/32x32.png",
            "icons/128x128.png",
            "icons/128x128@2x.png",
            "icons/icon.icns",
            "icons/icon.ico"
            ]
        }
    }

5. **Se recomienda que la salida coincida al menos con tauri icon: `32x32.png` , `128x128.png` , `128x128@2x.png` y `icon.png.` .**

6. **En caso de crear uno mismo los iconos consultar documentacion de Tauri: [Creando iconos manualmente](https://v2.tauri.app/develop/icons/#creating-icons-manually).**

---

## Recomendaciones de uso

1. **Ejecucion con permisos elevados**

- Crea un acceso directo que incluya.

Ejemplos: 

1. 
   ```bash 
    runas /noprofile /user:mymachine\NameUser /savedcred "ruta_mi_archivo.exe"
2. 
    ```bash
    runas /noprofile /user:mydomain\NameUser /savedcred "ruta_mi_archivo.exe"

- Configura el acceso directo para que no solicite credenciales cada vez (usando almacenamiento seguro de credenciales de Windows).

2. **Funciones disponibles en la interfaz**

- Seleccionar puerto de red.
- Ver VLAN ID actual.
- Modificar IP, máscara y puerta de enlace.
- Eliminar configuraciones realizadas a un puerto y configurarlo a defecto en DHCP
- Guardar y aplicar cambios mediante scripts .ps1.

---

## Compilación para distribución

Generar ejecutable para Windows:

    
    npm run tauri build

Compilacion cruzada


    cargo-xwin.exe rustc --target x86_64-pc-windows-msvc

Este comando realiza una compilación cruzada de un proyecto Rust para el x86_64-pc-windows-msvc

El archivo resultante estara en:
    
    
    /src-tauri/target/release/bundle

Dentro de la carpeta **bundle** estaran dos carpetas:
 
- Carpeta `msi` que tiene el archivo ejecutable en `.msi`
- Carpeta `nsis` que tiene el archivo ejecutable en `.exe`

Para compilar si esta utilizando Linux o Mac, seguir la [documentación oficial de Tauri](https://v2.tauri.app/es/distribute/windows-installer/#build-windows-apps-on-linux-and-macos).

- **Notas al realizar el empaquetamiento:**

    1. **Al utilizar archivos externos como: `.ps1` se debe de modificar el `tauri.conf.json` de la siguiente manera:**
        ```bash
        "bundle": {
        "active": true,
        "targets": "all",
        "resources": [
            "../src-ps1/get_network_info.ps1",
            "../src-ps1/change_conf_port.ps1",
            "../src-ps1/change_conf_dhcp.ps1"
        ],
        "icon": [
            "icons/32x32.png",
            "icons/128x128.png",
            "icons/128x128@2x.png",
            "icons/icon.icns",
            "icons/icon.ico"     
            ]
        }

    2. **Al realizar esto cuando se empaqueta la aplicacion: `npm run tauri build` , el instalador generara una carpeta junto con la aplicacion con los archivos del programa, si esto no se hace la aplicacion buscara la ruta en la que se encuentran estos archivos y no los encontrara y retornara error.**

    3. **En caso de que no se quieran generar esos archivos junto la aplicacion (Como hizo NetPort) añadir las funcionamiento de estas en el `lib.rs` y eliminar el `resources:[]` añadido anteriormente al archivo `tauiri.conf.json` , asi ya no es necesario crear la carpeta con archivos junto la aplicacion y no se corre el riesgo de que los usuarios manipuelen el contenido de estos archivos.**



---

## Notas sobre la aplicacion.

1. **Rutas a archivos externos.**

    - Se recomienda que al declarara la ruta del archivo que se manda a llamar en el lib.rs sean declaradas de la siguiente manera:
        ```bash
        let script_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../ruta_del_archivo");
    
    - Ya que al empaquetar el proyecto la aplicacion al ejecutar esa funcion buscara el archivo en la ruta en que se especifico y sino la encuentra mostrara error (Esto solo si el instalador crea los archivos junto el aplicativo).

2. **Permisos elevados.**

    - Se recomienda instalar la aplicacion en el disco: `C:\` para evitar errores al querer ejecutarla con el usuario administrador estando en otro usuario que no tenga estos privilegios. 

    - La aplicacion utiliza scripts de `Powershell` que requieren permisos de Administrador.

    - Para evitar que se soliciten credenciales cada vez que se utilice la aplicacion, se recomienda:
    
        1. creat un acceso directo con `runas`.
        2. configurar el almacenamiento seguro de credenciales de Windows.

    - Importante: la manipulacion de configuraciones de red puede afectar la conectividad del sistema, *Usar con precaucion*.

    - Revisar el manual de usuario que brinda NetPort: [Manual de Usuario](documentacion\ManualDeUsuario-NetPort.pdf).

---

## Estructura del Proyecto.

    
    ├── src/                # Archivos HTML, CSS y JS de la interfaz
    ├── src-tauri/          # Configuración y código backend de Tauri
    │   ├── icons/          # Iconos de la aplicación
    │   ├── tauri.conf.json # Configuración principal de Tauri
    │   └── ...
    ├── scripts/            # Scripts PowerShell (.ps1) para cambios de red
    ├── package.json        # Configuración del proyecto y scripts npm
    └── README.md           # Documentación del proyecto

---
