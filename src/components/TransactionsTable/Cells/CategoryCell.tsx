import React from 'react'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { SelectChangeEvent } from '@mui/material/Select'
import TableCell from '@mui/material/TableCell'

import { useTransactionHandlers, useTransactionOptions } from '../context'

const EMPTY_CATEGORY = ''

interface CategoryCellProps {
    transactionId: string
    category: string
}

export const CategoryCell: React.FC<CategoryCellProps> = ({
    transactionId,
    category,
}) => {
    const { onCategoryChange } = useTransactionHandlers()
    const { categories } = useTransactionOptions()

    const handleChange = (e: SelectChangeEvent<string>) => {
        onCategoryChange(transactionId, e.target.value)
    }

    return (
        <TableCell onClick={(e) => e.stopPropagation()}>
            <FormControl fullWidth size="small">
                <Select
                    fullWidth
                    displayEmpty
                    value={category}
                    onChange={handleChange}
                >
                    <MenuItem value={EMPTY_CATEGORY}>
                        <em>Select category</em>
                    </MenuItem>
                    {categories.map((categoryItem) => (
                        <MenuItem key={categoryItem.id} value={categoryItem.id}>
                            {categoryItem.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </TableCell>
    )
}
