import { Theme, webDarkTheme } from '@fluentui/react-components'



// A customized theme with my own personal color preferences.
export const customDarkTheme: Theme = {
    ...webDarkTheme,
    colorSubtleBackground: webDarkTheme.colorSubtleBackgroundHover,
    colorSubtleBackgroundHover: webDarkTheme.colorNeutralForegroundInverted,
    colorNeutralForeground2: webDarkTheme.colorNeutralForeground2Hover,
    colorNeutralForeground2Hover: webDarkTheme.colorNeutralForeground2
};
