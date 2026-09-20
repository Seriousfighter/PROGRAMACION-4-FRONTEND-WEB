// ==========================================
// MESSAPI - AUTENTICACIÓN
// ==========================================

const API_URL =
    "http://localhost/PROGRAMACION-4-BACKEND-PABLO/messapi";


// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById("form-login");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        // Obtener datos ingresados
        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        try {

            // Enviar login al backend
            const response = await fetch(
                `${API_URL}/api/login`,
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

            const resultado = await response.json();


            // ==========================================
            // VERIFICAR RESPUESTA
            // ==========================================

            if (!response.ok || !resultado.success) {

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

            window.location.href = "panel.html";

        } catch (error) {

            console.error(
                "Error al iniciar sesión:",
                error
            );

            alert(
                "No se pudo conectar con el servidor."
            );
        }

    });
}


// ==========================================
// CERRAR SESIÓN
// ==========================================

function cerrarSesion() {

    sessionStorage.clear();

    window.location.href = "login.html";
}