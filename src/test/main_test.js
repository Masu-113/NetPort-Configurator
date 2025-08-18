const { invoke } = window.__TAURI__.core;

async function cargarDatos() {
  try {
    const salida = await invoke("ejecutar_powershell");
    console.log("salida completa:", JSON.stringify(salida));
    console.log(salida);

    if (!salida.includes("|")) throw new Error("Formato invalido");
    const lineas = salida.split("\r\n");
    
    // Limpiar las entradas
    const contenedor = document.querySelector("#contenedor-entradas");
    contenedor.innerHTML = '';

    // Procesar cada línea
    lineas.forEach(linea => {
      const [nombre, ip, mask, vlan] = linea.split("|");

      // creacion de un nuevo div para imprimir
      const divEntrada = document.createElement("div");
      divEntrada.classList.add("entrada");

      // Creacion de inputs
      const inputNombre = document.createElement("input");
      inputNombre.value = nombre.trim();
      inputNombre.placeholder = "Nombre del puerto";
      inputNombre.readOnly = true;

      const inputIp = document.createElement("input");
      inputIp.value = ip.trim();
      inputIp.placeholder = "IP";
      inputIp.readOnly = true;

      const inputMask = document.createElement("input");
      inputMask.value = mask.trim();
      inputMask.placeholder = "Máscara";
      inputMask.readOnly = true;

      const inputVlan = document.createElement("input");
      inputVlan.value = vlan.trim();
      inputVlan.placeholder = "VLAN";
      inputVlan.readOnly = true;

      // Agregar los inputs
      divEntrada.appendChild(inputNombre);
      divEntrada.appendChild(inputIp);
      divEntrada.appendChild(inputMask);
      divEntrada.appendChild(inputVlan);

      // Agregar el div de entrada al contenedor
      contenedor.appendChild(divEntrada);
    });

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
