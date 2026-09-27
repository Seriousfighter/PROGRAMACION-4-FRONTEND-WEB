// ==========================================
// MESSAPI - PANEL DE ADMINISTRACIÓN
// BACKEND: INDI
// ==========================================

const API_BASE =
    "http://localhost/PROGRAMACION-4-BACKEND/messapi/api";


// ==========================================
// SESIÓN
// ==========================================

const TOKEN =
    sessionStorage.getItem("token");

const RESTAURANTE_ID =
    parseInt(sessionStorage.getItem("restaurant_id"));


// Si no hay sesión, volvemos al login
if (!TOKEN || !RESTAURANTE_ID) {

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
// EDITAR RESTAURANTE
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

const mesasReservadas =
    document.getElementById("mesas-reservadas");


// ==========================================
// GRILLA DE MESAS
// ==========================================

const contenedorMesas =
    document.getElementById("panel-mesas");


// ==========================================
// VISTAS DEL PANEL
// ==========================================

const btnVistaMesas =
    document.getElementById("btn-vista-mesas");

const btnVistaConfiguracion =
    document.getElementById("btn-vista-configuracion");

const vistaMesas =
    document.getElementById("vista-mesas");

const vistaConfiguracion =
    document.getElementById("vista-configuracion");

const listaConfiguracionMesas =
    document.getElementById("lista-configuracion-mesas");

const btnVistaCliente =
    document.getElementById("btn-vista-cliente");

const vistaCliente =
    document.getElementById("vista-cliente");

// ==========================================
// VISTA CLIENTE
// ==========================================

const clienteNombreRestaurante =
    document.getElementById("cliente-nombre-restaurante");

const clienteDireccionRestaurante =
    document.getElementById("cliente-direccion-restaurante");

const clienteTelefonoRestaurante =
    document.getElementById("cliente-telefono-restaurante");

const clienteComoLlegar =
    document.getElementById("cliente-como-llegar");

const clienteCapacidad =
    document.getElementById("cliente-capacidad");

const clienteEstadoCapacidad =
    document.getElementById("cliente-estado-capacidad");
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
// LEER RESPUESTA DEL BACKEND
// ==========================================

async function leerRespuesta(respuesta) {

    // Algunos DELETE devuelven 204 sin JSON
    if (respuesta.status === 204) {
        return null;
    }

    const texto = await respuesta.text();

    if (!texto) {
        return null;
    }

    try {
        return JSON.parse(texto);
    } catch {
        return null;
    }
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

        window.location.href =
            "login.html";

        return false;
    }

    return true;
}


// ==========================================
// NORMALIZAR ESTADO DE MESA
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

function obtenerEstadoMesa(mesa) {
    return normalizarEstado(mesa?.status ?? mesa?.status_name);
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

    if (estado === "reservada") {
        return "Reservada";
    }

    return "Ocupada";
}
// ==========================================
// CAMBIAR VISTA DEL PANEL
// ==========================================
// ==========================================
// CAMBIAR VISTAS DEL PANEL
// ==========================================

function desactivarVistas() {

    vistaMesas.classList.add("oculto");
    vistaCliente.classList.add("oculto");
    vistaConfiguracion.classList.add("oculto");

    btnVistaMesas.classList.remove("activo");
    btnVistaCliente.classList.remove("activo");
    btnVistaConfiguracion.classList.remove("activo");
}


function mostrarVistaMesas() {

    desactivarVistas();

    vistaMesas.classList.remove("oculto");

    btnVistaMesas.classList.add("activo");
}


function mostrarVistaCliente() {

    desactivarVistas();

    vistaCliente.classList.remove("oculto");

    btnVistaCliente.classList.add("activo");

    actualizarVistaCliente();
}


function mostrarVistaConfiguracion() {

    desactivarVistas();

    vistaConfiguracion.classList.remove("oculto");

    btnVistaConfiguracion.classList.add("activo");

    mostrarListaConfiguracionMesas();
}


btnVistaMesas.addEventListener(
    "click",
    mostrarVistaMesas
);


btnVistaCliente.addEventListener(
    "click",
    mostrarVistaCliente
);


btnVistaConfiguracion.addEventListener(
    "click",
    mostrarVistaConfiguracion
);

// ==========================================
// CARGAR RESTAURANTE Y MESAS
// ==========================================

