import React, { useEffect } from 'react'
import { Button, LargeTitle, Body2, Skeleton, SkeletonItem, FluentProvider } from '@fluentui/react-components'
import { customDarkTheme, customLightTheme, useThemeChange } from './theme'
import { ipcRenderer, linksData, refreshLinks } from './ipc'

interface LinkButtonContainerProps {
    links: {
        appName: string,
        linkPath: string,
        shortcutText: string
    }[]
}

const LinkButtonContainer: React.FC<LinkButtonContainerProps> = ({ links }) => {

    interface LinkButtonProps {
        shortcutText: string,
        appName: string,
        linkPath: string
    }
    
    const LinkButton: React.FC<LinkButtonProps> = ({ shortcutText, appName, linkPath }) => {    

        // To open the links on button press
        const clickHandler = () => {
            ipcRenderer.send("button-press", linkPath)
        }
        return (
            <div>
                <Button 
                    shape='rounded'
                    size='large'
                    appearance='subtle' // Pretty!
                    onClick={clickHandler}
                    
                    >
                    <div style={{marginTop: '12px', marginBottom: '12px'}}>
                        <LargeTitle>{shortcutText}</LargeTitle>
                    </div>
                </Button>
            </div>
        )
    }
    
    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px', textAlign: 'center'}}>
            {links.map((link, index) => (
            <div key={link.appName}>
                <div style={{marginRight: '20px', marginTop: '3px'}}>
                    <LinkButton shortcutText={link.shortcutText} appName={link.appName} linkPath={link.linkPath}/>
                </div>
                <div style={{marginRight: '20px', marginTop: '10px'}}>
                    <Body2>{link.appName}</Body2>   
                </div>
            </div>
            
            ))}
        </div>
    )
}

// Just something nice to liven up the window
const BottomBar: React.FC = () => {
    return (
        <Skeleton appearance='opaque' style={{marginBottom: '10', marginLeft: '10', marginRight: '10'}}>
            <SkeletonItem />
        </Skeleton>
    )
}

export const App: React.FC = () => {

    useEffect(() => {
        refreshLinks()
    })

    const isDarkTheme = useThemeChange()
    return (
        <FluentProvider theme={isDarkTheme ? customDarkTheme : customLightTheme}
        onLoad={refreshLinks}>
            <LinkButtonContainer links={linksData} />
            <BottomBar/>
        </FluentProvider>
    )
}