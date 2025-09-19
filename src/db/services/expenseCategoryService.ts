import { Stores } from '../schema'
import { DBProvider } from '../provider'
import { Category } from '../../types'

export class ExpenseCategoryService {
    async getAllCategories(): Promise<Category[]> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.EXPENSE_CATEGORIES, 'readonly')
        const store = tx.objectStore(Stores.EXPENSE_CATEGORIES)

        try {
            return await store.getAll()
        } catch (error) {
            console.error('Failed to get all expense categories:', error)
            throw error
        }
    }

    async getCategoryById(id: string): Promise<Category | undefined> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.EXPENSE_CATEGORIES, 'readonly')
        const store = tx.objectStore(Stores.EXPENSE_CATEGORIES)

        try {
            return await store.get(id)
        } catch (error) {
            console.error('Failed to get expense category by id:', error)
            throw error
        }
    }

    async addCategory(label: string): Promise<Category> {
        const trimmed = label.trim()
        if (!trimmed) {
            throw new Error('Category label cannot be empty')
        }
        const category: Category = { id: crypto.randomUUID(), label: trimmed }

        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.EXPENSE_CATEGORIES, 'readwrite')
        const store = tx.objectStore(Stores.EXPENSE_CATEGORIES)

        try {
            await store.add(category)
            return category
        } catch (error) {
            console.error('Failed to add expense category:', error)
            throw error
        }
    }

    async removeCategory(id: string): Promise<void> {
        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.EXPENSE_CATEGORIES, 'readwrite')
        const store = tx.objectStore(Stores.EXPENSE_CATEGORIES)

        try {
            await store.delete(id)
        } catch (error) {
            console.error('Failed to remove expense category:', error)
            throw error
        }
    }

    async renameCategory(id: string, newLabel: string): Promise<Category> {
        const trimmed = newLabel.trim()
        if (!trimmed) {
            throw new Error('Category label cannot be empty')
        }

        const db = await DBProvider.instance.db
        const tx = db.transaction(Stores.EXPENSE_CATEGORIES, 'readwrite')
        const store = tx.objectStore(Stores.EXPENSE_CATEGORIES)

        try {
            const existing = await store.get(id)
            if (!existing) {
                throw new Error(`Category with id "${id}" not found`)
            }

            const updated: Category = { ...existing, label: trimmed }
            await store.put(updated)
            return updated
        } catch (error) {
            console.error('Failed to rename expense category:', error)
            throw error
        }
    }
}
