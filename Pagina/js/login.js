document.getElementById("formularioLogin").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("emailLogin").value.trim();
  const password = document.getElementById("passwordLogin").value.trim();
  const resultado = document.getElementById("resultadoLogin");

  // Validación en front
  const dominios = [".com", ".es", ".co"];
  const emailValido =
    email.includes("@") && dominios.some((d) => email.endsWith(d));

  if (!emailValido) {
    resultado.textContent = "El correo debe contener @ y terminar en .com, .es o .co";
    resultado.style.color = "red";
    return;
  }

  if (password.length < 8) {
    resultado.textContent = "La contraseña debe tener al menos 8 caracteres.";
    resultado.style.color = "red";
    return;
  }

  try {
    const res = await fetch("/api/usuarios");

    if (!res.ok) {
      resultado.textContent = "No se pudo obtener la lista de usuarios.";
      resultado.style.color = "red";
      return;
    }

    const usuarios = await res.json();

    if (!usuarios || usuarios.length === 0) {
      resultado.textContent = "No hay usuarios registrados. Regístrate primero.";
      resultado.style.color = "red";
      return;
    }

    const encontrado = usuarios.find(
      (u) => u.email === email && u.password === password
    );

    if (encontrado) {
      resultado.textContent = `Bienvenido, ${encontrado.nombre}`;
      resultado.style.color = "green";

      localStorage.setItem("id", encontrado.id);
      localStorage.setItem("nombre", encontrado.nombre);

      setTimeout(() => {
        window.location.href = "menu.html";
      }, 1000);
    } else {
      resultado.textContent = "Credenciales incorrectas.";
      resultado.style.color = "red";
    }
  } catch (error) {
    console.error(error);
    resultado.textContent = "Error al iniciar sesión. Intenta de nuevo.";
    resultado.style.color = "red";
  }
});
