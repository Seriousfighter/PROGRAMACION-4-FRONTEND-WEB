// ==========================================
// MESSAPI - PANEL DE ADMINISTRACIÓN
// ==========================================

const API_BASE =
    "http://localhost/PROGRAMACION-4-BACKEND-PABLO/messapi/api";


// ==========================================
// SESIÓN
// ==========================================

const TOKEN =
    sessionStorage.getItem("token");

const USER_ID =
    sessionStorage.getItem("user_id");

const RESTAURANTE_ID =
    parseInt(sessionStorage.getItem("restaurant_id"));


if (!TOKEN || !USER_ID || !RESTAURANTE_ID) {

    sessionStorage.clear();

    window.location.href = "login.html";
}


// ==========================================
// ELEMENTOS DEL RESTAURANTE
// ==========================================

const nombreRestaurante =
    document.getElementById("nombre-restaurante");

const direccionRestaurante =
    document.getElementById("direccion-restaurante");

const estadoRestaurante =
    document.getElementById("estado-restaurante-panel");

const btnEstadoRestaurante =
    document.getElementById("btn-estado-restaurante");


// ==========================================
// EDITAR DATOS DEL RESTAURANTE
// ==========================================

const btnEditarRestaurante =
    document.getElementById("btn-editar-restaurante");

const seccionEditarRestaurante =
    document.getElementById("editar-restaurante");

const formEditarRestaurante =
    document.getElementById("form-editar-restaurante");

const editarRestauranteNombre =
    document.getElementById("editar-restaurante-nombre");

const editarRestauranteDireccion =
    document.getElementById("editar-restaurante-direccion");

const editarRestauranteCiudad =
    document.getElementById("editar-restaurante-ciudad");

const editarRestauranteTelefono =
    document.getElementById("editar-restaurante-telefono");

const editarRestauranteDescripcion =
    document.getElementById("editar-restaurante-descripcion");

const btnCancelarEditarRestaurante =
    document.getElementById("btn-cancelar-editar-restaurante");

const mensajeEditarRestaurante =
    document.getElementById("mensaje-editar-restaurante");


// ==========================================
// RESUMEN
// ==========================================

const totalMesas =
    document.getElementById("total-mesas");

const mesasDisponibles =
    document.getElementById("mesas-disponibles");

const mesasOcupadas =
    document.getElementById("mesas-ocupadas");


// ==========================================
// GRILLA DE MESAS
// ==========================================

const contenedorMesas =
    document.getElementById("panel-mesas");


// ==========================================
// AGREGAR MESA
// ==========================================

const btnAgregarMesa =
    document.getElementById("btn-agregar-mesa");

const formularioMesa =
    document.getElementById("formulario-mesa");

const formAgregarMesa =
    document.getElementById("form-agregar-mesa");

const btnCancelarMesa =
    document.getElementById("btn-cancelar-mesa");

const numeroMesa =
    document.getElementById("numero-mesa");

const cantidadSillas =
    document.getElementById("cantidad-sillas");

const detalleMesa =
    document.getElementById("detalle-mesa");

const mensajeMesa =
    document.getElementById("mensaje-mesa");


// ==========================================
// GESTIONAR MESA
// ==========================================

const seccionGestion =
    document.getElementById("gestionar-mesa");

const formGestion =
    document.getElementById("form-gestionar-mesa");

const tituloGestion =
    document.getElementById("titulo-gestionar-mesa");

const gestionarId =
    document.getElementById("gestionar-mesa-id");

const gestionarNumero =
    document.getElementById("gestionar-numero");

const gestionarSillas =
    document.getElementById("gestionar-sillas");

const gestionarDetalle =
    document.getElementById("gestionar-detalle");

const gestionarEstado =
    document.getElementById("gestionar-estado");

const indicadorEstadoGestion =
    document.getElementById("indicador-estado-gestion");

const btnCambiarEstadoGestion =
    document.getElementById("btn-cambiar-estado-gestion");

const btnEliminarGestion =
    document.getElementById("btn-eliminar-gestion");

const btnCancelarGestion =
    document.getElementById("btn-cancelar-gestion");

