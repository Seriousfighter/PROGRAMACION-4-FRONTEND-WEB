/* =========================================================
   Página de login (web)
   ========================================================= */
(function () {
    Guard.requireGuest(); // Si ya está logueado, lo redirige al dashboard

    const form      = document.getElementById('login-form');
    const emailIn   = document.getElementById('email');
    const passIn    = document.getElementById('password');
    const btn       = document.getElementById('login-btn');
    const errorBox  = document.getElementById('form-error');

    // Muestra el cartel rojo de error con el mensaje recibido
    function showError(msg) {
        errorBox.textContent = msg;
        errorBox.hidden = false;
    }

    // Oculta el cartel de error y limpia su contenido
    function clearError() {
        errorBox.hidden = true;
        errorBox.textContent = '';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que la página se recargue
        clearError();

        const email    = emailIn.value.trim();
        const password = passIn.value;

        // Validaciones básicas
        if (!email)    return showError('El email es obligatorio.');
        if (!password) return showError('La contraseña es obligatoria.');
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return showError('El formato del email no es válido.');
        }

        // Bloquea el botón y muestra el loader
        btn.disabled = true;
        btn.textContent = 'Ingresando...';
        UI.showLoader();

        try {
            // Llama a la API de login
            const data = await AuthApi.login(email, password);

            // Guarda el token y los datos del usuario en la sesión
            Session.save(data.token, data.user);
            UI.success('¡Bienvenido!');
            UI.redirect('dashboard.html'); // Redirige al panel

        } catch (err) {
            // Manejo de errores
            if (err.errors) {
                const first = Object.values(err.errors)[0];
                showError(first || err.message); // Error de validación (422)
            } else if (err.status === 401) {
                showError('Email o contraseña incorrectos.'); // Credenciales inválidas
            } else if (err.status === 0) {
                showError('No se pudo conectar con el servidor.'); // Error de red
            } else {
                showError(err.message || 'Error al iniciar sesión.'); // Error genérico
            }
        } finally {
            // Restaura el botón pase lo que pase
            btn.disabled = false;
            btn.textContent = 'Iniciar sesión';
            UI.hideLoader();
        }
    });
})();