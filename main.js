const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db/connection');

let mainWindow;

function createWindow() {
    // Crear la ventana de login
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: false, // Desactivar nodeIntegration por seguridad
            contextIsolation: true, // Activar contextIsolation
            preload: path.join(__dirname, 'preload.js') // Especificar el archivo preload
        }
    });

    // Cargar la página de login al inicio
    mainWindow.loadFile('login.html');

    // Manejar el cierre de la ventana
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Manejar el login
ipcMain.handle('login', async (event, { usuario, contraseña }) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM usuarios WHERE usuario = ? AND contraseña = ?';
        db.query(query, [usuario, contraseña], (err, results) => {
            if (err) {
                console.error('Error al buscar usuario:', err);
                reject({ success: false, message: 'Error al iniciar sesión.' });
            } else if (results.length === 0) {
                resolve({ success: false, message: 'Usuario o contraseña incorrectos.' });
            } else {
                resolve({ success: true, message: 'Inicio de sesión exitoso.' });
            }
        });
    });
});

// Redirigir a la página principal después del login
ipcMain.on('redirect-to-main', () => {
    if (mainWindow) {
        mainWindow.loadFile('index.html');
    }
});

// Obtener lista de clientes
ipcMain.handle('getClients', async () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM clientes', (err, results) => {
            if (err) {
                console.error('Error al obtener clientes:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
});

// Agregar un nuevo cliente
ipcMain.handle('addClient', async (event, data) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO clientes (
                nombre_cliente, dni, direccion, direccion2, direccion3, departamento, 
                provincia, distrito, comentario, celular, correo, calificativo, zona, 
                cond_pago, pedido, linea_credito, fecha_ing, vendedor
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.nombre, data.dni, data.direccion, data.direccion2, data.direccion3, 
            data.departamento, data.provincia, data.distrito, data.comentario, data.celular, 
            data.correo, data.calificativo, data.zona, data.cond_pago, data.pedido, 
            data.linea_credito, data.fecha_ing, data.vendedor
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Error al agregar cliente:', err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
});

// Cerrar la aplicación cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});