const mensajeGestion =
    document.getElementById("mensaje-gestion");


// ==========================================
// DATOS EN MEMORIA
// ==========================================

let mesasActuales = [];

let restauranteActual = null;


// ==========================================
// HEADERS PRIVADOS
// ==========================================

function headersPrivados(conJson = false) {

    const headers = {
        "Authorization": `Bearer ${TOKEN}`
    };

    if (conJson) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}


// ==========================================
// VERIFICAR SESIÓN
// ==========================================

function verificarSesion(respuesta) {

    if (respuesta.status === 401) {

        sessionStorage.clear();

        alert(
            "La sesión venció. Iniciá sesión nuevamente."
        );

        window.location.href = "login.html";

        return false;
    }

    return true;
}


// ==========================================
// NORMALIZAR ESTADO
// ==========================================

function normalizarEstado(estado) {

    if (!estado) {
        return "";
    }

    estado =
        String(estado)
            .toLowerCase()
            .trim();

    if (estado === "available") {
        return "disponible";
    }

    if (estado === "occupied") {
        return "ocupada";
    }

    if (estado === "reserved") {
        return "reservada";
    }

    return estado;
}


// ==========================================
// FORMATEAR ESTADO
// ==========================================

function formatearEstado(estado) {

    estado =
        normalizarEstado(estado);

    if (estado === "disponible") {
        return "Libre";
    }

    return "Ocupada";
}


// ==========================================
// CARGAR PANEL
// ==========================================

async function cargarRestaurante() {

    try {

        // ==================================
        // CARGAR RESTAURANTE
        // ==================================

        const respuestaRestaurante =
            await fetch(
                `${API_BASE}/restaurants/${RESTAURANTE_ID}`,
                {
                    headers: headersPrivados()
                }
            );


        if (!verificarSesion(respuestaRestaurante)) {
            return;
        }


        const resultadoRestaurante =
            await respuestaRestaurante.json();


        if (!respuestaRestaurante.ok) {

            throw new Error(
                resultadoRestaurante.message ||
                "No se pudo cargar el restaurante."
            );
        }


        const restaurante =
            resultadoRestaurante.data ||
            resultadoRestaurante;


        // Guardamos los datos actuales
        restauranteActual =
            restaurante;


        nombreRestaurante.textContent =
            restaurante.name ||
            "Mi restaurante";


        direccionRestaurante.textContent =
            restaurante.address ||
            "Sin dirección";


        mostrarEstadoRestaurante(
            restaurante.is_open
        );


        // ==================================
        // CARGAR MESAS
        // ==================================

        const respuestaMesas =
            await fetch(
                `${API_BASE}/restaurants/${RESTAURANTE_ID}/tables`,
                {
                    headers: headersPrivados()
                }
            );


        if (!verificarSesion(respuestaMesas)) {
            return;
        }


        const resultadoMesas =
            await respuestaMesas.json();


        if (!respuestaMesas.ok) {

            throw new Error(
                resultadoMesas.message ||
                "No se pudieron cargar las mesas."
            );
        }


        let mesas =
            resultadoMesas.data ||
            resultadoMesas;


        if (
            mesas &&
            !Array.isArray(mesas) &&
            Array.isArray(mesas.tables)
        ) {

            mesas =
                mesas.tables;
        }


        if (!Array.isArray(mesas)) {

            mesas = [];
        }


        mesasActuales =
            mesas;


        mostrarMesas();

        actualizarResumen();


    } catch (error) {

        console.error(error);

        contenedorMesas.innerHTML =
            "";


        const mensaje =
            document.createElement("p");


        mensaje.textContent =
            "No se pudo cargar la información.";


        contenedorMesas.appendChild(
            mensaje
        );
    }
}


// ==========================================
// ESTADO DEL RESTAURANTE
// ==========================================

function mostrarEstadoRestaurante(abierto) {

    const estaAbierto =
        abierto === true ||
        abierto === 1 ||
        abierto === "1";


    if (estadoRestaurante) {

        estadoRestaurante.style.display =
            "none";
    }


    if (estaAbierto) {

        btnEstadoRestaurante.textContent =
            "Cerrar restaurante";

        btnEstadoRestaurante.className =
            "btn-estado cerrar-restaurante";

    } else {

        btnEstadoRestaurante.textContent =
            "Abrir restaurante";

        btnEstadoRestaurante.className =
            "btn-estado abrir-restaurante";
    }
}


