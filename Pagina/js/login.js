const API_URL = "/api";

/* ============================
   MANEJAR INICIO DE SESIÓN
============================ */
document.getElementById('formularioLogin').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailLogin').value.trim();
    const password = document.getElementById('passwordLogin').value;
    const resultado = document.getElementById('resultadoLogin');

    // Limpiar resultado anterior
    resultado.textContent = '';
    resultado.style.color = '';

    // Validación básica
    if (!email || !password) {
        resultado.textContent = 'Por favor, completa todos los campos.';
        resultado.style.color = 'red';
        return;
    }

    // Validación de email opcional
    const dominios = [".com", ".es", ".co"];
    const emailValido = email.includes("@") && dominios.some((d) => email.endsWith(d));
    if (!emailValido) {
        resultado.textContent = "El correo debe contener @ y terminar en .com, .es o .co";
        resultado.style.color = "red";
        return;
    }

    // Validación de contraseña opcional
    if (password.length < 8) {
        resultado.textContent = "La contraseña debe tener al menos 8 caracteres.";
        resultado.style.color = "red";
        return;
    }

    // Mostrar mensaje de carga
    resultado.textContent = 'Iniciando sesión...';
    resultado.style.color = 'blue';

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();

        if (response.ok) {
            // Login exitoso
            resultado.textContent = `✅ Bienvenido, ${data.nombre}. Redirigiendo...`;
            resultado.style.color = 'green';

            // Guardar sesión
            sessionStorage.setItem('userId', data.id);
            sessionStorage.setItem('userName', data.nombre);
            sessionStorage.setItem('userEmail', data.email);

            localStorage.setItem('userId', data.id);
            localStorage.setItem('userName', data.nombre);

            // Redirigir al menú
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1000);

        } else {
            // Error en las credenciales
            resultado.textContent = '❌ ' + (data.detail || data.mensaje || 'Credenciales incorrectas');
            resultado.style.color = 'red';
        }

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        resultado.textContent = '❌ Error de conexión con el servidor.';
        resultado.style.color = 'red';
    }
});

/* ============================
   VERIFICAR SI YA HAY SESIÓN
============================ */
window.addEventListener('DOMContentLoaded', () => {
    const userId = sessionStorage.getItem('userId');

    // Si ya hay sesión activa → ir al menú
    if (userId) {
        window.location.href = 'menu.html';
    }
});


