/* =========================================================
   Dashboard (web) — Panel general de mesas
   - Navbar con Home / Editar / Salir
   - Grid de mesas (círculos) con click para rotar estado
   - Modal "Editar" con 2 pestañas: Info y Cantidad de mesas
   - Se guarda todo con un solo botón
   ========================================================= */
(function () {
    Guard.requireAuth();

    /* ---------- Utilidades ---------- */
    const $ = (id) => document.getElementById(id);

    const STATUS = {
        1: { key: 'available', label: 'Disponible' },
        2: { key: 'occupied',  label: 'Ocupada'    },
        3: { key: 'reserved',  label: 'Reservada'  }
    };

    /* ---------- DOM: Navbar ---------- */
    const navHome   = $('nav-home');
    const navEdit   = $('nav-edit');
    const navLogout = $('nav-logout');

    /* ---------- DOM: Panel ---------- */
    const restaurantInfo = $('restaurant-info');
    const loading        = $('loading');
    const emptyState     = $('empty-state');
    const noTablesState  = $('no-tables-state');
    const tablesContent  = $('tables-content');
    const tablesGrid     = $('tables-grid');
    const createBtn      = $('create-restaurant-btn');
    const addTablesBtn   = $('add-tables-btn');

    /* ---------- DOM: Modal editar ---------- */
    const editModal    = $('edit-modal');
    const editCancel   = $('edit-cancel');
    const editCancel2  = $('edit-cancel-2');
    const editForm     = $('edit-form');
    const editSave     = $('edit-save');
    const formError    = $('form-error');

    const nameIn      = $('name');
    const addressIn   = $('address');
    const phoneIn     = $('phone');
    const descIn      = $('description');

    const btnMinus    = $('btn-minus');
    const btnPlus     = $('btn-plus');
    const tablesCount = $('tables-count');
    const hintEl      = $('numberbox-hint');

    const tabs        = document.querySelectorAll('.tab');
    const tabPanels   = document.querySelectorAll('.tab-panel');

    /* ---------- DOM: Modal crear ---------- */
    const createModal   = $('create-modal');
    const cancelCreate  = $('cancel-create-btn');
    const submitCreate  = $('submit-create-btn');
    const createForm    = $('create-restaurant-form');
    const modalError    = $('modal-error');

    /* ---------- DOM: Modales confirmación ---------- */
    const confirmModal = $('confirm-modal');
    const confirmTitle = $('confirm-title');
    const confirmMsg   = $('confirm-message');
    const confirmOk    = $('confirm-ok');
    const confirmCancel= $('confirm-cancel');

    const blockedModal = $('blocked-modal');
    const blockedMsg   = $('blocked-message');
    const blockedOk    = $('blocked-ok');

    /* ---------- Estado ---------- */
    let restaurant    = null;
    let tables        = [];
    let originalCount = 0;

    const MIN_TABLES = 1;
    const MAX_TABLES = 100;

    /* =========================================================
       NAVBAR
       ========================================================= */
    navHome.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    navEdit.addEventListener('click', openEditModal);

    navLogout.addEventListener('click', () => AuthApi.logout());

    /* =========================================================
       CARGA INICIAL
       ========================================================= */
    function showView(el) {
        [loading, emptyState, noTablesState, tablesContent]
            .forEach(e => e.hidden = true);
        el.hidden = false;
    }

    async function load() {
        showView(loading);

        try {
            const res = await RestaurantApi.list();
            const restaurants = res.data || [];

            if (restaurants.length === 0) {
                restaurantInfo.textContent = 'Creá tu primer restaurante.';
                showView(emptyState);
                return;
            }

            restaurant = restaurants[0];
            restaurantInfo.textContent = [
                restaurant.name,
                restaurant.address
            ].filter(Boolean).join(' · ');

            // Cargar mesas
            const tablesRes = await RestaurantApi.listTables(restaurant.id);
            tables = tablesRes.data || [];
            originalCount = tables.length;

            if (tables.length === 0) {
                showView(noTablesState);
                return;
            }

            renderTables();
            showView(tablesContent);

        } catch (err) {
            UI.error(err.message || 'Error al cargar el panel');
            showView(emptyState);
        }
    }

    /* =========================================================
       RENDER DE MESAS
       ========================================================= */
    function renderTables() {
        tablesGrid.innerHTML = tables.map(t => {
            const status = STATUS[t.status_id] || STATUS[1];
            return `
                <button type="button"
                        class="table-circle table-circle--${status.key}"
                        data-id="${t.id}"
                        data-status="${t.status_id}"
                        title="${status.label}">
                    <span class="table-circle__number">${t.table_number}</span>
                </button>
            `;
        }).join('');

        // Listener para rotar estado
        tablesGrid.querySelectorAll('.table-circle').forEach(el => {
            el.addEventListener('click', () => rotateStatus(el));
        });
    }

    /* =========================================================
       ROTAR ESTADO DE UNA MESA
       ========================================================= */
    async function rotateStatus(el) {
        const tableId = parseInt(el.dataset.id, 10);
        el.disabled = true;

        try {
            const res = await TableApi.rotateStatus(tableId);
            const updated = res.data;

            // Actualizar el DOM sin recargar
            const newStatus = STATUS[updated.status_id] || STATUS[1];
            el.classList.remove(
                'table-circle--available',
                'table-circle--occupied',
                'table-circle--reserved'
            );
            el.classList.add(`table-circle--${newStatus.key}`);
            el.dataset.status = updated.status_id;
            el.title = newStatus.label;

            // Actualizar también el array local
            const idx = tables.findIndex(t => t.id === tableId);
            if (idx >= 0) tables[idx].status_id = updated.status_id;

                       // Toast con el color del estado
            UI.toast(`Mesa ${updated.table_number} → ${newStatus.label}`, newStatus.key);
            
        } catch (err) {
            UI.error(err.message || 'No se pudo cambiar el estado');
        } finally {
            el.disabled = false;
        }
    }

    /* =========================================================
       MODAL EDITAR
       ========================================================= */
    function openEditModal() {
        if (!restaurant) return;

        // Precargar Info
        nameIn.value    = restaurant.name || '';
        addressIn.value = restaurant.address || '';
        phoneIn.value   = restaurant.phone || '';
        descIn.value    = restaurant.description || '';

        // Precargar Mesas
        const initialCount = Math.max(MIN_TABLES, originalCount);
        tablesCount.value = initialCount;
        updateHint();

        // Reset pestañas
        activateTab('info');
        formError.hidden = true;

        editModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeEditModal() {
        editModal.hidden = true;
        document.body.style.overflow = '';
    }

    editCancel.addEventListener('click', closeEditModal);
    editCancel2.addEventListener('click', closeEditModal);
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
    });

    /* ---------- Pestañas ---------- */
    function activateTab(name) {
        tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === name));
        tabPanels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === name));
    }

    tabs.forEach(t => {
        t.addEventListener('click', () => activateTab(t.dataset.tab));
    });

    /* ---------- Numberbox ---------- */
    function clampCount(n) {
        n = parseInt(n, 10);
        if (isNaN(n)) n = originalCount || MIN_TABLES;
        return Math.min(MAX_TABLES, Math.max(MIN_TABLES, n));
    }

    function updateHint() {
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

    tablesCount.addEventListener('blur', () => {
        tablesCount.value = clampCount(tablesCount.value);
        updateHint();
    });

    /* ---------- Guardar cambios (Info + Mesas) ---------- */
    editForm.addEventListener('submit', async (e) => {
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
            activateTab('info');
            return;
        }
        if (!address) {
            formError.textContent = 'La dirección es obligatoria.';
            formError.hidden = false;
            activateTab('info');
            return;
        }

        // Chequear reducción de mesas
        const countDiff = newCount - originalCount;

        if (countDiff < 0) {
            const tablesToDelete = tables.slice(newCount);
            const busy = tablesToDelete.filter(t => t.status_id !== 1);

            if (busy.length > 0) {
                const nums = busy.map(t => `Mesa ${t.table_number}`).join(', ');
                showBlocked(
                    `No se puede reducir porque ${nums} no está${busy.length > 1 ? 'n' : ''} disponible${busy.length > 1 ? 's' : ''}.`
                );
                return;
            }
        }

        // Confirmar si cambia la cantidad
        if (countDiff !== 0) {
            let msg;
            if (countDiff > 0) {
                msg = `Vas a agregar ${countDiff} ${countDiff === 1 ? 'mesa nueva' : 'mesas nuevas'}. ¿Confirmar?`;
            } else {
                msg = `Vas a eliminar ${Math.abs(countDiff)} ${Math.abs(countDiff) === 1 ? 'mesa' : 'mesas'} (las de mayor número). ¿Confirmar?`;
            }
            const ok = await askConfirm('Confirmar cambio de mesas', msg);
            if (!ok) return;
        }

        editSave.disabled = true;
        editSave.textContent = 'Guardando...';

        try {
            // 1) Actualizar info del restaurante
            await RestaurantApi.update(restaurant.id, {
                name,
                address,
                phone: phone || null,
                description: description || null,
                is_open: restaurant.is_open ?? true
            });

            // 2) Ajustar mesas
            if (countDiff > 0) {
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
                const toDelete = tables.slice(newCount);
                for (const t of toDelete) {
                    await TableApi.delete(t.id);
                }
            }

            UI.success('Cambios guardados.');
            closeEditModal();
            await load();

        } catch (err) {
            if (err.errors) {
                formError.textContent = Object.values(err.errors)[0] || err.message;
            } else {
                formError.textContent = err.message || 'Error al guardar.';
            }
            formError.hidden = false;
        } finally {
            editSave.disabled = false;
            editSave.textContent = 'Guardar';
        }
    });

    /* =========================================================
       CREAR RESTAURANTE
       ========================================================= */
    function openCreateModal() {
        createForm.reset();
        modalError.hidden = true;
        createModal.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeCreateModal() {
        createModal.hidden = true;
        document.body.style.overflow = '';
    }

    createBtn.addEventListener('click', openCreateModal);
    addTablesBtn.addEventListener('click', openEditModal);
    cancelCreate.addEventListener('click', closeCreateModal);
    createModal.addEventListener('click', (e) => {
        if (e.target === createModal) closeCreateModal();
    });

    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        modalError.hidden = true;

        const name        = document.getElementById('create-name').value.trim();
        const address     = document.getElementById('create-address').value.trim();
        const phone       = document.getElementById('create-phone').value.trim();
        const description = document.getElementById('create-description').value.trim();

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
            modalError.textContent = err.message || 'Error al crear.';
            modalError.hidden = false;
        } finally {
            submitCreate.disabled = false;
            submitCreate.textContent = 'Crear restaurante';
        }
    });

    /* =========================================================
       MODALES DE CONFIRMACIÓN
       ========================================================= */
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

    function showBlocked(message) {
        blockedMsg.textContent = message;
        blockedModal.hidden = false;
        blockedOk.addEventListener('click', () => {
            blockedModal.hidden = true;
        }, { once: true });
    }

    /* =========================================================
       Init
       ========================================================= */
    load();
})();