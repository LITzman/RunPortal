import { useEffect, useState } from 'react'
import { Theme, webDarkTheme, webLightTheme } from '@fluentui/react-components'
import { ipcRenderer } from './ipc';

// Helper function for generating transparent colors!
const addAlpha = (color: string, alpha: number) => {
    return color + Math.round(alpha * 255).toString(16)
}

type customTheme = {
    dark: Theme
    light: Theme
}

const micaDarkTheme: Theme = {
    ...webDarkTheme,
    colorSubtleBackground: addAlpha(webDarkTheme.colorSubtleBackgroundHover, 0.5),
    colorSubtleBackgroundHover: webDarkTheme.colorNeutralForegroundInverted,
    colorNeutralForeground2: webDarkTheme.colorNeutralForeground2Hover,
    colorNeutralForeground2Hover: webDarkTheme.colorNeutralForeground2,
    colorNeutralBackground1: webDarkTheme.colorSubtleBackground,
};

const micaLightTheme: Theme = {
    ...webLightTheme,
    colorSubtleBackground: webLightTheme.colorNeutralForegroundInverted,
    colorSubtleBackgroundHover: webLightTheme.colorSubtleBackgroundHover,
    colorNeutralForeground2: webLightTheme.colorNeutralForeground2Hover,
    colorNeutralForeground2Hover: webLightTheme.colorNeutralForeground2,
    colorNeutralBackground1: webLightTheme.colorSubtleBackground,
    colorTransparentBackground: webLightTheme.colorTransparentBackground
}

const micaTheme: customTheme = {
    dark: micaDarkTheme,
    light: micaLightTheme
}

const acrylicDarkTheme: Theme = {
    ...webDarkTheme,
    colorSubtleBackground: webDarkTheme.colorNeutralForegroundInverted,
    colorSubtleBackgroundHover: webDarkTheme.colorSubtleBackgroundHover,
    colorNeutralForeground2: webDarkTheme.colorNeutralForeground2Hover,
    colorNeutralForeground2Hover: webDarkTheme.colorNeutralForeground2,
    colorNeutralBackground1: webDarkTheme.colorSubtleBackground
}

const acrylicLightTheme: Theme = {
    ...webLightTheme,
    colorSubtleBackground: addAlpha(webLightTheme.colorSubtleBackgroundHover, 0.5),
    colorSubtleBackgroundHover: webLightTheme.colorSubtleBackgroundHover,
    colorNeutralForeground2: webLightTheme.colorNeutralForeground2Hover,
    colorNeutralForeground2Hover: webLightTheme.colorNeutralForeground2,
    colorNeutralBackground1: webLightTheme.colorSubtleBackground,
    colorTransparentBackground: webLightTheme.colorTransparentBackground
    
}

const acrylicTheme: customTheme = {
    dark: acrylicDarkTheme,
    light: acrylicLightTheme
}

const isMica = () => {
    return ipcRenderer.invoke('get-material') === 'mica'
}

const getButtonShape= () => {
    if (isMica()) {
        return 'rounded'
    } else {
        return 'square'
    }
}

let theme: customTheme
if (isMica()) {
    theme = micaTheme
} else {
    theme = acrylicTheme
}

const getTheme = () => {
    return theme
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
    useThemeChange,
    isMica,
    getButtonShape,
    getTheme,
}