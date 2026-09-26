const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPathForFile: (file) => {
    try {
      if (webUtils && typeof webUtils.getPathForFile === 'function') {
        return webUtils.getPathForFile(file);
      }
    } catch (e) {
      console.warn('webUtils.getPathForFile error:', e);
    }
    return file?.path || '';
  },
  getData: () => ipcRenderer.invoke('get-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getAutoStart: () => ipcRenderer.invoke('get-auto-start'),
  setAutoStart: (enabled) => ipcRenderer.invoke('set-auto-start', enabled),
  extractIcon: (filePath) => ipcRenderer.invoke('extract-icon', filePath),
  refreshItemIcons: (items) => ipcRenderer.invoke('refresh-item-icons', items),
  pickFile: () => ipcRenderer.invoke('pick-file'),
  launchApp: (appItem) => ipcRenderer.invoke('launch-app', appItem),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  quitApp: () => ipcRenderer.send('window-quit'),
  setWindowSize: (size) => ipcRenderer.invoke('set-window-size', size),
  expandCanvas: (canvasSize) => ipcRenderer.invoke('expand-canvas', canvasSize),
  collapseCanvas: (size) => ipcRenderer.invoke('collapse-canvas', size),
  setWidgetStyle: (style) => ipcRenderer.invoke('set-widget-style', style),
  expandWindowForModal: (isExpanded) => ipcRenderer.invoke('expand-window-for-modal', isExpanded),
  capturePreview: (filename) => ipcRenderer.invoke('capture-preview', filename),
  getWallpaperPalette: () => ipcRenderer.invoke('get-wallpaper-palette'),
  scanRealDesktop: () => ipcRenderer.invoke('scan-real-desktop'),
  onSettingsChanged: (callback) => {
    ipcRenderer.on('settings-changed', (event, value) => callback(value));
  },
  onTriggerAddApp: (callback) => {
    ipcRenderer.on('trigger-add-app', () => callback());
  },
  onResetDefaultData: (callback) => {
    ipcRenderer.on('reset-default-data', () => callback());
  },
  onStealthState: (callback) => {
    ipcRenderer.on('stealth-state', (event, value) => callback(value));
  }
});
