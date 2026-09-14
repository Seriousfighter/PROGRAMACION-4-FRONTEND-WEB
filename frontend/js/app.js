// Referencias al DOM
const vistaLogin = document.getElementById('vista-login');
const vistaDashboard = document.getElementById('vista-dashboard');
const formLogin = document.getElementById('form-login');
const msjError = document.getElementById('msj-error');
const btnLogout = document.getElementById('btn-logout');

// Comprobar estado al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        mostrarDashboard();
    }
});

// Lógica de Login
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    msjError.textContent = '';
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const data = await api.login(email, password);
        
        if (data.token) {
            localStorage.setItem('jwt_token', data.token);
            mostrarDashboard();
        } else {
            msjError.textContent = data.error || 'Credenciales inválidas';
        }
    } catch (error) {
        msjError.textContent = 'Error de conexión con el servidor.';
    }
});

// Lógica de Logout
btnLogout.addEventListener('click', () => {
    localStorage.removeItem('jwt_token');
    vistaDashboard.classList.add('oculto');
    btnLogout.classList.add('oculto');
    vistaLogin.classList.remove('oculto');
    
    document.getElementById('res-restaurantes').textContent = '';
    document.getElementById('res-mesas').textContent = '';
    document.getElementById('mensaje-bienvenida').textContent = '';
});

// Funciones del Dashboard
document.getElementById('btn-cargar-restaurantes').addEventListener('click', async () => {
    const consola = document.getElementById('res-restaurantes');
    consola.textContent = 'Cargando...';
    try {
        const data = await api.obtenerRestaurantes();
        consola.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        consola.textContent = 'Error: ' + error.message;
    }
});

document.getElementById('btn-rotar-mesa').addEventListener('click', async () => {
    const consola = document.getElementById('res-mesas');
    consola.textContent = 'Enviando petición...';
    try {
        const data = await api.rotarEstadoMesa(1); 
        consola.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        consola.textContent = 'Error: ' + error.message;
    }
});

// Utilidades y decodificación JWT
function mostrarDashboard() {
    const token = localStorage.getItem('jwt_token');
    
    if (token) {
        const datosUsuario = parsearJWT(token);
        // Ajusta "email" si tu payload de PHP usa otra clave (ej. "usuario")
        if (datosUsuario && datosUsuario.email) {
            document.getElementById('mensaje-bienvenida').textContent = `Hola, ${datosUsuario.email}`;
        }
    }

    vistaLogin.classList.add('oculto');
    vistaDashboard.classList.remove('oculto');
    btnLogout.classList.remove('oculto');
}

function parsearJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}