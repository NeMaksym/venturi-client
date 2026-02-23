import React from 'react'
import TableCell from '@mui/material/TableCell'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { createFilterOptions } from '@mui/material/Autocomplete'

import { useTransactionHandlers, useTransactionOptions } from '../context'

const filter = createFilterOptions<string>()

interface LabelCellProps {
    transactionId: string
    labels: string[]
}

export const LabelCell: React.FC<LabelCellProps> = ({
    transactionId,
    labels,
}) => {
    const { onLabelChange } = useTransactionHandlers()
    const { labels: options } = useTransactionOptions()

    return (
        <TableCell onClick={(e) => e.stopPropagation()}>
            <Autocomplete
                fullWidth
                freeSolo
                selectOnFocus
                clearOnBlur
                blurOnSelect
                multiple
                disableClearable
                size="small"
                limitTags={1}
                options={options}
                value={labels}
                onChange={(_, value) => {
                    if (value) {
                        onLabelChange(transactionId, value)
                    }
                }}
                filterOptions={(options, params) => {
                    const filtered = filter(options, params)
                    const isExisting = options.some(
                        (option) => params.inputValue === option
                    )
                    if (params.inputValue !== '' && !isExisting) {
                        filtered.push(params.inputValue)
                    }
                    return filtered
                }}
                renderInput={(params) => {
                    const {
                        InputProps,
                        InputLabelProps,
                        inputProps,
                        ...restParams
                    } = params

                    return (
                        <TextField
                            {...restParams}
                            size={restParams.size || 'small'}
                            slotProps={{
                                input: InputProps,
                                inputLabel: InputLabelProps,
                                htmlInput: inputProps,
                            }}
                        />
                    )
                }}
            />
        </TableCell>
    )
}
