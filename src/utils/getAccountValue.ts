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
    return `${transaction.bankId}${DELIMITER}${getAccountValue(transaction)}`
}

export function fromBankAccountValue(bankAccountValue: string): {
    bankId: string
    accountValue: string
} {
    const [bankId, accountValue] = bankAccountValue.split(DELIMITER)

    if (!bankId || !accountValue) {
        throw new Error('Invalid bank account value')
    }

    return { bankId, accountValue }
}
