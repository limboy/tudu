import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { autoUpdater } from 'electron-updater'
import { initDatabase } from './db/index.js'
import { registerIpc } from './ipc.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null = null

function createWindow() {
  const appRoot = process.env.APP_ROOT || path.join(__dirname, '..')
  const iconPath = path.join(appRoot, 'assets/icon.png')
  const icon = nativeImage.createFromPath(iconPath)

  win = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 640,
    minHeight: 480,
    icon: icon,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 14 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(icon)
  }

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

function broadcastToAllWindows(channel: string, ...args: unknown[]) {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(channel, ...args)
  }
}

function initAutoUpdater() {
  if (!app.isPackaged) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-downloaded', (info) => {
    broadcastToAllWindows('update-ready', { version: info.version })
  })

  autoUpdater.on('error', (err) => {
    console.error('[autoUpdater]', err)
  })

  autoUpdater.checkForUpdates().catch(() => {})
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {})
  }, 6 * 60 * 60 * 1000)
}

app.whenReady().then(() => {
  initDatabase()
  registerIpc()
  createWindow()
  initAutoUpdater()

  ipcMain.handle('apply-update', () => {
    if (!app.isPackaged) return
    autoUpdater.quitAndInstall()
  })
})
