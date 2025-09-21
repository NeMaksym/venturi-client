import { AddMessage } from '../../../hooks'
import { SourceTransaction } from '../../../types'
import { RootStore } from '../../../stores'

export interface PipelineInput {
    sourceTransactions: SourceTransaction[]
    addMessage: AddMessage
    bankId: string
    expenseStore: RootStore['expenseStore']
    incomeStore: RootStore['incomeStore']
}

export function validate(input: PipelineInput): PipelineInput {
    input.sourceTransactions.forEach((transaction) => {
        if (transaction.commissionRate) {
            if (transaction.commissionRate < 0) {
                throw new Error('Commission rate should be positive')
            }
        }
    })

    return input
}
