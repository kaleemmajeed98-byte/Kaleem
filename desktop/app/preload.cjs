const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('terminalSettings', {
  getServerUrl: () => ipcRenderer.invoke('terminal:get-server-url'),
  saveServerUrl: (serverUrl) => ipcRenderer.invoke('terminal:save-server-url', serverUrl),
});
