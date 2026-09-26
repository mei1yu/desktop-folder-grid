const { app, BrowserWindow, ipcMain, shell, dialog, Tray, Menu, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn, execFile } = require('child_process');

let mainWindow = null;
let tray = null;
let isQuitting = false;
let updateTrayMenu = null;

function getExtractorExePath() {
  const devPath = path.join(__dirname, 'ExtractIcon.exe');
  if (fs.existsSync(devPath)) return devPath;
  const unpackedPath = path.join(__dirname.replace('app.asar', 'app.asar.unpacked'), 'ExtractIcon.exe');
  if (fs.existsSync(unpackedPath)) return unpackedPath;
  const resPath = path.join(process.resourcesPath, 'ExtractIcon.exe');
  if (fs.existsSync(resPath)) return resPath;
  return devPath;
}

function extractIconNative(targetPath) {
  const exePath = getExtractorExePath();
  return new Promise((resolve) => {
    if (!targetPath || !fs.existsSync(exePath)) {
      resolve(null);
      return;
    }
    execFile(exePath, [targetPath], { timeout: 3000, maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
      if (!err && stdout) {
        const trimmed = stdout.trim();
        if (trimmed.startsWith('data:image/')) {
          resolve(trimmed);
          return;
        }
      }
      resolve(null);
    });
  });
}

function getWallpaperPaletteNative() {
  const exePath = getExtractorExePath();
  return new Promise((resolve) => {
    if (!fs.existsSync(exePath)) {
      resolve({ success: false });
      return;
    }
    execFile(exePath, ['--wallpaper'], { timeout: 4000 }, (err, stdout) => {
      if (!err && stdout) {
        try {
          const parsed = JSON.parse(stdout.trim());
          if (parsed && parsed.success) {
            resolve(parsed);
            return;
          }
        } catch (e) {}
      }
      resolve({ success: false });
    });
  });
}

const DATA_FILE = path.join(app.getPath('userData'), 'desktop-folders-data.json');
const SETTINGS_FILE = path.join(app.getPath('userData'), 'desktop-settings.json');

let logFile = path.join(__dirname, 'startup.log');
try {
  logFile = path.join(app.getPath('userData'), 'desktop-app.log');
} catch (e) {}

function log(...args) {
  try {
    const msg = `[${new Date().toISOString()}] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}\n`;
    fs.appendFileSync(logFile, msg, 'utf-8');
  } catch (e) {}
}

process.on('uncaughtException', (err) => {
  log('UNCAUGHT_EXCEPTION:', err.stack || err);
});
process.on('unhandledRejection', (err) => {
  log('UNHANDLED_REJECTION:', err.stack || err);
});

