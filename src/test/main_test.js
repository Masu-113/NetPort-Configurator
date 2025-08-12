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

async function cambiarVlan() {

  try {
    const interfaceName = document.querySelector("#port-name").value;
    const newVlanId = document.querySelector("#vlan-input").value;

    const salida = await invoke("cambiar_vlan", { interface_name: interfaceName, new_vlan_id: newVlanId });
    console.log("Salida de cambiar VLAN:", JSON.stringify(salida));
    document.querySelector("#response-msg").textContent = "VLAN cambiado: " + salida;
  } catch (e) {
    document.querySelector("#response-msg").textContent = "Error: " + e.message;
  }
}

function addform(){
  const contenedor = document.getElementById("form-contenedor");
  const cont_original = document.getElementById("form-original");
  const clon = cont_original.cloneNode(true)
  
  const inputs = clon.querySelectorAll('input');
  inputs.forEach(input => input.value = '');

  const nuevoId = 'formulario-' + (document.querySelectorAll('#form-contenedor > div'.length +1));
  clon.id = nuevoId

  contenedor.appendChild(clon)
}

window.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#data-form");
  form.addEventListener("submit", e => {
    e.preventDefault();
    cargarDatos();
  });
  // para cambiar VLAN
  const cambiarVlanButton = document.querySelector("#cambiar-vlan-button");
  cambiarVlanButton.addEventListener("click", e => {
    e.preventDefault();
    cambiarVlan();
  });
});
