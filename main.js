const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db/connection');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            worldSafeExecuteJavaScript: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
            devTools: true
        }
    });

    mainWindow.loadFile('login.html');
    mainWindow.on('closed', () => mainWindow = null);
}

// Inicialización de la aplicación
app.whenReady().then(createWindow);
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());
app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());

// Helper para consultas a la base de datos
const dbQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                console.error('Error en consulta:', err);
                reject({ success: false, message: 'Error en la base de datos' });
            } else {
                resolve(results);
            }
        });
    });
};

// Manejadores de navegación
ipcMain.on('redirect-to-main', () => {
    if (mainWindow) {
        mainWindow.loadFile('index.html');
    }
});

ipcMain.on('cerrar-sesion', () => {
    if (mainWindow) {
        mainWindow.loadFile('login.html');
    }
});

// Manejador de autenticación
ipcMain.handle('login', async (_, { usuario, contraseña }) => {
    try {
        const results = await dbQuery(
            'SELECT * FROM usuarios WHERE usuario = ? AND contraseña = ?',
            [usuario, contraseña]
        );
        return {
            success: results.length > 0,
            message: results.length > 0 ? 'Inicio de sesión exitoso' : 'Usuario o contraseña incorrectos'
        };
    } catch (error) {
        console.error('Error en login:', error);
        return { success: false, message: 'Error interno del servidor' };
    }
});

// Manejadores de clientes
ipcMain.handle('getClients', async () => {
    try {
        const results = await dbQuery('SELECT * FROM clientes ORDER BY nombre_cliente');
        return results;
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        throw { success: false, message: 'Error al obtener la lista de clientes' };
    }
});

ipcMain.handle('addClient', async (_, data) => {
    try {
        if (!data.nombre_cliente || !data.dni || !data.celular) {
            throw new Error('Nombre, DNI y celular son campos obligatorios');
        }

        const query = `INSERT INTO clientes (nombre_cliente, dni, celular) VALUES (?, ?, ?)`;
        const values = [data.nombre_cliente, data.dni, data.celular];
        const result = await dbQuery(query, values);
        return { success: true, id: result.insertId };
    } catch (error) {
        console.error('Error al agregar cliente:', error);
        throw { success: false, message: error.message || 'Error al agregar el cliente' };
    }
});

ipcMain.handle('updateClient', async (_, data) => {
    try {
        if (!data.id_cliente || !data.nombre_cliente || !data.dni || !data.celular) {
            throw new Error('ID, nombre, DNI y celular son campos obligatorios');
        }

        const query = `UPDATE clientes SET nombre_cliente = ?, dni = ?, celular = ? WHERE id_cliente = ?`;
        const values = [data.nombre_cliente, data.dni, data.celular, data.id_cliente];
        await dbQuery(query, values);
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        throw { success: false, message: error.message || 'Error al actualizar el cliente' };
    }
});

ipcMain.handle('deleteClient', async (_, id) => {
    try {
        if (!id) {
            throw new Error('ID de cliente es requerido para eliminar');
        }
        await dbQuery('DELETE FROM clientes WHERE id_cliente = ?', [id]);
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        throw { success: false, message: error.message || 'Error al eliminar el cliente' };
    }
});

// Manejadores de notas
ipcMain.handle('getNotas', async (_, clienteId) => {
    try {
        if (!clienteId) {
            throw new Error('ID de cliente es requerido');
        }
        const results = await dbQuery(
            'SELECT comentario FROM clientes WHERE id_cliente = ?',
            [clienteId]
        );
        return results[0]?.comentario || '';
    } catch (error) {
        console.error('Error al obtener notas:', error);
        throw { success: false, message: 'Error al obtener las notas del cliente' };
    }
});

ipcMain.handle('updateNotas', async (_, { clientId, notas }) => {
    try {
        if (!clientId) {
            throw new Error('ID de cliente es requerido para actualizar notas');
        }
        await dbQuery(
            'UPDATE clientes SET comentario = ? WHERE id_cliente = ?',
            [notas || '', clientId]
        );
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar notas:', error);
        throw { success: false, message: error.message || 'Error al actualizar las notas del cliente' };
    }
});