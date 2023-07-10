const { app, BrowserWindow, globalShortcut, shell, Menu, Tray, nativeTheme } = require('electron')
const { ipcMain } = require('electron/main');
const path = require('path')
const url = require('url')
const linksStorage = require('./links')

// Local links settings
const linksStorageClient = new linksStorage()
let linksData = []

const refreshLinks = () => {
    linksData = linksStorageClient.getLinks()
}

// Give the UI the links list when it wants it
ipcMain.handle('get-links', (event, ...args) => {
    return linksStorageClient.getLinks()
})

// Initially determine dark theme by electron
let getIcon = () => {
    let icon = nativeTheme.shouldUseDarkColors ? 'dark_icon.png' : 'light_icon.png'
    return path.join(__dirname, icon)
}
var tray = null

// Get theme updates from react
ipcMain.on('change-theme', (_, isDark) => {

    // Update icon accordingly
    getIcon = () => { return path.join(__dirname, isDark ? 'dark_icon.png' : 'light_icon.png') }
    BrowserWindow.getAllWindows().forEach((window) => {
        window.setIcon(getIcon())
    })
    if (tray) { 
        tray.setImage(getIcon())
    }
})

const clearIcon = path.join(__dirname, 'clear_icon.png')

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

// FIXME - make something that will work packaged
const startUrl = process.env.ELECTRON_START_URL || "http://localhost:3000"

const getRoute = (route) => {
    const url = new URL(startUrl)
    url.pathname = route
    return url.href
}

class clientWindow extends BrowserWindow {
    // Wrapper class to manage window state
    constructor(options) {
        super(options)
        this.windowShown = false
    }
    updateWindowBounds() {
        this.setBounds({ width: (linksData.length * 100) + 250})
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

            refreshLinks()

            // Register link shortcuts
            linksData.forEach((link) => {

                var openLinkCallback = (() => {
                    if (this.windowShown && this.isFocused()) {
                        this.executeLink(link.linkPath)
                    }
                }).bind(this)
                globalShortcut.register(link.shortcutText, openLinkCallback)
            })
            
            // Register escape callback
            const escapeCallback = (() => {
                this.hideWindow()
            }).bind(this)
            globalShortcut.register('esc', escapeCallback)

            this.updateWindowBounds()
            this.loadURL(startUrl)
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
        backgroundMaterial: 'mica',
        show: false,
    })
    dialogWindow.once('ready-to-show', () => {
        dialogWindow.show()
    })

    return dialogWindow
}

const modifyLinkDialog = () => {
    const modifyLinkWindow = openDialogWindow('Modify', 400, 500)
    modifyLinkWindow.once('ready-to-show', () => {
        modifyLinkWindow.show()
    })

    dialogOpen = true
    
    // Handle key add requests
    ipcMain.on('modify-link', (_, [oldLink, NewLink]) => {
        linksStorageClient.modifyLink(oldLink, NewLink)

        // Update everything open after we modified a link
        refreshWindows()
    })

    modifyLinkWindow.on('closed', () => {
        dialogOpen = false
    })

    modifyLinkWindow.loadURL(getRoute('/Modify'))
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

        // Update everything open after we added a link
        refreshWindows()
    })

    addLinkWindow.on('closed', () => {
        dialogOpen = false
    })

    addLinkWindow.loadURL(getRoute('/Add'))
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
            editWindow.setContentBounds(editWindow.getContentBounds())
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

        editWindow.on('closed', () => {
            modifyDialogOpen = false
        })

        editWindow.loadURL(getRoute('/Edit'))
    }
    
}

function clientInit() {
    
    // Get screen dimensions for window scaling 
    const {screen} = require('electron')
    let primaryDisplay = screen.getPrimaryDisplay()
    const screenHeight = primaryDisplay.workAreaSize.height
    const screenWidth = primaryDisplay.workAreaSize.width
  
    // Scale window to the number of buttons.
    refreshLinks()
    const mainWindowWidth = (linksData.length * 100) + 250
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
        backgroundMaterial: 'mica',
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

    mainWindow.loadURL(startUrl)
}

app.whenReady().then(clientInit)
app.on('activate', () => {
    clientInit()
})