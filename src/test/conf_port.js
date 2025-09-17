const { invoke } = window.__TAURI__.core;

async function cargarDatosIpv6() {
    try{
        const salida = await invoke("tomar_datos_ipv6");
        if(!salida.includes("|")) throw new error("Formato invalido");

        const lineas = salida.split(/\r?\n/);
        const contenedor = document.querySelector("#contenedor-entradas");
        contenedor.innerHTML = '';

        lineas.forEach(linea =>{
            if(!linea.trim()) return;
            const [nombre, ip, prefixlenght, vlan, status, gateway] = linea.split("|");

            const fila = document.createElement("div");
            fila.classList.add("dila");

            const btnEditar = document.createElement("button");
            btnEditar.type = "button";
            btnEditar.classList.add("btn-editar");
            btnEditar.innerHTML = `<img src="../assets/icone-config.png" alt="icono" width="30" height="30">`;

            btnEditar.onclick = (event) => {
                event.stopPropagation();
                if (!window.isAdmin) {
                    mostrarNotificacion("No tienes privilegios necesarios para editar.", "error");
                    return;
                }
                editarPuerto(nombre, ip, prefixlenght, vlan, status, gateway);
            };

            if (document.body.classList.contains('dark-mode')){
                btnEditar.classList.add('dark-mode');
            }

            fila.innerHTML = `
                <div class="col">${nombre?.trim() || "—"}</div>
                <div class="col">${ip?.trim() || "—"}</div>
                <div class="col">${prefixlenght?.trim() || "—"}</div>
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
    }
    catch(e){
        mostrarNotificacion("Error: " + e.message, "error");
    }
}



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