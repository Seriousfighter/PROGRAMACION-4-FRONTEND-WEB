/* =========================================================
   Dashboard (web) — enfoque 1 restaurante
   - Verifica sesión
   - Saluda al usuario
   - Si no tiene restaurante → estado vacío + modal
   - Si tiene → muestra stats + acciones
   ========================================================= */
(function () {
    Guard.requireAuth();

    /* ---------- DOM ---------- */
    const greeting     = document.getElementById('user-greeting');
    const logoutBtn    = document.getElementById('logout-btn');
    const heroTitle    = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');

    const loading      = document.getElementById('loading');
    const emptyState   = document.getElementById('empty-state');
    const content      = document.getElementById('content');

    const statTotal     = document.getElementById('stat-total');
    const statAvailable = document.getElementById('stat-available');
    const statOccupied  = document.getElementById('stat-occupied');

    const createModal   = document.getElementById('create-modal');
    const createBtn     = document.getElementById('create-restaurant-btn');
    const cancelCreate  = document.getElementById('cancel-create-btn');
    const submitCreate  = document.getElementById('submit-create-btn');
    const createForm    = document.getElementById('create-restaurant-form');
    const modalError    = document.getElementById('modal-error');

    /* ---------- Saludo ---------- */
    const user = Session.getUser();
    if (user && user.name) {
        greeting.textContent = `Hola, ${user.name.split(' ')[0]}`;
    }

    /* ---------- Logout ---------- */
    logoutBtn.addEventListener('click', () => AuthApi.logout());

    /* ---------- Mostrar/ocultar vistas ---------- */
    function show(el) {
        [loading, emptyState, content].forEach(e => e.hidden = true);
        el.hidden = false;
    }

    /* ---------- Cargar dashboard ---------- */
    async function load() {
        show(loading);

        try {
            const res = await RestaurantApi.list();
            const restaurants = res.data || [];

            // Si no hay restaurantes → estado vacío
            if (restaurants.length === 0) {
                heroTitle.textContent = 'Bienvenido a Messapi';
                heroSubtitle.textContent = 'Empezá creando tu primer restaurante.';
                show(emptyState);
                return;
            }

            // Tomar el primero
            const restaurant = restaurants[0];

            // Hero
            heroTitle.textContent = restaurant.name;
            heroSubtitle.textContent = [
                restaurant.address,
                restaurant.phone
            ].filter(Boolean).join(' · ');

            // Traer las mesas
            const tablesRes = await RestaurantApi.listTables(restaurant.id);
            const tables = tablesRes.data || [];

            // Stats
            const total     = tables.length;
            const available = tables.filter(t => t.status_id === 1).length;
            const occupied  = tables.filter(t => t.status_id === 2).length;

            statTotal.textContent     = total;
            statAvailable.textContent = available;
            statOccupied.textContent  = occupied;

            show(content);

        } catch (err) {
            UI.error(err.message || 'Error al cargar el panel');
            show(emptyState);
        }
    }

    /* ---------- Abrir modal ---------- */
    function openCreateModal() {
        createForm.reset();
        modalError.hidden = true;
        modalError.textContent = '';
        createModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeCreateModal() {
        createModal.hidden = true;
        document.body.style.overflow = '';
    }

    createBtn.addEventListener('click', openCreateModal);
    cancelCreate.addEventListener('click', closeCreateModal);
    createModal.addEventListener('click', (e) => {
        if (e.target === createModal) closeCreateModal();
    });

    /* Cerrar con Escape */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !createModal.hidden) {
            closeCreateModal();
        }
    });

    /* ---------- Crear restaurante ---------- */
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        modalError.hidden = true;

        const name        = document.getElementById('name').value.trim();
        const address     = document.getElementById('address').value.trim();
        const phone       = document.getElementById('phone').value.trim();
        const description = document.getElementById('description').value.trim();

        if (!name) {
            modalError.textContent = 'El nombre es obligatorio.';
            modalError.hidden = false;
            return;
        }
        if (!address) {
            modalError.textContent = 'La dirección es obligatoria.';
            modalError.hidden = false;
            return;
        }

        submitCreate.disabled = true;
        submitCreate.textContent = 'Creando...';

        try {
            await RestaurantApi.create({
                name,
                address,
                phone: phone || null,
                description: description || null,
                is_open: true
            });

            UI.success('¡Restaurante creado!');
            closeCreateModal();
            await load();

        } catch (err) {
            if (err.errors) {
                const first = Object.values(err.errors)[0];
                modalError.textContent = first || err.message;
            } else {
                modalError.textContent = err.message || 'Error al crear el restaurante.';
            }
            modalError.hidden = false;
        } finally {
            submitCreate.disabled = false;
            submitCreate.textContent = 'Crear restaurante';
        }
    });

    /* ---------- Init ---------- */
    load();
})();