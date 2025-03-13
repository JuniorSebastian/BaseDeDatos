const { ipcRenderer } = require('electron');

async function cargarClientes() {
    const clientes = await ipcRenderer.invoke('getClients');
    const lista = document.getElementById('clientes-lista');

    lista.innerHTML = '';
    clientes.forEach(cliente => {
        const li = document.createElement('li');
        li.textContent = `${cliente.nombre_cliente} - ${cliente.dni}`;
        lista.appendChild(li);
    });
}

async function agregarCliente() {
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

    await ipcRenderer.invoke('addClient', cliente);
    cargarClientes();
}

cargarClientes();
