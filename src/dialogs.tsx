import React, { useState } from 'react'
import { Input, Button, FluentProvider, makeStyles, shorthands, Card, CardHeader, Menu, MenuTrigger, MenuPopover, MenuItem, CompoundButton, InputProps, Title3, Body1, Body1Strong, Divider, webDarkTheme, webLightTheme, tokens } from '@fluentui/react-components'
import { AddSquare24Filled, MoreHorizontal20Filled } from '@fluentui/react-icons';
import { getTheme, getButtonShape, useThemeChange } from './theme'
import { ipcRenderer, linksData, refreshLinks } from './ipc'

const useStyles = makeStyles({
    editDialogContainer: {
        marginLeft: '10px',
        marginRight: '10px',
        ...shorthands.overflow('auto')
    },
    editDialogContainerOut: {
        ...shorthands.overflow('hidden')
    },
    editDialogTitle :{
        ...shorthands.padding('20px', '0px')
    },
    editDialogCard: {
        marginBottom: '5px',
        width: '400px',
    },
    editDialogCardTitle: {
        marginLeft: '15px',
    },
    editDialogAddButton: {
        width: '200px',
        height: '50px'
    },
    editDialogCardMenu: {
        backgroundColor: webDarkTheme.colorNeutralBackground1
    },
    linkDialog: {
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap('20px'),
        ...shorthands.margin('10px'),
        boxSizing: 'border-box',
    },
    fileUploader: {
        display: 'none'
    },
    linkDialogButtons: {
        width: '150px',
        height: '40px'
    },
    acceptButton: {
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap('20px'),
    },
    inputFields: {
        ...shorthands.borderRadius(tokens.borderRadiusNone)
    }
})

// Heckin typescript
interface FileWithPath extends File {
    path: string,
    name: string
}

interface LinkDialogProps {
    link: {
        appName: string,
        linkPath: string,
        shortcutText: string
    }
}

export const LinkDialog: React.FC<LinkDialogProps> = ({ link }) => {

    let isModify = false
    if (link.shortcutText) {
        isModify = true
    }

    const styles = useStyles()
    const isDarkTheme = useThemeChange()

    React.useEffect(() => {
        refreshLinks()
    })

    // Hotkey chooser state
    const validKeys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    const takenKeys = linksData.map((link: any) => { return link.shortcutText }) || []
    const [hotkey, setHotkey] = React.useState(link.shortcutText)
    const IsHotkeyValid = (hotkey: string) => {
        return !takenKeys.includes(hotkey.toUpperCase()) || hotkey.toUpperCase() === link.shortcutText
    }
    const [HotkeyValid, setIsHotkeyValid] = React.useState(IsHotkeyValid(hotkey))

    // File chooser state
    const hiddenFileInput = React.useRef<any>()
    const [fileUploaded, setFileUploaded] = useState(link.linkPath)
    const [fileUploadedName, setFileUploadedName] = useState(link.appName)
    const handleFileClick = (_: React.MouseEvent) => {
        if (hiddenFileInput.current) {
            hiddenFileInput.current.click()
        }
    }
    const handlePathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files![0] as FileWithPath
        setFileUploaded(file.path)

        const appName = file.name.split('.')[0]
        setFileUploadedName(appName.charAt(0).toUpperCase() + appName.slice(1))
    }

    const handleNameChange: InputProps['onChange'] = (_, data) => {
        setFileUploadedName(data.value)
    }

    const handleHotkeyChange: InputProps['onChange'] = (_, data) => {
        if (data.value.length <= 1 && (validKeys + ' ').includes(data.value.toUpperCase()))
        {
            setHotkey(data.value.toUpperCase())
            setIsHotkeyValid(IsHotkeyValid(data.value))
        }
    }

    // Submit button
    const handleSubmitClick = (_: React.MouseEvent) => {
        if (HotkeyValid && fileUploadedName && fileUploaded)
        {
            if (isModify) {
                ipcRenderer.send('modify-link', [link, { appName: fileUploadedName,
                                                         linkPath: fileUploaded,
                                                         shortcutText: hotkey }])
            } else {
                ipcRenderer.send('add-link', { appName: fileUploadedName,
                                               linkPath: fileUploaded,
                                               shortcutText: hotkey })
            }
            window.close()
        }
    }

    return (
        <FluentProvider theme={isDarkTheme ? getTheme().dark : getTheme().light}>
            <div className={styles.linkDialog}>
                <Body1Strong>
                    Application Path:
                </Body1Strong>
                <input type='file' ref={hiddenFileInput} onChange={handlePathChange} className={styles.fileUploader} />
                <Input value={fileUploaded} className={styles.inputFields}/>
                <Button className={styles.linkDialogButtons} onClick={handleFileClick} appearance='subtle' shape={getButtonShape()}>Browse</Button>
                <Divider />
                <Body1Strong>
                    Application Name:
                </Body1Strong>
                <Input value={fileUploadedName} onChange={handleNameChange} className={styles.inputFields}/>
                <Divider />
                <Body1Strong>
                    Application Hotkey:
                </Body1Strong>
                <Input value={hotkey} onChange={handleHotkeyChange} className={styles.inputFields}/>
                <Divider />
                <div className={styles.acceptButton}>
                    <Button className={styles.linkDialogButtons} appearance={'primary'} onClick={handleSubmitClick} shape={getButtonShape()}>Accept</Button>
                </div>
            </div>
        </FluentProvider>
    )
}

