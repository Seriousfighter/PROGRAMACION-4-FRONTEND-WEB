const API_URL =
    "../messapi/api/public/restaurants";

const listaRestaurantes =
    document.getElementById("restaurantes");

const mensaje =
    document.getElementById("mensaje");

const buscador =
    document.getElementById("buscador");

const filtroPersonas =
    document.getElementById("personas");

let restaurantes = [];


// ==============================
// CARGAR RESTAURANTES
// ==============================

async function cargarRestaurantes() {

    try {

        mensaje.innerHTML =
            "<p>Cargando restaurantes...</p>";

        const respuesta =
            await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo obtener la información"
            );
        }

        restaurantes =
            await respuesta.json();

        mensaje.innerHTML = "";

        mostrarRestaurantes();

    } catch (error) {

        console.error(error);

        mensaje.innerHTML =
            "<p>Error al conectar con la API.</p>";
    }
}


// ==============================
// MOSTRAR RESTAURANTES
// ==============================

function mostrarRestaurantes() {

    const textoBusqueda =
        buscador.value
            .toLowerCase()
            .trim();

    const cantidadPersonas =
        parseInt(filtroPersonas.value) || 0;


    const restaurantesFiltrados =
        restaurantes.filter(restaurante => {

            // Filtro por nombre
            const coincideNombre =
                restaurante.name
                    .toLowerCase()
                    .includes(textoBusqueda);

            if (!coincideNombre) {
                return false;
            }


            // Si no eligió cantidad de personas
            if (cantidadPersonas === 0) {
                return true;
            }


            // Si está cerrado, no sirve
            if (!restaurante.is_open) {
                return false;
            }


            // Buscar una mesa disponible
            // que tenga suficientes sillas
            const tieneMesaDisponible =
                restaurante.tables.some(mesa => {

                    const estado =
                        mesa.status
                            .toLowerCase();

                    const disponible =
                        estado === "disponible"
                        ||
                        estado === "available";

                    return (
                        disponible
                        &&
                        mesa.chairs >= cantidadPersonas
                    );
                });


            return tieneMesaDisponible;
        });


    listaRestaurantes.innerHTML = "";


    // ==============================
    // SIN RESULTADOS
    // ==============================

    if (restaurantesFiltrados.length === 0) {

        listaRestaurantes.innerHTML = `
            <p class="sin-resultados">
                ${cantidadPersonas > 0
                ? `No se encontraron restaurantes con mesas disponibles para ${cantidadPersonas} personas.`
                : "No se encontraron restaurantes."
            }
            </p>
        `;

        return;
    }


    // ==============================
    // CREAR TARJETAS
    // ==============================

    restaurantesFiltrados.forEach(
        restaurante => {

            const tarjeta =
                document.createElement("article");

            tarjeta.classList.add(
                "restaurante"
            );


            // Mesas disponibles reales
            let mesasDisponibles = [];

            if (restaurante.is_open) {

                mesasDisponibles =
                    restaurante.tables.filter(
                        mesa => {

                            const estado =
                                mesa.status
                                    .toLowerCase();

                            return (
                                estado === "disponible"
                                ||
                                estado === "available"
                            );
                        }
                    );
            }


            // Cantidad total de lugares disponibles
            const lugaresDisponibles =
                mesasDisponibles.reduce(
                    (total, mesa) =>
                        total + mesa.chairs,
                    0
                );


            // ==============================
            // MESAS QUE SE VAN A MOSTRAR
            // ==============================

            const mesasParaMostrar =
                restaurante.tables.filter(
                    mesa => {

                        // Sin filtro mostramos todas
                        if (cantidadPersonas === 0) {
                            return true;
                        }

                        const estado =
                            mesa.status
                                .toLowerCase();

                        const disponible =
                            estado === "disponible"
                            ||
                            estado === "available";

                        // Con filtro:
                        // solo disponibles y con suficientes sillas
                        return (
                            disponible
                            &&
                            mesa.chairs >= cantidadPersonas
                        );
                    }
                );


            // ==============================
            // TARJETA
            // ==============================

            tarjeta.innerHTML = `

                <h2>
                    ${restaurante.name}
                </h2>

                <p class="direccion">
                    📍 ${restaurante.address}
                </p>

                <p class="descripcion">
                    ${restaurante.description ?? ""}
                </p>

                <p class="estado-restaurante">
                    ${restaurante.is_open
                    ? "🟢 Abierto"
                    : "🔴 Cerrado"
                }
                </p>


                <div class="resumen">

                    ${restaurante.is_open

                    ? `
                            <p>
                                Mesas disponibles:
                                <strong>
                                    ${mesasDisponibles.length}
                                </strong>
                            </p>

                            <p>
                                Lugares disponibles:
                                <strong>
                                    ${lugaresDisponibles}
                                </strong>
                            </p>
                        `

                    : `
                            <p>
                                <strong>
                                    Restaurante cerrado
                                </strong>
                            </p>

                            <p>
                                Mesas disponibles:
                                <strong>0</strong>
                            </p>

                            <p>
                                Lugares disponibles:
                                <strong>0</strong>
                            </p>
                        `
                }

                    <p>
                        Mesas totales:
                        <strong>
                            ${restaurante.total_tables}
                        </strong>
                    </p>

                </div>


                <div class="mesas">

                    ${mesasParaMostrar.length > 0

                    ? mesasParaMostrar
                        .map(
                            mesa =>
                                crearMesa(
                                    mesa,
                                    cantidadPersonas
                                )
                        )
                        .join("")

                    : `
                            <p class="sin-mesas">
                                No hay mesas disponibles
                                para esta cantidad
                                de personas.
                            </p>
                        `
                }

                </div>
            `;


            listaRestaurantes.appendChild(
                tarjeta
            );
        }
    );
}


// ==============================
// CREAR UNA MESA
// ==============================

function crearMesa(
    mesa,
    cantidadPersonas
) {

    const estado =
        mesa.status
            .toLowerCase();


    let claseEstado = estado;


    if (estado === "available") {
        claseEstado = "disponible";
    }

    if (estado === "occupied") {
        claseEstado = "ocupada";
    }

    if (estado === "reserved") {
        claseEstado = "reservada";
    }


    let mensajePersonas = "";


    if (
        cantidadPersonas > 0
        &&
        (
            estado === "disponible"
            ||
            estado === "available"
        )
        &&
        mesa.chairs >= cantidadPersonas
    ) {

        mensajePersonas = `
            <p>
                <strong>
                    ✓ Sirve para ${cantidadPersonas} personas
                </strong>
            </p>
        `;
    }


    return `

        <div class="mesa ${claseEstado}">

            <h3>
                Mesa ${mesa.table_number}
            </h3>

            <p>
                👥 ${mesa.chairs} sillas
            </p>

            <p>
                Estado:
                <strong>
                    ${mesa.status}
                </strong>
            </p>

            ${mensajePersonas}

            ${mesa.details
            ? `<p>${mesa.details}</p>`
            : ""
        }

        </div>
    `;
}


// ==============================
// EVENTOS
// ==============================

buscador.addEventListener(
    "input",
    mostrarRestaurantes
);


filtroPersonas.addEventListener(
    "change",
    mostrarRestaurantes
);


// ==============================
// INICIAR
// ==============================

cargarRestaurantes();