import { makeAutoObservable } from 'mobx'

import { RootStore } from './rootStore'
import { IncomeService } from '../db/services'
import { RawSystemTransaction, SystemTransaction } from '../types'

export class IncomeStore {
    private readonly root: RootStore
    private readonly incomeService: IncomeService

    loading = false
    error: string | null = null
    incomes: SystemTransaction[] = []

    async incomeExists(
        income: SystemTransaction | RawSystemTransaction
    ): Promise<boolean> {
        return await this.incomeService.transactionExists(income)
    }

    constructor(root: RootStore, incomeService: IncomeService) {
        makeAutoObservable(this, {}, { autoBind: true })
        this.root = root
        this.incomeService = incomeService
    }

    get incomesInDateRange() {
        return this.incomes.filter((income) => {
            return (
                income.time >= this.root.expenseFilterStore.unixStartDate &&
                income.time <= this.root.expenseFilterStore.unixEndDate
            )
        })
    }

    *loadAll() {
        this.loading = true
        this.error = null

        try {
            const incomes: SystemTransaction[] =
                yield this.incomeService.getAllIncomes()
            this.incomes = incomes
        } catch (e) {
            this.error =
                e instanceof Error ? e.message : 'Failed to load incomes'
        } finally {
            this.loading = false
        }
    }

    *updateIncomeField(incomeId: string, updates: Partial<SystemTransaction>) {
        const income: SystemTransaction | undefined =
            yield this.incomeService.getIncomeById(incomeId)
        if (!income) return

        const updated: SystemTransaction =
            yield this.incomeService.updateIncome({
                ...income,
                ...updates,
            })

        this.incomes = this.incomes.map((i) =>
            i.id === incomeId ? updated : i
        )
    }

    *delete(incomeId: string) {
        yield this.incomeService.deleteIncome(incomeId)

        this.incomes = this.incomes.filter((i) => i.id !== incomeId)
    }

    *addIncome(rawIncome: RawSystemTransaction) {
        const income: SystemTransaction = yield this.incomeService.addIncome(
            rawIncome
        )

        this.incomes.push(income)
    }
}