// ==========================================
// MOSTRAR MESAS EN LA GRILLA
// ==========================================

function mostrarMesas() {

    contenedorMesas.innerHTML =
        "";


    if (mesasActuales.length === 0) {

        const mensaje =
            document.createElement("p");


        mensaje.className =
            "sin-mesas-panel";


        mensaje.textContent =
            "Todavía no hay mesas registradas.";


        contenedorMesas.appendChild(
            mensaje
        );

        return;
    }


    const mesasOrdenadas =
        [...mesasActuales].sort(
            (a, b) =>
                Number(a.table_number) -
                Number(b.table_number)
        );


    mesasOrdenadas.forEach(
        mesa => {

            const estado =
                normalizarEstado(
                    mesa.status
                );


            const disponible =
                estado === "disponible";


            const boton =
                document.createElement(
                    "button"
                );


            boton.type =
                "button";


            boton.className =
                disponible
                    ? "boton-mesa disponible"
                    : "boton-mesa no-disponible";


            boton.setAttribute(
                "aria-label",
                `Mesa ${mesa.table_number}, ${formatearEstado(estado)}`
            );


            // NÚMERO

            const numero =
                document.createElement(
                    "span"
                );


            numero.className =
                "numero-mesa-panel";


            numero.textContent =
                `Mesa ${mesa.table_number}`;


            // CAPACIDAD

            const capacidad =
                document.createElement(
                    "small"
                );


            capacidad.className =
                "capacidad-mesa-panel";


            capacidad.textContent =
                `${mesa.chairs} personas`;


            boton.appendChild(
                numero
            );


            boton.appendChild(
                capacidad
            );


            // ==================================
            // CLICK SIMPLE = CAMBIAR ESTADO
            // DOBLE CLICK = EDITAR
            // ==================================

            let clickTimer =
                null;


            boton.addEventListener(
                "click",
                function () {

                    clearTimeout(
                        clickTimer
                    );


                    clickTimer =
                        setTimeout(
                            function () {

                                cambiarEstadoRapido(
                                    mesa.id
                                );

                            },
                            300
                        );
                }
            );


            boton.addEventListener(
                "dblclick",
                function () {

                    clearTimeout(
                        clickTimer
                    );


                    clickTimer =
                        null;


                    abrirGestionMesa(
                        mesa.id
                    );
                }
            );


            contenedorMesas.appendChild(
                boton
            );
        }
    );
}


// ==========================================
// CAMBIAR ESTADO RÁPIDO
// ==========================================

async function cambiarEstadoRapido(
    mesaId
) {

    try {

        const respuesta =
            await fetch(
                `${API_BASE}/tables/${mesaId}/status`,
                {
                    method: "PATCH",

                    headers:
                        headersPrivados(true)
                }
            );


        if (!verificarSesion(respuesta)) {
            return;
        }


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.message ||
                "No se pudo cambiar el estado de la mesa."
            );
        }


        await cargarRestaurante();


    } catch (error) {

        console.error(error);


        alert(
            error.message ||
            "No se pudo cambiar el estado de la mesa."
        );
    }
}


// ==========================================
// ACTUALIZAR RESUMEN
// ==========================================

function actualizarResumen() {

    const libres =
        mesasActuales.filter(
            mesa =>
                normalizarEstado(
                    mesa.status
                ) === "disponible"
        ).length;


    const ocupadas =
        mesasActuales.filter(
            mesa =>
                normalizarEstado(
                    mesa.status
                ) !== "disponible"
        ).length;


    totalMesas.textContent =
        mesasActuales.length;


    mesasDisponibles.textContent =
        libres;


    mesasOcupadas.textContent =
        ocupadas;
}


// ==========================================
// ABRIR GESTIÓN DE MESA
// ==========================================

