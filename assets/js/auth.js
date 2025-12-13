// assets/js/auth.js

// 1. Configuración (Simulada)
const USUARIO_ADMIN = "admin";
const PASS_ADMIN_ENCRIPTADA = "VmFsZU5pY28="; 

// 2. Función Login (MEJORADA CON SWEETALERT)
function iniciarSesion(usuario, password) {
    if (usuario === USUARIO_ADMIN && btoa(password) === PASS_ADMIN_ENCRIPTADA) {
        // Guardamos el token
        sessionStorage.setItem('usuario_logueado', 'true');
        
        // Alerta Bonita
        Swal.fire({
            icon: 'success',
            title: '¡Bienvenido!',
            text: 'Ingresando al sistema...',
            timer: 1500, // Espera 1.5 segundos
            showConfirmButton: false,
            background: '#fff',
            color: '#333'
        }).then(() => {
            // Cuando termina el timer, redirige
            window.location.href = 'admin.html';
        });

    } else {
        // Error Bonito
        Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'Usuario o contraseña incorrectos',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Intentar de nuevo'
        });
    }
}

// 3. Protección de Rutas (Para admin.html)
function verificarSesion() {
    const logueado = sessionStorage.getItem('usuario_logueado');
    if (!logueado) {
        window.location.href = 'login.html';
    }
}

// 4. Cerrar Sesión (Para el botón Salir)
function cerrarSesion() {
    Swal.fire({
        title: '¿Cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            sessionStorage.removeItem('usuario_logueado');
            window.location.href = 'index.html';
        }
    })
}