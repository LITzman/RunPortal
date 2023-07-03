import { Theme, webDarkTheme, webLightTheme } from '@fluentui/react-components'

// A customized theme with my own personal color preferences.
const customDarkTheme: Theme = {
    ...webDarkTheme,
    colorSubtleBackground: webDarkTheme.colorSubtleBackgroundHover,
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
let i = 4
export {
    customDarkTheme,
    customLightTheme
}