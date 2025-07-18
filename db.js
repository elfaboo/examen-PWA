let db;

export function inicializarDB() {
  console.log("Inicializando IndexedDB...");
  
  const request = indexedDB.open("EncuestasCABA", 3); // Subí la versión a 3, o incluso 4 si ya probaste con 3

  request.onupgradeneeded = (event) => {
    db = event.target.result;
    console.log("onupgradeneeded ejecutado");

    if (!db.objectStoreNames.contains("comentarios")) {
      console.log("Creando store: comentarios");
      db.createObjectStore("comentarios", { keyPath: "id", autoIncrement: true });
    }

    if (!db.objectStoreNames.contains("pendientes")) {
      console.log("Creando store: pendientes");
      db.createObjectStore("pendientes", { keyPath: "id", autoIncrement: true });
    }
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    console.log("Base de datos abierta con éxito");
  };

  request.onerror = (event) => {
    console.error("Error abriendo la base de datos", event);
  };
}

export function guardarComentario(categoria, comentario) {
  return new Promise(resolve => {
    const tx = db.transaction("comentarios", "readwrite");
    const store = tx.objectStore("comentarios");
    store.add({ ...comentario, categoria });
    tx.oncomplete = resolve;
  });
}

export function guardarComentarioPendiente(categoria, comentario) {
  return new Promise(resolve => {
    const tx = db.transaction("pendientes", "readwrite");
    const store = tx.objectStore("pendientes");
    store.add({ ...comentario, categoria });
    tx.oncomplete = resolve;
  });
}

export function traerComentarios(categoria) {
  return new Promise(resolve => {
    const tx = db.transaction("comentarios", "readonly");
    const store = tx.objectStore("comentarios");
    const request = store.getAll();
    request.onsuccess = () => {
      resolve(request.result.filter(c => c.categoria === categoria));
    };
  });
}

export function traerPendientes() {
  return new Promise(resolve => {
    const tx = db.transaction("pendientes", "readonly");
    const store = tx.objectStore("pendientes");
    const request = store.getAll();
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

export function borrarPendiente(id) {
  return new Promise(resolve => {
    const tx = db.transaction("pendientes", "readwrite");
    const store = tx.objectStore("pendientes");
    store.delete(id);
    tx.oncomplete = resolve;
  });
}
