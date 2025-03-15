const loginForm = document.getElementById('login-form');
const usuarioInput = document.getElementById('usuario');
const contraseñaInput = document.getElementById('contraseña');
const submitButton = loginForm.querySelector('button[type="submit"]');

let isSubmitting = false;

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isSubmitting) {
        return;
    }

    isSubmitting = true;
    submitButton.disabled = true;

    const usuario = usuarioInput.value.trim();
    const contraseña = contraseñaInput.value.trim();

    if (!usuario || !contraseña) {
        alert('Usuario y contraseña son requeridos.');
        isSubmitting = false;
        submitButton.disabled = false;
        return;
    }

    try {
        const respuesta = await window.api.login({ usuario, contraseña });

        if (respuesta.success) {
            alert(respuesta.message || 'Inicio de sesión exitoso.');
            window.api.redirectToMain();
        } else {
            alert(respuesta.message || 'Usuario o contraseña incorrectos.');
            loginForm.reset();
            setImmediate(() => {
                usuarioInput.focus();
            });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('Error de comunicación con el servidor. Inténtalo de nuevo.');
        loginForm.reset();
        setImmediate(() => {
            usuarioInput.focus();
        });
    } finally {
        isSubmitting = false;
        submitButton.disabled = false;
    }
});