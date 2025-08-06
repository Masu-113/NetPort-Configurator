const { invoke } = window.__TAURI__.core;

let greetInputEl;
let greetMsgEl;

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#greet-input");
  greetMsgEl = document.querySelector("#greet-msg");
  document.querySelector("#greet-form").addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });
});

import invoke from '@tauri-apps/api/tauri';

async function llamarfuncion() {
  try {
    const resultado = await invoke('nombre_de_la_funcion', { parametro1: 'valor1' });
    console.log('Resultado de la función:', resultado);
  } catch (error) {
    console.error('Error al llamar a la función:', error);
  }
} 
