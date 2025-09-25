import { ToSystemTransactionsDTO } from './toSystemTransactions'
import { split, splitAsync } from '../../../utils'
import { RawSystemTransaction } from '../../../types'

type AddToDB = (input: ToSystemTransactionsDTO) => Promise<void>

export const addToDB: AddToDB = async ({
    systemTransactions,
    addMessage,
    expenseStore,
    incomeStore,
}) => {
    const [expenses, incomes] = split<RawSystemTransaction>(
        systemTransactions,
        (transaction) => transaction.amount < 0
    )

    addMessage(
        `Adding transactions to database... Total: ${systemTransactions.length} (${expenses.length} expenses, ${incomes.length} incomes)`
    )

    const [expensesDuplicates, expensesToAdd] =
        await splitAsync<RawSystemTransaction>(expenses, async (transaction) =>
            expenseStore.expenseExists(transaction)
        )

    const [incomesDuplicates, incomesToAdd] =
        await splitAsync<RawSystemTransaction>(incomes, async (transaction) =>
            incomeStore.incomeExists(transaction)
        )

    if (expensesDuplicates.length || incomesDuplicates.length) {
        addMessage(
            `Found duplicates: ${expensesDuplicates.length} expenses, ${incomesDuplicates.length} incomes`
        )
    }

    await Promise.all([
        ...expensesToAdd.map((expense) => expenseStore.addExpense(expense)),
        ...incomesToAdd.map((income) => incomeStore.addIncome(income)),
    ])

    addMessage(
        `Added ${expensesToAdd.length} expenses and ${incomesToAdd.length} incomes to database`
    )
}