function abrirGestionMesa(
    mesaId
) {

    const mesa =
        mesasActuales.find(
            item =>
                Number(item.id) ===
                Number(mesaId)
        );


    if (!mesa) {

        alert(
            "No se encontró la mesa."
        );

        return;
    }


    // Cerramos otros formularios

    formularioMesa.classList.add(
        "oculto"
    );


    seccionEditarRestaurante.classList.add(
        "oculto"
    );


    // Cargamos los datos

    gestionarId.value =
        mesa.id;


    gestionarNumero.value =
        mesa.table_number;


    gestionarSillas.value =
        mesa.chairs;


    gestionarDetalle.value =
        mesa.details || "";


    const estado =
        normalizarEstado(
            mesa.status
        );


    gestionarEstado.textContent =
        formatearEstado(
            estado
        );


    tituloGestion.textContent =
        `Gestionar Mesa ${mesa.table_number}`;


    actualizarIndicadorGestion(
        estado
    );


    mensajeGestion.textContent =
        "";


    seccionGestion.classList.remove(
        "oculto"
    );


    seccionGestion.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ==========================================
// INDICADOR GESTIÓN DE MESA
// ==========================================

function actualizarIndicadorGestion(
    estado
) {

    const disponible =
        normalizarEstado(
            estado
        ) === "disponible";


    indicadorEstadoGestion.className =
        disponible
            ? "indicador-estado disponible"
            : "indicador-estado no-disponible";


    indicadorEstadoGestion.textContent =
        disponible
            ? "Libre"
            : "Ocupada";
}


// ==========================================
// CERRAR GESTIÓN
// ==========================================

function cerrarGestion() {

    seccionGestion.classList.add(
        "oculto"
    );


    formGestion.reset();


    gestionarId.value =
        "";


    mensajeGestion.textContent =
        "";
}


// ==========================================
// CANCELAR GESTIÓN
// ==========================================

btnCancelarGestion.addEventListener(
    "click",
    cerrarGestion
);


// ==========================================
// GUARDAR CAMBIOS DE MESA
// ==========================================

formGestion.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const mesaId =
            gestionarId.value;


        if (!mesaId) {
            return;
        }


        const datos = {

            table_number:
                parseInt(
                    gestionarNumero.value
                ),

            chairs:
                parseInt(
                    gestionarSillas.value
                ),

            details:
                gestionarDetalle.value.trim()
        };


        if (
            datos.table_number < 1 ||
            datos.chairs < 1
        ) {

            mensajeGestion.textContent =
                "Revisá el número de mesa y la cantidad de personas.";

            return;
        }


        mensajeGestion.textContent =
            "Guardando cambios...";


        try {

            const respuesta =
                await fetch(
                    `${API_BASE}/tables/${mesaId}`,
                    {
                        method: "PUT",

                        headers:
                            headersPrivados(true),

                        body:
                            JSON.stringify(
                                datos
                            )
                    }
                );


            if (!verificarSesion(respuesta)) {
                return;
            }


            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    resultado.message ||
                    "No se pudo modificar la mesa."
                );
            }


            mensajeGestion.textContent =
                "Mesa actualizada correctamente.";


            await cargarRestaurante();


            abrirGestionMesa(
                mesaId
            );


            mensajeGestion.textContent =
                "Mesa actualizada correctamente.";


        } catch (error) {

            console.error(error);


            mensajeGestion.textContent =
                error.message;
        }
    }
);


// ==========================================
// CAMBIAR ESTADO DESDE GESTIÓN
// ==========================================

btnCambiarEstadoGestion.addEventListener(
    "click",
    async function () {

        const mesaId =
            gestionarId.value;


        if (!mesaId) {
            return;
        }


        try {

            btnCambiarEstadoGestion.disabled =
                true;


            const respuesta =
                await fetch(
                    `${API_BASE}/tables/${mesaId}/status`,
                    {
                        method: "PATCH",

                        headers:
                            headersPrivados(true)
                    }
                );


            if (!verificarSesion(respuesta)) {
                return;
            }


            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    resultado.message ||
                    "No se pudo cambiar el estado."
                );
            }


            await cargarRestaurante();


            const mesaActualizada =
                mesasActuales.find(
                    mesa =>
                        Number(mesa.id) ===
                        Number(mesaId)
                );


            if (mesaActualizada) {

                const estado =
                    normalizarEstado(
                        mesaActualizada.status
                    );


                gestionarEstado.textContent =
                    formatearEstado(
                        estado
                    );


                actualizarIndicadorGestion(
                    estado
                );
            }


        } catch (error) {

            console.error(error);

            alert(
                error.message
            );


        } finally {

            btnCambiarEstadoGestion.disabled =
                false;
        }
    }
);


