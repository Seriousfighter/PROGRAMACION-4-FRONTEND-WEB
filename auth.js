// ==========================================
// MESSAPI - AUTENTICACIÓN
// ==========================================

const API_URL =
    "http://localhost/PROGRAMACION-4-BACKEND-PABLO/messapi";


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

            // Obtener datos ingresados
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

                // Enviar login al backend
                const response = await fetch(
                    `${API_URL}/api/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );

                const resultado =
                    await response.json();


                // ==========================================
                // VERIFICAR RESPUESTA
                // ==========================================

                if (
                    !response.ok ||
                    !resultado.success
                ) {

                    alert(
                        resultado.message ||
                        "No se pudo iniciar sesión."
                    );

                    return;
                }


                // ==========================================
                // GUARDAR DATOS DE LA SESIÓN
                // ==========================================

                sessionStorage.setItem(
                    "token",
                    resultado.data.token
                );

                sessionStorage.setItem(
                    "user_id",
                    resultado.data.user_id
                );

                sessionStorage.setItem(
                    "restaurant_id",
                    resultado.data.restaurant_id
                );

                sessionStorage.setItem(
                    "restaurant_name",
                    resultado.data.restaurant_name
                );


                // ==========================================
                // ENTRAR AL PANEL
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
// REGISTRO DE RESTAURANTE
// ==========================================

const registroForm =
    document.getElementById("form-registro");

if (registroForm) {

    registroForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ==========================================
            // OBTENER DATOS DEL FORMULARIO
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

            const city =
                document
                    .getElementById("ciudad")
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
            // VALIDAR CONTRASEÑAS
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


            // ==========================================
            // ENVIAR REGISTRO AL BACKEND
            // ==========================================

            try {

                const response = await fetch(
                    `${API_URL}/api/register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            restaurant_name:
                                restaurantName,

                            address:
                                address,

                            city:
                                city,

                            phone:
                                phone,

                            description:
                                description,

                            email:
                                email,

                            password:
                                password
                        })
                    }
                );


                const resultado =
                    await response.json();


                // ==========================================
                // VERIFICAR RESPUESTA
                // ==========================================

                if (
                    !response.ok ||
                    !resultado.success
                ) {

                    alert(
                        resultado.message ||
                        "No se pudo registrar el restaurante."
                    );

                    return;
                }


                // ==========================================
                // REGISTRO CORRECTO
                // ==========================================

                alert(
                    "Restaurante registrado correctamente."
                );


                // Ir al login
                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Error al registrar restaurante:",
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