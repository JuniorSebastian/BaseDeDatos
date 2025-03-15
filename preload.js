const { contextBridge, ipcRenderer } = require('electron');

// Exponer las APIs seguras al proceso de renderizado
contextBridge.exposeInMainWorld('api', {
    // Autenticación
    login: async (data) => {
        try {
            const result = await ipcRenderer.invoke('login', data);
            if (!result.success) {
                throw { message: result.message || 'Error de autenticación. Inténtalo de nuevo.' };
            }
            return result;
        } catch (error) {
            console.error('Error al autenticar usuario:', error);
            throw error.message ? error : { message: 'Error de comunicación. Inténtalo de nuevo.' };
        }
    },

    // Gestión de clientes
    getClients: async () => {
        try {
            const clients = await ipcRenderer.invoke('getClients');
            return clients || [];
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            throw error.message ? error : { message: 'Error al cargar la lista de clientes.' };
        }
    },

    addClient: async (clientData) => {
        try {
            if (!clientData.nombre_cliente || !clientData.dni || !clientData.celular) {
                throw new Error('Faltan campos obligatorios');
            }
            const result = await ipcRenderer.invoke('addClient', clientData);
            if (!result || !result.success) {
                throw new Error(result?.message || 'Error al agregar el cliente');
            }
            return result;
        } catch (error) {
            console.error('Error al agregar cliente:', error);
            throw error.message ? error : { message: 'Error al agregar el cliente. Inténtalo de nuevo.' };
        }
    },

    updateClient: async (clientData) => {
        try {
            if (!clientData.id_cliente || !clientData.nombre_cliente || !clientData.dni || !clientData.celular) {
                throw new Error('Faltan campos obligatorios');
            }
            const result = await ipcRenderer.invoke('updateClient', clientData);
            if (!result || !result.success) {
                throw new Error(result?.message || 'Error al actualizar el cliente');
            }
            return result;
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            throw error.message ? error : { message: 'Error al actualizar el cliente. Inténtalo de nuevo.' };
        }
    },

    deleteClient: async (clientId) => {
        try {
            if (!clientId) {
                throw new Error('ID de cliente no proporcionado');
            }
            const result = await ipcRenderer.invoke('deleteClient', clientId);
            if (!result || !result.success) {
                throw new Error(result?.message || 'Error al eliminar el cliente');
            }
            return result;
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            throw error.message ? error : { message: 'Error al eliminar el cliente. Inténtalo de nuevo.' };
        }
    },

    // Gestión de notas
    getNotas: async (clientId) => {
        try {
            if (!clientId) {
                throw new Error('ID de cliente no proporcionado');
            }
            const notas = await ipcRenderer.invoke('getNotas', clientId);
            return notas || '';
        } catch (error) {
            console.error('Error al obtener notas:', error);
            throw error.message ? error : { message: 'Error al cargar las notas del cliente.' };
        }
    },

    updateNotas: async (clientId, notas) => {
        try {
            if (!clientId) {
                throw new Error('ID de cliente no proporcionado');
            }
            const result = await ipcRenderer.invoke('updateNotas', { clientId, notas });
            if (!result || !result.success) {
                throw new Error(result?.message || 'Error al actualizar las notas');
            }
            return result;
        } catch (error) {
            console.error('Error al actualizar notas:', error);
            throw error.message ? error : { message: 'Error al guardar las notas. Inténtalo de nuevo.' };
        }
    },

    // Navegación
    redirectToMain: () => {
        ipcRenderer.send('redirect-to-main');
    },

    cerrarSesion: () => {
        ipcRenderer.send('cerrar-sesion');
    }
});
