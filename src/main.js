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
      btnEditar.innerHTML = `<img src="../assets/icone-config.png" alt="icono" width="30" height="30">`;
      
      // Evita que la funcion buscar se ejecute si se utiliza al btn-editar
      btnEditar.onclick = (event) => {
        event.stopPropagation();
        if (!window.isAdmin) {
          mostrarNotificacion("No tienes privilegios necesarios para editar.", "error");
          return;
        }
        editarPuerto(nombre, ip, mask, vlan, status, getaway);
      };

      if (document.body.classList.contains('dark-mode')) {
        btnEditar.classList.add('dark-mode');
      }

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
    const resultado = await invoke("cambiar_config_puerto", { datos });

    // Verificar si el resultado contiene un mensaje de error
    if (resultado.includes("La operación solicitada requiere elevación")) {
      mostrarNotificacion("Error: " + resultado, "error");
    } else {
      mostrarNotificacion("Cambios aplicados correctamente", "success");
      cargarDatos();
    }
    } catch (e) {
    console.log("Error al aplicar cambios: ", e);
    mostrarNotificacion("Error al aplicar cambios: " + e.message, "error");
  }
}

// -------- Funcion para validar los datos ingresados a modificar ------- //
function validar_datos(datos) {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const soloNumeros = /^\d+$/;

  if (!datos.nombre || !datos.ip || !datos.mask) {
    mostrarNotificacion("Llenar todos los campos obligatorios (nombre, IP, máscara)", "error");
    return false;
  }

  if (!ipRegex.test(datos.ip) || !validarIP(datos.ip)) {
    mostrarNotificacion("La dirección IP no es válida.", "error");
    return false;
  }

  if (datos.vlan !== null && datos.vlan !== "" && datos.vlan.toLowerCase() !== "null" && !soloNumeros.test(datos.vlan)) {
    mostrarNotificacion("La VLAN debe ser un número entero o NULL.", "error");
    return false;
  }

  if (!validarMascara(datos.mask)) {
    mostrarNotificacion("La máscara que insertó no es válida.", "error");
    return false;
  }

  if (datos.gateway && !ipRegex.test(datos.gateway) && datos.gateway !== null && datos.gateway !== "" && datos.gateway.toLowerCase() !== "null") {
    mostrarNotificacion("La puerta de enlace no es válida.", "error");
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

// ---- Función para validar máscara ---- //
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

// ----- Confirmar la configuración a DHCP ------ //
function confirmarConfiguracionDHCP() {
  const nombre = document.querySelector("#edit-nombre").value;

  if (!nombre) {
    mostrarNotificacion("Por favor, selecciona un puerto antes de configurar a DHCP.", "error");
    return;
  }

  mostrarNotificacionConConfirmacion(`¿Está seguro de que desea reiniciar el puerto "${nombre}" y configurarlo en DHCP?`, async () => {
    await configurarPuertoADHCP();
  });
}

// ----- Mostrar notificación con confirmación ------ //
function mostrarNotificacionConConfirmacion(mensaje, callback) {
  const contenedor = document.getElementById("confirmation-container");
  const notificacion = document.createElement("div");
  notificacion.classList.add("notification", "confirm");
  notificacion.innerHTML = `
    <p>${mensaje}</p>
    <button id="confirmar">Sí</button>
    <button id="cancelar">No</button>
  `;

  contenedor.appendChild(notificacion);

  document.getElementById("confirmar").onclick = () => {
    callback();
    contenedor.removeChild(notificacion);
  };

  document.getElementById("cancelar").onclick = () => {
    console.log("Configuración a DHCP cancelada.");
    contenedor.removeChild(notificacion);
  };
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

// -------------- Funcion para obtener usuario -------------- //
async function displayUsername() {
  try {
    const response = await invoke("get_username");

    if (response && response.length === 2) {
      const username = response[0];
      const isAdmin = response[1];

      document.getElementById("username").innerText = `Bienvenido, ${username}!`;

      // Guardar el estado de administrador en el objeto global
      window.isAdmin = isAdmin;

      // Desactivar el botón de editar si no es administrador
      const botonesEditar = document.querySelectorAll('.btn-editar');
      botonesEditar.forEach(btn => {
        btn.disabled = !isAdmin; // Desactiva el botón si no es administrador
        btn.title = !isAdmin ? "No tienes privilegios necesarios" : ""; // Mensaje de tooltip
      });
    } else {
      console.error("Respuesta inesperada al obtener el nombre de usuario:", response);
    }
  } catch (e) {
    console.error("Error al obtener el nombre de usuario:", e);
  }
}

// Llamar a la funcion displayUsername cuando la ventana se haya cargado
window.onload = displayUsername;


// ------ funcion debonce para evitar multiples llamadas consecutivas a las funciones ------ //
function debounce(func, wait){
  let timeout;
  return function(...args){
    const contexto = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(contexto. args);
    }, wait);
  }
}

// ------------------------ Acciones de los botones ------------------------------- //
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('toggleBtn').addEventListener('click', function() {
        var sidebar = document.getElementById('sidebar');
        var navMenu = document.getElementById('nav-menu');

        sidebar.classList.toggle('collapsed');
        
        if(navMenu){
          navMenu.classList.toggle('collapsed');
        }
        else{
          console.error("Elemento nav-menu no encontrado");
        }
    });
});


