const { contextBridge, ipcRenderer } = require('electron');

window.ipcRenderer = require('electron').ipcRenderer

contextBridge.exposeInMainWorld('ipcRenderer', {
    // Called within react
    send: (channel, data) => ipcRenderer.send(channel, data),
});