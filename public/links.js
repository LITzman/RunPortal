const { app } = require('electron')
const path = require('path')
const storage = require('electron-json-storage')
const { error } = require('console')

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
                storage.set('links', emptyArray, (error) => {
                    if (error) throw error()
                })
            }
        })
    }
    
    getLinks() {
        return storage.getSync('links')
    }

    addLink(link) {
        var links = this.getLinks()
        links.push(link)
        storage.set('links', links, (error) => {
            if (error) throw error()
        })
    }
   
    removeLink(shortcut) {
        var links = this.getLinks()
        storage.set('links', links.filter(link => link.shortcutText !== shortcut), (error) => {
            if (error) throw error
        })
    }
    
    modifyLink(oldLink, newLink) {
        var links = this.getLinks()
        storage.set('links', links.map(link => link.shortcutText !== oldLink.shortcutText ? link : newLink), (error) => {
            if (error) throw error
        })
        
    }
}