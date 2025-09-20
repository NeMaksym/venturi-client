import { pick } from 'lodash'

import { MonoAPIClientInfo, MonoAPITransaction } from '../types'
import { SourceTransaction } from '../../../types'

function getCard(
    account: MonoAPIClientInfo['accounts'][number]
): SourceTransaction['card'] | undefined {
    if (account.maskedPan[0]) {
        return {
            type: 'lastFour',
            value: account.maskedPan[0].slice(-4),
        }
    }

    return undefined
}

// Mono doc is inaccurate, transaction.currencyCode is a code of operation. Account currencyCode is available in clientInfo
export function toSourceTransactions(
    transactions: MonoAPITransaction[],
    account: MonoAPIClientInfo['accounts'][number]
): SourceTransaction[] {
    const card = getCard(account)

    return transactions.map((transaction) => ({
        ...pick(transaction, [
            'description',
            'amount',
            'currencyCode',
            'commissionRate',
            'mcc',
            'hold',
            'comment',
        ]),
        originalId: transaction.id,
        time: transaction.time * 1000,
        operation: {
            amount: Math.abs(transaction.operationAmount),
            currencyCode: transaction.currencyCode,
        },
        account: { type: 'iban', value: account.iban },
        ...(card ? { card } : {}),
    }))
}
