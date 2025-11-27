document.getElementById("formularioRegistro").addEventListener("submit", async function (e) {
    e.preventDefault();

    const usuario = {
        nombre: document.getElementById("nombre").value,
        email: document.getElementById("email").value,
        telefono: document.getElementById("telefono").value,
        password: document.getElementById("password").value
    };

    try {
        const response = await fetch("http://127.0.0.1:8000/api/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario)
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ Registro exitoso: " + data.mensaje);
            document.getElementById("formularioRegistro").reset();
        } else {
            alert("⚠ Error: " + data.mensaje);
        }

    } catch (error) {
        alert("❌ Error de conexión con el servidor");
        console.log(error);
    }
});
