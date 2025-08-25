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
    const [nombre, ip, mask, vlan, status, getaway] = linea.split("|");

    const fila = document.createElement("div");
    fila.classList.add("fila");

    const btnEditar = document.createElement("Button")
    btnEditar.classList.add("btn-editar");
    btnEditar.innerHTML = `<img src="../assets/icone-config.png" alt="icono" width="20" height="20">`;
    btnEditar.onclick = () => editarPuerto(nombre, ip, mask, vlan, status, getaway);
    

    fila.innerHTML = `
      <div class="col">${nombre?.trim() || "—"}</div>
      <div class="col">${ip?.trim() || "—"}</div>
      <div class="col">${mask?.trim() || "—"}</div>
      <div class="col">${getaway?.trim() || "—"}</div>
      <div class="col">${vlan?.trim() || "—"}</div>
      <div class="col estado">
        <span class="circulo ${status?.trim() === "Up" ? "verde" : "rojo"}"></span>
        ${status?.trim() || "—"}
      </div>
    `;
    
    fila.querySelector('.estado').appendChild(btnEditar)
    contenedor.appendChild(fila);
  });

    document.querySelector("#response-msg").textContent = "Puertos cargados Correctamente.";
  } catch (e) {
    document.querySelector("#response-msg").textContent = "Error: " + e.message;
  }
}

// ----- Llenar card de edicion con el puerto seleccionado ------ //
function editarPuerto(nombre, ip, mask, vlan, status, getaway) {
  document.querySelector("#card-edicion").classList.remove("oculto");

  document.querySelector("#edit-nombre").value = nombre;
  document.querySelector("#edit-ip").value = ip;
  document.querySelector("#edit-mask").value = mask;
  document.querySelector("#edit-vlan").value = vlan;
  document.querySelector("#edit-status").value = status;
  document.querySelector("#edit-puerta-enlace").value = getaway;
}

// ----- Manda las modificaciones de los puertos a change_conf_port.ps1 ------ //
async function guardarCambios() {
  const datos = {
    nombre: document.querySelector("#edit-nombre").value,
    ip: document.querySelector("#edit-ip").value,
    mask: document.querySelector("#edit-mask").value,
    vlan: document.querySelector("#edit-vlan").value,
    gateway: document.querySelector("#edit-puerta-enlace").value
  };

  if(!validar_datos(datos)){
    alert("Completar todos los campos.");
    return;
  }

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

function validar_datos(datos){
  const ipRegex = /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
  const ipMask = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

  if(!datos.nombre || !datos.ip || !datos.mask || !datos.vlan || !datos.gateway){
      return false;
    }
  if(!ipRegex.test(datos.ip)){
      alert("La direccion ip no es valida.");
      return false;
  }
  if(!ipMask.test(datos.mask)){
      alert("La mascara que inserto no es valida.");
      return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
    const btnAplicarCambios = document.querySelector("#btn-aplicar-cambios");
    if (btnAplicarCambios) {
        btnAplicarCambios.addEventListener("click", guardarCambios);
    } else {
        console.error("Botón de aplicar cambios no encontrado");
    }
});

window.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#data-form");
  form.addEventListener("submit", e => {
    e.preventDefault();
    cargarDatos();
  });
});
