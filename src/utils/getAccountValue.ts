import { SystemTransaction } from '../types'

function getAccountValue(transaction: SystemTransaction): string {
    if ('account' in transaction) {
        return transaction.account.value
    }

    if ('card' in transaction) {
        return transaction.card.value
    }

    throw new Error('Each transaction should have account and/or card')
}

const DELIMITER = ':::'

export function getBankAccountValue(transaction: SystemTransaction): string {
    return `${transaction.bank}${DELIMITER}${getAccountValue(transaction)}`
}

export function fromBankAccountValue(bankAccountValue: string): {
    bank: string
    accountValue: string
} {
    const [bank, accountValue] = bankAccountValue.split(DELIMITER)

    if (!bank || !accountValue) {
        throw new Error('Invalid bank account value')
    }

    return { bank, accountValue }
}
