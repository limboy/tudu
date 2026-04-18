import { app, BrowserWindow, screen } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

interface WindowState {
  x?: number
  y?: number
  width: number
  height: number
  isMaximized?: boolean
}

export function manageWindowState(windowName: string, defaultWidth: number, defaultHeight: number) {
  const userDataPath = app.getPath('userData')
  const stateFilePath = path.join(userDataPath, `window-state-${windowName}.json`)

  let state: WindowState = {
    width: defaultWidth,
    height: defaultHeight,
  }

  // Load existing state
  try {
    if (fs.existsSync(stateFilePath)) {
      state = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'))
    }
  } catch (err) {
    console.error('Failed to load window state:', err)
  }

  function saveState(win: BrowserWindow) {
    try {
      const isMaximized = win.isMaximized()
      const bounds = isMaximized ? win.getNormalBounds() : win.getBounds()
      state = {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        isMaximized,
      }
      fs.writeFileSync(stateFilePath, JSON.stringify(state), 'utf8')
    } catch (err) {
      console.error('Failed to save window state:', err)
    }
  }

  function isValid(s: WindowState): boolean {
    if (s.x === undefined || s.y === undefined) return true // First run
    
    // Ensure window is within some display's bounds
    const displays = screen.getAllDisplays()
    return displays.some(display => {
      return (
        s.x! >= display.bounds.x &&
        s.y! >= display.bounds.y &&
        s.x! + s.width <= display.bounds.x + display.bounds.width &&
        s.y! + s.height <= display.bounds.y + display.bounds.height
      )
    })
  }

  // If the saved state is not valid (e.g. screen disconnected), reset to defaults
  if (!isValid(state)) {
    state = {
      width: defaultWidth,
      height: defaultHeight,
    }
  }

  return {
    state,
    track(win: BrowserWindow) {
      let timeout: NodeJS.Timeout
      const debouncedSave = () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => saveState(win), 500)
      }

      win.on('resize', debouncedSave)
      win.on('move', debouncedSave)
      win.on('close', () => saveState(win))
    }
  }
}
