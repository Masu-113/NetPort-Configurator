const { invoke } = window.__TAURI__.core;

export function init() {
  console.log("Inicializando configuración IPv6...");

  cargarDatosIpv6();

  const btnBuscar = document.querySelector("#btn-buscar");
  if  (btnBuscar){
    btnBuscar.addEventListener("click", debounce(cargarDatosIpv6, 1000));
  }

  const btnAplicarCambios = document.querySelector("#btn-aplicar-cambios");
  if (btnAplicarCambios) {
    btnAplicarCambios.addEventListener("click", debounce(guardarCambios, 1000));
  }

  const btnConfigurarDHCP = document.querySelector("#btn-configurar-dhcp");
  if (btnConfigurarDHCP) {
    btnConfigurarDHCP.addEventListener("click", debounce(confirmarConfiguracionDHCP, 1000));
  }

  if (btn-editar){
     bftn-editar.addEventListener("click", debounce(editarPuerto, 1000));
  }
}

// --------- Funcion para extraer la informacion de los puertos ------------//
async function cargarDatosIpv6() {
    try{
        const salida = await invoke("tomar_datos_ipv6");
        if (!salida.includes("|")) throw new Error("Formato invalido");

    const lineas = salida.split(/\r?\n/);
    const contenedor = document.querySelector("#contenedor-entradas");
    contenedor.innerHTML = '';

    lineas.forEach(linea => {
      if (!linea.trim()) return;
      const [nombre, ip, mask, vlan, status, gateway] = linea.split("|");

      const fila = document.createElement("div");
      fila.classList.add("fila");

      const btnEditar = document.createElement("button");
      btnEditar.type = "button";
      btnEditar.classList.add("btn-editar");
      btnEditar.innerHTML = `<img src="/assets/icone-config.png" alt="icono" width="30" height="30">`;
      
      // Evita que la funcion buscar se ejecute si se utiliza al btn-editar
      btnEditar.onclick = (event) => {
        event.stopPropagation();
        if (!window.isAdmin) {
          mostrarNotificacion("No tienes privilegios necesarios para editar.", "error");
          return;
        }
        editarPuerto(nombre, ip, mask, vlan, status, gateway);
      };

      if (document.body.classList.contains('dark-mode')) {
        btnEditar.classList.add('dark-mode');
      }

      fila.innerHTML = `
        <div class="col">${nombre?.trim() || "—"}</div>
        <div class="col">${ip?.trim() || "—"}</div>
        <div class="col">${mask?.trim() || "—"}</div>
        <div class="col">${gateway?.trim() || "—"}</div>
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


// ---------- llenar car de edicion de los puertos seleccionados ---------- //
function editarPuerto(nombre, ip, preixlength, vlan, status, gateway){
    document.querySelector("#edit-nombre").value = nombre;
    document.querySelector("#edit-ip").value = ip;
    document.querySelector("#edit-prefixlength").value = preixlength;
    document.querySelector("#edit-vlan").value = vlan;
    document.querySelector("#edit-status").value = status;
    document.querySelector("#edit-puerta-enlace").value = gateway;
}

// ---------- Mandar los datos a modificar de los puertos a change_conf_port_ipv6 ----------- //
async function guardarCambios() {
    const datos = {
        nombre: document.querySelector("#edit-nombre").value,
        ip: document.querySelector("#edit-ip").value,
        prefixlength: document.querySelector("#edit-prefixlength").value,
        vlan: document.querySelector("#edit-vlan").value,
        gateway: document.querySelector("#edit-puerta-enlace").value
    }

    if (!await validar_datos(datos)){
      return;
    }
    
    try {
        console.log("Datos a enviar: ",datos);
        await invoke("cambiar_config_puerto_ipv6", {datos});
        mostrarNotificacion("Cambios aplicados correctamente","success");
        cargarDatosIpv6();
    }   catch (e) {
        console.log("Error al aplicar los cambios: ", e);
        mostrarNotificacion("Error al aplicar cambios: " + e.message, "error")
    }
}

// ---------- Funcion para validar los datos ingresados
async function validar_datos(datos) {
  const prefixlength = Number.parseInt(datos.prefixlength);
  const soloNum = /^\d+$/;

  if (!datos.nombre || !datos.ip || !datos.prefixlength) {
    mostrarNotificacion("Llenar todos los campos obligatorios (Nombre, Ip, longitud de prefijo)", "error");
    return false;
  }

  if (!await validarIP(datos.ip)) {
    mostrarNotificacion("El IP ingresado no es válido.", "error");
    return false;
  }

  if (datos.vlan !== null && datos.vlan !== "" && datos.vlan.toLowerCase() !== "null" && !soloNum.test(datos.vlan)) {
    mostrarNotificacion("La VLAN debe ser un número entero o NULL.", "error");
    return false;
  }

  if (prefixlength < 0 || prefixlength > 128) {
    mostrarNotificacion("Error, la longitud de prefijo debe estar entre 0 y 128.", "error");
    return false;
  }

  if (datos.gateway && !await validarIP(datos.gateway) && datos.gateway !== null && datos.gateway !== "" && datos.gateway.toLowerCase() !== "null") {
    mostrarNotificacion("La puerta de enlace no es válida.", "error");
    return false;
  }

  return true;
}


async function validarIP(ip) {
  try {
    const valido = await invoke ("validar_ipv6", {ip});
    return valido;
  } catch (e){
    console.error("Error validando Ipv6: ", e);
    return false;
  }
}

//---------- FUncion para modificar la configuracion del puerto a DHCP -----------//
async function configurarPuerto_DHCP(){
  const nombre = document.querySelector("#edit-nombre").value;

  try {
    const resultado = await invoke('configurar_puerto_dhcp_ipv6', {nombre});
    mostrarNotificacion("Se modifico el Ipv6 del puerto a DHCP.", "success");
  } catch (e){
    console.error("Error al configurar el puerto: ", e);
    mostrarNotificacion("Ocurrio un error al intentar configurar el puerto a DHCP.", "error");
  }
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
    const resultado = await invoke('configurar_puerto_dhcp_ipv6', { nombre });
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

// ---------- Funcion Debpunce -------- //
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

// ---------- Acciones de los botones ---------- //

document.addEventListener("DOMContentLoaded", () => {
  const btnAplicarCambios = document.querySelector("#btn-configurar-dhcp");
   if(btnAplicarCambios){
    btnAplicarCambios.addEventListener("click", debounce(confirmarConfiguracionDHCP,1000));
   } else {
    console.error("Boton de aplicar cambios no emcpntrado.");
   }
});

document.addEventListener("DOMContentLoaded", () => {
  const btnBuscar = document.querySelector("#btn-buscar");
  if (btnBuscar) {
    btnBuscar.addEventListener("click", debounce(cargarDatosIpv6,1000));
    }
    else {
        console.error("Botton de cargar datos.");
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