export const EditDialog: React.FC = () => {

    // Styling
    const styles = useStyles()
    const isDarkTheme = useThemeChange()

    // Existing keys state
    React.useEffect(() => {
        refreshLinks()
    })

    const handleAddClick = (_: React.MouseEvent) => {
        ipcRenderer.send('open-add-dialog', null)
    }

    const handleRemoveClick = (event: React.MouseEvent) => {
        ipcRenderer.send('remove-link', event.currentTarget.id)
    }
    
    const handleModifyClick = (event: React.MouseEvent) => {
        ipcRenderer.send('open-modify-dialog', event.currentTarget.id)
    }

    return (
        <div className={styles.editDialogContainerOut}>
        <FluentProvider theme={isDarkTheme ? getTheme().dark : getTheme().light}>
            <div className={styles.editDialogContainer}>
                <div className={styles.editDialogTitle}>
                    <Title3>Edit Shortcuts</Title3>
                </div>
                {linksData.map((link: any) => {
                    return (
                        <div className={styles.editDialogCard}>
                            <Card appearance='subtle' size='small'>
                                <CardHeader
                                    header={
                                    <div className={styles.editDialogCardTitle}>
                                        <Body1>
                                            {link.appName}
                                        </Body1>
                                    </div>
                                    }
                                    action={
                                    <div>
                                        <Menu>
                                            <MenuTrigger>
                                                <Button
                                                appearance='transparent'
                                                icon={<MoreHorizontal20Filled />}
                                                aria-label='More options'
                                                shape={getButtonShape()}/>
                                            </MenuTrigger>
                                            <MenuPopover style={{
                                                backgroundColor: isDarkTheme ? 
                                                webDarkTheme.colorNeutralBackground1 : 
                                                webLightTheme.colorNeutralBackground1
                                                }}>
                                                <MenuItem 
                                                id={link.shortcutText}
                                                onClick={handleRemoveClick}>
                                                    Remove Link
                                                </MenuItem>
                                                <MenuItem
                                                id={link.shortcutText}
                                                onClick={handleModifyClick}>
                                                    Modify Link
                                                </MenuItem>
                                            </MenuPopover>
                                        </Menu>
                                    </div>
                                    }>
                                </CardHeader>
                            </Card>
                        </div>
                    )
                })}
                <div>
                    <CompoundButton
                    className={styles.editDialogAddButton}
                    appearance='subtle'
                    icon={<AddSquare24Filled />}
                    onClick={handleAddClick}
                    shape={getButtonShape()}
                    >
                    Add Shortcut
                    </CompoundButton>
                </div>
            </div>
        </FluentProvider>
        </div>
    )
}