import { makeAutoObservable } from 'mobx'
import { Category } from '../types'
import { ExpenseCategoryService } from '../db/services'

// TODO: Add "order" property to keep the order on page refresh (after new item added)
export class ExpenseCategoryStore {
    private readonly service: ExpenseCategoryService

    categories: Category[] = []
    loading = false
    error: string | null = null

    getCategoryById(id: string): Category | undefined {
        return this.categories.find((c) => c.id === id)
    }

    constructor(service: ExpenseCategoryService) {
        makeAutoObservable(this, {}, { autoBind: true })
        this.service = service
    }

    get categoriesMap(): Record<string, string> {
        const map: Record<string, string> = {}
        for (const c of this.categories) {
            map[c.id] = c.label
        }
        return map
    }

    *loadAll() {
        this.loading = true
        this.error = null
        try {
            const all: Category[] = yield this.service.getAllCategories()
            this.categories = all
        } catch (e) {
            this.error =
                e instanceof Error ? e.message : 'Failed to load categories'
        } finally {
            this.loading = false
        }
    }

    *add(label: string) {
        const created: Category = yield this.service.addCategory(label)
        this.categories = [...this.categories, created]
    }

    *rename(id: string, newLabel: string) {
        const updated: Category = yield this.service.renameCategory(
            id,
            newLabel
        )
        this.categories = this.categories.map((c) =>
            c.id === id ? updated : c
        )
    }

    *remove(id: string) {
        yield this.service.removeCategory(id)
        this.categories = this.categories.filter((c) => c.id !== id)
    }
}
