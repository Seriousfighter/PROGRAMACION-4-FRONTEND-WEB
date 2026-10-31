/* =========================================================
   Dashboard (web) — Panel general de mesas
   - Navbar con Home / Editar / Vista pública / Salir
   - Toggle abierto/cerrado
   - Buscador exacto por número de mesa
   - Grid de mesas (círculos) con click para rotar estado
   - Modal "Editar" con 3 pestañas: Info / Agregar / Eliminar
   ========================================================= */
(function () {
    Guard.requireAuth();

    const $ = (id) => document.getElementById(id);

    const STATUS = {
        1: { key: 'available', label: 'Disponible' },
        2: { key: 'occupied',  label: 'Ocupada'    },
        3: { key: 'reserved',  label: 'Reservada'  }
    };

    /* =========================================================
       1. DOM: Navbar
       ========================================================= */
    const navHome   = $('nav-home');
    const navEdit   = $('nav-edit');
    const navLogout = $('nav-logout');

    /* =========================================================
       2. DOM: Panel principal
       ========================================================= */
    const restaurantInfo = $('restaurant-info');
    const loading        = $('loading');
    const emptyState     = $('empty-state');
    const noTablesState  = $('no-tables-state');
    const tablesContent  = $('tables-content');
    const tablesGrid     = $('tables-grid');
    const createBtn      = $('create-restaurant-btn');
    const addTablesBtn   = $('add-tables-btn');

    /* =========================================================
       3. DOM: Toggle ON/OFF
       ========================================================= */
    const openCheckbox = $('open-checkbox');
    const toggleLabel  = $('toggle-label');

    /* =========================================================
       4. DOM: Filtros y Buscador
       ========================================================= */
    const filterTabs       = document.querySelectorAll('.filter-tab');
    const countAll         = $('count-all');
    const countAvailable   = $('count-available');
    const countOccupied    = $('count-occupied');
    const countReserved    = $('count-reserved');
    const searchTableInput = $('search-table-input');

    let activeFilter = 'all';

    /* =========================================================
       5. DOM: Modal Editar
       ========================================================= */
    const editModal      = $('edit-modal');
    const editModalTitle = $('edit-modal-title');
    const editCancel     = $('edit-cancel');
    const editCancel2    = $('edit-cancel-2');
    const editForm       = $('edit-form');
    const editSave       = $('edit-save');
    const formError      = $('form-error');

    // Inputs de la pestaña Info
    const nameIn    = $('name');
    const addressIn = $('address');
    const phoneIn   = $('phone');
    const descIn    = $('description');

    // Inputs de la pestaña Agregar
    const addChairsMinus = $('add-chairs-minus');
    const addChairsPlus  = $('add-chairs-plus');
    const addChairsCount = $('add-chairs-count');
    const addTablesMinus = $('add-tables-minus');
    const addTablesPlus  = $('add-tables-plus');
    const addTablesCount = $('add-tables-count');
    const addHint        = $('add-hint');

    // Inputs de la pestaña Eliminar
    const removeInfo        = $('remove-info');
    const removeTablesMinus = $('remove-tables-minus');
    const removeTablesPlus  = $('remove-tables-plus');
    const removeTablesCount = $('remove-tables-count');
    const removeHint        = $('remove-hint');

    // Pestañas
    const tabs      = document.querySelectorAll('.tab');
    const tabPanels = document.querySelectorAll('.tab-panel');

    /* =========================================================
       6. DOM: Modal Crear Restaurante
       ========================================================= */
    const createModal  = $('create-modal');
    const cancelCreate = $('cancel-create-btn');
    const submitCreate = $('submit-create-btn');
    const createForm   = $('create-restaurant-form');
    const modalError   = $('modal-error');

    /* =========================================================
       7. DOM: Modales de Confirmación / Bloqueo
       ========================================================= */
    const confirmModal  = $('confirm-modal');
    const confirmTitle  = $('confirm-title');
    const confirmMsg    = $('confirm-message');
    const confirmOk     = $('confirm-ok');
    const confirmCancel = $('confirm-cancel');

    const blockedModal = $('blocked-modal');
    const blockedMsg   = $('blocked-message');
    const blockedOk    = $('blocked-ok');

    /* =========================================================
       8. Estado Global
       ========================================================= */
    let restaurant = null;
    let tables     = [];
    let activeTab  = 'info';

    const MIN_TABLES = 1;
    const MAX_TABLES = 100;
    const MIN_CHAIRS = 1;
    const MAX_CHAIRS = 20;

    /* =========================================================
       9. Navbar
       ========================================================= */
    navHome.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    navEdit.addEventListener('click', openEditModal);
    navLogout.addEventListener('click', () => AuthApi.logout());

    /* =========================================================
       10. Toggle Abierto / Cerrado
       ========================================================= */
    openCheckbox.addEventListener('change', async () => {
        if (!restaurant) return;

        const newState = openCheckbox.checked;
        openCheckbox.disabled = true;

        try {
            await RestaurantApi.update(restaurant.id, {
                name:        restaurant.name,
                address:     restaurant.address,
                phone:       restaurant.phone       ?? null,
                description: restaurant.description ?? null,
                is_open:     newState
            });

            restaurant.is_open = newState ? 1 : 0;
            toggleLabel.textContent = newState ? 'Abierto' : 'Cerrado';

            if (newState === false) {
                const mesasAOcupar = tables.filter(t => t.status_id !== 1);
                if (mesasAOcupar.length > 0) {
                    await Promise.all(mesasAOcupar.map(t => forceAvailable(t.id)));
                }
            }

            UI.success(newState ? 'Restaurante abierto' : 'Restaurante cerrado y mesas liberadas');
            await load();

        } catch (err) {
            openCheckbox.checked = !newState;
            UI.error(err.message || 'No se pudo cambiar el estado');
        } finally {
            openCheckbox.disabled = false;
        }
    });

    /* =========================================================
       11. Carga Inicial
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

            openCheckbox.checked = restaurant.is_open === 1 || restaurant.is_open === true;
            toggleLabel.textContent = openCheckbox.checked ? 'Abierto' : 'Cerrado';

            const tablesRes = await RestaurantApi.listTables(restaurant.id);
            tables = tablesRes.data || [];

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
       12. Render de Mesas
       ========================================================= */
    function renderTables() {
        tablesGrid.innerHTML = tables.map(t => {
            const status = STATUS[t.status_id] || STATUS[1];
            const chairs = t.chairs || 4;
            return `
                <button type="button"
                        class="table-circle table-circle--${status.key}"
                        data-id="${t.id}"
                        data-status="${t.status_id}"
                        title="${status.label} · ${chairs} sillas">
                    <span class="table-circle__number">${t.table_number}</span>
                    <span class="table-circle__chairs">${chairs} sillas</span>
                </button>
            `;
        }).join('');

        tablesGrid.querySelectorAll('.table-circle').forEach(el => {
            el.addEventListener('click', () => rotateStatus(el));
        });

        updateCounters();
        applyFilter();
    }

    function updateCounters() {
        const total     = tables.length;
        const available = tables.filter(t => t.status_id === 1).length;
        const occupied  = tables.filter(t => t.status_id === 2).length;
        const reserved  = tables.filter(t => t.status_id === 3).length;

        countAll.textContent       = total;
        countAvailable.textContent = available;
        countOccupied.textContent  = occupied;
        countReserved.textContent  = reserved;
    }

    /* =========================================================
       13. Filtros y Buscador Exacto
       ========================================================= */
    function applyFilter() {
        const searchTerm = searchTableInput ? searchTableInput.value.trim() : '';
        const circles = tablesGrid.querySelectorAll('.table-circle');

        circles.forEach(circle => {
            const statusId = parseInt(circle.dataset.status, 10);
            const tableNumber = circle.querySelector('.table-circle__number').textContent;
            
            let statusKey = 'available';
            if (statusId === 2) statusKey = 'occupied';
            else if (statusId === 3) statusKey = 'reserved';

            const matchesStatus = (activeFilter === 'all' || statusKey === activeFilter);
            const matchesSearch = searchTerm === '' || tableNumber === searchTerm;

            if (matchesStatus && matchesSearch) {
                circle.hidden = false;
            } else {
                circle.hidden = true;
            }
        });
    }

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('is-active'));
            tab.classList.add('is-active');

            activeFilter = tab.dataset.filter;
            applyFilter();
        });
    });

    if (searchTableInput) {
        searchTableInput.addEventListener('input', applyFilter);
    }

    /* =========================================================
       14. Rotar Estado de una Mesa
       ========================================================= */
    async function rotateStatus(el) {
        const tableId = parseInt(el.dataset.id, 10);
        el.disabled = true;

        try {
            const res = await TableApi.rotateStatus(tableId);
            const updated = res.data;
            const newStatus = STATUS[updated.status_id] || STATUS[1];

            el.classList.remove(
                'table-circle--available',
                'table-circle--occupied',
                'table-circle--reserved'
            );
            el.classList.add(`table-circle--${newStatus.key}`);
            el.dataset.status = updated.status_id;
            el.title = newStatus.label;

            const idx = tables.findIndex(t => t.id === tableId);
            if (idx >= 0) tables[idx].status_id = updated.status_id;

            UI.toast(`Mesa ${updated.table_number} → ${newStatus.label}`, newStatus.key);
            updateCounters();
            applyFilter();

        } catch (err) {
            UI.error(err.message || 'No se pudo cambiar el estado');
        } finally {
            el.disabled = false;
        }
    }

    async function forceAvailable(tableId) {
        const table = tables.find(t => t.id === tableId);
        if (!table || table.status_id === 1) return; 

        let rotationsNeeded = 0;
        if (table.status_id === 2) rotationsNeeded = 2;
        if (table.status_id === 3) rotationsNeeded = 1;

        for (let i = 0; i < rotationsNeeded; i++) {
            const res = await TableApi.rotateStatus(tableId);
            table.status_id = res.data.status_id; 
        }
    }

    /* =========================================================
       15. Modal Editar — Abrir / Cerrar
       ========================================================= */
    function openEditModal() {
        if (!restaurant) return;

        nameIn.value    = restaurant.name || '';
        addressIn.value = restaurant.address || '';
        phoneIn.value   = restaurant.phone || '';
        descIn.value    = restaurant.description || '';

        // Precargar pestaña Agregar (Arranca en 1 mesa o 0 si está lleno)
        const remaining = MAX_TABLES - tables.length;
        addChairsCount.value = tables[0]?.chairs || 4;
        addTablesCount.value = remaining > 0 ? 1 : 0;
        updateAddHint();

        // Precargar pestaña Eliminar (Arranca en 1 mesa)
        removeTablesCount.value = 1;
        updateRemoveInfo();
        updateRemoveHint();

        activateTab('info');
        formError.hidden = true;

        // Deshabilitar botones de agregar si ya está lleno
        const isFull = remaining <= 0;
        addTablesMinus.disabled = isFull;
        addTablesPlus.disabled = isFull;
        addTablesCount.disabled = isFull;

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

    /* =========================================================
       16. Pestañas del Modal
       ========================================================= */
    function activateTab(name) {
        activeTab = name;
        tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === name));
        tabPanels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === name));

        const titles = {
            info:   'Editar restaurante',
            add:    'Agregar mesas',
            remove: 'Eliminar mesas'
        };
        editModalTitle.textContent = titles[name] || 'Editar';

        formError.hidden = true;
    }

    tabs.forEach(t => {
        t.addEventListener('click', () => activateTab(t.dataset.tab));
    });

    /* =========================================================
       17. Numberboxes — Agregar Mesas
       ========================================================= */
    function clampChairs(n) {
        n = parseInt(n, 10);
        if (isNaN(n)) n = 4;
        return Math.min(MAX_CHAIRS, Math.max(MIN_CHAIRS, n));
    }

    function clampAddTables(n) {
        n = parseInt(n, 10);
        if (isNaN(n)) n = 1;
        
        const remaining = MAX_TABLES - tables.length;
        if (remaining <= 0) return 0;

        return Math.min(remaining, Math.max(1, n));
    }

    function updateAddHint() {
        const remaining = MAX_TABLES - tables.length;
        const chairs = clampChairs(addChairsCount.value);
        const count  = clampAddTables(addTablesCount.value);

        if (remaining <= 0) {
            addHint.innerHTML = `<span style="color: #dc2626; font-weight: 600;">Límite alcanzado: ya tenés ${MAX_TABLES} mesas.</span>`;
            return;
        }

        if (parseInt(addTablesCount.value, 10) > remaining) {
            addHint.innerHTML = `Solo podés agregar <strong>${remaining}</strong> ${remaining === 1 ? 'mesa' : 'mesas'} más para llegar al límite de ${MAX_TABLES}.`;
        } else {
            addHint.innerHTML = `Se agregará${count > 1 ? 'n' : ''} <strong>${count}</strong> ${count === 1 ? 'mesa' : 'mesas'} con <strong>${chairs}</strong> ${chairs === 1 ? 'silla' : 'sillas'} cada una.`;
        }
    }

    // EVENTOS AGREGAR (Recuperados)
    addChairsMinus.addEventListener('click', () => {
        addChairsCount.value = clampChairs(addChairsCount.value) - 1;
        updateAddHint();
    });
    addChairsPlus.addEventListener('click', () => {
        addChairsCount.value = clampChairs(addChairsCount.value) + 1;
        updateAddHint();
    });
    addChairsCount.addEventListener('input', () => {
        addChairsCount.value = clampChairs(addChairsCount.value);
        updateAddHint();
    });

    addTablesMinus.addEventListener('click', () => {
        addTablesCount.value = clampAddTables(addTablesCount.value) - 1;
        updateAddHint();
    });
    addTablesPlus.addEventListener('click', () => {
        addTablesCount.value = clampAddTables(addTablesCount.value) + 1;
        updateAddHint();
    });
    addTablesCount.addEventListener('input', () => {
        addTablesCount.value = clampAddTables(addTablesCount.value);
        updateAddHint();
    });

    /* =========================================================
       18. Numberboxes — Eliminar Mesas
       ========================================================= */
    function clampRemoveTables(n) {
        n = parseInt(n, 10);
        if (isNaN(n)) n = 1;
        return Math.min(tables.length, Math.max(1, n)); 
    }

    function updateRemoveInfo() {
        const total = tables.length;
        removeInfo.innerHTML = `Actualmente tenés <strong>${total}</strong> ${total === 1 ? 'mesa' : 'mesas'}.`;
    }

    function updateRemoveHint() {
        const n = clampRemoveTables(removeTablesCount.value);
        removeHint.innerHTML = `Se eliminará${n > 1 ? 'n' : ''} <strong>${n}</strong> ${n === 1 ? 'mesa' : 'mesas'}.`;
    }

    removeTablesMinus.addEventListener('click', () => {
        removeTablesCount.value = clampRemoveTables(removeTablesCount.value) - 1;
        updateRemoveHint();
    });
    removeTablesPlus.addEventListener('click', () => {
        removeTablesCount.value = clampRemoveTables(removeTablesCount.value) + 1;
        updateRemoveHint();
    });
    removeTablesCount.addEventListener('input', () => {
        removeTablesCount.value = clampRemoveTables(removeTablesCount.value);
        updateRemoveHint();
    });

    /* =========================================================
       19. Guardar (según pestaña activa)
       ========================================================= */
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        formError.hidden = true;

        if (activeTab === 'info') {
            await saveInfo();
        } else if (activeTab === 'add') {
            await addTables();
        } else if (activeTab === 'remove') {
            await removeTables();
        }
    });

    async function saveInfo() {
        const name        = nameIn.value.trim();
        const address     = addressIn.value.trim();
        const phone       = phoneIn.value.trim();
        const description = descIn.value.trim();

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

        editSave.disabled = true;
        editSave.textContent = 'Guardando...';

        try {
            await RestaurantApi.update(restaurant.id, {
                name,
                address,
                phone: phone || null,
                description: description || null,
                is_open: restaurant.is_open ?? true
            });

            UI.success('Cambios guardados.');
            closeEditModal();
            await load();

        } catch (err) {
            formError.textContent = err.message || 'Error al guardar.';
            formError.hidden = false;
        } finally {
            editSave.disabled = false;
            editSave.textContent = 'Guardar';
        }
    }

    async function addTables() {
        const remaining = MAX_TABLES - tables.length;
        
        if (remaining <= 0) {
            formError.textContent = `No podés agregar más mesas. Ya alcanzaste el límite de ${MAX_TABLES}.`;
            formError.hidden = false;
            return;
        }

        const count  = clampAddTables(addTablesCount.value);
        const chairs = clampChairs(addChairsCount.value);

        if (count <= 0) {
            formError.textContent = 'Tenés que agregar al menos 1 mesa.';
            formError.hidden = false;
            return;
        }

        editSave.disabled = true;
        editSave.textContent = 'Agregando...';

        try {
            const startNumber = tables.length;

            for (let i = 0; i < count; i++) {
                const nextNumber = startNumber + i + 1;
                await RestaurantApi.createTable(restaurant.id, {
                    table_number: nextNumber,
                    details:     `Mesa ${nextNumber}`,
                    chairs:      chairs,
                    status_id:   1
                });
            }

            UI.success(`Se agregaron ${count} ${count === 1 ? 'mesa' : 'mesas'}.`);
            closeEditModal();
            await load();

        } catch (err) {
            formError.textContent = err.message || 'Error al agregar mesas.';
            formError.hidden = false;
        } finally {
            editSave.disabled = false;
            editSave.textContent = 'Guardar';
        }
    }

    async function removeTables() {
        const count = clampRemoveTables(removeTablesCount.value);

        if (count <= 0) {
            formError.textContent = 'Elegí al menos 1 mesa para eliminar.';
            formError.hidden = false;
            return;
        }

        const toDelete = tables.slice(tables.length - count);
        const busy = toDelete.filter(t => t.status_id !== 1);

        if (busy.length > 0) {
            const nums = busy.map(t => `Mesa ${t.table_number}`).join(', ');
            showBlocked(`No se puede eliminar porque ${nums} no está${busy.length > 1 ? 'n' : ''} disponible${busy.length > 1 ? 's' : ''}.`);
            return;
        }

        const ok = await askConfirm(
            'Confirmar eliminación',
            `Vas a eliminar ${count} ${count === 1 ? 'mesa' : 'mesas'} (las de mayor número). ¿Confirmar?`
        );
        if (!ok) return;

        editSave.disabled = true;
        editSave.textContent = 'Eliminando...';

        try {
            for (const t of toDelete) {
                await TableApi.delete(t.id);
            }

            UI.success(`Se eliminaron ${count} ${count === 1 ? 'mesa' : 'mesas'}.`);
            closeEditModal();
            await load();

        } catch (err) {
            formError.textContent = err.message || 'Error al eliminar mesas.';
            formError.hidden = false;
        } finally {
            editSave.disabled = false;
            editSave.textContent = 'Guardar';
        }
    }

    /* =========================================================
       20. Crear Restaurante
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

            if (tables.length === 0) {
                setTimeout(() => {
                    openEditModal();
                    activateTab('add');
                }, 400);
            }

        } catch (err) {
            modalError.textContent = err.message || 'Error al crear.';
            modalError.hidden = false;
        } finally {
            submitCreate.disabled = false;
            submitCreate.textContent = 'Crear restaurante';
        }
    });

    /* =========================================================
       21. Modales de Confirmación
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
       22. Init
       ========================================================= */
    load();
})();