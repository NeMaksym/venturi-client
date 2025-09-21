import React from 'react'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

interface Option {
    value: string
    label: string
}

interface BankSelectorProps {
    value: string
    options: Option[]
    onChange: (value: string) => void
}

const LABEL = 'Bank'

export const BankSelector: React.FC<BankSelectorProps> = ({
    value,
    options,
    onChange,
}) => {
    const handleChange = (event: SelectChangeEvent) => {
        onChange(event.target.value)
    }

    return (
        <FormControl sx={{ minWidth: 200, width: 300 }}>
            <InputLabel id="bank-select-label">{LABEL}</InputLabel>
            <Select
                labelId="bank-select-label"
                id="bank-select"
                value={value}
                label={LABEL}
                onChange={handleChange}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}