// ==========================================
// ELIMINAR MESA
// ==========================================

btnEliminarGestion.addEventListener(
    "click",
    async function () {

        const mesaId =
            gestionarId.value;


        const numero =
            gestionarNumero.value;


        if (!mesaId) {
            return;
        }


        const confirmar =
            confirm(
                `¿Querés eliminar la Mesa ${numero}?`
            );


        if (!confirmar) {
            return;
        }


        try {

            btnEliminarGestion.disabled =
                true;


            const respuesta =
                await fetch(
                    `${API_BASE}/tables/${mesaId}`,
                    {
                        method: "DELETE",

                        headers:
                            headersPrivados()
                    }
                );


            if (!verificarSesion(respuesta)) {
                return;
            }


            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    resultado.message ||
                    "No se pudo eliminar la mesa."
                );
            }


            cerrarGestion();


            await cargarRestaurante();


        } catch (error) {

            console.error(error);


            alert(
                error.message
            );


        } finally {

            btnEliminarGestion.disabled =
                false;
        }
    }
);


// ==========================================
// MOSTRAR FORMULARIO AGREGAR MESA
// ==========================================

btnAgregarMesa.addEventListener(
    "click",
    function () {

        cerrarGestion();


        seccionEditarRestaurante.classList.add(
            "oculto"
        );


        formularioMesa.classList.remove(
            "oculto"
        );


        mensajeMesa.textContent =
            "";


        numeroMesa.focus();


        formularioMesa.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
);


// ==========================================
// CANCELAR AGREGAR MESA
// ==========================================

btnCancelarMesa.addEventListener(
    "click",
    function () {

        formularioMesa.classList.add(
            "oculto"
        );


        formAgregarMesa.reset();


        mensajeMesa.textContent =
            "";
    }
);


// ==========================================
// CREAR MESA
// ==========================================

formAgregarMesa.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const nuevaMesa = {

            table_number:
                parseInt(
                    numeroMesa.value
                ),

            chairs:
                parseInt(
                    cantidadSillas.value
                ),

            details:
                detalleMesa.value.trim()
        };


        if (
            nuevaMesa.table_number < 1 ||
            nuevaMesa.chairs < 1
        ) {

            mensajeMesa.textContent =
                "Revisá el número de mesa y la cantidad de personas.";

            return;
        }


        mensajeMesa.textContent =
            "Guardando mesa...";


        try {

            const respuesta =
                await fetch(
                    `${API_BASE}/restaurants/${RESTAURANTE_ID}/tables`,
                    {
                        method: "POST",

                        headers:
                            headersPrivados(true),

                        body:
                            JSON.stringify(
                                nuevaMesa
                            )
                    }
                );


            if (!verificarSesion(respuesta)) {
                return;
            }


            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    resultado.message ||
                    "No se pudo crear la mesa."
                );
            }


            mensajeMesa.textContent =
                "Mesa agregada correctamente.";


            formAgregarMesa.reset();


            await cargarRestaurante();


            setTimeout(
                function () {

                    formularioMesa.classList.add(
                        "oculto"
                    );


                    mensajeMesa.textContent =
                        "";

                },
                700
            );


        } catch (error) {

            console.error(error);


            mensajeMesa.textContent =
                error.message;
        }
    }
);


// ==========================================
// ABRIR EDICIÓN DEL RESTAURANTE
// ==========================================

