const { contextBridge, ipcRenderer } = require('electron');

// Exponer la API de Electron al proceso de renderizado
contextBridge.exposeInMainWorld('api', {
    login: (data) => ipcRenderer.invoke('login', data),
    getClients: () => ipcRenderer.invoke('getClients'),
    addClient: (data) => ipcRenderer.invoke('addClient', data),
    redirectToMain: () => ipcRenderer.send('redirect-to-main')
});