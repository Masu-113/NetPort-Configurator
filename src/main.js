const { invoke } = window.__TAURI__.core;

async function cargarDatos() {
  const loader = document.querySelector('.loader'); // Selecciona el loader
  loader.classList.add('active'); // Muestra el loader

  try {
    const salida = await invoke("mostrar_puertos_red"); // Cambia a la función que muestra los puertos
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
    loader.classList.remove('active'); // Oculta el loader al final
  }
}

async function cambiarVlan() {
  const loader = document.querySelector('.loader'); // Selecciona el loader
  loader.classList.add('active'); // Muestra el loader

  try {
    const salida = await invoke("cambiar_vlan"); // Llama a la función que cambia el VLAN
    console.log("Salida de cambiar VLAN:", JSON.stringify(salida));
    document.querySelector("#response-msg").textContent = "VLAN cambiado: " + salida;
  } catch (e) {
    document.querySelector("#response-msg").textContent = "Error: " + e.message;
  } finally {
    loader.classList.remove('active'); // Oculta el loader al final
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#data-form");
  form.addEventListener("submit", e => {
    e.preventDefault();
    cargarDatos();
  });

  // Agregar un evento para cambiar VLAN
  const cambiarVlanButton = document.querySelector("#cambiar-vlan-button");
  cambiarVlanButton.addEventListener("click", e => {
    e.preventDefault();
    cambiarVlan();
  });
});
