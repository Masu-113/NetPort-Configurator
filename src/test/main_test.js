const { invoke } = window.__TAURI__.core;

async function cargarDatos() {
  const loader = document.querySelector('.loader.circle');
  loader.classList.add('active');

  try {
    const salida = await invoke("mostrar_puertos_red");
    console.log("salida completa:", JSON.stringify(salida));

    // Limpiar el contenedor antes de mostrar nuevos datos
    const portInfoContainer = document.getElementById('port-info-container');
    portInfoContainer.innerHTML = '';

    // Suponiendo que la salida es un string con múltiples líneas para cada puerto
    const puertos = salida.split("\n");

    puertos.forEach(puerto => {
      if (!puerto.includes("|")) throw new Error("Formato invalido en la línea: " + puerto);

      const [nombre, ip, mask, vlan] = puerto.split("|").map(item => item.trim());

      // Crear una tarjeta para cada puerto
      const card = document.createElement('div');
      card.className = 'card flex-row';
      card.innerHTML = `
        <div>
          <strong>Nombre:</strong> ${nombre} <br>
          <strong>IP:</strong> ${ip} <br>
          <strong>Máscara:</strong> ${mask} <br>
          <strong>VLAN:</strong> ${vlan} <br>
        </div>
      `;

      // Agregar la tarjeta al contenedor
      portInfoContainer.appendChild(card);
    });

    document.querySelector("#response-msg").textContent = "Datos cargados desde PowerShell";
  } catch (e) {
    document.querySelector("#response-msg").textContent = "Error: " + e.message;
  } finally {
    loader.classList.remove('active');
  }
}

const toggleBtn = document.querySelector('.toggle-btn');
const sidebar = document.querySelector('.sidebar');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('minimized');
});

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
