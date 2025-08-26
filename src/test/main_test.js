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

      const btnEditar = document.createElement("button");
      btnEditar.type = "button";
      btnEditar.classList.add("btn-editar");
      btnEditar.innerHTML = `<img src="../assets/icone-config.png" alt="icono" width="20" height="20">`;
      
      // Evitar que el evento se propague
      btnEditar.onclick = (event) => {
        event.stopPropagation();
        editarPuerto(nombre, ip, mask, vlan, status, getaway);
      };

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

      fila.querySelector('.estado').appendChild(btnEditar);
      contenedor.appendChild(fila);
    });

    mostrarNotificacion("Puertos cargados correctamente.", "success");
  } catch (e) {
    mostrarNotificacion("Error: " + e.message, "error");
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

  if (!validar_datos(datos)) {
    mostrarNotificacion("Completar todos los campos.", "error");
    return;
  }

  try {
    console.log("Datos a enviar:", datos);
    await invoke("cambiar_config_puerto", { datos });
    mostrarNotificacion("Cambios aplicados correctamente", "success");
    cargarDatos();
  } catch (e) {
    console.log("Error al aplicar cambios: ", e);
    mostrarNotificacion("Error al aplicar cambios: " + e.message, "error");
  }
}

function validar_datos(datos) {
  const ipRegex = /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
  const ipMask = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

  if (!datos.nombre || !datos.ip || !datos.mask || !datos.vlan || !datos.gateway) {
    return false;
  }
  if (!ipRegex.test(datos.ip)) {
    mostrarNotificacion("La dirección IP no es válida.", "error");
    return false;
  }
  if (!ipMask.test(datos.mask)) {
    mostrarNotificacion("La máscara que insertó no es válida.", "error");
    return false;
  }
  return true;
}

// ----- confirmar la configuracion a DHCP ------ //
function confirmarConfiguracionDHCP() {
  const nombre = document.querySelector("#edit-nombre").value;

  if (!nombre) {
    mostrarNotificacion("Por favor, selecciona un puerto antes de configurar a DHCP.", "error");
    return;
  }

  const confirmacion = confirm(`¿Está seguro de que desea reiniciar el puerto "${nombre}" y configurarlo en DHCP?`);

  if (confirmacion) {
    configurarPuertoADHCP(); 
  } else {
    console.log("Configuración a DHCP cancelada.");
  }
}

// ----- Modificar la configurar del puerto a DHCP ------ //
async function configurarPuertoADHCP() {
  const nombre = document.querySelector("#edit-nombre").value;

  try {
    const resultado = await invoke('configurar_puerto_dhcp', { nombre });
    mostrarNotificacion(resultado, "success");
  } catch (error) {
    console.error("Error al configurar el puerto:", error);
    mostrarNotificacion("Ocurrió un error al intentar configurar el puerto a DHCP.", "error");
  }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo) {
  const contenedor = document.getElementById("notification-container");
  const notificacion = document.createElement("div");
  notificacion.classList.add("notification", tipo);
  notificacion.textContent = mensaje;

  contenedor.appendChild(notificacion);

  // Eliminar la notificación después de un tiempo
  setTimeout(() => {
    contenedor.removeChild(notificacion);
  }, 4000); // 4 segundos
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
