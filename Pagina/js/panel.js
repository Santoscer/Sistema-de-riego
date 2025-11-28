const API_URL = "/api";
let usuarioActual = null;

/* ============================
        GET - LISTA
============================ */
async function cargarUsuarios() {
    try {
        const res = await fetch(`${API_URL}/usuarios`);
        const usuarios = await res.json();

        const contenedor = document.getElementById("lista");
        contenedor.innerHTML = "";

        usuarios.forEach(u => {
            const card = document.createElement("div");
            card.className = "user-card";

            card.innerHTML = `
                <b>ID:</b> ${u.id}<br>
                <b>Nombre:</b> ${u.nombre}<br>
                <b>Email:</b> ${u.email}<br>
                <b>Teléfono:</b> ${u.telefono}<br>
                <b>Rol:</b> ${u.rol}<br>

                <div class="card-actions">
                    <button class="card-btn delete-btn" onclick="borrar('${u.id}')">Eliminar</button>
                    <button class="card-btn edit-btn" onclick="abrirPatch('${u.id}')">Editar (PATCH)</button>
                    <button class="card-btn put-btn" onclick="abrirPut('${u.id}')">Reemplazar (PUT)</button>
                </div>
            `;

            contenedor.appendChild(card);
        });
    } catch (err) {
        alert("Error al cargar usuarios");
    }
}

/* ============================
        DELETE
============================ */
async function borrar(id) {
    try {
        const res = await fetch(`${API_URL}/usuarios/${id}`, { method: "DELETE" });
        const json = await res.json();
        alert(json.mensaje || json.descripcion);
        cargarUsuarios();
    } catch {
        alert("Error al eliminar usuario");
    }
}

/* ============================
     ABRIR FORM (PATCH)
============================ */
function abrirPatch(id) {
    usuarioActual = id;

    // Mostrar formulario general
    document.getElementById("editar-form").style.display = "block";

    // Mostrar solo PATCH
    document.getElementById("patch-panel").style.display = "block";
    document.getElementById("put-panel").style.display = "none";
}

/* ============================
     ABRIR FORM (PUT)
============================ */
async function abrirPut(id) {
    usuarioActual = id;

    try {
        const res = await fetch(`${API_URL}/usuarios/${id}`);
        const u = await res.json();

        document.getElementById("edit-nombre").value = u.nombre;
        document.getElementById("edit-email").value = u.email;
        document.getElementById("edit-telefono").value = u.telefono;
        document.getElementById("edit-password").value = "";
        document.getElementById("edit-rol").value = u.rol;

    } catch {
        alert("Error al cargar datos del usuario");
    }

    // Mostrar formulario general
    document.getElementById("editar-form").style.display = "block";

    // Mostrar solo PUT
    document.getElementById("patch-panel").style.display = "none";
    document.getElementById("put-panel").style.display = "block";
}

/* ============================
       CERRAR FORM
============================ */
function cerrarFormulario() {
    usuarioActual = null;
    document.getElementById("editar-form").style.display = "none";
    document.getElementById("patch-panel").style.display = "none";
    document.getElementById("put-panel").style.display = "none";

    document.getElementById("nuevo-valor").value = "";
    document.getElementById("campo-editar").value = "";
}

/* ============================
        PATCH - EDITAR 1 CAMPO
============================ */
async function enviarEdicionIndividual() {
    if (!usuarioActual) return;

    const campo = document.getElementById("campo-editar").value;
    const valor = document.getElementById("nuevo-valor").value.trim();

    if (!campo) return alert("Debe seleccionar un campo.");
    if (!valor) return alert("El nuevo valor no puede estar vacío.");

    const datos = {};
    datos[campo] = valor;

    const res = await fetch(`${API_URL}/usuarios/${usuarioActual}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    });

    const json = await res.json();
    alert(json.mensaje || json.descripcion);

    cerrarFormulario();
    cargarUsuarios();
}

/* ============================
        PUT - REEMPLAZAR
============================ */
async function enviarReplace() {
    if (!usuarioActual) return;

    const datos = {
        nombre: document.getElementById("edit-nombre").value.trim(),
        email: document.getElementById("edit-email").value.trim(),
        telefono: document.getElementById("edit-telefono").value.trim(),
        password: document.getElementById("edit-password").value.trim(),
        rol: document.getElementById("edit-rol").value.trim()
    };

    const res = await fetch(`${API_URL}/usuarios/${usuarioActual}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    });

    const json = await res.json();
    alert(json.mensaje || json.descripcion);

    cerrarFormulario();
    cargarUsuarios();
}
