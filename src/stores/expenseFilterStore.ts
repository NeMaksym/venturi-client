import { makeAutoObservable, reaction } from 'mobx'
import { RootStore } from './rootStore'
import { fromBankAccountValue, getBankAccountValue } from '../utils'

export const STORAGE_KEYS = {
    START_DATE: 'filter-start-date',
    END_DATE: 'filter-end-date',
} as const

const today = (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const startOfMonth = (): string => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const year = start.getFullYear()
    const month = String(start.getMonth() + 1).padStart(2, '0')
    const day = String(start.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const getInitialStartDate = (): string => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.START_DATE)
        return saved || startOfMonth()
    } catch (error) {
        return startOfMonth()
    }
}

const getInitialEndDate = (): string => {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.END_DATE)
        return saved || today()
    } catch (error) {
        return today()
    }
}

export class ExpenseFilterStore {
    root: RootStore

    startDate = ''
    endDate = ''
    bankAccounts: string[] = []
    categories: string[] = []
    labels: string[] = []

    constructor(root: RootStore) {
        makeAutoObservable(this, {}, { autoBind: true })
        this.root = root
        this.startDate = getInitialStartDate()
        this.endDate = getInitialEndDate()

        reaction(
            () => this.startDate,
            (start) => {
                try {
                    localStorage.setItem(STORAGE_KEYS.START_DATE, start)
                } catch (error) {
                    console.error(
                        'Failed to save start date to localStorage:',
                        error
                    )
                }
            }
        )

        reaction(
            () => this.endDate,
            (end) => {
                try {
                    localStorage.setItem(STORAGE_KEYS.END_DATE, end)
                } catch (error) {
                    console.error(
                        'Failed to save end date to localStorage:',
                        error
                    )
                }
            }
        )
    }

    get unixStartDate() {
        return new Date(this.startDate + 'T00:00:00').getTime()
    }

    get unixEndDate() {
        return new Date(this.endDate + 'T23:59:59').getTime()
    }

    get bankAccountOptions() {
        const uniqueBankAccounts = new Set<string>()

        const allTransactions = [
            ...this.root.expenseStore.expenses,
            ...this.root.expenseStore.subExpenses,
        ]

        allTransactions.forEach((transaction) => {
            const accountValue = getBankAccountValue(transaction)
            uniqueBankAccounts.add(accountValue)
        })

        return Array.from(uniqueBankAccounts)
            .map((bankAccountValue) => {
                const { bankId, accountValue } =
                    fromBankAccountValue(bankAccountValue)

                return {
                    value: bankAccountValue,
                    label: `${bankId} ${accountValue}`,
                }
            })
            .sort((a, b) => a.label.localeCompare(b.label))
    }

    get labelOptions() {
        const labelCount: Record<string, number> = {}

        Promise.all([
            this.root.expenseStore.expenses.forEach((expense) => {
                expense.labels.forEach((label) => {
                    labelCount[label] = (labelCount[label] || 0) + 1
                })
            }),
            this.root.expenseStore.subExpenses.forEach((subExpense) => {
                subExpense.labels.forEach((label) => {
                    labelCount[label] = (labelCount[label] || 0) + 1
                })
            }),
        ])

        return Object.entries(labelCount)
            .sort((a, b) => b[1] - a[1])
            .map(([label]) => label)
    }

    updateStartDate(startDate: string) {
        this.startDate = startDate
    }

    updateEndDate(endDate: string) {
        this.endDate = endDate
    }

    updateBankAccounts(bankAccounts: string[]) {
        this.bankAccounts = bankAccounts
    }

    updateCategories(categories: string[]) {
        this.categories = categories
    }

    updateLabels(labels: string[]) {
        this.labels = labels
    }
}
