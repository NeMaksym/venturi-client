import React, { createContext, useContext, useMemo, useEffect } from 'react'
import { RootStore } from '../stores'

const StoreContext = createContext<RootStore | undefined>(undefined)

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const store = useMemo(() => new RootStore(), [])

    useEffect(() => {
        store.expenseCategoryStore.loadAll()
        store.transactionStore.loadAll()
    }, [])

    return (
        <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    )
}

export function useStore(): RootStore {
    const ctx = useContext(StoreContext)
    if (!ctx) {
        throw new Error('useStore must be used within a StoreProvider')
    }
    return ctx
}
