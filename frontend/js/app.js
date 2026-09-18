// Referencias al DOM
const vistaLogin = document.getElementById('vista-login');
const vistaDashboard = document.getElementById('vista-dashboard');
const formLogin = document.getElementById('form-login');
const msjError = document.getElementById('msj-error');
const btnLogout = document.getElementById('btn-logout');

// --- LÓGICA PÚBLICA (Catálogo) ---
async function cargarRestaurantes() {
    const contenedor = document.getElementById('contenedor-restaurantes');
    contenedor.innerHTML = '<p>Cargando disponibilidad de mesas...</p>';
    
    try {
        const restaurantes = await api.obtenerRestaurantes();
        contenedor.innerHTML = ''; // Limpiamos el texto de carga

        if (!restaurantes || restaurantes.length === 0) {
            contenedor.innerHTML = '<p>No hay restaurantes disponibles.</p>';
            return;
        }

        restaurantes.forEach(restaurante => {
            const card = document.createElement('div');
            card.className = 'tarjeta-restaurante';
            
            // Título del restaurante
            let htmlContenido = `<h3>${restaurante.name || restaurante.nombre || 'Restaurante'}</h3>`;
            htmlContenido += `<div class="grilla-mesas">`;

            // Verificamos si tiene mesas
            const mesasDelLocal = restaurante.tables || restaurante.mesas || [];
            
            if (mesasDelLocal.length > 0) {
                mesasDelLocal.forEach(mesa => {
                    // Verificamos el estado para asignar color. Asumimos que id 2 es Ocupada, ajusta si es necesario.
                    const estadoId = mesa.status_id || mesa.estado_id;
                    const claseEstado = (estadoId === 2) ? 'mesa-ocupada' : 'mesa-libre';
                    const numeroMesa = mesa.number || mesa.numero || '#';
                    
                    htmlContenido += `
                        <div class="mesa-3d ${claseEstado}" title="Mesa ${numeroMesa}">
                            ${numeroMesa}
                        </div>
                    `;
                });
            } else {
                htmlContenido += `<p style="grid-column: 1 / -1; font-size: 0.9rem;">Sin mesas configuradas.</p>`;
            }

            htmlContenido += `</div>`;
            card.innerHTML = htmlContenido;
            contenedor.appendChild(card);
        });

    } catch (error) {
        contenedor.innerHTML = `<p style="color: #e60000; font-weight: bold;">Error al conectar con el servidor: ${error.message}</p>`;
    }
}

// Cargar estado inicial al entrar a la página
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar siempre el catálogo público
    cargarRestaurantes();

    // 2. Comprobar estado de la sesión administrativa
    const token = localStorage.getItem('jwt_token');
    if (token) {
        mostrarDashboard();
    }
});

// Botón manual para actualizar las mesas
document.getElementById('btn-cargar-restaurantes').addEventListener('click', cargarRestaurantes);


// --- LÓGICA DE AUTENTICACIÓN Y ADMINISTRACIÓN ---
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

btnLogout.addEventListener('click', () => {
    localStorage.removeItem('jwt_token');
    vistaDashboard.classList.add('oculto');
    btnLogout.classList.add('oculto');
    vistaLogin.classList.remove('oculto');
    
    document.getElementById('res-mesas').textContent = '';
    document.getElementById('mensaje-bienvenida').textContent = '';
});

// Endpoint Privado - Rotar Mesa
document.getElementById('btn-rotar-mesa').addEventListener('click', async () => {
    const consola = document.getElementById('res-mesas');
    consola.textContent = 'Enviando petición...';
    try {
        const data = await api.rotarEstadoMesa(1); 
        consola.textContent = JSON.stringify(data, null, 2);
        
        // Opcional: Recargar el catálogo público para ver el cambio reflejado al instante
        cargarRestaurantes();
    } catch (error) {
        consola.textContent = 'Error: ' + error.message;
    }
});

// Utilidades
function mostrarDashboard() {
    const token = localStorage.getItem('jwt_token');
    
    if (token) {
        const datosUsuario = parsearJWT(token);
        if (datosUsuario && datosUsuario.email) {
            document.getElementById('mensaje-bienvenida').textContent = `Admin: ${datosUsuario.email}`;
        } else if (datosUsuario && datosUsuario.name) {
            document.getElementById('mensaje-bienvenida').textContent = `Admin: ${datosUsuario.name}`;
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