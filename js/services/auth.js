/* =========================================================
   Servicio de autenticación (web)
   ========================================================= */
const AuthApi = {
    /* Registro de usuario
       POST /api/register  →  { user, token } */
    register(name, email, password) {
        return ApiClient.post('/register', { name, email, password }, false);
    },

    /* Login con email y contraseña
       POST /api/login  →  { user, token } */
    login(email, password) {
        return ApiClient.post('/login', { email, password }, false);
    },

    /* Perfil del usuario autenticado
       GET /api/me  →  { user } */
    me() {
        return ApiClient.get('/me');
    },

    /* Cerrar sesión */
    logout() {
        Session.clear();
        UI.redirect('index.html');
    }
};