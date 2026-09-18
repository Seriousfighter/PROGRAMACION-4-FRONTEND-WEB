const API_BASE = 'http://127.0.0.1:8080/api';

const api = {
    getHeaders: (requiereAuth = false) => {
        const headers = { 'Content-Type': 'application/json' };
        if (requiereAuth) {
            const token = localStorage.getItem('jwt_token');
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    login: async (email, password) => {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify({ email, password })
        });
        return response.json();
    },

    obtenerRestaurantes: async () => {
        const response = await fetch(`${API_BASE}/public/restaurants`, {
            method: 'GET',
            headers: api.getHeaders()
        });
        return response.json();
    },

    rotarEstadoMesa: async (idMesa) => {
        const response = await fetch(`${API_BASE}/tables/${idMesa}/status`, {
            method: 'PATCH',
            headers: api.getHeaders(true)
        });
        return response.json();
    }
};