import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { App } from './ui'

const container = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(container)
root.render(
    <Router>
        <div>
            <Route path='/' Component={App}></Route>
        </div>
    </Router>
)