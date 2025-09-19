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
      const [nombre, ip, mask, vlan, status, getaway] = linea.split("|");

      const fila = document.createElement("div");
      fila.classList.add("fila");

      const btnEditar = document.createElement("button");
      btnEditar.type = "button";
      btnEditar.classList.add("btn-editar");
      btnEditar.innerHTML = `<img src="/assets/icone-config.png" alt="icono" width="30" height="30">`;
      
      // Evita que la funcion buscar se ejecute si se utiliza al btn-editar
      btnEditar.onclick = (event) => {
        event.stopPropagation();
        /*if (!window.isAdmin) {
          mostrarNotificacion("No tienes privilegios necesarios para editar.", "error");
          return;
        }*/
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


// ---------- llenar car de edicion de los puertos seleccionados ---------- //
function editarPuerto(nombre, ip, preixlength, vlan, status, getaway){
    document.querySelector("#edit-nombre").value = nombre;
    document.querySelector("#edit-ip").value = ip;
    document.querySelector("#edit-preixlength").value = preixlength;
    document.querySelector("#edit-vlan").value = vlan;
    document.querySelector("#edit-status").value = status;
    document.querySelector("#edit-puerta-enlace").value = getaway;
}

// ---------- Mandar los datos a modificar de los puertos a change_conf_port_ipv6 ----------- //
async function guardarCambios() {
    const datos = {
        nombre: document.querySelector("#edit-nombre").value,
        ip: document.querySelector("#edit-ip").value,
        mask: document.querySelector("#edit-preixlength").value,
        vlan: document.querySelector("#edit-vlan").value,
        getaway: document.querySelector("#edit-puerta-enlace").value
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
