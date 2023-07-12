import React from 'react'
import ReactDOM from 'react-dom/client'
import { Router, Route } from 'electron-router-dom'
import { App } from './ui'
import { LinkDialog, EditDialog } from './dialogs'
import { getLinkToModify, getEmptyLink } from './ipc'


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Router
            main={<Route path='/' element={<App />} />}
            add={<Route path='/' element={<LinkDialog link={getEmptyLink()}/>} />}
            modify={<Route path='/' element={<LinkDialog link={await getLinkToModify()}/>} />}
            edit={<Route path='/' element={<EditDialog />} />}
        />
    </React.StrictMode>
)