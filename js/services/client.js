/* =========================================================
   Cliente HTTP centralizado
   ========================================================= */
const ApiClient = {
    // Función principal que arma y envía la petición HTTP
    async request(path, { method = 'GET', body = null, auth = true } = {}) {
        // 1. Cabeceras (headers)
        const headers = {
            'Accept': 'application/json'
        };

        // Si enviamos datos, avisamos que es JSON
        if (body !== null) {
            headers['Content-Type'] = 'application/json';
        }

        // 2. Si requiere auth, adjuntamos el token
        if (auth) {
            const token = Session.getToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }

        // 3. Armamos las opciones finales
        const options = { method, headers };
        if (body !== null) options.body = JSON.stringify(body);

        let response;
        try {
            // 4. Hacemos la petición real al backend
            response = await fetch(`${CONFIG.API_URL}${path}`, options);
        } catch (err) {
            // Sin internet o servidor caído
            throw { status: 0, message: 'No se pudo conectar con el servidor.' };
        }

        // 5. Si el token expiró (401), cerramos sesión y redirigimos
        if (response.status === 401 && auth) {
            Session.clear();
            UI.redirect('index.html');
            throw { status: 401, message: 'Sesión expirada' };
        }

        // 6. Si no hay contenido (204), devolvemos null
        if (response.status === 204) return null;

        // 7. Intentamos leer el JSON de respuesta
        let data = null;
        try { data = await response.json(); } catch (_) {}

        // 8. Si hubo error (400, 404, 500), lo lanzamos
        if (!response.ok) {
            throw {
                status: response.status,
                message: (data && data.message) || 'Error del servidor',
                errors: (data && data.errors) || null
            };
        }

        // 9. Todo bien, devolvemos los datos
        return data;
    },

    // Atajos para cada método HTTP
    get(path, auth = true)        { return this.request(path, { method: 'GET', auth }); },
    post(path, body, auth = true) { return this.request(path, { method: 'POST', body, auth }); },
    put(path, body, auth = true)  { return this.request(path, { method: 'PUT', body, auth }); },
    patch(path, body = null, auth = true) { return this.request(path, { method: 'PATCH', body, auth }); },
    del(path, auth = true)        { return this.request(path, { method: 'DELETE', auth }); }
};