const { app, BrowserWindow, globalShortcut, shell, Menu, Tray, nativeTheme } = require('electron')
const { ipcMain } = require('electron/main');
const path = require('path')
const os = require('os')
const { createFileRoute, createURLRoute } = require('electron-router-dom')
import { isPackaged } from 'electron-is-packaged';

// Limit to one app instance
if (!app.requestSingleInstanceLock({ running: true})) {
    app.quit()
}

const linksStorage = require('./links')
// Local links settings
const linksStorageClient = new linksStorage()
let linksData = []

const refreshLinks = () => {
    linksData = linksStorageClient.getLinks()
}

if (isPackaged)
{
    app.setLoginItemSettings({
        openAtLogin: true,
        path: app.getPath('exe'),
        
    })
}

// Routing
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
process.env.DIST = path.join(__dirname, '../dist')
const loadRoute = (window, route) => {
    if (VITE_DEV_SERVER_URL) {
        window.loadURL(createURLRoute(VITE_DEV_SERVER_URL, route))
    } else {
        window.loadFile(...createFileRoute(path.join(process.env.DIST, 'index.html'), route))
    }
}

process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')
const getAsset = (name) => {
    return path.join(process.env.PUBLIC, name)
}

// Give the UI the links list when it wants it
ipcMain.handle('get-links', (event, ...args) => {
    return linksStorageClient.getLinks()
})

// Initially determine dark theme by electron
let getIcon = () => {
    let icon = nativeTheme.shouldUseDarkColors ? getAsset('dark_icon.png') : getAsset('light_icon.png')
    return icon
}
var tray = null

const materialChooser = () => {
    // For Windows 11
    if (Number(os.release().split('.').join('')) >= 1022000) {
        return 'mica'
    
    // For Windows 10
    } else {
        return 'acrylic'
    }
}

ipcMain.handle('get-material', (event, ...args) => {
    return materialChooser()
})

// Get theme updates from react
ipcMain.on('change-theme', (_, isDark) => {

    // Update icon accordingly
    getIcon = () => { return isDark ? getAsset('dark_icon.png') : getAsset('light_icon.png') }
    BrowserWindow.getAllWindows().forEach((window) => {
        window.setIcon(getIcon())
    })
    if (tray) { 
        tray.setImage(getIcon())
    }
})

const clearIcon = getAsset('clear_icon.png')

var screenHeight, screenWidth

const refreshWindows = () => {
    refreshLinks()
    BrowserWindow.getAllWindows().forEach((window) => {
        window.reload()
        window.emit('reloaded')
    })
}

// Give the UI the correct link which needs to be modified
let linkToModify = null
let dialogOpen = false
let modifyDialogOpen = false
ipcMain.handle('get-link-to-modify', (event, ...args) => {
    return linkToModify
})

class clientWindow extends BrowserWindow {
    // Wrapper class to manage window state
    constructor(options) {
        super(options)
        this.windowShown = false
        this.registerHotkey()
    }

    updateWindowBounds() {
        if (linksData.length > 0) {
            const bounds = this.getBounds()
            this.setBounds({ 
                // Electron will violently rape me if it will recieve a float argument
                x: Math.round(screenWidth / 2 - bounds.width / 2),
                y: Math.round(screenHeight / 2 - bounds.height / 2 - (bounds.height / 2)),
                width: (linksData.length * 100) + 250
            })
        }
    }

    registerHotkey() {
        // Register the WINKEY + F combo to open the window
        var openCallback = (() => {
            this.showWindow()
        }).bind(this)
        globalShortcut.register('CommandOrControl+Alt+F', openCallback)
    }

    hideWindow() {
        if (this.windowShown) {
            // Unregister the open window shortcuts
            globalShortcut.unregisterAll()

            this.registerHotkey()

            this.hide()
            this.windowShown = false
        }
    }

