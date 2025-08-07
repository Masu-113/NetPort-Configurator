const { invoke } = window.__TAURI__.core;
const { Command } = window.__TAURI__.shell;

let portNameEl;
let ipAddressEl;
let subnetMaskEl;
let vlanEl;
let responseMsgEl;

async function ejecutarPowershell() {
  const portName = portNameEl.value;
  const ipAddress = ipAddressEl.value;
  const subnetMask = subnetMaskEl.value;
  const vlan = vlanEl.value;

  // Comando de PowerShell
  const command = new Command('powershell.exe', [
    '-ExecutionPolicy', 'Bypass',
    '-File', 'path/to/your/script.ps1', // Cambia esto a la ruta de tu script
    portName, ipAddress, subnetMask, vlan
  ]);

  try {
    const output = await command.execute();
    responseMsgEl.textContent = output.stdout; // Muestra el resultado en el elemento correspondiente
  } catch (error) {
    console.error('Error al ejecutar el script de PowerShell:', error);
    responseMsgEl.textContent = 'Error al ejecutar el script.';
  }
}

window.addEventListener("DOMContentLoaded", () => {
  portNameEl = document.querySelector("#port-name");
  ipAddressEl = document.querySelector("#ip-address");
  subnetMaskEl = document.querySelector("#subnet-mask");
  vlanEl = document.querySelector("#vlan");
  responseMsgEl = document.querySelector("#response-msg");

  document.querySelector("#data-form").addEventListener("submit", (e) => {
    e.preventDefault();
    ejecutarPowershell(); // Llama a la función para ejecutar PowerShell
  });
});