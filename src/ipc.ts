export const ipcRenderer = (window as any).ipcRenderer
export let linksData = await ipcRenderer.invoke('get-links')

export const refreshLinks = async () => {
    linksData = await ipcRenderer.invoke('get-links')
}

export const getLinkToModify = async () => {
    return ipcRenderer.invoke('get-link-to-modify')
}

export const getEmptyLink = () => {
    return {
        appName: '',
        linkPath: '',
        shortcutText: ''
    }
}