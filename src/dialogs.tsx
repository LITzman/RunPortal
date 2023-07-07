import React, { useState } from 'react'
import { Input, Label, Button, FluentProvider, makeStyles, shorthands, LargeTitle, Combobox, Option, ComboboxProps } from '@fluentui/react-components'
import { customDarkTheme, customLightTheme, useThemeChange } from './theme'
import { ipcRenderer, linksData, refreshLinks } from './ipc'


const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        ...shorthands.gap("2px"),
        maxWidth: "400px",
        marginLeft: "100px"
    },
    fileUploader: {
        display: 'none'
    },
    hotkeySelector: {
        display: "grid",
        gridTemplateRows: "repeat(1fr)",
        justifyItems: "start",
        ...shorthands.gap("2px"),
        maxWidth: "400px",
    }

})


export const AddLinkDialog: React.FC = () => {
    const styles = useStyles()
    const isDarkTheme = useThemeChange()

    React.useEffect(() => {
        refreshLinks()
    })

    // Hotkey chooser state
    const takenKeys = linksData.map((link: any) => { return link.shortcutText })
    const freeKeys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').filter((value: string) => {
        return !takenKeys.includes(value)
    })

    const [hotkey, setHotkey] = React.useState('')
    const onOptionSelect: ComboboxProps["onOptionSelect"] = (event, data) => {
        if (data.optionValue)
            setHotkey(data.optionValue)
    }

    // File chooser state
    const hiddenFileInput = React.useRef<any>()
    const [fileUploaded, setFileUploaded] = useState('')
    const [fileUploadedName, setFileUploadedName] = useState('')
    const handleFileClick = (event: React.MouseEvent) => {
        if (hiddenFileInput.current) {
            hiddenFileInput.current.click()
        }
    }
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files![0]
        setFileUploaded(file.path)

        const appName = file.name.split('.')[0]
        setFileUploadedName(appName.charAt(0).toUpperCase() + appName.slice(1))
    }

    // Submit button
    const handleSubmitClick = (event: React.MouseEvent) => {
        if (hotkey && fileUploadedName)
        {
            ipcRenderer.send('add-link', [fileUploadedName, fileUploaded, hotkey])
            window.close()
        }
    }

    return (
        <FluentProvider theme={isDarkTheme ? customDarkTheme : customLightTheme}>
            <div className={styles.root}>
                <div>
                    <Label>
                        Application Path:
                    </Label>
                    <input type="file" ref={hiddenFileInput} onChange={handleChange} className={styles.fileUploader} />
                    <Button onClick={handleFileClick} appearance='subtle'>Browse</Button>
                    <Input value={fileUploaded}/>
                    <Label>
                            Application Name:
                    </Label>
                    <Input value={fileUploadedName}/>
                </div>
                <Label>
                    Application Hotkey:
                </Label>
                <div className={styles.hotkeySelector}>
                    <Combobox
                        placeholder='Select Hotkey'
                        onOptionSelect={onOptionSelect}
                        value={hotkey}>
                        {freeKeys.map((option: string) => (
                            <Option key={option}>
                                {option}
                            </Option >
                            ))}
                        {freeKeys.length === 0 ? (
                            <Option key="no-results" text="">
                                No results found
                            </Option>
                        ) : null}
                    </Combobox>
                    <LargeTitle>{hotkey}</LargeTitle>
                </div>
                <Button appearance='primary' onClick={handleSubmitClick}>Add Link</Button>
            </div>
        </FluentProvider>
    )
}

export const RemoveLinkDialog: React.FC = () => {

    const styles = useStyles()
    const isDarkTheme = useThemeChange()
    React.useEffect(() => {
        refreshLinks()
    })

    const existingKeys = linksData.map((link: any) => { return link.shortcutText })

    const [hotkey, setHotkey] = React.useState('')
    const onOptionSelect: ComboboxProps["onOptionSelect"] = (event, data) => {
        if (data.optionValue)
            setHotkey(data.optionValue)
    }

    // Submit button
    const handleRemoveClick = (event: React.MouseEvent) => {
        if (hotkey)
        {
            ipcRenderer.send('remove-link', hotkey)
            window.close()
        }
    }

    return (
        <FluentProvider theme={isDarkTheme ? customDarkTheme : customLightTheme}>
            <div>
                <div className={styles.hotkeySelector}>
                    <Combobox
                        placeholder='Select Hotkey'
                        onOptionSelect={onOptionSelect}
                        value={hotkey}>
                        {existingKeys.map((option: string) => (
                            <Option key={option}>
                                {option}
                            </Option >
                            ))}
                        {existingKeys.length === 0 ? (
                            <Option key="no-results" text="">
                                No results found
                            </Option>
                        ) : null}
                    </Combobox>
                    <LargeTitle>{hotkey}</LargeTitle>
                </div>
                <Button appearance='primary' onClick={handleRemoveClick}>Remove Link</Button>
            </div>
        </FluentProvider>
    )
}