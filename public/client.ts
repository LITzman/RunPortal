const { app, BrowserWindow, globalShortcut, shell, Menu, Tray, nativeTheme } = require('electron')
const { ipcMain } = require('electron/main');
const path = require('path')
const url = require('url')
const storage = require('electron-json-storage')

// Local links settings
const userSettingsPath = path.join(app.getPath('userData'), 'linksSettings')
storage.setDataPath(userSettingsPath)
const linksData = storage.getSync('links')

// Give the UI the links list when it wants it
ipcMain.handle('get-links', (event, ...args) => {
    return linksData
})

function getIcon() {
    let icon = nativeTheme.shouldUseDarkColors ? 'dark_icon.png' : 'light_icon.png'
    return path.join(__dirname, icon)
}
const clearIconPath = path.join(__dirname, 'clear_icon.png')

class clientWindow extends BrowserWindow {
    // Wrapper class to manage window state
    constructor(options) {
        super(options)
        this.windowShown = false
    }
    hideWindow() {
        if (this.windowShown) {
            // Unregister the open window shortcuts
            globalShortcut.unregisterAll()

            // Register the WINKEY + F combo to open the window
            var openCallback = (() => {
                this.showWindow()
            }).bind(this)
            globalShortcut.register('CommandOrControl+Alt+F', openCallback)

            this.hide()
            this.windowShown = false
        }
    }
    showWindow() {
        if (!this.windowShown) {
            // Unregister the close window shortcuts
            globalShortcut.unregisterAll()

            // Register link shortcuts
            linksData.links.forEach((link) => {

                var openLinkCallback = (() => {
                    if (this.windowShown && this.isFocused()) {
                        this.executeLink(link.linkPath)
                    }
                }).bind(this)
                globalShortcut.register(link.shortcutText, openLinkCallback)
            })
            
            // Register escape callback
            var escapeCallback = (() => {
                this.hideWindow()
            }).bind(this)
            globalShortcut.register('esc', escapeCallback)

            this.show()
            this.windowShown = true
        }
    }

    // Idealy this is shell32.dll->ShellExecuteEx but this works
    executeLink(link) {
        shell.openPath(link)
        this.hideWindow()
    }
}

function clientInit() {
    
     // FIXME - make something that will work packaged
    const startUrl = process.env.ELECTRON_START_URL
    
    // Get screen dimensions for window scaling
    const {screen} = require('electron')
    let primaryDisplay = screen.getPrimaryDisplay()
    const screenHeight = primaryDisplay.workAreaSize.height
    const screenWidth = primaryDisplay.workAreaSize.width
  
    // Scale window to the number of buttons.
    const mainWindowWidth = (linksData.links.length * 100) + 250
    const mainWindowHeight = 240

    let mainWindow = new clientWindow({

        // Create the window in the center of the screen
        width: mainWindowWidth,
        height: mainWindowHeight,
        x: screenWidth / 2 - mainWindowWidth / 2,
        y: screenHeight / 2 - mainWindowHeight / 2 - (mainWindowHeight / 2),
        resizable: false,
        minimizable: false,
        maximizable: false,
        movable: false,
        closable: false,

        // For react->electron IPC
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },

        // Window styling
        icon: clearIconPath,
        skipTaskbar: true,
        titleBarStyle: 'default',
        title: '',
        autoHideMenuBar: true,
        transparent: true,
        frameless: false,
        backgroundMaterial: 'mica',
        show: false
    })
    
    // Tray icon!
    var tray = new Tray(getIcon())
    tray.on('click', () => {
        if (mainWindow) {
            mainWindow.showWindow()
        }
    })
    tray.setToolTip(app.getName())
    
    // UI buttons can also be used to open the links
    ipcMain.on('button-press', (_, link) => {
        mainWindow.executeLink(link)
    })

    // Don't show the ugly context menu
    mainWindow.on('system-context-menu', (event, _) => {
        event.preventDefault()
    })

    mainWindow.on('blur', () => {
        mainWindow.hideWindow()
    })

    mainWindow.on('minimize', () => {
        mainWindow.hideWindow()
    })
    
    app.on('window-all-closed', () => {   
        mainWindow.hideWindow()
    })

    mainWindow.loadURL(startUrl)
}

app.whenReady().then(clientInit)
app.on('activate', () => {
    if (app.getAllWindows().length === 0) {
        clientInit()
    }
})