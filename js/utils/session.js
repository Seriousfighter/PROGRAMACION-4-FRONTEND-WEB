/* =========================================================
   Utilidades de sesión
   Maneja el token JWT y los datos del usuario.
   ========================================================= */
const Session = {
    /* Guarda el token y el usuario después de un login exitoso */
    save(token, user) {
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
    },

    /* Devuelve el token JWT crudo */
    getToken() {
        return localStorage.getItem(CONFIG.TOKEN_KEY);
    },

    /* Devuelve el usuario parseado como objeto */
    getUser() {
        const raw = localStorage.getItem(CONFIG.USER_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (_) {
            return null;
        }
    },

    /* Devuelve true si hay un token guardado */
    isLogged() {
        const token = this.getToken();
        return typeof token === 'string' && token.length > 0;
    },

    /* Borra todo (se usa al cerrar sesión o si el token expiró) */
    clear() {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
    }
};