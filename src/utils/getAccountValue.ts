import { AnyTransaction, BankSourceData } from '../types'
import { bankProvider } from '../plugins'
import { currency } from './currency'

function getSourceValue(source: BankSourceData): string {
    if (source.card) {
        return `**** ${source.card.value}`
    }

    if (source.account) {
        return source.account.value
    }

    throw new Error('Bank transaction should have account and/or card')
}

const DELIMITER = ':::'

export function getTransactionSourceValue(transaction: AnyTransaction): string {
    const { source } = transaction

    switch (source.type) {
        case 'bank':
            return `${source.bankId}${DELIMITER}${getSourceValue(source)}`
        case 'cash':
            return `Cash${DELIMITER}${source.currencyCode}`
    }
}

export function getTransactionSourceLabel(transaction: AnyTransaction): string {
    const { source } = transaction

    if (source.type === 'bank') {
        const bankLabel = bankProvider.getLabelById(source.bankId)

        if (source.card) {
            return `${bankLabel} **** ${source.card.value}`
        }

        if (source.account) {
            return `${bankLabel} ${source.account.value}`
        }

        return bankLabel
    }

    return `Cash ${currency.numToAlpha(source.currencyCode)}`
}

export function fromTransactionSourceValue(transactionSourceValue: string): {
    bankId: string
    sourceValue: string
} {
    const [bankId, sourceValue] = transactionSourceValue.split(DELIMITER)

    if (!bankId || !sourceValue) {
        throw new Error('Invalid transaction source value')
    }

    return { bankId, sourceValue }
}
