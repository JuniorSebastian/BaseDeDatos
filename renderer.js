// Variables globales
let listaCompletaClientes = [];
let clienteSeleccionadoId = null;

// Definición de campos del cliente con mapeo correcto a la base de datos
const camposCliente = [
    { id: 'nombre', dbField: 'nombre_cliente' },
    { id: 'dni', dbField: 'dni' },
    { id: 'direccion', dbField: 'direccion' },
    { id: 'direccion2', dbField: 'direccion2' },
    { id: 'direccion3', dbField: 'direccion3' },
    { id: 'departamento', dbField: 'departamento' },
    { id: 'provincia', dbField: 'provincia' },
    { id: 'distrito', dbField: 'distrito' },
    { id: 'comentario', dbField: 'comentario' },
    { id: 'celular', dbField: 'celular' },
    { id: 'correo', dbField: 'correo' },
    { id: 'calificativo', dbField: 'calificativo' },
    { id: 'zona', dbField: 'zona' },
    { id: 'cond_pago', dbField: 'cond_pago' },
    { id: 'pedido', dbField: 'pedido' },
    { id: 'linea_credito', dbField: 'linea_credito' },
    { id: 'fecha_ing', dbField: 'fecha_ing' },
    { id: 'vendedor', dbField: 'vendedor' }
];

// Función mejorada para obtener valores de formularios
const getFormValues = (prefix, campos) => {
    const values = {};
    campos.forEach(campo => {
        const id = (prefix || '') + campo.id;
        const element = document.getElementById(id);
        if (element) {
            let value = element.value.trim();
            // Manejo especial para campos numéricos
            if (campo.id === 'linea_credito' && value) {
                value = parseFloat(value);
            }
            values[campo.dbField] = value;
        }
    });
    return values;
};

// Función para seleccionar cliente
async function seleccionarCliente(id) {
    clienteSeleccionadoId = id;
    const items = document.querySelectorAll('#clientes-lista li');
    items.forEach(item => item.classList.remove('cliente-seleccionado'));
    
    const itemSeleccionado = document.querySelector(`li[data-id="${id}"]`);
    if (itemSeleccionado) {
        itemSeleccionado.classList.add('cliente-seleccionado');
        await cargarNotas(id);
    }
}

// Función para cargar notas del cliente
async function cargarNotas(clienteId) {
    try {
        const notas = await window.api.getNotas(clienteId);
        const textArea = document.getElementById('notasCliente');
        if (textArea) {
            textArea.value = notas || '';
        }
    } catch (error) {
        console.error('Error al cargar notas:', error);
        alert('Error al cargar las notas del cliente');
    }
}

// Función para guardar notas
async function guardarNotas() {
    try {
        const notas = document.getElementById('notasCliente').value;
        if (!clienteSeleccionadoId) {
            alert('Por favor, seleccione un cliente primero');
            return;
        }

        await window.api.updateNotas(clienteSeleccionadoId, notas);
        alert('Notas guardadas correctamente');
    } catch (error) {
        console.error('Error al guardar notas:', error);
        alert('Error al guardar las notas');
    }
}

// Función para cargar la lista de clientes
async function cargarClientes() {
    try {
        const valorBusqueda = document.getElementById('buscar')?.value.trim().toLowerCase() || '';
        
        if (listaCompletaClientes.length === 0) {
            listaCompletaClientes = await window.api.getClients();
        }
        
        const clientes = valorBusqueda 
            ? listaCompletaClientes.filter(cliente => 
                cliente.nombre_cliente.toLowerCase().includes(valorBusqueda) || 
                cliente.dni.toLowerCase().includes(valorBusqueda))
            : listaCompletaClientes;
        
        const lista = document.getElementById('clientes-lista');
        if (lista) {
            lista.innerHTML = clientes
                .map(cliente => `
                    <li class="list-group-item d-flex justify-content-between align-items-center" 
                        data-id="${cliente.id_cliente}" 
                        onclick="seleccionarCliente(${cliente.id_cliente})">
                        ${cliente.nombre_cliente} - ${cliente.dni}
                        <div onclick="event.stopPropagation()">
                            <button class="btn btn-sm btn-primary me-1" onclick="editarCliente(${cliente.id_cliente})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarCliente(${cliente.id_cliente})">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </li>
                `)
                .join('');
        }
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        alert(error.message || 'Error al cargar la lista de clientes');
    }
}

