import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { App } from './ui'
import { LinkDialog, EditDialog } from './dialogs'
import { getLinkToModify, getEmptyLink } from './ipc'


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<App />} />
                <Route path='Add' element={<LinkDialog link={getEmptyLink()}/>} />
                <Route path='Modify' element={<LinkDialog link={await getLinkToModify()}/>} />
                <Route path='Edit' element={<EditDialog />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
)