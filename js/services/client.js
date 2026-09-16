/* =========================================================
   Cliente HTTP centralizado
   Todas las llamadas al backend pasan por acá.
   ========================================================= */
const ApiClient = {
    async request(path, { method = 'GET', body = null, auth = true } = {}) {
        const headers = {
            'Accept': 'application/json'
        };

        if (body !== null) {
            headers['Content-Type'] = 'application/json';
        }

        if (auth) {
            const token = Session.getToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }

        const options = { method, headers };
        if (body !== null) options.body = JSON.stringify(body);

        let response;
        try {
            response = await fetch(`${CONFIG.API_URL}${path}`, options);
        } catch (err) {
            throw { status: 0, message: 'No se pudo conectar con el servidor.' };
        }

        if (response.status === 401 && auth) {
            Session.clear();
            UI.redirect('index.html');
            throw { status: 401, message: 'Sesión expirada' };
        }

        if (response.status === 204) return null;

        let data = null;
        try { data = await response.json(); } catch (_) {}

        if (!response.ok) {
            throw {
                status: response.status,
                message: (data && data.message) || 'Error del servidor',
                errors: (data && data.errors) || null
            };
        }

        return data;
    },

    get(path, auth = true)        { return this.request(path, { method: 'GET', auth }); },
    post(path, body, auth = true) { return this.request(path, { method: 'POST', body, auth }); },
    put(path, body, auth = true)  { return this.request(path, { method: 'PUT', body, auth }); },
    patch(path, body = null, auth = true) { return this.request(path, { method: 'PATCH', body, auth }); },
    del(path, auth = true)        { return this.request(path, { method: 'DELETE', auth }); }
};