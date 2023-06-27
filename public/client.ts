const { app, BrowserWindow, globalShortcut, shell, Menu, Tray } = require('electron')
const { ipcMain } = require('electron/main');
const path = require('path')
const url = require('url')
const storage = require('electron-json-storage')

// Local links settings
const userSettingsPath = path.join(app.getPath('userData'), 'linksSettings')
storage.setDataPath(userSettingsPath)
const linksData = storage.getSync('links')

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
            var openCallback = (function () {
                this.showWindow()
            }).bind(this)
            globalShortcut.register('CommandOrControl+Alt+F', openCallback)

            this.hide()
            this.windowShown = false
        }
    }
    showWindow() {
        var self = this
        if (!this.windowShown) {
            // Unregister the close window shortcuts
            globalShortcut.unregisterAll()

            // Register link shortcuts
            linksData.links.forEach(function (link) {

                var openLinkCallback = (function() {
                    if (this.windowShown && this.isFocused()) {
                        this.executeLink(link.linkPath)
                    }
                }).bind(this)
                globalShortcut.register(link.shortcutText, openLinkCallback)
            })
            
            // Register escape callback
            var escapeCallback = (function() {
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

    // Give the UI the links list when it wants it
    ipcMain.handle('get-links', function (event, ...args) {
        return linksData
    })
    
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
        titleBarStyle: 'default',
        title: '',
        autoHideMenuBar: true,
        transparent: true,
        frameless: false,
        backgroundMaterial: 'mica',
        show: false // CHANGE
    })
    
    // Tray icon!
    var tray = new Tray(path.join(__dirname, 'ic_fluent_balloon_24_filled.png'))
    tray.on('click', function () {
        if (mainWindow) {
            mainWindow.showWindow()
        }
    })
    tray.setToolTip('Run')
    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: 'Show',
            click : mainWindow.showWindow
        }
    ]))
    
    // UI buttons can also be used to open the links
    ipcMain.on('button-press', function (event, link) {
        mainWindow.executeLink(link)
    })

    globalShortcut.register('esc', function () {
        mainWindow.hideWindow()
    })

    mainWindow.on('blur', function () {
        mainWindow.hideWindow()
    })

    mainWindow.on('minimize', function () {
        mainWindow.hideWindow()
    })
    
    app.on('window-all-closed', function () {   
        mainWindow.hideWindow()
    })

    mainWindow.loadURL(startUrl)
}

app.whenReady().then(clientInit)
app.on('activate', function () {
    if (app.getAllWindows().length === 0) {
        clientInit()
    }
})