log('=== APP START === PID:', process.pid, 'argv:', process.argv);

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
log('gotTheLock:', gotTheLock);
if (!gotTheLock) {
  log('Failed to get single instance lock! Exiting.');
  app.quit();
} else {
  app.on('second-instance', () => {
    log('second-instance triggered');
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return {
    alwaysOnTop: false,
    cardScale: 1.0,
    opacity: 0.9,
    blurStrength: 28,
    theme: 'white', // Default to elegant translucent gray-white frosted glass
    widgetStyle: 'glass', // 'glass', 'island', 'edge', 'zipper'
    autoHide: true, // Stealth mode
    autoStart: true, // Auto-start on boot
    minimizeBehavior: 'stealth', // 'stealth' (enter hover reveal) or 'tray'
    isCanvasExpanded: true,
    showToolbar: true
  };
}

function applyAutoStart(enabled) {
  try {
    const isPackaged = app.isPackaged;
    const execPath = process.execPath;
    const args = isPackaged ? [] : [path.resolve(__dirname)];

    app.setLoginItemSettings({
      openAtLogin: !!enabled,
      path: execPath,
      args: args
    });

    // Also sync shortcut in Windows Startup folder for max reliability
    try {
      const startupDir = path.join(app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
      const shortcutFile = path.join(startupDir, '桌面文件夹格子.lnk');
      if (enabled) {
        if (isPackaged) {
          shell.writeShortcutLink(shortcutFile, 'create', {
            target: execPath,
            description: '桌面文件夹格子 (Desktop Folder Grid)',
            icon: execPath,
            iconIndex: 0
          });
        }
      } else {
        if (fs.existsSync(shortcutFile)) {
          fs.unlinkSync(shortcutFile);
        }
      }
    } catch (err) {
      log(`Startup shortcut sync note: ${err.message}`);
    }

    log(`Auto-start applied: ${enabled}`);
  } catch (e) {
    log(`Auto-start error: ${e.message}`);
  }
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

async function scanRealDesktop() {
  const userDesktop = path.join(app.getPath('home'), 'Desktop');
  const publicDesktop = 'C:\\Users\\Public\\Desktop';

  function getFiles(dir) {
    try {
      if (!fs.existsSync(dir)) return [];
      return fs.readdirSync(dir).map(f => ({ name: f, fullPath: path.join(dir, f) }));
    } catch (e) {
      return [];
    }
  }

  const all = [...getFiles(userDesktop), ...getFiles(publicDesktop)]
    .filter(f => f.name.toLowerCase() !== 'desktop.ini' && !f.name.endsWith('.tmp') && !f.name.endsWith('.bat'));

  const categories = {
    '浏览器': [],
    '系统与安全': [],
    '笔记本': [],
    'ai': [],
    '第三方代理': [],
    '开发工具': [],
    '社交通讯': []
  };
  const singles = [];

  await Promise.all(all.map(async (item) => {
    const cleanName = item.name.replace(/\.(lnk|url|exe)$/i, '');
    const lower = cleanName.toLowerCase();

    let iconData = null;
    try {
      const nativeImg = await app.getFileIcon(item.fullPath, { size: 'large' });
      iconData = nativeImg.toDataURL();
    } catch (e) {}

    const appObj = {
      id: 'app-' + Math.random().toString(36).substring(2, 9),
      type: 'app',
      name: cleanName,
      icon: iconData || 'folder',
      action: item.fullPath
    };

    if (lower.includes('chrome') || lower.includes('edge') || lower.includes('browser')) {
      categories['浏览器'].push(appObj);
    } else if (lower.includes('cherry') || lower.includes('copilot') || lower.includes('cursor') || lower.includes('ai') || lower.includes('antigravity') || lower.includes('opencode') || lower.includes('workbuddy')) {
      categories['ai'].push(appObj);
    } else if (lower.includes('clash') || lower.includes('switch') || lower.includes('proxy') || lower.includes('verge')) {
      categories['第三方代理'].push(appObj);
    } else if (lower.includes('obsidian') || lower.includes('note') || lower.endsWith('.md') || lower.endsWith('.pdf') || lower.includes('devtoys')) {
      categories['笔记本'].push(appObj);
    } else if (lower.includes('burp') || lower.includes('acunetix') || lower.includes('ida') || lower.includes('yakit') || lower.includes('navicat') || lower.includes('xshell') || lower.includes('everything') || lower.includes('windhawk') || lower.includes('vmware') || lower.includes('tianshu') || lower.includes('010editor')) {
      categories['系统与安全'].push(appObj);
    } else if (lower.includes('code') || lower.includes('idea') || lower.includes('pycharm') || lower.includes('hbuilder') || lower.includes('docker') || lower.includes('nexus')) {
      categories['开发工具'].push(appObj);
    } else if (lower.includes('qq') || lower.includes('微信') || lower.includes('wechat') || lower.includes('discord') || lower.includes('todesk') || lower.includes('localsend') || lower.includes('lx music')) {
      categories['社交通讯'].push(appObj);
    } else {
      singles.push(appObj);
    }
  }));

  const resultItems = [];
  for (const [catName, appList] of Object.entries(categories)) {
    if (appList.length > 0) {
      resultItems.push({
        id: 'folder-' + Math.random().toString(36).substring(2, 9),
        type: 'folder',
        name: catName,
        items: appList
      });
    }
  }

  // Include 4 real standalone apps on the desktop grid so user can immediately drag them onto each other
  singles.slice(0, 4).forEach(app => resultItems.push(app));

  return resultItems;
}

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return null;
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (e) {
    console.error('Failed to save data:', e);
    return { success: false, error: e.message };
  }
}

function getWidgetDimensions(widgetStyle) {
  switch (widgetStyle) {
    case 'island': return { width: 165, height: 44 };
    case 'edge': return { width: 150, height: 34 };
    case 'zipper': return { width: 220, height: 56 };
    case 'glass':
    default: return { width: 180, height: 48 };
  }
}

let proximityTimer = null;
let isStealthModeActive = false;
let lastNearTime = Date.now();

function startProximityTracker() {
  if (proximityTimer) clearInterval(proximityTimer);
  proximityTimer = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed() || !mainWindow.isVisible()) return;

    const settings = loadSettings();
    // Only active when canvas is collapsed and autoHide is enabled
    if (settings.isCanvasExpanded !== false || settings.autoHide === false) {
      if (isStealthModeActive) {
        isStealthModeActive = false;
        mainWindow.webContents.send('stealth-state', false);
      }
      return;
    }

    try {
      const cursorPos = screen.getCursorScreenPoint();
      const bounds = mainWindow.getBounds();
      const margin = 55; // 55px proximity margin around widget

      const isNearOrInside = (
        cursorPos.x >= bounds.x - margin &&
        cursorPos.x <= bounds.x + bounds.width + margin &&
        cursorPos.y >= bounds.y - margin &&
        cursorPos.y <= bounds.y + bounds.height + margin
      );

      if (isNearOrInside) {
        lastNearTime = Date.now();
        if (isStealthModeActive) {
          isStealthModeActive = false;
          mainWindow.webContents.send('stealth-state', false);
        }
      } else {
        if (!isStealthModeActive && (Date.now() - lastNearTime > 750)) {
          isStealthModeActive = true;
          mainWindow.webContents.send('stealth-state', true);
        }
      }
    } catch (e) {}
  }, 120);
}