// Función mejorada para agregar cliente
async function agregarCliente() {
    try {
        const cliente = getFormValues('', camposCliente);
        
        if (!cliente.nombre_cliente || !cliente.dni || !cliente.celular) {
            alert('Nombre, DNI y celular son campos obligatorios.');
            return;
        }

        const result = await window.api.addClient(cliente);
        if (result.success) {
            listaCompletaClientes = [];
            await cargarClientes();
            document.getElementById('formularioCliente').reset();
            alert('Cliente agregado correctamente');
        }
    } catch (error) {
        console.error('Error al agregar cliente:', error);
        alert(error.message || 'Error al agregar el cliente');
    }
}

// Función para eliminar cliente
async function eliminarCliente(id) {
    try {
        if (confirm('¿Está seguro de que desea eliminar este cliente?')) {
            await window.api.deleteClient(id);
            if (clienteSeleccionadoId === id) {
                clienteSeleccionadoId = null;
                document.getElementById('notasCliente').value = '';
            }
            listaCompletaClientes = [];
            await cargarClientes();
            alert('Cliente eliminado correctamente');
        }
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Error al eliminar el cliente');
    }
}

// Función mejorada para editar cliente
async function editarCliente(id) {
    try {
        const cliente = listaCompletaClientes.find(c => c.id_cliente === id);
        if (!cliente) {
            alert('Cliente no encontrado.');
            return;
        }

        camposCliente.forEach(campo => {
            const inputId = 'editar' + campo.id;
            const input = document.getElementById(inputId);
            if (input) {
                input.value = cliente[campo.dbField] || '';
            }
        });

        const modal = new bootstrap.Modal(document.getElementById('editarClienteModal'));
        document.getElementById('formularioEditarCliente').dataset.id = id;
        modal.show();
    } catch (error) {
        console.error('Error al cargar datos del cliente:', error);
        alert('Error al cargar los datos del cliente');
    }
}

// Función mejorada para guardar cambios del cliente
async function guardarCambiosCliente() {
    try {
        const id = document.getElementById('formularioEditarCliente').dataset.id;
        const cliente = getFormValues('editar', camposCliente);
        
        if (!cliente.nombre_cliente || !cliente.dni || !cliente.celular) {
            alert('Nombre, DNI y celular son campos obligatorios.');
            return;
        }

        cliente.id_cliente = parseInt(id);
        
        const result = await window.api.updateClient(cliente);
        if (result.success) {
            listaCompletaClientes = [];
            await cargarClientes();
            
            const modalElement = document.getElementById('editarClienteModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
            alert('Cliente actualizado correctamente');
        }
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        alert(error.message || 'Error al actualizar el cliente');
    }
}

// Función para mostrar secciones
function mostrarSeccion(seccion) {
    const listadoClientes = document.getElementById('listado-clientes');
    const agregarCliente = document.getElementById('agregar-cliente');
    
    if (listadoClientes && agregarCliente) {
        listadoClientes.classList.toggle('hidden', seccion !== 'listado');
        agregarCliente.classList.toggle('hidden', seccion !== 'agregar');
        
        if (seccion === 'listado') cargarClientes();
    }
}

// Función para manejar el inicio de sesión
async function login() {
    const usuario = document.getElementById('usuario')?.value.trim();
    const contraseña = document.getElementById('contraseña')?.value.trim();

    if (!usuario || !contraseña) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    try {
        const respuesta = await window.api.login({ usuario, contraseña });
        if (respuesta.success) {
            window.api.redirectToMain();
        } else {
            alert(respuesta.message || 'Usuario o contraseña incorrectos.');
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert(error.message || 'Error al iniciar sesión');
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    window.api.cerrarSesion();
}

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    
    if (path.includes('index.html') || path.endsWith('/')) {
        cargarClientes();
        
        const formularioCliente = document.getElementById('formularioCliente');
        if (formularioCliente) {
            formularioCliente.addEventListener('submit', function(e) {
                e.preventDefault();
                agregarCliente();
            });
        }

        const formularioEditarCliente = document.getElementById('formularioEditarCliente');
        if (formularioEditarCliente) {
            formularioEditarCliente.addEventListener('submit', function(e) {
                e.preventDefault();
                guardarCambiosCliente();
            });
        }

        const buscarInput = document.getElementById('buscar');
        if (buscarInput) {
            buscarInput.addEventListener('input', () => {
                cargarClientes();
            });
        }
    } else if (path.includes('login.html')) {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                login();
            });
        }
    }
});
