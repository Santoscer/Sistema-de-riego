document.getElementById("formularioRegistro").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const password = document.getElementById("password").value.trim();
  const resultado = document.getElementById("resultado");

  // ==== VALIDACIÓN EN FRONT ====

  // Validar correo: debe tener @ y terminar en .com, .es o .co
  const dominios = [".com", ".es", ".co"];
  const emailValido =
    email.includes("@") && dominios.some((d) => email.endsWith(d));

  if (!emailValido) {
    resultado.textContent = "El correo debe contener @ y terminar en .com, .es o .co.";
    resultado.style.color = "red";
    return;
  }

  // Validar longitud de contraseña (mínimo 8 caracteres)
  if (password.length < 8) {
    resultado.textContent = "La contraseña debe tener al menos 8 caracteres.";
    resultado.style.color = "red";
    return;
  }

  if (!nombre || !telefono) {
    resultado.textContent = "Por favor, completa todos los campos.";
    resultado.style.color = "red";
    return;
  }

  const usuario = { nombre, email, telefono, password };

  try {
    // 🔴 ANTES: "http://127.0.0.1:8000/api/registro"
    // 🟢 AHORA: ruta relativa para que funcione en Azure y en local
    const response = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario),
    });

    const data = await response.json();

    if (response.ok) {
      resultado.textContent = data.mensaje || "Usuario registrado correctamente.";
      resultado.style.color = "green";
      document.getElementById("formularioRegistro").reset();
    } else {
      // si tu backend manda "detail" o "mensaje"
      resultado.textContent = data.detail || data.mensaje || "Error al registrar usuario.";
      resultado.style.color = "red";
    }
  } catch (error) {
    console.error(error);
    resultado.textContent = "Error de conexión con el servidor.";
    resultado.style.color = "red";
  }
});
