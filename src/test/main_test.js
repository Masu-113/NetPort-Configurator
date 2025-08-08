const { invoke } = window.__TAURI__.core;

async function cargarDatos() {
  try {
    const salida = await invoke("ejecutar_powershell");
    console.log("salida completa:", JSON.stringify(salida));
    console.log(salida)

    if (!salida.includes("|")) throw new Error("Formato invalido");

    const [nombre, ip, mask, vlan] = salida.split("|");

    document.querySelector("#port-name").value = nombre.trim();
    document.querySelector("#ip-address").value = ip.trim();
    document.querySelector("#subnet-mask").value = mask.trim();
    document.querySelector("#vlan").value = vlan.trim();

    document.querySelector("#response-msg").textContent = "Datos cargados desde PowerShell";
  } catch (e) {
    document.querySelector("#response-msg").textContent = "Error: " + e.message;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#data-form");
  form.addEventListener("submit", e => {
    e.preventDefault();
    cargarDatos();
  });
});
