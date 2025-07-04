import { inicializarDB, guardarComentario, } from './db.js';
import { crearRating } from './componentes/rating.js';
import { mostrarComentarios } from './componentes/listaComentarios.js';


const toggle = document.getElementById('input');
const h1 = document.getElementById('tituloh1');

window.addEventListener('DOMContentLoaded', () => {
  const darkMode = localStorage.getItem('darkMode');
  if (darkMode === 'enabled') {
    document.body.classList.add('dark');
    toggle.checked = true;
    h1.style.color = 'white';
  } else {
    h1.style.color = 'black';
  }
});

toggle.addEventListener('change', () => {
  if (toggle.checked) {
    document.body.classList.add('dark');
    localStorage.setItem('darkMode', 'enabled');
    h1.style.color = 'white';
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('darkMode', 'disabled');
    h1.style.color = 'black';
  }
});

const content = document.getElementById('content');
const buttons = document.querySelectorAll('.tabs button');
const imagenesPorCategoria = {
  limpieza: 'assets/foto-limpieza.jpg',
  transporte: 'assets/foto-transporte.jpg',
  verdes: 'assets/foto-espacio-verde.jpg',
  eventos: 'assets/foto-evento-gratis.jpeg',
  subte: 'assets/foto-subte.jpg',
  seguridad: 'assets/foto-seguridad.jpg',
  accesibilidad: 'assets/foto-accesibilidad.jpg'
};

buttons.forEach(btn => {
  btn.addEventListener('click', async () => {

    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
    alert("Debes iniciar sesión para enviar un comentario.");
    window.location.href = "login.html";
    return;
  }
    
    const categoria = btn.dataset.tab;
    content.innerHTML = `
      <h2>${btn.textContent}</h2>
      <img src="${imagenesPorCategoria[categoria]}" alt="${btn.textContent}" style="width: 500px; height: auto; margin-bottom: 10px; margin: auto;">
      <label>Tu comentario:</label><br/>
      <textarea id="comentario"></textarea><br/>
      <label>Tu puntuación:</label>
      <div id="calificacion"></div>
      <button id="submit">Enviar</button>
      <h3>Comentarios anteriores:</h3>
      <div id="comentarios"></div>
    `;
    crearRating(document.getElementById('calificacion'));

    document.getElementById('submit').addEventListener('click', async () => {
      const texto = document.getElementById('comentario').value;
      const calificacion = document.querySelectorAll('.calificacion.selected').length;
      const comentario = {
        texto,
        calificacion,
        fecha: new Date().toISOString()
      };
      if (navigator.onLine) {
      await guardarComentario(categoria, comentario);
    } else {
      await guardarComentarioPendiente(categoria, comentario);
      alert('Sin conexión. Comentario guardado localmente.');
    }
      document.getElementById('comentario').value = "";
      mostrarComentarios(categoria, document.getElementById('comentarios'));
    });

    mostrarComentarios(categoria, document.getElementById('comentarios'));
  });
});


window.addEventListener('online', () => {
  status.textContent = 'Conexión restaurada. Reintentando...';
  reenviarPendientes();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log("SW registrado", reg.scope))
      .catch(err => console.error("SW error:", err));
  });
}

inicializarDB();

