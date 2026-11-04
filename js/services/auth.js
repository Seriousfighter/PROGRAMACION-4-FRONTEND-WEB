/* =========================================================
   Servicio de autenticación (web)
   ========================================================= */
const AuthApi = {
    /* Registro de usuario
       POST /api/register  →  { user, token } */
    register(name, email, password) {
        return ApiClient.post('/register', { name, email, password }, false); // Crea un usuario nuevo (no envía token)
    },

    /* Login con email y contraseña
       POST /api/login  →  { user, token } */
    login(email, password) {
        return ApiClient.post('/login', { email, password }, false); // Inicia sesión y devuelve el token
    },

    /* Perfil del usuario autenticado
       GET /api/me  →  { user } */
    me() {
        return ApiClient.get('/me');// Trae los datos del usuario logueado
    },

    /* Cerrar sesión */
    logout() {
        Session.clear();
        UI.redirect('index.html');// Borra la sesión y redirige al login
    }
};