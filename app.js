import { inicializarDB, guardarComentario, } from './db.js';
import { traerPendientes, borrarPendiente, guardarComentarioPendiente } from './db.js';
import { crearRating } from './componentes/rating.js';
import { mostrarComentarios } from './componentes/listaComentarios.js';


const toggle = document.getElementById('input');
const h1 = document.getElementById('tituloh1');

let db;

const request = indexedDB.open("encuestasDB", 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;
  if (!db.objectStoreNames.contains("comentarios")) {
  db.createObjectStore("comentarios", { autoIncrement: true });
  }
  if (!db.objectStoreNames.contains("pendientes")) {
  db.createObjectStore("pendientes", { autoIncrement: true });
  }
};

request.onsuccess = function(event) {
  db = event.target.result;
  console.log("IndexedDB inicializada");
  if (navigator.onLine) {
    sincronizarDesdeIndexedDB();
  }
};

request.onerror = function(event) {
  console.error("Error al abrir IndexedDB", event);
};

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

  function guardarComentarioPendiente(data) {
  let pendientes = JSON.parse(localStorage.getItem("pendientes")) || [];
  pendientes.push(data);
  localStorage.setItem("pendientes", JSON.stringify(pendientes));
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
      if (userEmail && navigator.onLine) {
      guardarComentario(categoria, comentario);
      } else {
          guardarComentarioPendiente(categoria, comentario);
          guardarEnIndexedDB({
          texto,
          calificacion,
          fecha: new Date().toISOString(),
          categoria
        });
        alert('Sin conexión. Comentario guardado localmente.');

    }
      document.getElementById('comentario').value = "";
      mostrarComentarios(categoria, document.getElementById('comentarios'));
    });

    mostrarComentarios(categoria, document.getElementById('comentarios'));
  });
});


async function procesarPendientes() {
  const pendientes = await traerPendientes();

  for (const p of pendientes) {
    try {
      await firebase.firestore().collection("comentarios").add(p);
      await borrarPendiente(p.id);
      console.log("🔄 Sincronizado:", p);
    } catch (e) {
      console.error("❌ Error al sincronizar:", e);
    }
    if (pendientes.length === 0) {
      console.log("✅ No hay encuestas pendientes para sincronizar.");
    }
  }
}
if (!navigator.onLine) {
  await guardarComentarioPendiente(categoria, comentario);
  console.log("💾 Guardado en pendientes (offline).");
} else {
  firebase.firestore().collection("comentarios").add({ ...comentario, categoria });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/firebase-messaging-sw.js")
    .then((registration) => {
  console.log("Service Worker registrado:", registration);
  })
    .catch((err) => {
      console.error("Error al registrar SW:", err);
    });
}

const firebaseConfig = {
  apiKey: "AIzaSyAS7a5mV9As2GfbuzI4MIRp6Zv1itYDUBg",
  authDomain: "pwa-notificaciones-fabri.firebaseapp.com",
  projectId: "pwa-notificaciones-fabri",
  storageBucket: "pwa-notificaciones-fabri.firebasestorage.app",
  messagingSenderId: "140521245389",
  appId: "1:140521245389:web:a263c7b9c9d0ed07443784"
};
// Evitar doble inicialización
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

// Registrar el Service Worker
navigator.serviceWorker.register("firebase-messaging-sw.js").then((registration) => {
  messaging.useServiceWorker(registration);

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      messaging.getToken({
        vapidKey: "TU_CLAVE_PUBLICA_VAPID"
      }).then((currentToken) => {
        if (currentToken) {
          console.log("🔐 Token recibido:", currentToken);
          // podés guardarlo o usarlo más adelante
        } else {
          console.warn("⚠️ No se obtuvo el token de FCM.");
        }
      }).catch((err) => {
        console.error("❌ Error al obtener el token:", err);
      });
    } else {
      console.warn("🔕 Permiso de notificaciones denegado.");
    }
  });
});

// Detectar conexión/desconexión
window.addEventListener('online', procesarPendientes);
window.addEventListener('offline', () => {
  console.log('Estás sin conexión. Se guardará localmente.');
});

function guardarLocalmente(data) {
  let pendientes = JSON.parse(localStorage.getItem("pendientes")) || [];
  pendientes.push(data);
  localStorage.setItem("pendientes", JSON.stringify(pendientes));
}
async function procesarPendientes() {
  let pendientes = JSON.parse(localStorage.getItem("pendientes")) || [];

  for (const data of pendientes) {
    try {
      if (navigator.onLine) {
        try {
          await firebase.firestore().collection("encuestas").add(data);
          console.log("✅ Encuesta guardada en Firestore");
        } catch (error) {
          console.error("❌ Error al guardar en Firestore. Guardando localmente...");
          guardarLocalmente(data);
        }
      } else {
        console.log("📴 Sin conexión. Guardando encuesta localmente...");
        guardarLocalmente(data);
      }

    } catch (e) {
      console.error("⚠️ Error al sincronizar:", e);
      return;
    }
  }

  localStorage.removeItem("pendientes");
  console.log("📤 Datos pendientes sincronizados");
}

// Mostrar notificación en primer plano
messaging.onMessage((payload) => {
  console.log("📩 Notificación recibida en foreground:", payload);
  alert("📣 " + payload.notification.title + "\n" + payload.notification.body);
});


inicializarDB();

