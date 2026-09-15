/* =========================================================
   Utilidades de interfaz
   Toasts, loader global y escape de HTML.
   ========================================================= */
const UI = {
    /* Escapa HTML para evitar XSS al mostrar datos del usuario */
    escape(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    /* Muestra una notificación temporal (toast) */
    toast(message, type = 'info') {
        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.textContent = message;
        document.body.appendChild(el);

        setTimeout(() => {
            el.classList.add('toast-hide');
            setTimeout(() => el.remove(), 300);
        }, 3000);
    },

    /* Atajos para tipos comunes de toast */
    success(msg) { this.toast(msg, 'success'); },
    error(msg)   { this.toast(msg, 'error'); },
    info(msg)    { this.toast(msg, 'info'); },

    /* Muestra el loader global */
    showLoader() {
        let el = document.getElementById('global-loader');
        if (!el) {
            el = document.createElement('div');
            el.id = 'global-loader';
            el.className = 'global-loader';
            el.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(el);
        }
        el.style.display = 'flex';
    },

    /* Oculta el loader global */
    hideLoader() {
        const el = document.getElementById('global-loader');
        if (el) el.style.display = 'none';
    },

    /* Redirige a otra página */
    redirect(path) {
        window.location.href = path;
    }
};