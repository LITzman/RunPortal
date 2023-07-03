import ReactDOM from 'react-dom/client'
import { App } from './ui'

const container = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(container)
root.render(
    <App/>
)