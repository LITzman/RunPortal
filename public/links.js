const { app } = require('electron')
const path = require('path')
const storage = require('electron-json-storage')

// Local links settings
const userSettingsPath = path.join(app.getPath('userData'), 'linksSettings')
storage.setDataPath(userSettingsPath)

const emptyArray = []

module.exports = class linksStorage {
    constructor() {
        storage.setDataPath(userSettingsPath)
        
        // First run
        storage.get('links', (error) => {
            if (error) {
                storage.setSync('links', emptyArray)
            }
        })
    }
    
    getLinks() {
        return storage.getSync('links')
    }

    addLink(newLink) {
        var links = this.getLinks()
        
        if (links.some((link) => {
            if (link.linkPath == newLink.linkPath && link.appName == newLink.appName && link.shortcutText == newLink.shortcutText) {
                return true
            } else {
                return false
            }}))
            {
            return
        }
        links.push(newLink)
        storage.setSync('links', links)
    }
   
    removeLink(shortcut) {
        var links = this.getLinks()
        storage.setSync('links', links.filter(link => link.shortcutText !== shortcut))
    }
    
    modifyLink(oldLink, newLink) {
        var links = this.getLinks()
        if (links.includes(newLink)) {
            return
        }
        storage.setSync('links', links.map(link => link.shortcutText !== oldLink.shortcutText ? link : newLink))
    }
}