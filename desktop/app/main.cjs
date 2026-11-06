const fs = require('node:fs');
const path = require('node:path');
const { app, BrowserWindow, ipcMain, Menu } = require('electron');

const role = process.argv.includes('--kds') ? 'kds' : 'pos';
const productName = role === 'kds' ? 'Indolj KDS' : 'Indolj POS';
const terminalPath = `/${role}`;
let mainWindow;

app.setName(productName);
app.setAppUserModelId(`pk.indolj.${role}`);

const settingsPath = () => path.join(app.getPath('userData'), 'server.json');

const readServerUrl = () => {
  try {
    const config = JSON.parse(fs.readFileSync(settingsPath(), 'utf8'));
    return config.serverUrl;
  } catch (error) {
    if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) {
      console.error('[Indolj Desktop] Could not read server settings:', error);
    }
    return '';
  }
};

const normalizeServerUrl = (value) => {
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('Enter a valid server URL, for example https://erp.example.com');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Server URL must start with http:// or https://');
  }
  const isLoopback = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(url.hostname.toLowerCase());
  if (url.protocol === 'http:' && !isLoopback) {
    throw new Error('Remote servers must use HTTPS. HTTP is allowed only for localhost.');
  }
  if (url.username || url.password || url.search || url.hash || !['', '/'].includes(url.pathname)) {
    throw new Error('Enter only the server address, without a path, username, or query.');
  }
  return url.origin;
};

const settingsFileUrl = (errorMessage = '') => {
  const file = path.join(__dirname, 'server-settings.html');
  return `${require('node:url').pathToFileURL(file).href}${errorMessage ? `?error=${encodeURIComponent(errorMessage)}` : ''}`;
};

const showSettings = (errorMessage = '') => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.loadURL(settingsFileUrl(errorMessage));
  }
};

const openTerminal = async () => {
  const serverUrl = readServerUrl();
  if (!serverUrl) {
    showSettings();
    return;
  }
  try {
    const normalized = normalizeServerUrl(serverUrl);
    await mainWindow.loadURL(`${normalized}${terminalPath}`);
  } catch (error) {
    showSettings(error instanceof Error ? error.message : 'Could not open the server.');
  }
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 640,
    title: productName,
    backgroundColor: '#090a0b',
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    const serverUrl = readServerUrl();
    if (!serverUrl || targetUrl.startsWith('file://')) return;
    try {
      if (new URL(targetUrl).origin !== normalizeServerUrl(serverUrl)) event.preventDefault();
    } catch {
      event.preventDefault();
    }
  });
  mainWindow.webContents.on('did-fail-load', (_event, code, description, _url, isMainFrame) => {
    if (isMainFrame && code !== -3) showSettings(`Could not connect to server: ${description}`);
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  openTerminal();
};

ipcMain.handle('terminal:get-server-url', () => readServerUrl());
ipcMain.handle('terminal:save-server-url', async (_event, value) => {
  const serverUrl = normalizeServerUrl(String(value || ''));
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify({ serverUrl }, null, 2), 'utf8');
  await openTerminal();
  return true;
});

const menu = Menu.buildFromTemplate([
  {
    label: productName,
    submenu: [
      { label: 'Server settings…', accelerator: 'CmdOrCtrl+,', click: () => showSettings() },
      { type: 'separator' },
      { role: 'quit' },
    ],
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'togglefullscreen' },
      { type: 'separator' },
      { role: 'toggledevtools' },
    ],
  },
]);

app.whenReady().then(() => {
  Menu.setApplicationMenu(menu);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
