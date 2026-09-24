// ==========================================
// MESSAPI - VISTA PÚBLICA
// ==========================================

const API_URL =
    "http://localhost/PROGRAMACION-4-BACKEND-PABLO/messapi/api/public/restaurants";


// ==========================================
// ELEMENTOS
// ==========================================

const listaRestaurantes =
    document.getElementById("restaurantes");

const mensaje =
    document.getElementById("mensaje");

const buscador =
    document.getElementById("buscador");

const cantidadResultados =
    document.getElementById("cantidad-resultados");


// ==========================================
// DATOS
// ==========================================

let restaurantes = [];


// ==========================================
// NORMALIZAR TEXTO
// ==========================================

function normalizarTexto(texto) {

    return String(texto || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}


// ==========================================
// VERIFICAR RESTAURANTE ABIERTO
// ==========================================

function estaAbierto(restaurante) {

    return (
        restaurante.is_open === true ||
        restaurante.is_open === 1 ||
        restaurante.is_open === "1"
    );
}


// ==========================================
// VERIFICAR MESA LIBRE
// ==========================================

function estaLibre(mesa) {

    if (!mesa.status) {
        return false;
    }

    const estado =
        String(mesa.status)
            .toLowerCase()
            .trim();

    return (
        estado === "disponible" ||
        estado === "available" ||
        estado === "libre"
    );
}


// ==========================================
// OBTENER MESAS
// ==========================================

function obtenerMesas(restaurante) {

    return Array.isArray(restaurante.tables)
        ? restaurante.tables
        : [];
}


// ==========================================
// CALCULAR ESTADO DE CAPACIDAD
// ==========================================

function calcularCapacidad(restaurante) {

    const mesas =
        obtenerMesas(restaurante);

    const totalMesas =
        mesas.length;

    const mesasLibres =
        mesas.filter(estaLibre).length;


    // SIN MESAS CARGADAS

    if (totalMesas === 0) {

        return {
            estado: "lleno",
            texto: "Lleno",
            clase: "restaurante-lleno"
        };
    }


    // SIN MESAS DISPONIBLES

    if (mesasLibres === 0) {

        return {
            estado: "lleno",
            texto: "Lleno",
            clase: "restaurante-lleno"
        };
    }


    // PORCENTAJE DE MESAS DISPONIBLES

    const porcentajeLibre =
        (mesasLibres / totalMesas) * 100;


    // MÁS DEL 30% LIBRE

    if (porcentajeLibre > 30) {

        return {
            estado: "capacidad",
            texto: "Con capacidad",
            clase: "restaurante-con-capacidad"
        };
    }


    // ENTRE 1% Y 30%

    return {
        estado: "poca",
        texto: "Casi sin capacidad",
        clase: "restaurante-poca-capacidad"
    };
}


// ==========================================
// CREAR URL DE GOOGLE MAPS
// ==========================================

function crearUrlMaps(restaurante) {

    const direccion =
        restaurante.address || "";

    const ciudad =
        restaurante.city || "";

    const ubicacion =
        [direccion, ciudad]
            .filter(Boolean)
            .join(", ");

    if (!ubicacion) {
        return "";
    }

    return (
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(ubicacion)
    );
}


// ==========================================
// CREAR ENLACE DE TELÉFONO
// ==========================================

function crearUrlTelefono(telefono) {

    if (!telefono) {
        return "";
    }

    const telefonoLimpio =
        String(telefono)
            .replace(/[^\d+]/g, "");

    return `tel:${telefonoLimpio}`;
}


// ==========================================
// CARGAR RESTAURANTES
// ==========================================

async function cargarRestaurantes() {

    try {

        mensaje.innerHTML =
            "<p>Cargando restaurantes...</p>";

        const respuesta =
            await fetch(API_URL);

        if (!respuesta.ok) {

            throw new Error(
                "No se pudo obtener la información."
            );
        }

        const resultado =
            await respuesta.json();

        restaurantes =
            resultado.data || resultado;

        if (!Array.isArray(restaurantes)) {
            restaurantes = [];
        }

        mensaje.innerHTML = "";

        mostrarRestaurantes();

    } catch (error) {

        console.error(error);

        mensaje.innerHTML = `
            <p>
                No pudimos cargar los restaurantes.
            </p>
        `;
    }
}


// ==========================================
// MOSTRAR RESTAURANTES
// ==========================================

function mostrarRestaurantes() {

    const textoBusqueda =
        normalizarTexto(
            buscador.value
        );


    const restaurantesFiltrados =
        restaurantes.filter(restaurante => {

            const nombre =
                normalizarTexto(
                    restaurante.name
                );


            // FILTRAR POR NOMBRE

            if (!nombre.includes(textoBusqueda)) {
                return false;
            }


            // SOLO MOSTRAR RESTAURANTES ABIERTOS

            if (!estaAbierto(restaurante)) {
                return false;
            }


            // IMPORTANTE:
            // AHORA MOSTRAMOS TAMBIÉN LOS LLENOS

            return true;
        });


    listaRestaurantes.innerHTML = "";


    // ======================================
    // CANTIDAD DE RESULTADOS
    // ======================================

    if (restaurantesFiltrados.length === 1) {

        cantidadResultados.textContent =
            "1 restaurante abierto";

    } else {

        cantidadResultados.textContent =
            `${restaurantesFiltrados.length} restaurantes abiertos`;
    }


    // ======================================
    // SIN RESULTADOS
    // ======================================

    if (restaurantesFiltrados.length === 0) {

        cantidadResultados.textContent = "";

        listaRestaurantes.innerHTML = `

            <div class="publico-sin-resultados">

                <strong>
                    No encontramos restaurantes
                </strong>

                <p>
                    Probá buscando otro nombre.
                </p>

            </div>
        `;

        return;
    }


    // ======================================
    // CREAR TARJETAS
    // ======================================

    restaurantesFiltrados.forEach(
        restaurante => {

            crearTarjetaRestaurante(
                restaurante
            );
        }
    );
}


// ==========================================
// CREAR TARJETA DEL RESTAURANTE
// ==========================================

function crearTarjetaRestaurante(restaurante) {

    const tarjeta =
        document.createElement("article");


    // CALCULAR CAPACIDAD

    const capacidad =
        calcularCapacidad(restaurante);


    // CLASES DE LA TARJETA

    tarjeta.classList.add(
        "publico-restaurante",
        capacidad.clase
    );


    // DATOS DEL RESTAURANTE

    const nombre =
        restaurante.name ||
        "Restaurante";

    const direccion =
        restaurante.address ||
        "Dirección no informada";

    const telefono =
        restaurante.phone || "";

    const mapsUrl =
        crearUrlMaps(restaurante);

    const telefonoUrl =
        crearUrlTelefono(telefono);


    // ======================================
    // HTML DE LA TARJETA
    // ======================================

    tarjeta.innerHTML = `

        <div class="publico-restaurante-info">

            <h3>
                ${nombre}
            </h3>


            <p class="publico-direccion">

                <span class="publico-icono">
                    📍
                </span>

                ${direccion}

            </p>


            ${telefono
            ? `
                        <p class="publico-telefono">

                            <span class="publico-icono">
                                ☎
                            </span>

                            <a href="${telefonoUrl}">
                                ${telefono}
                            </a>

                        </p>
                    `
            : `
                        <p class="publico-telefono publico-dato-no-disponible">

                            <span class="publico-icono">
                                ☎
                            </span>

                            Teléfono no informado

                        </p>
                    `
        }


            ${mapsUrl
            ? `
                        <a
                            href="${mapsUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="publico-como-llegar"
                        >
                            <span>
                                📍
                            </span>

                            Cómo llegar
                        </a>
                    `
            : ""
        }

        </div>


        <div class="publico-capacidad publico-capacidad-${capacidad.estado}">

            <span class="publico-punto-estado">
            </span>

            <div>

                <small>
                    Estado actual
                </small>

                <strong>
                    ${capacidad.texto}
                </strong>

            </div>

        </div>
    `;


    listaRestaurantes.appendChild(
        tarjeta
    );
}


// ==========================================
// BUSCADOR
// ==========================================

buscador.addEventListener(
    "input",
    mostrarRestaurantes
);


// ==========================================
// INICIAR
// ==========================================

cargarRestaurantes();