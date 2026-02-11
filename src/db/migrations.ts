import { IDBPDatabase } from 'idb'

import { VenturiDB, Stores } from './schema'
import { seedDefaultCategories } from './seeds'

const initializeDB = (db: IDBPDatabase<VenturiDB>) => {
    const transactionsStore = db.createObjectStore(Stores.TRANSACTIONS, {
        keyPath: 'id',
    })
    transactionsStore.createIndex('time', 'time')
    transactionsStore.createIndex('category', 'category')

    const subExpensesStore = db.createObjectStore(Stores.SUB_EXPENSES, {
        keyPath: 'id',
    })
    subExpensesStore.createIndex('parentId', 'parentId')
    subExpensesStore.createIndex('time', 'time')
    subExpensesStore.createIndex('bankId', 'bankId')
    subExpensesStore.createIndex('category', 'category')
    subExpensesStore.createIndex('labels', 'labels', {
        multiEntry: true,
    })

    const expenseCategoriesStore = db.createObjectStore(
        Stores.EXPENSE_CATEGORIES,
        { keyPath: 'id' }
    )
    seedDefaultCategories(expenseCategoriesStore)
}

export const migrations = [{ version: 1, upgrade: initializeDB }]
