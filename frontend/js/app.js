const vistaLogin = document.getElementById('vista-login');
const vistaDashboard = document.getElementById('vista-dashboard');
const formLogin = document.getElementById('form-login');
const msjError = document.getElementById('msj-error');
const btnLogout = document.getElementById('btn-logout');

async function cargarRestaurantes() {
    const contenedor = document.getElementById('contenedor-restaurantes');
    contenedor.innerHTML = '<p>Cargando disponibilidad de mesas...</p>';
    
    try {
        const respuesta = await api.obtenerRestaurantes();
        const restaurantes = Array.isArray(respuesta) ? respuesta : (respuesta.data || respuesta.datos || []);
        
        contenedor.innerHTML = ''; 

        if (restaurantes.length === 0) {
            contenedor.innerHTML = '<p>No hay restaurantes disponibles.</p>';
            return;
        }

        restaurantes.forEach(restaurante => {
            const mesasDelLocal = restaurante.tables || [];
            let totalMesas = mesasDelLocal.length;
            let mesasOcupadas = 0;

            mesasDelLocal.forEach(mesa => {
                const estadoStr = mesa.status ? mesa.status.toLowerCase() : 'disponible';
                if (estadoStr === 'ocupada' || estadoStr === 'reservada') {
                    mesasOcupadas++;
                }
            });

            let claseRestaurante = 'restaurante-disponible';
            let textoEstado = 'Disponible';

            if (totalMesas > 0) {
                const porcentaje = (mesasOcupadas / totalMesas) * 100;
                if (porcentaje === 100) {
                    claseRestaurante = 'restaurante-lleno';
                    textoEstado = 'Lleno';
                } else if (porcentaje >= 50) {
                    claseRestaurante = 'restaurante-medio';
                    textoEstado = 'Ocupación Media';
                }
            }

            const card = document.createElement('div');
            card.className = `tarjeta-restaurante ${claseRestaurante}`;
            const nombreLocal = restaurante.name || 'Restaurante';
            const direccionLocal = restaurante.address || '';
            
            // Botón de mapa dinámico
            let botonMapa = '';
            if (restaurante.latitude && restaurante.longitude) {
                const urlMapa = `https://www.google.com/maps/dir/?api=1&destination=${restaurante.latitude},${restaurante.longitude}`;
                botonMapa = `<a href="${urlMapa}" target="_blank" class="btn-mapa">📍 Cómo llegar</a>`;
            }
            
            let htmlContenido = `
                <div style="border-bottom: 2px solid #000000; padding-bottom: 10px; margin-bottom: 15px;">
                    <h3 style="display: flex; justify-content: space-between; align-items: center; margin: 0 0 5px 0; border: none; padding: 0;">
                        ${nombreLocal}
                        <span style="font-size: 0.75rem; font-weight: bold; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; background: rgba(0,0,0,0.08); color: #000000;">
                            ${textoEstado}
                        </span>
                    </h3>
                    <p style="margin: 0; font-size: 0.9rem; color: #555; display: flex; align-items: center;">
                        ${direccionLocal} ${botonMapa}
                    </p>
                </div>
                <div class="grilla-mesas">
            `;
            
            if (totalMesas > 0) {
                mesasDelLocal.forEach(mesa => {
                    const estadoStr = mesa.status ? mesa.status.toLowerCase() : 'disponible';
                    const numeroMesa = mesa.table_number || '#';
                    const capacidad = mesa.chairs || 4;
                    const detalle = mesa.details || 'General';

                    let claseEstado = 'mesa-disponible';
                    if (estadoStr === 'ocupada') claseEstado = 'mesa-ocupada';
                    if (estadoStr === 'reservada') claseEstado = 'mesa-reservada';
                    
                    htmlContenido += `
                        <div class="mesa-wrapper" title="${detalle} - Estado: ${estadoStr}">
                            <div class="mesa-3d ${claseEstado}">
                                ${numeroMesa}
                            </div>
                            <div class="mesa-info">
                                <span class="capacidad">${capacidad} personas</span>
                                <span class="detalle">${detalle}</span>
                            </div>
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

document.addEventListener('DOMContentLoaded', () => {
    cargarRestaurantes();
    const token = localStorage.getItem('jwt_token');
    if (token) mostrarDashboard();
});

document.getElementById('btn-cargar-restaurantes').addEventListener('click', cargarRestaurantes);

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

document.getElementById('btn-rotar-mesa').addEventListener('click', async () => {
    const consola = document.getElementById('res-mesas');
    consola.textContent = 'Enviando petición...';
    try {
        const data = await api.rotarEstadoMesa(1); 
        consola.textContent = JSON.stringify(data, null, 2);
        cargarRestaurantes();
    } catch (error) {
        consola.textContent = 'Error: ' + error.message;
    }
});

function mostrarDashboard() {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        const datosUsuario = parsearJWT(token);
        if (datosUsuario && (datosUsuario.email || datosUsuario.name)) {
            document.getElementById('mensaje-bienvenida').textContent = `Admin: ${datosUsuario.email || datosUsuario.name}`;
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