btnEditarRestaurante.addEventListener(
    "click",
    function () {

        if (!restauranteActual) {

            alert(
                "Todavía no se cargaron los datos del restaurante."
            );

            return;
        }


        // Cerramos los otros formularios

        cerrarGestion();


        formularioMesa.classList.add(
            "oculto"
        );


        // Cargamos los datos actuales

        editarRestauranteNombre.value =
            restauranteActual.name || "";


        editarRestauranteDireccion.value =
            restauranteActual.address || "";


        editarRestauranteCiudad.value =
            restauranteActual.city || "";


        editarRestauranteTelefono.value =
            restauranteActual.phone || "";


        editarRestauranteDescripcion.value =
            restauranteActual.description || "";


        mensajeEditarRestaurante.textContent =
            "";


        // Mostramos formulario

        seccionEditarRestaurante.classList.remove(
            "oculto"
        );


        seccionEditarRestaurante.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
);


// ==========================================
// CANCELAR EDICIÓN DEL RESTAURANTE
// ==========================================

btnCancelarEditarRestaurante.addEventListener(
    "click",
    function () {

        seccionEditarRestaurante.classList.add(
            "oculto"
        );


        formEditarRestaurante.reset();


        mensajeEditarRestaurante.textContent =
            "";
    }
);


// ==========================================
// GUARDAR DATOS DEL RESTAURANTE
// ==========================================

formEditarRestaurante.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const datos = {

            name:
                editarRestauranteNombre.value.trim(),

            address:
                editarRestauranteDireccion.value.trim(),

            city:
                editarRestauranteCiudad.value.trim(),

            phone:
                editarRestauranteTelefono.value.trim(),

            description:
                editarRestauranteDescripcion.value.trim()
        };


        // ==================================
        // VALIDACIONES
        // ==================================

        if (datos.name === "") {

            mensajeEditarRestaurante.textContent =
                "Ingresá el nombre del restaurante.";

            return;
        }


        if (datos.address === "") {

            mensajeEditarRestaurante.textContent =
                "Ingresá la dirección.";

            return;
        }


        if (datos.city === "") {

            mensajeEditarRestaurante.textContent =
                "Ingresá la ciudad.";

            return;
        }


        mensajeEditarRestaurante.textContent =
            "Guardando cambios...";


        try {

            const respuesta =
                await fetch(
                    `${API_BASE}/restaurants/${RESTAURANTE_ID}`,
                    {
                        method: "PUT",

                        headers:
                            headersPrivados(true),

                        body:
                            JSON.stringify(
                                datos
                            )
                    }
                );


            if (!verificarSesion(respuesta)) {
                return;
            }


            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    resultado.message ||
                    "No se pudieron actualizar los datos."
                );
            }


            mensajeEditarRestaurante.textContent =
                "Datos actualizados correctamente.";


            // Recargamos restaurante y mesas
            await cargarRestaurante();


            // Cerramos el formulario después
            // de mostrar el mensaje brevemente.

            setTimeout(
                function () {

                    seccionEditarRestaurante.classList.add(
                        "oculto"
                    );


                    mensajeEditarRestaurante.textContent =
                        "";

                },
                700
            );


        } catch (error) {

            console.error(error);


            mensajeEditarRestaurante.textContent =
                error.message ||
                "No se pudieron actualizar los datos.";
        }
    }
);


// ==========================================
// ABRIR / CERRAR RESTAURANTE
// ==========================================

btnEstadoRestaurante.addEventListener(
    "click",
    async function () {

        try {

            btnEstadoRestaurante.disabled =
                true;


            const respuesta =
                await fetch(
                    `${API_BASE}/restaurants/${RESTAURANTE_ID}/status`,
                    {
                        method: "PATCH",

                        headers:
                            headersPrivados(true)
                    }
                );


            if (!verificarSesion(respuesta)) {
                return;
            }


            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    resultado.message ||
                    "No se pudo cambiar el estado del restaurante."
                );
            }


            await cargarRestaurante();


        } catch (error) {

            console.error(error);


            alert(
                error.message
            );


        } finally {

            btnEstadoRestaurante.disabled =
                false;
        }
    }
);


// ==========================================
// CERRAR SESIÓN
// ==========================================

function cerrarSesion() {

    sessionStorage.clear();

    window.location.href =
        "index.html";
}


// ==========================================
// INICIAR PANEL
// ==========================================

cargarRestaurante();