import { fromSmallestUnit } from '../utils'
import { AnyTransaction, SubTransaction } from '../types'

export interface ExpenseTableStats {
    totalAmount: number
    totalRefAmount: number
}

// TODO: Count total by currency
export function useExpenseTableStats(
    rows: (AnyTransaction | SubTransaction)[]
) {
    return {
        totalAmount: fromSmallestUnit(
            rows.reduce((acc, row) => acc + row.source.amount, 0)
        ),
        totalRefAmount: fromSmallestUnit(
            rows.reduce((acc, row) => acc + row.referenceAmount, 0)
        ),
    }
}
