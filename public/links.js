const { app } = require('electron')
const path = require('path')
const storage = require('electron-json-storage')

// Local links settings
const userSettingsPath = path.join(app.getPath('userData'), 'linksSettings')
storage.setDataPath(userSettingsPath)

module.exports = class linksStorage {
    constructor() {
        storage.setDataPath(userSettingsPath)
    }
    
    getLinks() {
        return storage.getSync('links')
    }

    addLink(name, path, shortcut) {
        var links = this.getLinks()
        links.push({
            appName: name,
            linkPath: path,
            shortcutText: shortcut
        })
        storage.set('links', links, (error) => {
            if (error) throw error()
        })
    }
   
    removeLink(shortcut) {
        console.log(shortcut)
        var links = this.getLinks()
        console.log(links.filter(link => link.shortcutText !== shortcut))
        storage.set('links', links.filter(link => link.shortcutText !== shortcut), (error) => {
            if (error) throw error
        })
    }
}