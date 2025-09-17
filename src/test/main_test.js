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
      
      // Evita que la funcion buscar se ejecute si se utiliza al btn-editar
      btnEditar.onclick = (event) => {
        event.stopPropagation();
        if(!window.isAdmin){
          mostrarNotificacion("No tienes privilegios necesarios para editar.", "error");
          return;
        }
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

// -------- Funcion para validar los datos ingresados a modificar ------- //
function validar_datos(datos) {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const soloNumeros = /^\d+$/;

  if (!datos.nombre || !datos.ip || !datos.mask || !datos.vlan || !datos.gateway) {
    mostrarNotificacion("Llenar todos los campos", "error");
    return false;
  }

  if (!ipRegex.test(datos.ip) || !validarIP(datos.ip)) {
    mostrarNotificacion("La dirección IP no es válida.", "error");
    return false;
  }
  if (!ipRegex.test(datos.gateway) || !validarIP(datos.gateway)) {
    mostrarNotificacion("La puerta de enlace no es válida.", "error");
    return false;
  }

  if (!soloNumeros.test(datos.vlan)) {
    mostrarNotificacion("La VLAN debe ser un número sin letras.", "error");
    return false;
  }

  if (!validarMascara(datos.mask)) {
    mostrarNotificacion("La máscara que insertó no es válida.", "error");
    return false;
  }
  return true;
}

// ---- Funcion para validar IP ----
function validarIP(ip) {
  const octetos = ip.split('.');
  return octetos.length === 4 && octetos.every(o => {
    const numero = parseInt(o, 10);
    return numero >= 0 && numero <= 255;
  });
}

// ---- Función para validar mascara ---- //
function validarMascara(mascara) {
  const octetos = mascara.split('.');
  if (octetos.length !== 4) {
    return false;
  }

  let mascaraBinaria = '';

  for (let i = 0; i < octetos.length; i++) {
    const octeto = parseInt(octetos[i], 10);
    // validar rango
    if (isNaN(octeto) || octeto < 0 || octeto > 255) {
      return false;
    }
    mascaraBinaria += octeto.toString(2).padStart(8, '0');
  }
  // validar patrón de bits
  let hayCeros = false;
  for (let bit of mascaraBinaria) {
    if (bit === '0') {
      hayCeros = true;
    } else if (hayCeros && bit === '1') {
      return false;
    }
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
    mostrarNotificacion("Se modifico el puerto a DHCP.", "success");
  } catch (error) {
    console.error("Error al configurar el puerto:", error);
    mostrarNotificacion("Ocurrió un error al intentar configurar el puerto a DHCP.", "error");
  }
}

// ---------- Funcion para obtener usuario ---------- //
async function displayUsername() {
  try{
    const response = await invoke("get_username");
    
    if (response && response.length === 2){
      const username = response[0];
      const isAdmin = response[1];

      document.getElementById("username").innerText = `Bienvenido, ${username}!`;

      window.isAdmin = isAdmin;

      const btnEditar = document.querySelectorAll('.btn-editar');
      btnEditar.forEach(btn => {
        btn.disabled = !isAdmin;
        btn.title = !isAdmin ? "No tienes privilegios necesarios" : "";
      });
    } else {
      console.error("Respuesta inesperada al obtener el nombre de usuario: ", response);
    }
  } catch (e) {
    console.error("Error al obtener el nombre de usuario: ", e);
  }
}

window.onload = displayUsername;

// ---------- Funcion para mostrar notificaciones ---------- //
function mostrarNotificacion(mensaje, tipo) {
  const contenedor = document.getElementById("notification-container");
  const notificacion = document.createElement("div");
  notificacion.classList.add("notification", tipo);
  notificacion.textContent = mensaje;

  contenedor.appendChild(notificacion);

  setTimeout(() => {
    contenedor.removeChild(notificacion);
  }, 4000);
}

// ------------------------ Acciones de los botones ------------------------------- //
document.addEventListener("DOMContentLoaded", () => {
  const btnAplicarCambios = document.querySelector("#btn-configurar-dhcp");
  if (btnAplicarCambios) {
    btnAplicarCambios.addEventListener("click", confirmarConfiguracionDHCP);
  } else {
    console.error("Botón de aplicar cambios no encontrado");
  }
});

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
