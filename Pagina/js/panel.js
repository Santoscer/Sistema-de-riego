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
                    <button class="card-btn edit-btn" onclick="editar('${u.id}', false)">Editar (PATCH)</button>
                    <button class="card-btn put-btn" onclick="editar('${u.id}', true)">Reemplazar (PUT)</button>
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
        EDITAR - ABRIR FORM
============================ */
function editar(id, esPut = false) {
    usuarioActual = id;

    fetch(`${API_URL}/usuarios/${id}`)
        .then(res => res.json())
        .then(u => {
            document.getElementById("edit-id").value = u.id;
            document.getElementById("edit-nombre").value = u.nombre;
            document.getElementById("edit-email").value = u.email;
            document.getElementById("edit-telefono").value = u.telefono;
            document.getElementById("edit-password").value = "";
            document.getElementById("edit-rol").value = u.rol;
            document.getElementById("editar-form").style.display = "block";
        })
        .catch(() => {
            document.getElementById("editar-form").style.display = "block";
        })
        .finally(() => {
            document.getElementById("put-btn").style.display = esPut ? "inline-block" : "none";
            document.getElementById("patch-btn").style.display = esPut ? "none" : "inline-block";
        });
}

function cerrarFormulario() {
    usuarioActual = null;
    document.getElementById("editar-form").style.display = "none";
}

/* ============================
        PATCH - EDITAR
============================ */
async function enviarEdicion() {
    if (!usuarioActual) return;

    const datos = {};

    const nombre = document.getElementById("edit-nombre").value;
    const email = document.getElementById("edit-email").value;
    const telefono = document.getElementById("edit-telefono").value;
    const password = document.getElementById("edit-password").value;
    const rol = document.getElementById("edit-rol").value;

    // Solo enviar campos modificados
    if (nombre) datos.nombre = nombre;
    if (email) datos.email = email;
    if (telefono) datos.telefono = telefono;
    if (password) datos.password = password; // evitar campo vacío
    if (rol) datos.rol = rol;

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
        nombre: document.getElementById("edit-nombre").value,
        email: document.getElementById("edit-email").value,
        telefono: document.getElementById("edit-telefono").value,
        password: document.getElementById("edit-password").value,
        rol: document.getElementById("edit-rol").value
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
