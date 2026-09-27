// ==========================================
// MESSAPI - AUTENTICACIÓN
// BACKEND: INDI
// ==========================================

const API_URL =
    "http://localhost/PROGRAMACION-4-BACKEND/messapi/api";


// ==========================================
// LOGIN
// ==========================================

const loginForm =
    document.getElementById("form-login");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            try {

                // ==========================================
                // 1. INICIAR SESIÓN
                // ==========================================

                const response = await fetch(
                    `${API_URL}/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );

                const resultado =
                    await response.json();


                if (!response.ok) {

                    alert(
                        resultado.message ||
                        "No se pudo iniciar sesión."
                    );

                    return;
                }


                // ==========================================
                // 2. OBTENER TOKEN Y USUARIO
                // ==========================================

                const token =
                    resultado.token;

                const usuario =
                    resultado.user;


                if (!token || !usuario) {

                    alert(
                        "La respuesta del servidor no es válida."
                    );

                    return;
                }


                // ==========================================
                // 3. BUSCAR RESTAURANTES DEL USUARIO
                // ==========================================

                const restaurantesResponse =
                    await fetch(
                        `${API_URL}/restaurants`,
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    `Bearer ${token}`
                            }
                        }
                    );


                const restaurantesResultado =
                    await restaurantesResponse.json();


                if (!restaurantesResponse.ok) {

                    alert(
                        restaurantesResultado.message ||
                        "No se pudo obtener el restaurante."
                    );

                    return;
                }


                const restaurantes =
                    restaurantesResultado.data || [];


                if (
                    !Array.isArray(restaurantes) ||
                    restaurantes.length === 0
                ) {

                    alert(
                        "Este usuario no tiene un restaurante registrado."
                    );

                    return;
                }


                // ==========================================
                // 4. TOMAR RESTAURANTE
                // ==========================================

                const restaurante =
                    restaurantes[0];


                // ==========================================
                // 5. GUARDAR SESIÓN
                // ==========================================

                sessionStorage.setItem(
                    "token",
                    token
                );

                sessionStorage.setItem(
                    "user_id",
                    usuario.id
                );

                sessionStorage.setItem(
                    "restaurant_id",
                    restaurante.id
                );

                sessionStorage.setItem(
                    "restaurant_name",
                    restaurante.name
                );


                // ==========================================
                // 6. ENTRAR AL PANEL
                // ==========================================

                window.location.href =
                    "panel.html";


            } catch (error) {

                console.error(
                    "Error al iniciar sesión:",
                    error
                );

                alert(
                    "No se pudo conectar con el servidor."
                );
            }
        }
    );
}


// ==========================================
// REGISTRO
// ==========================================

const registroForm =
    document.getElementById("form-registro");

if (registroForm) {

    registroForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ==========================================
            // DATOS DEL RESTAURANTE
            // ==========================================

            const restaurantName =
                document
                    .getElementById("nombre")
                    .value
                    .trim();

            const address =
                document
                    .getElementById("direccion")
                    .value
                    .trim();

            const phone =
                document
                    .getElementById("telefono")
                    .value
                    .trim();

            const description =
                document
                    .getElementById("descripcion")
                    .value
                    .trim();


            // ==========================================
            // DATOS DEL USUARIO
            // ==========================================

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            const repetirPassword =
                document
                    .getElementById("repetir-password")
                    .value;


            // ==========================================
            // VALIDACIONES
            // ==========================================

            if (password !== repetirPassword) {

                alert(
                    "Las contraseñas no coinciden."
                );

                return;
            }


            if (password.length < 6) {

                alert(
                    "La contraseña debe tener al menos 6 caracteres."
                );

                return;
            }


            try {

                // ==========================================
                // 1. CREAR USUARIO
                // ==========================================

                const registroResponse =
                    await fetch(
                        `${API_URL}/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name: restaurantName,
                                email: email,
                                password: password
                            })
                        }
                    );


                const registroResultado =
                    await registroResponse.json();


                if (!registroResponse.ok) {

                    alert(
                        registroResultado.message ||
                        "No se pudo realizar el registro."
                    );

                    return;
                }


                const token =
                    registroResultado.token;

                const usuario =
                    registroResultado.user;


                if (!token || !usuario) {

                    alert(
                        "El servidor no devolvió los datos necesarios."
                    );

                    return;
                }


                // ==========================================
                // 2. CREAR RESTAURANTE
                // ==========================================

                const restauranteResponse =
                    await fetch(
                        `${API_URL}/restaurants`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                name: restaurantName,
                                address: address,
                                phone: phone,
                                description: description,
                                is_open: true
                            })
                        }
                    );


                const restauranteResultado =
                    await restauranteResponse.json();


                if (!restauranteResponse.ok) {

                    alert(
                        restauranteResultado.message ||
                        "El usuario fue creado, pero no se pudo crear el restaurante."
                    );

                    return;
                }


                // ==========================================
                // 3. REGISTRO COMPLETADO
                // ==========================================

                alert(
                    "Restaurante registrado correctamente."
                );


                // ==========================================
                // 4. IR AL LOGIN
                // ==========================================

                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Error al registrar:",
                    error
                );

                alert(
                    "No se pudo conectar con el servidor."
                );
            }
        }
    );
}


// ==========================================
// CERRAR SESIÓN
// ==========================================

function cerrarSesion() {

    sessionStorage.clear();

    window.location.href =
        "login.html";
}