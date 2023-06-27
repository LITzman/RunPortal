import { FluentProvider, Skeleton, SkeletonItem} from '@fluentui/react-components'
import ReactDOM from 'react-dom/client'
import { LinkButtonContainer, BottomBar } from './ui'
import { customDarkTheme } from './theme'
import linksData from './links.js'

const container = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(container)
root.render(
    <FluentProvider theme={customDarkTheme}>
        <LinkButtonContainer links={linksData.links} />
        <BottomBar/>
    </FluentProvider>
)