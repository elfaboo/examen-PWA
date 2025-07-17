// fcm.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
  measurementId: "TU_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Solicitar permiso para recibir notificaciones
export function solicitarPermisoNotificaciones() {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      getToken(messaging, {
        vapidKey: "TU_VAPID_KEY_PUBLICA"
      })
      .then((token) => {
        console.log("Token FCM:", token);
        // Aquí podrías guardarlo en Firestore si querés enviarle notificaciones después
      })
      .catch((err) => {
        console.error("Error al obtener token:", err);
      });
    } else {
      console.warn("Permiso de notificación denegado");
    }
  });
}

// Mostrar notificaciones si la app está abierta
onMessage(messaging, (payload) => {
  console.log("Mensaje recibido con la app abierta:", payload);
  const { title, body } = payload.notification;
  new Notification(title, { body });
});