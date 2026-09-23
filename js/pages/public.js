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

    /* ---------------------------------------------------------
       Embeds personalizados por restaurante.
       Si un restaurante no está acá, se genera automáticamente
       usando su dirección + ", Crespo, Entre Ríos, Argentina".
       --------------------------------------------------------- */
    const RESTAURANT_MAPS = {
        1: { // Darcy Resto
            embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4275.12590393613!2d-60.30417862599889!3d-32.029261125179566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b4235f38bf165d%3A0x7c27b02d8ffadf76!2sDarcy%20Resto!5e1!3m2!1ses-419!2sar!4v1790182368116!5m2!1ses-419!2sar'
        },
        2: { // Punto y Coma
            embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d384.2646340251881!2d-60.30463374571947!3d-32.02682653284185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b4258e161316ab%3A0x245cfabdb7431177!2sPunto%20y%20Coma!5e1!3m2!1ses-419!2sar!4v1790182280572!5m2!1ses-419!2sar'
        },
        3: { // Der Fritz
            embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d663.2518857936408!2d-60.30743127871736!3d-32.029577099596615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b424a104b69e83%3A0xc41b7fa877c28b18!2sDer%20Fritz%20Restaurante!5e1!3m2!1ses-419!2sar!4v1790182304109!5m2!1ses-419!2sar'
        },
        6: { // Ándale
            embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d663.2397179372005!2d-60.309880215015646!3d-32.031257296070166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b424a22407a597%3A0xbdafc99f7b1961bb!2s%C3%81ndale%20Bar%20%26%20Comida%20Mexicana!5e1!3m2!1ses-419!2sar!4v1790182346970!5m2!1ses-419!2sar'
        }
    };

    /* Genera el embed/link automático para un restaurante */
    function autoMap(address) {
        const query = encodeURIComponent((address || '') + ', Crespo, Entre Ríos, Argentina');
        return {
            embed: `https://maps.google.com/maps?q=${query}&z=16&output=embed`,
            link:  `https://www.google.com/maps/search/?api=1&query=${query}`
        };
    }

    function show(el) {
        [loading, errorBox, emptyBox, grid, toolbar, statsSection]
            .forEach(e => e.hidden = true);
        el.hidden = false;
    }

    function buildCard(r, index) {
        const available = r.available_tables;
        const total     = r.total_tables;
        const pct       = total > 0 ? (available / total) * 100 : 0;

        const delay = Math.min(index * 40, 400);

        // Mapa: custom si existe, si no automático
        const custom = RESTAURANT_MAPS[r.id];
        const fallback = autoMap(r.address);
        const embed = custom?.embed || fallback.embed;
        const link  = custom?.link  || fallback.link;

        return `
            <article class="card restaurant-card" data-id="${r.id}"
                     style="animation-delay: ${delay}ms">
                <div class="restaurant-card__header">
                    <h3 class="restaurant-card__name">${UI.escape(r.name)}</h3>
                </div>

                <ul class="restaurant-card__meta">
                    <li>📍 <span>${UI.escape(r.address)}</span></li>
                    ${r.phone ? `<li>📞 <span>${UI.escape(r.phone)}</span></li>` : ''}
                </ul>

                ${r.description
                    ? `<p class="restaurant-card__description">"${UI.escape(r.description)}"</p>`
                    : ''}

                <a href="${link}"
                   target="_blank"
                   rel="noopener"
                   class="restaurant-card__map"
                   title="Abrir ubicación en Google Maps">
                    <iframe
                        src="${embed}"
                        width="100%"
                        height="140"
                        style="border:0; pointer-events:none; display:block;"
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                        title="Ubicación de ${UI.escape(r.name)}">
                    </iframe>
                </a>

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