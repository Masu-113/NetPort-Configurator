# NetPort Configurator

Aplicación de escritorio para **Windows**, desarrollada con **Tauri** y **HTML/CSS/JavaScript**, diseñada para visualizar y modificar configuraciones de puertos de red de manera sencilla a través de una interfaz gráfica.

Esta herramienta permite a los administradores y técnicos de redes cambiar rápidamente parámetros clave como:

- **VLAN ID**
- **Dirección IP**
- **Máscara de subred**
- **Puerta de enlace**

Incluye scripts **PowerShell (.ps1)** integrados que se ejecutan con permisos elevados para realizar las configuraciones directamente en el sistema.

---

## 🚀 Características

- Visualización de puertos de red disponibles en el equipo.
- Configuración rápida de VLAN ID, IP, máscara y gateway.
- Integración con scripts `.ps1` para aplicar cambios.
- Ejecución con permisos elevados mediante acceso directo configurado con `runas`.
- Interfaz gráfica ligera y optimizada con HTML/CSS/JS.
- Compatible con **Windows 10/11** (soporte para Linux/Mac con adaptación de scripts).

---

## 📋 Requisitos previos

Antes de ejecutar o compilar el proyecto, asegúrate de tener instalado:

| Requisito          | Versión recomendada | Notas |
|--------------------|--------------------|-------|
| [Node.js](https://nodejs.org/) | LTS (>= 16) | Necesario para gestionar dependencias y scripts. |
| [Rust](https://www.rust-lang.org/) | >= 1.70 | Requerido por Tauri para compilar. |
| [Tauri CLI](https://tauri.app/) | v2.x | Instalar con `npm install -g @tauri-apps/cli` o `npx`. |
| **Windows 10/11**  | - | Optimizado para este sistema. |

---

## ⚙️ Instalación para desarrollo

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/usuario/netport-configurator.git
   cd netport-configurator

2. **Instalar Dependencias**
    npm install
