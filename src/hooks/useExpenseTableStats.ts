import { fromSmallestUnit } from '../utils'
import { AnyTransaction } from '../types'

export interface ExpenseTableStats {
    totalAmount: number
    totalRefAmount: number
}

// TODO: Count total by currency
export function useExpenseTableStats(rows: AnyTransaction[]) {
    return {
        totalAmount: fromSmallestUnit(
            rows.reduce((acc, row) => acc + row.source.amount, 0)
        ),
        totalRefAmount: fromSmallestUnit(
            rows.reduce((acc, row) => acc + row.referenceAmount, 0)
        ),
    }
}
