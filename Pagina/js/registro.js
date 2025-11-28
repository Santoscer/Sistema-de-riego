document.addEventListener("DOMContentLoaded", () => {
  const formRegistro = document.getElementById("formularioRegistro");
  const resultado = document.getElementById("resultado");

  const modal = document.getElementById("modalExito");
  const modalMensaje = document.getElementById("modalMensaje");
  const btnCerrarModal = document.getElementById("btnCerrarModal");

  // Cerrar modal al hacer clic en el botón
  btnCerrarModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Cerrar modal si se hace clic en el fondo oscuro
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  formRegistro.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const password = document.getElementById("password").value.trim();

    // ==== VALIDACIÓN EN FRONT ====
    const dominios = [".com", ".es", ".co"];
    const emailValido =
      email.includes("@") && dominios.some((d) => email.endsWith(d));

    if (!emailValido) {
      resultado.textContent =
        "El correo debe contener @ y terminar en .com, .es o .co.";
      resultado.style.color = "red";
      return;
    }

    if (password.length < 8) {
      resultado.textContent =
        "La contraseña debe tener al menos 8 caracteres.";
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
      // Ruta relativa para que funcione en local y en Azure
      const response = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });

      const data = await response.json();

      if (response.ok) {
        resultado.textContent = "";

        modalMensaje.textContent =
          data.mensaje || "Usuario registrado correctamente.";

        modal.style.display = "flex";

        formRegistro.reset();

        // Si deseas redirigir al login:
        // setTimeout(() => { window.location.href = "login.html"; }, 2000);
      } else {
        resultado.textContent =
          data.detail || data.mensaje || "Error al registrar usuario.";
        resultado.style.color = "red";
      }
    } catch (error) {
      console.error(error);
      resultado.textContent =
        "Error de conexión con el servidor. Intenta de nuevo.";
      resultado.style.color = "red";
    }
  });
});

