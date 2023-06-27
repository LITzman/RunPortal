import React from 'react'
import { Button, LargeTitle, Body2, Skeleton, SkeletonItem, FluentProvider } from '@fluentui/react-components'
import { customDarkTheme } from './theme'

const ipcRenderer = (window as any).ipcRenderer
const linksData = await ipcRenderer.invoke('get-links')

interface LinkButtonContainerProps {
    links: {
        appName: string,
        linkPath: string,
        shortcutText: string
    }[]
}

const LinkButtonContainer: React.FC<LinkButtonContainerProps> = function ({ links }) {

    interface LinkButtonProps {
        shortcutText: string,
        appName: string,
        linkPath: string
    }
    
    const LinkButton: React.FC<LinkButtonProps> = function ({ shortcutText, appName, linkPath }) {    

        // To open the links on button press
        const clickHandler = function() {
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
            <div>
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
const BottomBar: React.FC = function () {
    return (
        <Skeleton appearance='opaque' style={{marginBottom: '10', marginLeft: '10', marginRight: '10'}}>
            <SkeletonItem />
        </Skeleton>
    )
}

const App: React.FC = function () {
    return (
        <FluentProvider theme={customDarkTheme}>
            <LinkButtonContainer links={linksData.links} />
            <BottomBar/>
        </FluentProvider>
    )

}

export {
    App
}
