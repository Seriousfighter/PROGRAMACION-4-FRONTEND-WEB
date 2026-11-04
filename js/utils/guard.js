/* =========================================================
   Guardián de rutas
   Protege las páginas que requieren autenticación.
   ========================================================= */
const Guard = {
    /* Requiere que el usuario esté logueado.
       Si no lo está, lo redirige al login. */
    requireAuth() {
        if (!Session.isLogged()) {
            UI.redirect('index.html');
            return false;
        }
        return true;
    },

    /* Requiere que el usuario NO esté logueado.
       Si ya lo está, lo redirige al dashboard. */
    requireGuest() {
        if (Session.isLogged()) {
            UI.redirect('dashboard.html');
            return false;
        }
        return true;
    }
};