function createWindow() {
  const settings = loadSettings();
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const isExpanded = settings.isCanvasExpanded !== false;
  const widgetDim = getWidgetDimensions(settings.widgetStyle || 'glass');
  const defaultWidth = isExpanded ? 640 : widgetDim.width;
  const defaultHeight = isExpanded ? 640 : widgetDim.height;
  const defaultX = Math.max(10, Math.round((screenWidth - defaultWidth) / 2));
  const defaultY = Math.max(10, isExpanded ? 50 : 20);

  const isAlwaysOnTop = !!settings.alwaysOnTop;

  log('createWindow called. screen:', screenWidth, 'x', screenHeight, 'bounds:', { defaultWidth, defaultHeight, defaultX, defaultY }, 'isExpanded:', isExpanded, 'alwaysOnTop:', isAlwaysOnTop);

  mainWindow = new BrowserWindow({
    title: '桌面文件夹格子',
    width: defaultWidth,
    height: defaultHeight,
    x: defaultX,
    y: defaultY,
    frame: false,
    transparent: true,
    hasShadow: true,
    resizable: true,
    minWidth: 120,
    minHeight: 28,
    skipTaskbar: false, // Ensure taskbar icon is visible
    alwaysOnTop: isAlwaysOnTop,
    show: true,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isAlwaysOnTop) {
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  } else {
    mainWindow.setAlwaysOnTop(false);
  }

  mainWindow.webContents.on('console-message', (e, level, msg, line, id) => {
    log(`[RENDERER L${line}]`, msg);
  });

  mainWindow.webContents.on('did-fail-load', (e, errorCode, errorDescription) => {
    log('did-fail-load error:', errorCode, errorDescription);
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  let isShown = false;
  const showMainWindow = () => {
    if (isShown || !mainWindow) return;
    isShown = true;
    log('showMainWindow called');
    mainWindow.show();
    const curSettings = loadSettings();
    if (curSettings.alwaysOnTop) {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    } else {
      mainWindow.setAlwaysOnTop(false);
    }

    setTimeout(async () => {
      try {
        const img = await mainWindow.webContents.capturePage();
        const dir = path.join(__dirname, 'screenshots');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const targetPath = path.join(dir, 'real_widget_preview.png');
        fs.writeFileSync(targetPath, img.toPNG());
        log('real_widget_preview.png successfully captured: ' + targetPath);
      } catch (err) {
        log('capturePage error: ' + err.message);
      }
    }, 1200);
  };

  mainWindow.once('ready-to-show', () => {
    log('ready-to-show fired');
    showMainWindow();
  });
  mainWindow.webContents.once('did-finish-load', () => {
    log('did-finish-load fired');
    setTimeout(showMainWindow, 200);
  });
  setTimeout(showMainWindow, 1500);

  // Keep widget alive on desktop when Win+D (Show Desktop) is pressed!
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    setTimeout(() => {
      if (mainWindow.isMinimized()) mainWindow.restore();
      const curSettings = loadSettings();
      if (curSettings.alwaysOnTop) {
        mainWindow.show();
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
      } else {
        mainWindow.showInactive();
        mainWindow.setAlwaysOnTop(false);
      }
    }, 60);
  });

  const cmdFile = path.join(__dirname, 'take_screenshot_cmd.json');
  fs.watchFile(cmdFile, { interval: 300 }, async () => {
    try {
      if (!fs.existsSync(cmdFile)) return;
      const cmdData = JSON.parse(fs.readFileSync(cmdFile, 'utf-8'));
      if (!cmdData || !cmdData.id) return;
      if (cmdData.js) {
        await mainWindow.webContents.executeJavaScript(cmdData.js);
      }
      await new Promise(r => setTimeout(r, cmdData.waitMs || 500));
      const img = await mainWindow.webContents.capturePage();
      const outDir = path.join(__dirname, 'screenshots');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const outPath = cmdData.outPath || path.join(outDir, `${cmdData.id}.png`);
      fs.writeFileSync(outPath, img.toPNG());
      log(`Screenshot captured for cmd ${cmdData.id}: ${outPath}`);
    } catch (e) {
      log(`cmdFile error: ${e.message}`);
    }
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });
}

function createTray() {
  let trayImage = null;
  try {
    const icoPath = path.join(__dirname, 'assets', 'icon.ico');
    const pngPath = path.join(__dirname, 'assets', 'icon-32.png');
    if (fs.existsSync(icoPath)) {
      trayImage = nativeImage.createFromPath(icoPath);
    }
    if (!trayImage || trayImage.isEmpty()) {
      trayImage = nativeImage.createFromPath(pngPath);
    }
  } catch (e) {
    log('Error loading tray icon:', e);
  }

  try {
    tray = new Tray(trayImage || path.join(__dirname, 'assets', 'icon-32.png'));
  } catch (err) {
    log('Tray creation failed:', err);
    try {
      tray = new Tray(path.join(__dirname, 'assets', 'icon.png'));
    } catch (e2) {}
  }
  if (tray) {
    tray.setToolTip('桌面文件夹格子 (Desktop Folder Grid)');
  }

  const toggleVisibility = () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      const curSettings = loadSettings();
      if (curSettings.alwaysOnTop) {
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
      } else {
        mainWindow.setAlwaysOnTop(false);
      }
      mainWindow.focus();
    }
  };

  const updateContextMenu = () => {
    const settings = loadSettings();
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示/隐藏格子',
        click: toggleVisibility
      },
      {
        label: '置顶显示',
        type: 'checkbox',
        checked: !!settings.alwaysOnTop,
        click: (menuItem) => {
          settings.alwaysOnTop = menuItem.checked;
          saveSettings(settings);
          if (mainWindow) {
            if (menuItem.checked) {
              mainWindow.setAlwaysOnTop(true, 'screen-saver');
            } else {
              mainWindow.setAlwaysOnTop(false);
            }
          }
          if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send('settings-changed', settings);
          }
        }
      },
      {
        label: '🚀 开机自动启动',
        type: 'checkbox',
        checked: settings.autoStart !== false,
        click: (menuItem) => {
          settings.autoStart = menuItem.checked;
          saveSettings(settings);
          applyAutoStart(menuItem.checked);
          if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send('settings-changed', settings);
          }
        }
      },
      { type: 'separator' },
      {
        label: '添加应用快捷方式...',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.webContents.send('trigger-add-app');
          }
        }
      },
      {
        label: '重置为初始格子布局',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('reset-default-data');
          }
        }
      },
      { type: 'separator' },
      {
        label: '退出程序',
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);
    tray.setContextMenu(contextMenu);
  };

  updateTrayMenu = updateContextMenu;
  updateContextMenu();

  tray.on('click', toggleVisibility);
  tray.on('double-click', toggleVisibility);
}

