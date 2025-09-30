const { invoke } = window.__TAURI__.core;



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

//---------- Funcion para aplicar el modo oscuro ----------//
function aplicarModoOscuro() {
  if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.querySelector('.sidebar').classList.add('dark-mode');
    document.querySelectorAll('.nav-list li a').forEach(link => link.classList.add('dark-mode'));
    document.querySelectorAll('.card').forEach(card => card.classList.add('dark-mode'));
    document.querySelectorAll('.flex-row input').forEach(input => input.classList.add('dark-mode'));
    document.querySelectorAll('.btn-buscar, #btn-aplicar-cambios, #btn-configurar-dhcp, .btn-editar, #logo').forEach(btn => btn.classList.add('dark-mode'));
    document.querySelectorAll('.notification').forEach(notification => notification.classList.add('dark-mode'));
    document.querySelector('.footer').classList.add('dark-mode');

    const toggleButton = document.getElementById('darkModeToggle');
    if (toggleButton) toggleButton.checked = true;
  }
}

// -------- funcion para el toggle del modo oscuro -------- //
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('darkModeToggle');

    aplicarModoOscuro();

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

window.aplicarModoOscuro = aplicarModoOscuro;