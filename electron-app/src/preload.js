// preload.js
const { contextBridge, ipcRenderer } = require('electron');

process.once('loaded', () => {

  contextBridge.exposeInMainWorld( 'api', {
    send: ( channel, data ) => ipcRenderer.invoke( channel, data ),
    handle: ( channel, callable ) => ipcRenderer.on( channel, (event, ...args) => callable(...args) )
  });

});
