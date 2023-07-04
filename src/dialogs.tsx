import React from 'react'
import { Input, Label, FluentProvider } from '@fluentui/react-components'
import { customDarkTheme, customLightTheme, useThemeChange } from './theme'

const ipcRenderer = (window as any).ipcRenderer
const linksData = await ipcRenderer.invoke('get-links')

export const AddLinkDialog: React.FC = () => {

    const isDarkTheme = useThemeChange()
     return (
         <FluentProvider theme={isDarkTheme ? customDarkTheme : customLightTheme}>
            <Label>
                Application Name:
            </Label>
            <Input/>
w        </FluentProvider>
     )
 }