// IPC Handlers
ipcMain.handle('get-data', async () => {
  const data = loadData();
  if (data && Array.isArray(data) && data.length > 0) {
    return data;
  }
  return null;
});

ipcMain.handle('save-data', async (event, data) => {
  return saveData(data);
});

ipcMain.handle('get-settings', async () => {
  return loadSettings();
});

ipcMain.handle('save-settings', async (event, newSettings) => {
  saveSettings(newSettings);
  if (typeof newSettings.autoStart === 'boolean') {
    applyAutoStart(newSettings.autoStart);
  }
  if (mainWindow && typeof newSettings.alwaysOnTop === 'boolean') {
    if (newSettings.alwaysOnTop) {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    } else {
      mainWindow.setAlwaysOnTop(false);
    }
  }
  if (typeof updateTrayMenu === 'function') {
    updateTrayMenu();
  }
  return { success: true };
});

ipcMain.handle('get-auto-start', async () => {
  const settings = loadSettings();
  if (typeof settings.autoStart === 'boolean') {
    return settings.autoStart;
  }
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.handle('set-auto-start', async (event, enabled) => {
  const settings = loadSettings();
  settings.autoStart = !!enabled;
  saveSettings(settings);
  applyAutoStart(settings.autoStart);
  if (typeof updateTrayMenu === 'function') {
    updateTrayMenu();
  }
  return { success: true, autoStart: settings.autoStart };
});

ipcMain.handle('get-wallpaper-palette', async () => {
  return getWallpaperPaletteNative();
});

ipcMain.handle('extract-icon', async (event, targetPath) => {
  try {
    if (!targetPath) return null;

    // 1. Try high-definition native Windows Shell extractor first!
    const nativeData = await extractIconNative(targetPath);
    if (nativeData) {
      log('extractIconNative success for:', targetPath);
      return nativeData;
    }

    // 2. Fallback to shell.readShortcutLink + app.getFileIcon
    let icon = null;
    if (targetPath.toLowerCase().endsWith('.lnk')) {
      try {
        const link = shell.readShortcutLink(targetPath);
        if (link.icon && fs.existsSync(link.icon)) {
          icon = await app.getFileIcon(link.icon, { size: 'large' });
        }
        if (!icon && link.target && fs.existsSync(link.target)) {
          icon = await app.getFileIcon(link.target, { size: 'large' });
        }
      } catch (err) {}
    }

    if (!icon && fs.existsSync(targetPath)) {
      try {
        icon = await app.getFileIcon(targetPath, { size: 'large' });
      } catch (e) {}
    }

    if (icon) {
      return icon.toDataURL();
    }
    return null;
  } catch (err) {
    console.error('Failed to extract icon for:', targetPath, err);
    return null;
  }
});

ipcMain.handle('refresh-item-icons', async (event, items) => {
  if (!items || !Array.isArray(items)) return items;

  async function processItem(item) {
    if (!item) return item;
    if (item.type === 'folder' && Array.isArray(item.items)) {
      for (let i = 0; i < item.items.length; i++) {
        item.items[i] = await processItem(item.items[i]);
      }
    } else if (item.type === 'app' && item.action) {
      try {
        const nativeIcon = await extractIconNative(item.action);
        if (nativeIcon) {
          item.icon = nativeIcon;
          log('refresh-item-icons native ok for:', item.name);
        } else {
          let icon = null;
          const actionPath = item.action;
          if (actionPath.toLowerCase().endsWith('.lnk')) {
            try {
              const link = shell.readShortcutLink(actionPath);
              if (link.icon && fs.existsSync(link.icon)) {
                icon = await app.getFileIcon(link.icon, { size: 'large' });
              }
              if (!icon && link.target && fs.existsSync(link.target)) {
                icon = await app.getFileIcon(link.target, { size: 'large' });
              }
            } catch (e) {}
          }
          if (!icon && fs.existsSync(actionPath)) {
            try {
              icon = await app.getFileIcon(actionPath, { size: 'large' });
            } catch (e) {}
          }
          if (icon) {
            item.icon = icon.toDataURL();
          }
        }
      } catch (err) {}
    }
    return item;
  }

  for (let i = 0; i < items.length; i++) {
    items[i] = await processItem(items[i]);
  }
  saveData(items);
  return items;
});

ipcMain.handle('pick-file', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择要添加的应用或文件',
    properties: ['openFile'],
    filters: [
      { name: '所有可执行程序与快捷方式', extensions: ['lnk', 'exe', 'url', 'bat', 'cmd'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return null;
  }

  const selectedPath = result.filePaths[0];
  const basename = path.basename(selectedPath, path.extname(selectedPath));
  let iconDataUrl = null;
  try {
    const icon = await app.getFileIcon(selectedPath, { size: 'large' });
    iconDataUrl = icon.toDataURL();
  } catch (e) {
    console.error('Icon extraction failed:', e);
  }

  return {
    path: selectedPath,
    name: basename,
    icon: iconDataUrl
  };
});

ipcMain.handle('launch-app', async (event, appItem) => {
  try {
    if (!appItem || !appItem.action) return { success: false, error: 'Empty action' };
    const action = appItem.action.trim();

    if (action.startsWith('http://') || action.startsWith('https://')) {
      await shell.openExternal(action);
      return { success: true };
    }

    // Check if it's a known Windows system app command
    const systemCommands = ['calc', 'calc.exe', 'mspaint', 'mspaint.exe', 'notepad', 'notepad.exe', 'snippingtool', 'explorer'];
    const isCmd = systemCommands.includes(action.toLowerCase());

    if (isCmd) {
      exec(`start ${action}`);
      return { success: true };
    }

    // Try opening as file/path
    if (fs.existsSync(action)) {
      const err = await shell.openPath(action);
      if (err) {
        // Fallback to spawn
        spawn(action, [], { detached: true, shell: true });
      }
      return { success: true };
    } else {
      // Try executing via cmd
      exec(`start "" "${action}"`);
      return { success: true };
    }
  } catch (err) {
    console.error('Launch failed:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.on('window-hide', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.on('window-quit', () => {
  isQuitting = true;
  app.quit();
});

let preModalBounds = null;

ipcMain.handle('expand-canvas', async (event, customSize) => {
  if (!mainWindow) return null;
  const curBounds = mainWindow.getBounds();
  const primaryDisplay = screen.getDisplayNearestPoint({ x: curBounds.x, y: curBounds.y }) || screen.getPrimaryDisplay();
  const { x: workX, y: workY, width: screenWidth, height: screenHeight } = primaryDisplay.workArea;
  const targetW = customSize?.width || 640;
  const targetH = customSize?.height || 640;

  // Symmetrical horizontal alignment based on the center of the current collapsed widget
  const centerX = curBounds.x + curBounds.width / 2;
  let newX = Math.round(centerX - targetW / 2);
  newX = Math.max(workX + 10, Math.min(newX, workX + screenWidth - targetW - 10));

  // If docked near top, keep docked at top
  let newY = curBounds.y;
  if (curBounds.y <= workY + 40) {
    newY = workY + 10;
  } else {
    newY = Math.max(workY + 10, Math.min(curBounds.y, workY + screenHeight - targetH - 10));
  }

  mainWindow.setBounds({ x: newX, y: newY, width: targetW, height: targetH }, true);
  const settings = loadSettings();
  settings.isCanvasExpanded = true;
  saveSettings(settings);
  isStealthModeActive = false;
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('stealth-state', false);
  }
  return { x: newX, y: newY, width: targetW, height: targetH };
});

ipcMain.handle('collapse-canvas', async (event, customSize) => {
  if (!mainWindow) return null;
  const curBounds = mainWindow.getBounds();
  const settings = loadSettings();
  settings.isCanvasExpanded = false;
  saveSettings(settings);
  const dim = customSize || getWidgetDimensions(settings.widgetStyle || 'glass');

  const primaryDisplay = screen.getDisplayNearestPoint({ x: curBounds.x, y: curBounds.y }) || screen.getPrimaryDisplay();
  const { x: workX, width: screenWidth } = primaryDisplay.workArea;

  // Symmetrical horizontal alignment: keep collapsed widget centered where canvas was centered
  const centerX = curBounds.x + curBounds.width / 2;
  let collapsedX = Math.round(centerX - dim.width / 2);
  collapsedX = Math.max(workX + 10, Math.min(collapsedX, workX + screenWidth - dim.width - 10));

  mainWindow.setBounds({ x: collapsedX, y: curBounds.y, width: dim.width, height: dim.height }, true);
  lastNearTime = Date.now();
  return { x: collapsedX, y: curBounds.y, width: dim.width, height: dim.height };
});

ipcMain.handle('set-widget-style', async (event, style) => {
  const settings = loadSettings();
  settings.widgetStyle = style;
  saveSettings(settings);
  const dim = getWidgetDimensions(style);
  if (mainWindow && !settings.isCanvasExpanded) {
    const curBounds = mainWindow.getBounds();
    const primaryDisplay = screen.getDisplayNearestPoint({ x: curBounds.x, y: curBounds.y }) || screen.getPrimaryDisplay();
    const { x: workX, width: screenWidth } = primaryDisplay.workArea;
    const centerX = curBounds.x + curBounds.width / 2;
    let newX = Math.round(centerX - dim.width / 2);
    newX = Math.max(workX + 10, Math.min(newX, workX + screenWidth - dim.width - 10));
    mainWindow.setBounds({ x: newX, y: curBounds.y, width: dim.width, height: dim.height }, true);
    lastNearTime = Date.now();
  }
  return { success: true, dimensions: dim };
});

ipcMain.handle('expand-window-for-modal', async (event, isExpanded) => {
  if (!mainWindow) return;
  const currentBounds = mainWindow.getBounds();
  if (isExpanded) {
    if (!preModalBounds) {
      preModalBounds = { ...currentBounds };
    }
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    const targetW = Math.min(Math.max(currentBounds.width, 960), screenWidth - 40);
    const targetH = Math.min(520, screenHeight - 60);
    const newX = Math.max(20, Math.round((screenWidth - targetW) / 2));
    const newY = Math.max(30, Math.round((screenHeight - targetH) / 2));

    mainWindow.setBounds({
      x: newX,
      y: newY,
      width: targetW,
      height: targetH
    }, true);
  } else {
    if (preModalBounds) {
      mainWindow.setBounds(preModalBounds, true);
      preModalBounds = null;
    }
  }
});

ipcMain.handle('capture-preview', async (event, filename = 'window_preview.png') => {
  if (!mainWindow) return null;
  const image = await mainWindow.webContents.capturePage();
  const dir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const previewPath = path.join(dir, filename);
  fs.writeFileSync(previewPath, image.toPNG());
  return previewPath;
});

ipcMain.handle('set-window-size', async (event, { width, height }) => {
  if (mainWindow) {
    const [curW, curH] = mainWindow.getSize();
    mainWindow.setSize(width || curW, height || curH);
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();
  startProximityTracker();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep running in tray unless explicit quit
  }
});
