const { app } = require('electron')
const path = require('path')
const storage = require('electron-json-storage')

// Local links settings
const userSettingsPath = path.join(app.getPath('userData'), 'linksSettings')
storage.setDataPath(userSettingsPath)
const linksData = storage.getSync('links')

module.exports = class linksStorage {
    constructor() {
        storage.setDataPath(userSettingsPath)
    }
    
    getLinks() {
        return storage.getSync('links')
    }

    addLink(name, path, shortcut) {
        var links = this.getLinks().links
        links.push({
            appName: name,
            linkPath: path,
            shortcutText: shortcut
        })
        storage.set('links', links, (error) => {
            if (error) throw error
        })
    }
   
    removeLink(shortcut) {
        var links = this.getLinks().links
        storage.set('links', links.filter(link => link.shortcut !== shortcut), (error) => {
            if (error) throw error
        })
    }
}