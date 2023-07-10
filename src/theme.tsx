import { useEffect, useState } from 'react'
import { Theme, webDarkTheme, webLightTheme } from '@fluentui/react-components'
import { ipcRenderer } from './ipc';

// Helper function for generating transparent colors!
const addAlpha = (color: string, alpha: number) => {
    return color + Math.round(alpha * 255).toString(16)
}

// A customized theme with my own personal color preferences.
const customDarkTheme: Theme = {
    ...webDarkTheme,
    colorSubtleBackground: addAlpha(webDarkTheme.colorSubtleBackgroundHover, 0.5),
    colorSubtleBackgroundHover: webDarkTheme.colorNeutralForegroundInverted,
    colorNeutralForeground2: webDarkTheme.colorNeutralForeground2Hover,
    colorNeutralForeground2Hover: webDarkTheme.colorNeutralForeground2,
    colorNeutralBackground1: webDarkTheme.colorSubtleBackground,
};

const customLightTheme: Theme = {
    ...webLightTheme,
    colorSubtleBackground: webLightTheme.colorNeutralForegroundInverted,
    colorSubtleBackgroundHover: webLightTheme.colorSubtleBackgroundHover,
    colorNeutralForeground2: webLightTheme.colorNeutralForeground2Hover,
    colorNeutralForeground2Hover: webLightTheme.colorNeutralForeground2,
    colorNeutralBackground1: webLightTheme.colorSubtleBackground,
    colorTransparentBackground: webLightTheme.colorTransparentBackground
}


const useThemeChange = () => {
    const mediaQuery = () => window.matchMedia('(prefers-color-scheme: dark)')

    const [isDarkTheme, setDarkTheme] = useState(mediaQuery().matches)

    useEffect(() => {
        const mediaQueryResult = mediaQuery()
        mediaQueryResult.addEventListener("change", (event) => {
            ipcRenderer.send('change-theme', event.matches)
            setDarkTheme(event.matches)
        })
    }, [])

    return isDarkTheme
}

export {
    customDarkTheme,
    customLightTheme,
    useThemeChange
}