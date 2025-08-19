const { invoke } = window.__TAURI__.core;
// -------- funcion para extraer la informacion de los puertos -------- //
async function cargarDatos() {
  try {
    const salida = await invoke("ejecutar_powershell");
    if (!salida.includes("|")) throw new Error("Formato invalido");

    const lineas = salida.split(/\r?\n/);
    const contenedor = document.querySelector("#contenedor-entradas");
    contenedor.innerHTML = '';

    lineas.forEach(linea => {
    if (!linea.trim()) return;
    const [nombre, ip, mask, vlan, status] = linea.split("|");

    const fila = document.createElement("div");
    fila.classList.add("fila");

    const btnEditar = document.createElement("Button")
    btnEditar.classList.add("btn-editar");
    btnEditar.innerHTML = `<img src="../assets/icone-config.png" alt="icono" width="20" height="20">`;
    btnEditar.onclick = () => editarPuerto(nombre, ip, mask, vlan, status);

    fila.innerHTML = `
      <div class="col">${nombre?.trim() || "—"}</div>
      <div class="col">${ip?.trim() || "—"}</div>
      <div class="col">${mask?.trim() || "—"}</div>
      <div class="col">${vlan?.trim() || "—"}</div>
      <div class="col estado">
        <span class="circulo ${status?.trim() === "Up" ? "verde" : "rojo"}"></span>
        ${status?.trim() || "—"}
      </div>
    `;
    
    fila.querySelector('.estado').appendChild(btnEditar)
    contenedor.appendChild(fila);
  });

    document.querySelector("#response-msg").textContent = "Datos cargados desde PowerShell";
  } catch (e) {
    document.querySelector("#response-msg").textContent = "Error: " + e.message;
  }
}

// ----- Llenar card de edicion con el puerto seleccionado ------ //
function editarPuerto(nombre, ip, mask, vlan, status) {
  document.querySelector("#card-edicion").classList.remove("oculto");

  document.querySelector("#edit-nombre").value = nombre;
  document.querySelector("#edit-ip").value = ip;
  document.querySelector("#edit-mask").value = mask;
  document.querySelector("#edit-vlan").value = vlan;
  document.querySelector("#edit-status").value = status;
}

// Guardar cambios (ejecutar PowerShell con invoke)
async function guardarCambios() {
  const datos = {
    nombre: document.querySelector("#edit-nombre").value,
    ip: document.querySelector("#edit-ip").value,
    mask: document.querySelector("#edit-mask").value,
    vlan: document.querySelector("#edit-vlan").value
  };

  try {
    console.log("Datos a enviar:", datos);
    await invoke("cambiar_config_puerto", { datos });
    alert("Cambios aplicados correctamente");
    cargarDatos();
  } catch (e) {
    console.log("Error al aplicar cambios: ", e)
    alert("Error al aplicar cambios: " + e.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
    const btnAplicarCambios = document.querySelector("#btn-aplicar-cambios");
    if (btnAplicarCambios) {
        btnAplicarCambios.addEventListener("click", guardarCambios);
    } else {
        console.error("Botón de aplicar cambios no encontrado");
    }
});

// ------------------------------------------------------------------------------- //
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
});
