window.addEventListener('load', function () {
    const msgSucces = this.document.getElementById('msgSucces');
    const msgError = this.document.getElementById('msgError');
    const result = JSON.parse(this.localStorage.getItem('result'));
    const btnLogout = this.document.getElementById('btnCerrarSesion');

    // Mostrar nombre de usuario en alerta
    if (result && result.nombreUsuario) {
        mostrarAlerta(`¡Hola, ${result.nombreUsuario}! Bienvenido de nuevo.`, msgSucces);
    } else {
        mostrarError("Lo sentimos, no se encontró información de usuario. Por favor, inicie sesión.", msgError);
    }

    btnLogout.addEventListener('click', function (event) {
        event.preventDefault();  // Prevenir que el enlace navegue por defecto
        logout();  // Llamar a la función logout
    });
});

function mostrarError(mensaje, element) {
    element.innerHTML = mensaje;
    element.style.display = 'block';
}

function mostrarAlerta(mensaje, element) {
    element.innerHTML = mensaje;
    element.style.display = 'block';
}

function ocultarAlerta(element) {
    element.innerHTML = '';
    element.style.display = 'none';
}

async function logout() {
    const url = 'http://localhost:9092/login/cerrar-sesion-async';
    const tipoDocumento = localStorage.getItem('tipoDocumento');
    const numeroDocumento = localStorage.getItem('numeroDocumento');

    // Verificar si se encontraron los valores necesarios
    if (!tipoDocumento || !numeroDocumento) {
        console.error("No se encontraron datos válidos en localStorage.");
        mostrarError("Error: No se encontraron datos válidos para cerrar sesión. Por favor, inténtelo de nuevo.",
             document.getElementById('msgError'));
        return;
    }

    const responseBody = {
        tipoDocumento: tipoDocumento,
        numeroDocumento: numeroDocumento
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(responseBody)
        });

        // Manejo de error en caso de respuesta no exitosa
        if (!response.ok) {
            const errorMessage = await response.text(); 
            console.error('Error al cerrar sesión: ', errorMessage);
            mostrarError(`${errorMessage}. Por favor, inténtelo de nuevo.`, document.getElementById('msgError'));
            return;
        }

 
        const resultLogout = await response.json();
        console.log('Respuesta del servidor: ', resultLogout);

        // Verifica si el mensaje de logout es el esperado
        if (resultLogout.errorMessage === "Exito") {
            // Limpiar localStorage
            localStorage.removeItem('result');
            localStorage.removeItem('tipoDocumento');
            localStorage.removeItem('numeroDocumento');
            // Guardar mensaje en localStorage para mostrar en index.html
            localStorage.setItem('logoutMessage', "¡Cierre de sesión realizado correctamente! Hasta pronto.");
            window.location.replace('index.html'); // Redirigir a la página de inicio
        } else {
            mostrarError(`Error: ${resultLogout.errorMessage}. Inténtelo nuevamente.`, document.getElementById('msgError'));
        }
    } catch (error) {
        console.error('Error: Ocurrió un problema ', error);
        mostrarAlerta('Error: Ocurrió un problema al cerrar sesión', document.getElementById('msgSucces'));
    }
}