async function cargarRestaurante() {

    try {

        // ==================================
        // RESTAURANTE
        // ==================================

        const respuestaRestaurante =
            await fetch(
                `${API_BASE}/restaurants/${RESTAURANTE_ID}`,
                {
                    method: "GET",
                    headers: headersPrivados()
                }
            );


        if (!verificarSesion(respuestaRestaurante)) {
            return;
        }


        const resultadoRestaurante =
            await leerRespuesta(
                respuestaRestaurante
            );


        if (!respuestaRestaurante.ok) {

            throw new Error(
                resultadoRestaurante?.message ||
                "No se pudo cargar el restaurante."
            );
        }


        const restaurante =
            resultadoRestaurante?.data ||
            resultadoRestaurante;


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
        // MESAS
        // ==================================

        const respuestaMesas =
            await fetch(
                `${API_BASE}/restaurants/${RESTAURANTE_ID}/tables`,
                {
                    method: "GET",
                    headers: headersPrivados()
                }
            );


        if (!verificarSesion(respuestaMesas)) {
            return;
        }


        const resultadoMesas =
            await leerRespuesta(
                respuestaMesas
            );


        if (!respuestaMesas.ok) {

            throw new Error(
                resultadoMesas?.message ||
                "No se pudieron cargar las mesas."
            );
        }


        let mesas =
            resultadoMesas?.data ||
            resultadoMesas ||
            [];


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


        // GUARDAMOS LAS MESAS CARGADAS
        mesasActuales = mesas;


        mostrarMesas();

        actualizarResumen();

        mostrarListaConfiguracionMesas();

        actualizarVistaCliente();

    } catch (error) {

        console.error(
            "Error al cargar el panel:",
            error
        );


        contenedorMesas.innerHTML = "";


        const mensaje =
            document.createElement("p");


        mensaje.textContent =
            error.message ||
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
// LISTA DE MESAS - CONFIGURACIÓN
// ==========================================


// ==========================================
// VISTA PREVIA DEL CLIENTE
// ==========================================
// ==========================================
// VISTA PREVIA DEL CLIENTE
// ==========================================

function actualizarVistaCliente() {

    if (!restauranteActual) {
        return;
    }


    // ======================================
    // DATOS DEL RESTAURANTE
    // ======================================

    clienteNombreRestaurante.textContent =
        restauranteActual.name || "Restaurante";


    const direccion =
        restauranteActual.address ||
        "Dirección no disponible";


    clienteDireccionRestaurante.textContent =
        direccion;


    clienteTelefonoRestaurante.textContent =
        restauranteActual.phone ||
        "Teléfono no disponible";


    // ======================================
    // GOOGLE MAPS
    // ======================================

    if (
        restauranteActual.address &&
        restauranteActual.address.trim() !== ""
    ) {

        const ubicacionCompleta = [
            restauranteActual.address,
            restauranteActual.city,
            "Entre Ríos",
            "Argentina"
        ]
            .filter(Boolean)
            .join(", ");

        const direccionGoogle =
            encodeURIComponent(
                ubicacionCompleta
            );


        clienteComoLlegar.href =
            `https://www.google.com/maps/search/?api=1&query=${direccionGoogle}`;


        clienteComoLlegar.classList.remove(
            "oculto"
        );

    } else {

        clienteComoLlegar.classList.add(
            "oculto"
        );
    }


    // ======================================
    // RESTAURANTE ABIERTO / CERRADO
    // ======================================

    const restauranteAbierto =
        restauranteActual.is_open === true ||
        restauranteActual.is_open === 1 ||
        restauranteActual.is_open === "1";


    // Reiniciamos clases
    clienteCapacidad.className =
        "cliente-capacidad";


    // ======================================
    // CERRADO
    // ======================================

    if (!restauranteAbierto) {

        clienteCapacidad.classList.add(
            "cerrado"
        );

        clienteEstadoCapacidad.textContent =
            "Cerrado";

        return;
    }


    // ======================================
    // CALCULAR MESAS DISPONIBLES
    // ======================================

    const totalMesas =
        mesasActuales.length;


    const mesasLibres =
        mesasActuales.filter(
            mesa =>
                obtenerEstadoMesa(mesa) ===
                "disponible"
        ).length;


    // ======================================
    // SIN MESAS / SIN DISPONIBILIDAD
    // ======================================

    if (
        totalMesas === 0 ||
        mesasLibres === 0
    ) {

        clienteCapacidad.classList.add(
            "lleno"
        );

        clienteEstadoCapacidad.textContent =
            "Lleno";

        return;
    }


    // ======================================
    // PORCENTAJE DISPONIBLE
    // ======================================

    const porcentajeLibre =
        (mesasLibres / totalMesas) * 100;


    // ======================================
    // MÁS DEL 30% LIBRE
    // ======================================

    if (porcentajeLibre > 30) {

        clienteCapacidad.classList.add(
            "con-capacidad"
        );

        clienteEstadoCapacidad.textContent =
            "Con capacidad";

        return;
    }


    // ======================================
    // ENTRE 1% Y 30% LIBRE
    // ======================================

    clienteCapacidad.classList.add(
        "poca-capacidad"
    );

    clienteEstadoCapacidad.textContent =
        "Casi sin capacidad";
}


function mostrarMesasCliente() {

    clienteMesas.innerHTML = "";


    if (mesasActuales.length === 0) {

        clienteMesas.innerHTML =
            `<p class="sin-mesas-panel">
                No hay mesas registradas.
            </p>`;

        clienteResumenMesas.textContent =
            "Sin mesas";

        return;
    }


    let libres = 0;


    const mesasOrdenadas =
        [...mesasActuales].sort(
            (a, b) =>
                Number(a.table_number) -
                Number(b.table_number)
        );


    mesasOrdenadas.forEach(
        mesa => {

            const estado =
                obtenerEstadoMesa(mesa);


            if (estado === "disponible") {
                libres++;
            }


            const tarjeta =
                document.createElement("div");


            tarjeta.className =
                `boton-mesa ${estado}`;


            const numero =
                document.createElement("span");

            numero.className =
                "numero-mesa-panel";

            numero.textContent =
                `Mesa ${mesa.table_number}`;


            const capacidad =
                document.createElement("span");

            capacidad.className =
                "capacidad-mesa-panel";

            capacidad.textContent =
                `${mesa.chairs} personas`;


            tarjeta.appendChild(
                numero
            );

            tarjeta.appendChild(
                capacidad
            );


            clienteMesas.appendChild(
                tarjeta
            );
        }
    );


    clienteResumenMesas.textContent =
        libres === 1
            ? "1 mesa libre"
            : `${libres} mesas libres`;
}


function mostrarListaConfiguracionMesas() {

    if (!listaConfiguracionMesas) {
        return;
    }


    listaConfiguracionMesas.innerHTML = "";


    if (mesasActuales.length === 0) {

        const mensaje =
            document.createElement("p");

        mensaje.className =
            "sin-mesas-panel";

        mensaje.textContent =
            "Todavía no hay mesas registradas.";

        listaConfiguracionMesas.appendChild(
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

            const fila =
                document.createElement("div");

            fila.className =
                "configuracion-mesa-item";


            // INFORMACIÓN

            const informacion =
                document.createElement("div");

            informacion.className =
                "configuracion-mesa-info";


            const nombre =
                document.createElement("strong");

            nombre.textContent =
                `Mesa ${mesa.table_number}`;


            const capacidad =
                document.createElement("span");

            capacidad.textContent =
                `${mesa.chairs} personas`;


            informacion.appendChild(
                nombre
            );

            informacion.appendChild(
                capacidad
            );


            // BOTÓN EDITAR

            const botonEditar =
                document.createElement("button");

            botonEditar.type =
                "button";

            botonEditar.className =
                "btn-secundario";

            botonEditar.textContent =
                "Editar";


            botonEditar.addEventListener(
                "click",
                function () {

                    abrirGestionMesa(
                        mesa.id
                    );
                }
            );


            fila.appendChild(
                informacion
            );

            fila.appendChild(
                botonEditar
            );


            listaConfiguracionMesas.appendChild(
                fila
            );
        }
    );
}

// ==========================================
// MOSTRAR MESAS
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
                obtenerEstadoMesa(mesa);



            const boton =
                document.createElement(
                    "button"
                );


            boton.type =
                "button";


            if (estado === "disponible") {

                boton.className =
                    "boton-mesa disponible";

            } else if (estado === "reservada") {

                boton.className =
                    "boton-mesa reservada";

            } else {

                boton.className =
                    "boton-mesa no-disponible";
            }


            boton.setAttribute(
                "aria-label",
                `Mesa ${mesa.table_number}, ${formatearEstado(estado)}`
            );


            // Número de mesa
            const numero =
                document.createElement(
                    "span"
                );

            numero.className =
                "numero-mesa-panel";

            numero.textContent =
                `Mesa ${mesa.table_number}`;


            // Capacidad
            const capacidad =
                document.createElement(
                    "small"
                );

            capacidad.className =
                "capacidad-mesa-panel";

            capacidad.textContent =
                `${mesa.chairs} personas`;


            boton.appendChild(numero);

            boton.appendChild(capacidad);


            // ==================================
            // CLICK = CAMBIAR ESTADO
            // ==================================

            boton.addEventListener(
                "click",
                function () {

                    cambiarEstadoRapido(
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

async function cambiarEstadoRapido(mesaId) {

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
            await leerRespuesta(
                respuesta
            );


        if (!respuesta.ok) {

            throw new Error(
                resultado?.message ||
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
// RESUMEN DE MESAS
// ==========================================

function actualizarResumen() {

    const libres =
        mesasActuales.filter(
            mesa =>
                obtenerEstadoMesa(mesa) === "disponible"
        ).length;

    const ocupadas =
        mesasActuales.filter(
            mesa =>
                obtenerEstadoMesa(mesa) === "ocupada"
        ).length;

    const reservadas =
        mesasActuales.filter(
            mesa =>
                obtenerEstadoMesa(mesa) === "reservada"
        ).length;

    totalMesas.textContent =
        mesasActuales.length;

    mesasDisponibles.textContent =
        libres;

    mesasOcupadas.textContent =
        ocupadas;

    mesasReservadas.textContent =
        reservadas;
}


// ==========================================
// ABRIR GESTIÓN DE MESA
// ==========================================

function abrirGestionMesa(mesaId) {

    mostrarVistaConfiguracion();

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


    // Cerrar otros formularios

    formularioMesa?.classList.add(
        "oculto"
    );

    seccionEditarRestaurante?.classList.add(
        "oculto"
    );


    // Cargar datos

    gestionarId.value =
        mesa.id;

    gestionarNumero.value =
        mesa.table_number;

    gestionarSillas.value =
        mesa.chairs;

    gestionarDetalle.value =
        mesa.details || "";


    const estado =
        obtenerEstadoMesa(mesa);


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
// INDICADOR DE ESTADO
// ==========================================

function actualizarIndicadorGestion(estado) {

    const estadoNormalizado =
        normalizarEstado(estado);

    indicadorEstadoGestion.className =
        "indicador-estado";

    if (estadoNormalizado === "disponible") {

        indicadorEstadoGestion.classList.add(
            "disponible"
        );

        indicadorEstadoGestion.textContent =
            "Libre";

        return;
    }

    if (estadoNormalizado === "reservada") {

        indicadorEstadoGestion.classList.add(
            "reservada"
        );

        indicadorEstadoGestion.textContent =
            "Reservada";

        return;
    }

    indicadorEstadoGestion.classList.add(
        "no-disponible"
    );

    indicadorEstadoGestion.textContent =
        "Ocupada";
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
// EDITAR MESA
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
            !Number.isInteger(datos.table_number) ||
            !Number.isInteger(datos.chairs) ||
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
                await leerRespuesta(
                    respuesta
                );


            if (!respuesta.ok) {

                throw new Error(
                    resultado?.message ||
                    "No se pudo modificar la mesa."
                );
            }


            await cargarRestaurante();


            abrirGestionMesa(
                mesaId
            );


            mensajeGestion.textContent =
                "Mesa actualizada correctamente.";


        } catch (error) {

            console.error(error);

            mensajeGestion.textContent =
                error.message ||
                "No se pudo modificar la mesa.";
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
                await leerRespuesta(
                    respuesta
                );


            if (!respuesta.ok) {

                throw new Error(
                    resultado?.message ||
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
                    obtenerEstadoMesa(mesaActualizada);


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
                error.message ||
                "No se pudo cambiar el estado."
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
                await leerRespuesta(
                    respuesta
                );


            if (!respuesta.ok) {

                throw new Error(
                    resultado?.message ||
                    "No se pudo eliminar la mesa."
                );
            }


            cerrarGestion();

            await cargarRestaurante();


        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "No se pudo eliminar la mesa."
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


        seccionEditarRestaurante?.classList.add(
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
            !Number.isInteger(nuevaMesa.table_number) ||
            !Number.isInteger(nuevaMesa.chairs) ||
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
                await leerRespuesta(
                    respuesta
                );


            if (!respuesta.ok) {

                throw new Error(
                    resultado?.message ||
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
                error.message ||
                "No se pudo crear la mesa.";
        }
    }
);


// ==========================================
// ABRIR EDICIÓN DEL RESTAURANTE
// ==========================================



btnEditarRestaurante?.addEventListener(
    "click",
    function () {

        if (!restauranteActual) {
            alert(
                "Todavía no se cargaron los datos del restaurante."
            );
            return;
        }

        cerrarGestion();

        formularioMesa?.classList.add(
            "oculto"
        );

        // Cargamos solamente los campos
        // que realmente existen en el HTML.

        if (editarRestauranteNombre) {
            editarRestauranteNombre.value =
                restauranteActual.name || "";
        }

        if (editarRestauranteDireccion) {
            editarRestauranteDireccion.value =
                restauranteActual.address || "";
        }

        if (editarRestauranteCiudad) {
            editarRestauranteCiudad.value =
                restauranteActual.city || "";
        }

        if (editarRestauranteTelefono) {
            editarRestauranteTelefono.value =
                restauranteActual.phone || "";
        }

        if (editarRestauranteDescripcion) {
            editarRestauranteDescripcion.value =
                restauranteActual.description || "";
        }

        if (mensajeEditarRestaurante) {
            mensajeEditarRestaurante.textContent = "";
        }

        seccionEditarRestaurante?.classList.remove(
            "oculto"
        );

        seccionEditarRestaurante?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
);

// ==========================================
// CANCELAR EDICIÓN RESTAURANTE
// ==========================================

btnCancelarEditarRestaurante?.addEventListener(
    "click",
    function () {

        seccionEditarRestaurante.classList.add(
            "oculto"
        );

        formEditarRestaurante.reset();

        mensajeEditarRestaurante.textContent = "";
    }
);


// ==========================================
// GUARDAR RESTAURANTE
// ==========================================

formEditarRestaurante?.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const datos = {

            name:
                editarRestauranteNombre
                    ? editarRestauranteNombre.value.trim()
                    : restauranteActual?.name || "",

            address:
                editarRestauranteDireccion
                    ? editarRestauranteDireccion.value.trim()
                    : restauranteActual?.address || "",

            city:
                editarRestauranteCiudad
                    ? editarRestauranteCiudad.value.trim()
                    : restauranteActual?.city || "",

            phone:
                editarRestauranteTelefono
                    ? editarRestauranteTelefono.value.trim()
                    : restauranteActual?.phone || "",

            description:
                editarRestauranteDescripcion
                    ? editarRestauranteDescripcion.value.trim()
                    : restauranteActual?.description || "",

            is_open:
                restauranteActual?.is_open === true ||
                restauranteActual?.is_open === 1 ||
                restauranteActual?.is_open === "1"
        };


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
                await leerRespuesta(
                    respuesta
                );


            if (!respuesta.ok) {

                throw new Error(
                    resultado?.message ||
                    "No se pudieron actualizar los datos."
                );
            }


            mensajeEditarRestaurante.textContent =
                "Datos actualizados correctamente.";


            await cargarRestaurante();


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
// BACKEND INDI: SE HACE CON PUT
// ==========================================

btnEstadoRestaurante.addEventListener(
    "click",
    async function () {

        if (!restauranteActual) {
            return;
        }


        try {

            btnEstadoRestaurante.disabled =
                true;


            const estaAbierto =
                restauranteActual.is_open === true ||
                restauranteActual.is_open === 1 ||
                restauranteActual.is_open === "1";


            const datos = {

                name:
                    restauranteActual.name,

                address:
                    restauranteActual.address,

                phone:
                    restauranteActual.phone || "",

                description:
                    restauranteActual.description || "",

                is_open:
                    !estaAbierto
            };


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
                await leerRespuesta(
                    respuesta
                );


            if (!respuesta.ok) {

                throw new Error(
                    resultado?.message ||
                    "No se pudo cambiar el estado del restaurante."
                );
            }


            await cargarRestaurante();


        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "No se pudo cambiar el estado del restaurante."
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