export const ipcRenderer = (window as any).ipcRenderer
export let linksData = await ipcRenderer.invoke('get-links')

export const refreshLinks = async () => {
    linksData = await ipcRenderer.invoke('get-links')
}