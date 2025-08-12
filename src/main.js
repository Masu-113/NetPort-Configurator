const { invoke } = window.__TAURI__.core;

async function cargarDatos() {
  const loader = document.querySelector('.loader.circle');
  loader.classList.add('active');

  try {
    const salida = await invoke("mostrar_puertos_red");
    console.log("salida completa:", JSON.stringify(salida));

    if (!salida.includes("|")) throw new Error("Formato invalido");

    const [nombre, ip, mask, vlan] = salida.split("|");

    document.querySelector("#port-name").value = nombre.trim();
    document.querySelector("#ip-address").value = ip.trim();
    document.querySelector("#subnet-mask").value = mask.trim();
    document.querySelector("#vlan").value = vlan.trim();

    document.querySelector("#response-msg").textContent = "Datos cargados desde PowerShell";
  } catch (e) {
    document.querySelector("#response-msg").textContent = "Error: " + e.message;
  } finally {
    loader.classList.remove('active');
  }
}

async function cambiarVlan() {
  const loader = document.querySelector('.loader.circle');
  loader.classList.add('active'); 

  try {
    const interfaceName = document.querySelector("#port-name").value;
    const newVlanId = document.querySelector("#vlan-input").value;

    const salida = await invoke("cambiar_vlan", { interface_name: interfaceName, new_vlan_id: newVlanId });
    console.log("Salida de cambiar VLAN:", JSON.stringify(salida));
    document.querySelector("#response-msg").textContent = "VLAN cambiado: " + salida;
  } catch (e) {
    document.querySelector("#response-msg").textContent = "Error: " + e.message;
  } finally {
    loader.classList.remove('active'); 
  }
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
