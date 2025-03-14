// Función para cargar la lista de clientes
async function cargarClientes() {
    try {
        const clientes = await window.api.getClients(); // Usar window.api en lugar de ipcRenderer directamente
        const lista = document.getElementById('clientes-lista');

        lista.innerHTML = ''; // Limpiar la lista antes de agregar nuevos elementos
        clientes.forEach(cliente => {
            const li = document.createElement('li');
            li.className = 'list-group-item'; // Añadir clase de Bootstrap
            li.textContent = `${cliente.nombre_cliente} - ${cliente.dni}`;
            lista.appendChild(li);
        });
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        alert('Hubo un error al cargar la lista de clientes');
    }
}

// Función para agregar un nuevo cliente
async function agregarCliente() {
    try {
        const cliente = {
            nombre: document.getElementById('nombre').value,
            dni: document.getElementById('dni').value,
            direccion: document.getElementById('direccion').value,
            direccion2: document.getElementById('direccion2').value,
            direccion3: document.getElementById('direccion3').value,
            departamento: document.getElementById('departamento').value,
            provincia: document.getElementById('provincia').value,
            distrito: document.getElementById('distrito').value,
            comentario: document.getElementById('comentario').value,
            celular: document.getElementById('celular').value,
            correo: document.getElementById('correo').value,
            calificativo: document.getElementById('calificativo').value,
            zona: document.getElementById('zona').value,
            cond_pago: document.getElementById('cond_pago').value,
            pedido: document.getElementById('pedido').value,
            linea_credito: document.getElementById('linea_credito').value,
            fecha_ing: document.getElementById('fecha_ing').value,
            vendedor: document.getElementById('vendedor').value
        };

        await window.api.addClient(cliente); // Usar window.api en lugar de ipcRenderer directamente
        cargarClientes(); // Recargar la lista de clientes

        // Limpiar el formulario
        document.getElementById('formularioCliente').reset();
        alert('Cliente agregado correctamente');
    } catch (error) {
        console.error('Error al agregar cliente:', error);
        alert('Hubo un error al agregar el cliente');
    }
}

// Función para manejar el inicio de sesión
async function login() {
    const usuario = document.getElementById('usuario').value.trim(); // Eliminar espacios en blanco
    const contraseña = document.getElementById('contraseña').value.trim(); // Eliminar espacios en blanco

    // Validar que los campos no estén vacíos
    if (!usuario || !contraseña) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    try {
        const respuesta = await window.api.login({ usuario, contraseña });

        if (respuesta.success) {
            // Redirigir a la página principal
            window.api.redirectToMain();
        } else {
            alert(respuesta.message || 'Usuario o contraseña incorrectos.');
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('Hubo un error al iniciar sesión. Inténtalo de nuevo.');
    }
}

// Cargar la lista de clientes al iniciar la página principal
if (window.location.pathname.endsWith('index.html')) {
    cargarClientes();
}

// Asignar eventos a los botones
if (window.location.pathname.endsWith('login.html')) {
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        login();
    });
}

if (window.location.pathname.endsWith('index.html')) {
    document.getElementById('agregar-cliente-btn').addEventListener('click', (e) => {
        e.preventDefault();
        agregarCliente();
    });
}