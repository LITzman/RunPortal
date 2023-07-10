import React, { useEffect } from 'react'
import { Button, LargeTitle, Body2, Skeleton, SkeletonItem, FluentProvider, makeStyles } from '@fluentui/react-components'
import { customDarkTheme, customLightTheme ,useThemeChange } from './theme'
import { ipcRenderer, linksData, refreshLinks } from './ipc'

interface LinkButtonContainerProps {
    links: {
        appName: string,
        linkPath: string,
        shortcutText: string
    }[],
}

const useStyles = makeStyles({
    linkButton: {
        marginTop: '12px',
        marginBottom: '12px'
    },
    linkButtonContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '30px',
        textAlign: 'center',
    },
    linkButtonContainerButton: {
        marginRight: '10px',
        marginLeft: '10px',
        marginTop: '3px'
    },
    linkButtonContainerText: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '10px',
        textAlign: 'center'
    },
    skeleton: {
        marginBottom: '10px',
        marginLeft: '10px',
        marginRight: '10px'
    }
})


const LinkButtonContainer: React.FC<LinkButtonContainerProps> = ({ links }) => {
    
    const styles = useStyles()

    interface LinkButtonProps {
        shortcutText: string,
        appName: string,
        linkPath: string,
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
                    onClick={clickHandler}>
                    <div className={styles.linkButton}>
                        <LargeTitle>{shortcutText}</LargeTitle>
                    </div>
                </Button>
            </div>
        )
    }
    
    return (
        <div className={styles.linkButtonContainer}>
            {links.map((link, index) => (
            <td>
            <div key={link.appName}>
                <tr>
                <div className={styles.linkButtonContainerButton}>
                    <LinkButton shortcutText={link.shortcutText} appName={link.appName} linkPath={link.linkPath}/>
                </div>
                </tr>
                <tr>
                <div className={styles.linkButtonContainerText}>
                    <Body2>{link.appName}</Body2>   
                </div>
                </tr>
            </div>
            </td>
            ))}
        </div>
    )
}

// Just something nice to liven up the window
const BottomBar: React.FC = () => {
    const styles = useStyles()
    return (
        <Skeleton appearance='opaque' className={styles.skeleton}>
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
            <LinkButtonContainer links={linksData}/>
            <BottomBar/>
        </FluentProvider>
    )
}