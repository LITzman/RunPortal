import ReactDOM from 'react-dom/client'
import { App } from './ui'
import { customDarkTheme } from './theme'
import linksData from './links.js'

const container = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(container)
root.render(
    <App/>
)