const firebaseConfig = {
  apiKey: "AIzaSyAS7a5mV9As2GfbuzI4MIRp6Zv1itYDUBg",
  authDomain: "pwa-notificaciones-fabri.firebaseapp.com",
  projectId: "pwa-notificaciones-fabri",
  storageBucket: "pwa-notificaciones-fabri.firebasestorage.app",
  messagingSenderId: "140521245389",
  appId: "1:140521245389:web:a263c7b9c9d0ed07443784"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function registerUser() {
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  if (email === "" || password === "") {
    alert("Completá ambos campos.");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Usuario registrado correctamente.");
    })
    .catch((error) => {
      alert("Error al registrar: " + error.message);
    });
}

function loginEmailPassword() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (email === "" || password === "") {
    alert("Completá ambos campos.");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      localStorage.setItem("userEmail", userCredential.user.email);
      alert("Sesión iniciada correctamente.");
      window.location.href = "encuestas.html";
    })
    .catch((error) => {
      alert("Error al iniciar sesión: " + error.message);
    });
}

// Función para login con Google
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      localStorage.setItem("userEmail", user.email);
      alert("Sesión iniciada con Google");
      window.location.href = "encuestas.html";
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
}

// Función de logout
function logout() {
  auth.signOut()
    .then(() => {
      localStorage.removeItem("userEmail");
      window.location.href = "login.html";
    });
}

// Verifica si hay sesión iniciada
function checkAuth() {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    alert("Debes iniciar sesión para acceder.");
    window.location.href = "login.html";
  }
}