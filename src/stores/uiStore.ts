import { makeAutoObservable, reaction } from 'mobx'
import { PaletteMode } from '@mui/material/styles'

const THEME_STORAGE_KEY = 'venturi-theme-mode'

const getInitialTheme = (): PaletteMode => {
    try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
        if (savedTheme === 'dark' || savedTheme === 'light') {
            return savedTheme
        }
    } catch (error) {
        console.warn('Failed to load theme from localStorage:', error)
    }

    return 'light'
}

const getInitialDebug = (): boolean => {
    try {
        const urlParams = new URLSearchParams(window.location.search)
        return urlParams.has('debug')
    } catch (error) {
        console.warn('Failed to read debug parameter from URL:', error)
    }

    return false
}

export class UiStore {
    mode: PaletteMode
    debug: boolean

    constructor() {
        makeAutoObservable(this)
        this.mode = getInitialTheme()
        this.debug = getInitialDebug()

        reaction(
            () => this.mode,
            (newMode) => {
                try {
                    localStorage.setItem(THEME_STORAGE_KEY, newMode)
                } catch (error) {
                    console.warn('Failed to save theme to localStorage:', error)
                }
            }
        )
    }

    toggleMode() {
        this.mode = this.mode === 'light' ? 'dark' : 'light'
    }
}
