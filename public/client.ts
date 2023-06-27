const { app, BrowserWindow, globalShortcut, shell, Menu, Tray } = require('electron')
const { ipcMain } = require('electron/main');
const path = require('path')
const url = require('url')
const linksData = require('../src/links')

let mainWindow = null
let windowShown = false
function clientInit() {

    // Functions to control window state
    function hideWindow() {

        if (windowShown) {
            // Unregister the open window shortcuts
            globalShortcut.unregisterAll()

            // Register the WINKEY + F combo to open the window
            globalShortcut.register('CommandOrControl+Alt+F', function () {
                showWindow()
            })

            mainWindow.hide()
            windowShown = false
        }
    }
    function showWindow() {
        if (!windowShown) {
            // Unregister the close window shortcuts
            globalShortcut.unregisterAll()

            // Register link shortcuts
            linksData.links.forEach(function (link) {
                globalShortcut.register(link.shortcutText, function () {
                    if (windowShown && mainWindow.isFocused()) {
                        executeLink(link.linkPath)
                    }
                    return
                })
    
                globalShortcut.register('esc', function () {
                    hideWindow()
                    return 
                })
            
            })
    
            mainWindow.show()
            windowShown = true
        }
    }

    // Idealy this is shell32.dll->ShellExecuteEx but this works
    function executeLink(link) {
        shell.openPath(link)
        hideWindow()
    }

    // Tray icon!
    tray = new Tray(path.join(__dirname, 'ic_fluent_balloon_24_filled.png'))
    tray.on('click', function () {
        if (mainWindow) {
            showWindow()
        }
    })
    tray.setToolTip('Run')
    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: 'Show',
            click : showWindow
        }
    ]))
    
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

    mainWindow = new BrowserWindow({

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
        //backgroundColor: '#292929',
        show: false // CHANGE
    })

    mainWindow.loadURL(startUrl)
    
    // UI buttons can also be used to open the links
    ipcMain.on('button-press', function (event, link) {
        executeLink(link)
    })

    globalShortcut.register('esc', function () {
        hideWindow()
    })

    mainWindow.on('blur', function () {
        hideWindow()
    })

    mainWindow.on('minimize', function () {
        hideWindow()
    })
    
    app.on('window-all-closed', function () {   
        hideWindow()
    })
}

let tray = null
app.whenReady().then(clientInit)
app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
        clientInit()
    }
})