    showWindow() {
        if (!this.windowShown) {
            // Unregister the close window shortcuts
            globalShortcut.unregisterAll()

            refreshLinks()
            
            // Register escape callback
            const escapeCallback = (() => {
                this.hideWindow()
            }).bind(this)
            globalShortcut.register('esc', escapeCallback)

            this.updateWindowBounds()
            loadRoute(this, 'main')
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

const openDialogWindow = (dialog, width, height) => {
    let dialogWindow = new BrowserWindow({
        width: width,
        height: height,
        resizable: true,
        minimizable: false,
        maximizable: false, 
        movable: true,
        closable: true,
        // For react->electron IPC
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        // Window styling
        icon: getIcon(),
        skipTaskbar: false,
        titleBarStyle: 'default',
        title: dialog + ' Shortcut',
        autoHideMenuBar: true,
        transparent: true,
        backgroundMaterial: materialChooser(),
        show: false,
    })
    dialogWindow.once('ready-to-show', () => {
        dialogWindow.show()
    })

    // Register escape callback
    const escapeCallback = (() => {
        BrowserWindow.getAllWindows().forEach((window) => {
            try {
                window.close()
            } catch {}
        })
        globalShortcut.unregister('esc', escapeCallback)
    })
    globalShortcut.register('esc', escapeCallback)

    return dialogWindow
}

const modifyLinkDialog = () => {
    const modifyLinkWindow = openDialogWindow('Modify', 400, 500)
    modifyLinkWindow.once('ready-to-show', () => {
        modifyLinkWindow.show()
    })

    dialogOpen = true
    
    // Handle key modify requests
    ipcMain.on('modify-link', (_, [oldLink, NewLink]) => {
        linksStorageClient.modifyLink(oldLink, NewLink)
        refreshLinks()
    
        // Update everything open after we modified a link
        refreshWindows()
    })

    modifyLinkWindow.updateWindow = () => {
        refreshLinks()
    }

    modifyLinkWindow.on('closed', () => {
        dialogOpen = false
    })

    loadRoute(modifyLinkWindow, 'Modify')
}    

const addLinkDialog = () => {
    const addLinkWindow = openDialogWindow('Add', 400, 500)
    addLinkWindow.once('ready-to-show', () => {
        addLinkWindow.show()
    })

    dialogOpen = true

    // Handle key add requests
    ipcMain.on('add-link', (_, link) => {
        linksStorageClient.addLink(link)
        refreshLinks()

        // Update everything open after we added a link
        refreshWindows()
    })

    addLinkWindow.on('closed', () => {
        dialogOpen = false
    })

    loadRoute(addLinkWindow, 'Add')
}  

const editDialog = () => {
    if (!modifyDialogOpen) {
        const editWindow = openDialogWindow('Edit', 450, (200 + linksData.length * 53))
        modifyDialogOpen = true

        editWindow.once('ready-to-show', () => {
            editWindow.setContentBounds(editWindow.getContentBounds())
            editWindow.reload()
        })

        editWindow.on('reloaded', () => {
            editWindow.reload()
        })
        
        // Handle key add requests
        ipcMain.on('open-add-dialog', (_, __) => {
            if (!dialogOpen) {
                addLinkDialog()
            }
        })

        // Handle key remove requests
        ipcMain.on('remove-link', (_, shortcut) => {
            linksStorageClient.removeLink(shortcut)
            refreshLinks()
            refreshWindows()
        })

        // Handle key modify requests
        ipcMain.on('open-modify-dialog', (_, shortcut) => {

            // Shouldn't be needed but won't work without it
            refreshLinks()

            linkToModify = linksData.filter(link => link.shortcutText === shortcut)[0]
            if (!dialogOpen) {
                modifyLinkDialog()
            }
        })

        const interval = setInterval(() => {
            editWindow.setResizable(true)
            editWindow.setSize( 450, (200 + linksData.length * 53))
            editWindow.setResizable(false)
        }, 100)

        editWindow.on('closed', () => {
            modifyDialogOpen = false
            clearInterval(interval)
        })
        loadRoute(editWindow, 'Edit')
    }
    
}

function clientInit() {
    
    // Get screen dimensions for window scaling 
    const {screen} = require('electron')
    let primaryDisplay = screen.getPrimaryDisplay()
    screenHeight, screenWidth = undefined

    const updateScreenMetrics = () => {
        primaryDisplay = screen.getPrimaryDisplay()
        screenHeight = primaryDisplay.workAreaSize.height
        screenWidth = primaryDisplay.workAreaSize.width
    }
    updateScreenMetrics()

    // Apparently comupter monitors grow sometimes 
    screen.on('display-metrics-changed', updateScreenMetrics)
  
    // Scale window to the number of buttons.
    refreshLinks()
    var mainWindowWidth = 900
    if (linksData.length > 0) {
        mainWindowWidth = (linksData.length * 100) + 250
    }
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
        // For react<->electron IPC
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        // Window styling
        icon: clearIcon,
        skipTaskbar: true,
        titleBarStyle: 'default',
        title: '',
        autoHideMenuBar: true,
        transparent: true,
        backgroundMaterial: materialChooser(),
        show: false
    })
    
    // Tray icon!
    tray = new Tray(getIcon())
    tray.on('click', () => {
        if (mainWindow) {
            mainWindow.showWindow()
        }
    })
    tray.setToolTip(app.getName())

    // Tray Menu!
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Show RunPortal', click: () => { mainWindow.showWindow() }},
        {label: 'Edit Shortcuts', click: editDialog},
        {label: 'Terminate RunPortal', click: () => { app.exit(1) }},
        
    ])
    tray.setContextMenu(contextMenu)
    
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

    loadRoute(mainWindow, 'main')
}

app.whenReady().then(clientInit)
app.on('activate', () => {
    clientInit()
})