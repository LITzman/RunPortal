const { contextBridge, ipcRenderer, dialog } = require('electron');
window.ipcRenderer = require('electron').ipcRenderer

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    invoke: (channel) => ipcRenderer.invoke(channel)
});