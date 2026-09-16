/* =========================================================
   Página pública de restaurantes
   ========================================================= */
(function () {
    const grid          = document.getElementById('restaurants-grid');
    const loading       = document.getElementById('loading');
    const errorBox      = document.getElementById('error-box');
    const errorMsg      = document.getElementById('error-message');
    const emptyBox      = document.getElementById('empty-box');
    const emptyMsg      = document.getElementById('empty-message');
    const toolbar       = document.getElementById('toolbar');
    const statsSection  = document.getElementById('stats-section');
    const searchInput   = document.getElementById('search-input');
    const sortSelect    = document.getElementById('sort-select');

    const statRestaurants = document.getElementById('stat-restaurants');
    const statAvailable   = document.getElementById('stat-available');
    const statBest        = document.getElementById('stat-best');

    let allRestaurants = [];

    function show(el) {
        [loading, errorBox, emptyBox, grid, toolbar, statsSection]
            .forEach(e => e.hidden = true);
        el.hidden = false;
    }

    function badgeFor(r) {
        if (!r.is_open) return { cls: 'badge-muted',   text: 'Cerrado' };

        const a = r.available_tables;
        if (a === 0)  return { cls: 'badge-danger',  text: 'Sin disponibilidad' };
        if (a <= 2)   return { cls: 'badge-warning', text: 'Disponibilidad limitada' };
        if (a <= 5)   return { cls: 'badge-info',    text: 'Buena disponibilidad' };
        return          { cls: 'badge-success', text: 'Excelente disponibilidad' };
    }

    function buildCard(r, index) {
        const available = r.available_tables;
        const total     = r.total_tables;
        const pct       = total > 0 ? (available / total) * 100 : 0;
        const badge     = badgeFor(r);

        // Animación escalonada (cada tarjeta aparece un poquito después)
        const delay = Math.min(index * 40, 400);

        return `
            <article class="card restaurant-card" data-id="${r.id}"
                     style="animation-delay: ${delay}ms">
                <div class="restaurant-card__header">
                    <h3 class="restaurant-card__name">${UI.escape(r.name)}</h3>
                    <span class="badge ${badge.cls}">${badge.text}</span>
                </div>

                <ul class="restaurant-card__meta">
                    <li>📍 <span>${UI.escape(r.address)}</span></li>
                    ${r.phone ? `<li>📞 <span>${UI.escape(r.phone)}</span></li>` : ''}
                </ul>

                ${r.description
                    ? `<p class="restaurant-card__description">"${UI.escape(r.description)}"</p>`
                    : ''}

                <div class="restaurant-card__availability">
                    <div class="availability-number">
                        <strong>${available}</strong>
                        <span>de ${total} mesas disponibles</span>
                    </div>
                    <div class="availability-bar">
                        <div class="availability-bar__fill"
                             style="width: ${pct.toFixed(1)}%"></div>
                    </div>
                </div>
            </article>
        `;
    }

    function renderStats(list) {
        if (list.length === 0) return;

        const totalAvailable = list.reduce((s, r) => s + r.available_tables, 0);
        const best = list.reduce(
            (acc, r) => (r.available_tables > acc.available_tables ? r : acc),
            list[0]
        );

        statRestaurants.textContent = list.length;
        statAvailable.textContent   = totalAvailable;
        statBest.textContent        = best.available_tables > 0 ? best.name : '—';
    }

    function applyFilters() {
        const query = searchInput.value.trim().toLowerCase();
        const sort  = sortSelect.value;

        let list = allRestaurants.filter(r => {
            if (!query) return true;
            const haystack = [r.name, r.address, r.description || '']
                .join(' ').toLowerCase();
            return haystack.includes(query);
        });

        if (sort === 'availability') {
            list.sort((a, b) => b.available_tables - a.available_tables
                             || a.name.localeCompare(b.name));
        } else if (sort === 'name') {
            list.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === 'total') {
            list.sort((a, b) => b.total_tables - a.total_tables
                             || a.name.localeCompare(b.name));
        }

        if (list.length === 0) {
            emptyMsg.textContent = query
                ? `No se encontraron resultados para "${query}".`
                : 'No hay restaurantes registrados todavía.';
            grid.hidden = true;
            emptyBox.hidden = false;
        } else {
            grid.innerHTML = list.map((r, i) => buildCard(r, i)).join('');
            grid.hidden = false;
            emptyBox.hidden = true;
        }
    }

    async function load() {
        show(loading);
        try {
            const response = await PublicApi.listRestaurants();
            const list = response.data || [];
            allRestaurants = list;

            if (list.length === 0) {
                emptyMsg.textContent = 'No hay restaurantes registrados todavía.';
                show(emptyBox);
                return;
            }

            renderStats(list);
            statsSection.hidden = false;
            toolbar.hidden = false;
            applyFilters();
            show(grid);

        } catch (err) {
            errorMsg.textContent = err.message || 'Error al cargar los restaurantes.';
            show(errorBox);
        }
    }

    searchInput.addEventListener('input', applyFilters);
    sortSelect.addEventListener('change', applyFilters);

    load();
})();