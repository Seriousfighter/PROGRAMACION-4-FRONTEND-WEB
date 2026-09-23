/* =========================================================
   Editar restaurante (web)
   - Carga los datos del restaurante del usuario
   - Permite editar nombre, dirección, teléfono, descripción
   - Permite cambiar la cantidad de mesas (min 1, max 100)
   - Crea o elimina mesas según corresponda
   ========================================================= */
(function () {
    Guard.requireAuth();

    /* ---------- DOM ---------- */
    const greeting    = document.getElementById('user-greeting');
    const logoutBtn   = document.getElementById('logout-btn');
    const heroTitle   = document.getElementById('hero-title');

    const loading     = document.getElementById('loading');
    const errorBox    = document.getElementById('error-box');
    const errorMsg    = document.getElementById('error-message');
    const form        = document.getElementById('restaurant-form');
    const formError   = document.getElementById('form-error');
    const submitBtn   = document.getElementById('submit-btn');

    const nameIn      = document.getElementById('name');
    const addressIn   = document.getElementById('address');
    const phoneIn     = document.getElementById('phone');
    const descIn      = document.getElementById('description');

    const btnMinus    = document.getElementById('btn-minus');
    const btnPlus     = document.getElementById('btn-plus');
    const tablesCount = document.getElementById('tables-count');
    const hintEl      = document.getElementById('numberbox-hint');

    // Modales
    const confirmModal = document.getElementById('confirm-modal');
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMsg   = document.getElementById('confirm-message');
    const confirmOk    = document.getElementById('confirm-ok');
    const confirmCancel = document.getElementById('confirm-cancel');

    const blockedModal = document.getElementById('blocked-modal');
    const blockedMsg   = document.getElementById('blocked-message');
    const blockedOk    = document.getElementById('blocked-ok');

    /* ---------- Estado ---------- */
    let restaurant = null;         // datos del restaurante
    let currentTables = [];        // mesas actuales
    let originalCount = 0;         // cantidad original de mesas

    const MIN_TABLES = 1;
    const MAX_TABLES = 100;

    /* ---------- Saludo ---------- */
    const user = Session.getUser();
    if (user && user.name) {
        greeting.textContent = `Hola, ${user.name.split(' ')[0]}`;
    }

    /* ---------- Logout ---------- */
    logoutBtn.addEventListener('click', () => AuthApi.logout());

    /* ---------- Mostrar/ocultar ---------- */
    function show(el) {
        [loading, errorBox, form].forEach(e => e.hidden = true);
        el.hidden = false;
    }

    /* ---------- Error ---------- */
    function showError(msg) {
        errorMsg.textContent = msg;
        show(errorBox);
    }

    /* ---------- Cargar restaurante ---------- */
    async function load() {
        show(loading);

        try {
            const res = await RestaurantApi.list();
            const restaurants = res.data || [];

            if (restaurants.length === 0) {
                // No tiene restaurante → volver al dashboard
                UI.redirect('dashboard.html');
                return;
            }

            restaurant = restaurants[0];
            heroTitle.textContent = restaurant.name;

            // Cargar las mesas
            const tablesRes = await RestaurantApi.listTables(restaurant.id);
            currentTables = tablesRes.data || [];
            originalCount = currentTables.length;

            // Prellenar el formulario
            nameIn.value    = restaurant.name || '';
            addressIn.value = restaurant.address || '';
            phoneIn.value   = restaurant.phone || '';
            descIn.value    = restaurant.description || '';

            // Ajustar el numberbox
            const initialCount = Math.max(MIN_TABLES, originalCount);
            tablesCount.value = initialCount;
            updateHint();

            show(form);

        } catch (err) {
            showError(err.message || 'Error al cargar el restaurante.');
        }
    }

    /* ---------- Numberbox ---------- */
    function clampCount(n) {
        n = parseInt(n, 10);
        if (isNaN(n)) n = originalCount || MIN_TABLES;
        return Math.min(MAX_TABLES, Math.max(MIN_TABLES, n));
    }

    function updateHint() {
        const n = clampCount(tablesCount.value);
        const word = n === 1 ? 'mesa' : 'mesas';
        hintEl.innerHTML = `Actualmente tenés <strong>${originalCount}</strong> ${originalCount === 1 ? 'mesa' : 'mesas'}.`;
    }

    btnMinus.addEventListener('click', () => {
        tablesCount.value = clampCount(tablesCount.value) - 1;
        updateHint();
    });

    btnPlus.addEventListener('click', () => {
        tablesCount.value = clampCount(tablesCount.value) + 1;
        updateHint();
    });

    tablesCount.addEventListener('input', () => {
        // No forzamos clamp al tipear, solo al perder foco
    });

    tablesCount.addEventListener('blur', () => {
        tablesCount.value = clampCount(tablesCount.value);
        updateHint();
    });

    /* ---------- Modal genérico de confirmación ---------- */
    function askConfirm(title, message) {
        return new Promise((resolve) => {
            confirmTitle.textContent = title;
            confirmMsg.textContent = message;
            confirmModal.hidden = false;

            const cleanup = (value) => {
                confirmModal.hidden = true;
                confirmOk.removeEventListener('click', onOk);
                confirmCancel.removeEventListener('click', onCancel);
                resolve(value);
            };
            const onOk     = () => cleanup(true);
            const onCancel = () => cleanup(false);

            confirmOk.addEventListener('click', onOk);
            confirmCancel.addEventListener('click', onCancel);
        });
    }

    /* ---------- Modal bloqueante ---------- */
    function showBlocked(message) {
        blockedMsg.textContent = message;
        blockedModal.hidden = false;
        blockedOk.addEventListener('click', () => {
            blockedModal.hidden = true;
        }, { once: true });
    }

    /* ---------- Guardar cambios ---------- */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.hidden = true;

        const name        = nameIn.value.trim();
        const address     = addressIn.value.trim();
        const phone       = phoneIn.value.trim();
        const description = descIn.value.trim();
        const newCount    = clampCount(tablesCount.value);

        // Validaciones
        if (!name) {
            formError.textContent = 'El nombre es obligatorio.';
            formError.hidden = false;
            return;
        }
        if (!address) {
            formError.textContent = 'La dirección es obligatoria.';
            formError.hidden = false;
            return;
        }

        // 1) Si cambia la cantidad de mesas → chequear
        const countDiff = newCount - originalCount;

        if (countDiff < 0) {
            // Va a reducir: chequear que las últimas N estén libres
            const tablesToDelete = currentTables.slice(newCount); // las de mayor número
            const busy = tablesToDelete.filter(t => t.status_id !== 1);

            if (busy.length > 0) {
                const nums = busy.map(t => `Mesa ${t.table_number}`).join(', ');
                showBlocked(
                    `No se puede reducir la cantidad de mesas porque ${nums} no está${busy.length > 1 ? 'n' : ''} disponible${busy.length > 1 ? 's' : ''}. Liberá esas mesas antes de reducir.`
                );
                return;
            }
        }

        // 2) Si cambia → confirmar
        if (countDiff !== 0) {
            let msg;
            if (countDiff > 0) {
                msg = `Vas a agregar ${countDiff} ${countDiff === 1 ? 'mesa nueva' : 'mesas nuevas'} (numeradas automáticamente). ¿Confirmar?`;
            } else {
                msg = `Vas a eliminar ${Math.abs(countDiff)} ${Math.abs(countDiff) === 1 ? 'mesa' : 'mesas'} (las de mayor número). ¿Confirmar?`;
            }
            const ok = await askConfirm('Confirmar cambio de mesas', msg);
            if (!ok) return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';
        UI.showLoader();

        try {
            // 3) Actualizar los datos del restaurante
            await RestaurantApi.update(restaurant.id, {
                name,
                address,
                phone: phone || null,
                description: description || null,
                is_open: restaurant.is_open ?? true
            });

            // 4) Ajustar la cantidad de mesas
            if (countDiff > 0) {
                // Crear N mesas nuevas
                for (let i = 0; i < countDiff; i++) {
                    const nextNumber = originalCount + i + 1;
                    await RestaurantApi.createTable(restaurant.id, {
                        table_number: nextNumber,
                        details: `Mesa ${nextNumber}`,
                        chairs: 4,
                        status_id: 1
                    });
                }
            } else if (countDiff < 0) {
                // Eliminar las últimas Math.abs(countDiff) mesas
                const tablesToDelete = currentTables.slice(newCount);
                for (const t of tablesToDelete) {
                    await TableApi.delete(t.id);
                }
            }

            UI.success('Cambios guardados correctamente.');
            UI.redirect('dashboard.html');

        } catch (err) {
            if (err.errors) {
                const first = Object.values(err.errors)[0];
                formError.textContent = first || err.message;
            } else {
                formError.textContent = err.message || 'Error al guardar los cambios.';
            }
            formError.hidden = false;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar cambios';
            UI.hideLoader();
        }
    });

    /* ---------- Init ---------- */
    load();
})();