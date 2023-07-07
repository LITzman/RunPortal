import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { App } from './ui'
import { AddLinkDialog, RemoveLinkDialog } from './dialogs'


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<App />} />
                <Route path="Add" element={<AddLinkDialog />} />
                <Route path="Remove" element={<RemoveLinkDialog />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
)