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
    const searchInput   = document.getElementById('search-input');
    const sortSelect    = document.getElementById('sort-select');

    const categorySelect = document.getElementById('category-select');
    const onlyOpenBtn    = document.getElementById('only-open-btn');
    const pills          = document.querySelectorAll('.pill');

    let allRestaurants = [];

    /* ---------------------------------------------------------
       Embeds y Links personalizados por restaurante.
       Si un restaurante no está acá, se genera automáticamente.
       --------------------------------------------------------- */
    const RESTAURANT_MAPS = {
        1: { // Darcy Resto
            embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4275.12590393613!2d-60.30417862599889!3d-32.029261125179566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b4235f38bf165d%3A0x7c27b02d8ffadf76!2sDarcy%20Resto!5e1!3m2!1ses-419!2sar!4v1790182368116!5m2!1ses-419!2sar',
            link: 'https://maps.app.goo.gl/Y7tSZpM9cnMhHTXT8' 
        },
        2: { // Punto y Coma
            embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d384.2646340251881!2d-60.30463374571947!3d-32.02682653284185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b4258e161316ab%3A0x245cfabdb7431177!2sPunto%20y%20Coma!5e1!3m2!1ses-419!2sar!4v1790182280572!5m2!1ses-419!2sar',
            link: 'https://maps.app.goo.gl/wfLoFWww97er8T9Y9'
        },
        3: { // Der Fritz
            embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d663.2518857936408!2d-60.30743127871736!3d-32.029577099596615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b424a104b69e83%3A0xc41b7fa877c28b18!2sDer%20Fritz%20Restaurante!5e1!3m2!1ses-419!2sar!4v1790182304109!5m2!1ses-419!2sar',
            link: 'https://maps.app.goo.gl/dBb68pNRL5zVunf88'
        },
        6: { // Ándale
            embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3074.113761600445!2d-60.31210442476286!3d-32.03120107398426!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b424a22407a597%3A0xbdafc99f7b1961bb!2s%C3%81ndale%20Bar%20%26%20Comida%20Mexicana!5e1!3m2!1ses-419!2sar!4v1793118703633!5m2!1ses-419!2sar',
            // 👇 Acá va el link oficial de Ándale que te lleva a la ficha con las 4.4 estrellas
            link: 'https://maps.app.goo.gl/gQzfMF9Q8eXb6oWo6' 
        }
    };

    /* Genera el embed/link automático para un restaurante */
    function autoMap(address) {
        let fullAddress = address || '';
        if (!fullAddress.toLowerCase().includes('crespo')) {
            fullAddress += ', Crespo, Entre Ríos, Argentina';
        }
        
        const query = encodeURIComponent(fullAddress);
        return {
            embed: `https://maps.google.com/maps?q=${query}&t=&z=17&ie=UTF8&iwloc=&output=embed`,
            link:  `https://www.google.com/maps/search/?api=1&query=${query}`
        };
    }

    function show(el) {
        [loading, errorBox, emptyBox, grid].forEach(e => e.hidden = true);
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
        
        // Embed: el personalizado (que muestra el pin exacto) o el automático
        const embed = custom?.embed || fallback.embed;
        
        // Link: SI EXISTE en RESTAURANT_MAPS usa ese (ficha del lugar). Si no, busca la dirección.
        const link = custom?.link || fallback.link;

        // Badge de estado según disponibilidad
        let badgeCls = 'status-badge--success';
        let badgeTxt = 'Disponible';
        if (!r.is_open) {
            badgeCls = 'status-badge--muted';
            badgeTxt = 'Cerrado';
        } else if (available === 0) {
            badgeCls = 'status-badge--danger';
            badgeTxt = 'Sin mesas';
        } else if (pct <= 30) {
            badgeCls = 'status-badge--danger';
            badgeTxt = 'Casi lleno';
        } else if (pct <= 60) {
            badgeCls = 'status-badge--warning';
            badgeTxt = 'Medio';
        }

        // Color de la barra
        let barCls = '';
        if (pct <= 30) barCls = 'availability-bar__fill--low';
        else if (pct <= 60) barCls = 'availability-bar__fill--medium';

        // Categoría (chip corto)
        const category = r.description ? r.description.split(' ')[0] : 'Restaurante';

        return `
            <article class="card restaurant-card" data-id="${r.id}"
                     style="animation-delay: ${delay}ms">
                <div class="restaurant-card__header">
                    <div class="restaurant-card__title-block">
                        <h3 class="restaurant-card__name">${UI.escape(r.name)}</h3>
                        <span class="restaurant-card__category">${UI.escape(category)}</span>
                    </div>
                    <span class="status-badge ${badgeCls}">
                        <span class="status-badge__dot"></span>
                        ${badgeTxt}
                    </span>
                </div>

                <ul class="restaurant-card__meta">
                    <li>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>${UI.escape(r.address)}</span>
                    </li>
                    ${r.phone ? `
                        <li>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <a href="tel:${UI.escape(r.phone)}">${UI.escape(r.phone)}</a>
                        </li>
                    ` : ''}
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
                        height="130"
                        style="border:0; pointer-events:none; display:block;"
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                        title="Ubicación de ${UI.escape(r.name)}">
                    </iframe>
                </a>

                <div class="restaurant-card__availability">
                    <div class="availability-number">
                        <div class="availability-number__count">
                            <strong>${available}</strong>
                            <span>de ${total} mesas libres</span>
                        </div>
                    </div>
                    <div class="availability-bar">
                        <div class="availability-bar__fill ${barCls}"
                             style="width: ${pct.toFixed(1)}%"></div>
                    </div>
                </div>
            </article>
        `;
    }

    const CATEGORY_KEYWORDS = {
        mexicana: ['mexican', 'taco', 'ándale', 'andale', 'burrito', 'guacamole'],
        italiano: ['italian', 'pasta', 'pizza', 'punto', 'coma', 'napoli'],
        parrilla: ['parrilla', 'variado', 'carne', 'asado', 'grill', 'fritz', 'darcy'],
        bar:      ['bar', 'cerveza', 'cervecería', 'birra', 'pub', 'ándale']
    };

    function applyFilters() {
        const query    = searchInput.value.trim().toLowerCase();
        const sort     = sortSelect.value;
        const category = categorySelect ? categorySelect.value.toLowerCase() : '';
        const onlyOpen = onlyOpenBtn ? onlyOpenBtn.classList.contains('is-active') : false;

        let list = allRestaurants.filter(r => {
            if (onlyOpen && !r.is_open) return false;

            if (category) {
                const keywords = CATEGORY_KEYWORDS[category] || [category];
                const haystack = [r.name, r.description || ''].join(' ').toLowerCase();
                const matches = keywords.some(k => haystack.includes(k));
                if (!matches) return false;
            }

            if (!query) return true;
            const haystack = [r.name, r.address, r.description || ''].join(' ').toLowerCase();
            return haystack.includes(query);
        });

        if (sort === 'availability') {
            list.sort((a, b) => b.available_tables - a.available_tables || a.name.localeCompare(b.name));
        } else if (sort === 'name') {
            list.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === 'total') {
            list.sort((a, b) => b.total_tables - a.total_tables || a.name.localeCompare(b.name));
        }

        if (list.length === 0) {
            emptyMsg.textContent = query
                ? `No se encontraron resultados para "${query}".`
                : 'No hay restaurantes que coincidan con los filtros.';
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

    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            pills.forEach(p => {
                p.classList.toggle('is-active', p.dataset.category === categorySelect.value);
            });
            applyFilters();
        });
    }

    if (onlyOpenBtn) {
        onlyOpenBtn.addEventListener('click', () => {
            onlyOpenBtn.classList.toggle('is-active');
            applyFilters();
        });
    }

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('is-active'));
            pill.classList.add('is-active');

            if (categorySelect) {
                categorySelect.value = pill.dataset.category || '';
            }
            applyFilters();
        });
    });

    load();
})();