import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import react from '@vitejs/plugin-react'
import tsConfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        target: 'esnext'
    },
    plugins: [
        react(),
        tsConfigPaths(),
        electron([
            {
                entry: 'electron/client.js',
            },
            {
                entry: 'electron/preload.js',
            },
            {
                entry: 'electron/links.js',
            },
        ]),
        renderer(),
    ],
})
