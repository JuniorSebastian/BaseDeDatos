const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db/connection');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadFile('index.html');
});

// Obtener lista de clientes
ipcMain.handle('getClients', async () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM clientes', (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
});

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
            if (err) reject(err);
            else resolve(result);
        });
    });
});