document.addEventListener("DOMContentLoaded", () => {
  const btnAplicarCambios = document.querySelector("#btn-configurar-dhcp");
  if (btnAplicarCambios) {

    btnAplicarCambios.addEventListener("click", debounce(confirmarConfiguracionDHCP,1000));
  } else {
    console.error("Boton de aplicar cambios no encontrado");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const btnAplicarCambios = document.querySelector("#btn-aplicar-cambios");
  if (btnAplicarCambios) {
    btnAplicarCambios.addEventListener("click", debounce(guardarCambios,1000));
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

// -------- funcion para el modo oscuro -------- //
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('darkModeToggle');

    // Comprobar el estado del modo oscuro en localStorage
    if (localStorage.getItem('dark-mode') === 'enabled') {
        document.body.classList.add('dark-mode');
        document.querySelector('.sidebar').classList.add('dark-mode');
        document.querySelectorAll('.nav-list li a').forEach(link => link.classList.add('dark-mode'));
        document.querySelectorAll('.card').forEach(card => card.classList.add('dark-mode'));
        document.querySelectorAll('.flex-row input').forEach(input => input.classList.add('dark-mode'));
        document.querySelectorAll('.btn-buscar, #btn-aplicar-cambios, #btn-configurar-dhcp, .btn-editar, #logo').forEach(btn => btn.classList.add('dark-mode'));
        document.querySelectorAll('.notification').forEach(notification => notification.classList.add('dark-mode'));
        document.querySelector('.footer').classList.add('dark-mode');

        toggleButton.checked = true; // Asegura que el interruptor refleje el estado actual
      }

    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.querySelector('.sidebar').classList.toggle('dark-mode');
        document.querySelectorAll('.nav-list li a').forEach(link => link.classList.toggle('dark-mode'));
        document.querySelectorAll('.card').forEach(card => card.classList.toggle('dark-mode'));
        document.querySelectorAll('.flex-row input').forEach(input => input.classList.toggle('dark-mode'));
        document.querySelectorAll('.btn-buscar, #btn-aplicar-cambios, #btn-configurar-dhcp, .btn-editar, #logo').forEach(btn => btn.classList.toggle('dark-mode'));
        document.querySelectorAll('.notification').forEach(notification => notification.classList.toggle('dark-mode'));
        document.querySelector('.footer').classList.toggle('dark-mode');

        // Guardar la preferencia en localStorage
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('dark-mode', 'enabled');
        } else {
            localStorage.setItem('dark-mode', 'disabled');
        }
    });
});
