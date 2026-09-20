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

    estado = normalizarEstado(estado);

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


        nombreRestaurante.textContent =
            restaurante.name || "Mi restaurante";


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
            mesas = mesas.tables;
        }


        if (!Array.isArray(mesas)) {
            mesas = [];
        }


        mesasActuales = mesas;


        mostrarMesas();


        actualizarResumen();


    } catch (error) {

        console.error(error);

        contenedorMesas.innerHTML = "";

        const mensaje =
            document.createElement("p");

        mensaje.textContent =
            "No se pudo cargar la información.";

        contenedorMesas.appendChild(mensaje);
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


    if (estaAbierto) {

        estadoRestaurante.textContent =
            "Abierto";

        btnEstadoRestaurante.textContent =
            "Cerrar restaurante";

    } else {

        estadoRestaurante.textContent =
            "Cerrado";

        btnEstadoRestaurante.textContent =
            "Abrir restaurante";
    }
}


// ==========================================
// MOSTRAR MESAS EN LA GRILLA
// ==========================================

function mostrarMesas() {

    contenedorMesas.innerHTML = "";


    if (mesasActuales.length === 0) {

        const mensaje =
            document.createElement("p");

        mensaje.className =
            "sin-mesas-panel";

        mensaje.textContent =
            "Todavía no hay mesas registradas.";

        contenedorMesas.appendChild(mensaje);

        return;
    }


    // Ordenar por número de mesa
    const mesasOrdenadas =
        [...mesasActuales].sort(
            (a, b) =>
                Number(a.table_number) -
                Number(b.table_number)
        );


    mesasOrdenadas.forEach(mesa => {

        const estado =
            normalizarEstado(mesa.status);


        const disponible =
            estado === "disponible";


        const boton =
            document.createElement("button");


        boton.type = "button";


        // VERDE O ROJO

        boton.className =
            disponible
                ? "boton-mesa disponible"
                : "boton-mesa no-disponible";


        boton.setAttribute(
            "aria-label",
            `Gestionar Mesa ${mesa.table_number}, ${formatearEstado(estado)}`
        );


        // NÚMERO

        const numero =
            document.createElement("span");

        numero.className =
            "numero-mesa-panel";

        numero.textContent =
            `Mesa ${mesa.table_number}`;


        // CAPACIDAD

        const capacidad =
            document.createElement("small");

        capacidad.className =
            "capacidad-mesa-panel";

        capacidad.textContent =
            `${mesa.chairs} personas`;


        boton.appendChild(numero);
        boton.appendChild(capacidad);


        // CLICK = GESTIONAR

        boton.addEventListener(
            "click",
            function () {

                abrirGestionMesa(
                    mesa.id
                );
            }
        );


        contenedorMesas.appendChild(
            boton
        );
    });
}


// ==========================================
// ACTUALIZAR RESUMEN
// ==========================================

function actualizarResumen() {

    // LIBRES
    const libres =
        mesasActuales.filter(
            mesa =>
                normalizarEstado(mesa.status) ===
                "disponible"
        ).length;


    // OCUPADAS
    // Todo lo que no esté libre se considera ocupado.
    const ocupadas =
        mesasActuales.filter(
            mesa =>
                normalizarEstado(mesa.status) !==
                "disponible"
        ).length;


    // TOTAL
    totalMesas.textContent =
        mesasActuales.length;


    // LIBRES
    mesasDisponibles.textContent =
        libres;


    // OCUPADAS
    mesasOcupadas.textContent =
        ocupadas;
}

// ==========================================
// ABRIR GESTIÓN DE MESA
// ==========================================

function abrirGestionMesa(mesaId) {

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


    // Cerrar formulario agregar

    formularioMesa.classList.add(
        "oculto"
    );


    // Datos

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
        formatearEstado(estado);


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
// INDICADOR GESTIONAR MESA
// ==========================================

function actualizarIndicadorGestion(estado) {

    const disponible =
        normalizarEstado(estado) === "disponible";

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


    gestionarId.value = "";


    mensajeGestion.textContent = "";
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
                            JSON.stringify(datos)
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


            // Volvemos a abrir la mesa
            // para mostrar los datos actualizados.

            abrirGestionMesa(mesaId);


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
// CAMBIAR ESTADO DE MESA
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
                    formatearEstado(estado);


                actualizarIndicadorGestion(
                    estado
                );
            }


        } catch (error) {

            console.error(error);

            alert(error.message);


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

            alert(error.message);


        } finally {

            btnEliminarGestion.disabled =
                false;
        }
    }
);


// ==========================================
// MOSTRAR FORMULARIO AGREGAR
// ==========================================

btnAgregarMesa.addEventListener(
    "click",
    function () {

        cerrarGestion();


        formularioMesa.classList.remove(
            "oculto"
        );


        mensajeMesa.textContent = "";


        numeroMesa.focus();


        formularioMesa.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
);


// ==========================================
// CANCELAR AGREGAR
// ==========================================

btnCancelarMesa.addEventListener(
    "click",
    function () {

        formularioMesa.classList.add(
            "oculto"
        );


        formAgregarMesa.reset();


        mensajeMesa.textContent = "";
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

                    mensajeMesa.textContent = "";

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

            alert(error.message);


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