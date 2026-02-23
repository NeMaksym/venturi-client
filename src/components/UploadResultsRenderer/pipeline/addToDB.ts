import { ToSystemTransactionsDTO } from './toSystemTransactions'
import { split, splitAsync } from '../../../utils'

type AddToDB = (input: ToSystemTransactionsDTO) => Promise<void>

type SystemTransaction = ToSystemTransactionsDTO['systemTransactions'][number]

export const addToDB: AddToDB = async ({
    systemTransactions,
    addMessage,
    transactionStore,
}) => {
    const [expenses, incomes] = split<SystemTransaction>(
        systemTransactions,
        (transaction) => transaction.source.amount < 0
    )

    addMessage(
        `Adding transactions to database... Total: ${systemTransactions.length} (${expenses.length} expenses, ${incomes.length} incomes)`
    )

    const [expensesDuplicates, expensesToAdd] =
        await splitAsync<SystemTransaction>(expenses, async (transaction) =>
            transactionStore.transactionExists(transaction)
        )

    const [incomesDuplicates, incomesToAdd] =
        await splitAsync<SystemTransaction>(incomes, async (transaction) =>
            transactionStore.transactionExists(transaction)
        )

    if (expensesDuplicates.length || incomesDuplicates.length) {
        addMessage(
            `Found duplicates: ${expensesDuplicates.length} expenses, ${incomesDuplicates.length} incomes`
        )
    }

    await Promise.all([
        ...expensesToAdd.map((expense) =>
            transactionStore.addParentTransaction(expense)
        ),
        ...incomesToAdd.map((income) =>
            transactionStore.addParentTransaction(income)
        ),
    ])

    addMessage(
        `Added ${expensesToAdd.length} expenses and ${incomesToAdd.length} incomes to database`
    )
}
