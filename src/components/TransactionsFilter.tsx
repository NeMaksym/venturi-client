import React from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import { useStore } from '../context/StoreContext'

export const TransactionsFilter: React.FC = () => {
    const { expenseFilterStore, expenseCategoryStore } = useStore()

    const today = new Date().toISOString().split('T')[0]

    return (
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <TextField
                label="Start Date"
                type="date"
                value={expenseFilterStore.startDate}
                onChange={(e) =>
                    expenseFilterStore.updateStartDate(e.target.value)
                }
                sx={{ width: 120, flexShrink: 0 }}
                slotProps={{
                    inputLabel: {
                        shrink: true,
                    },
                    htmlInput: {
                        max: expenseFilterStore.endDate || today,
                    },
                }}
            />

            <TextField
                label="End Date"
                type="date"
                value={expenseFilterStore.endDate}
                onChange={(e) =>
                    expenseFilterStore.updateEndDate(e.target.value)
                }
                sx={{ width: 120, flexShrink: 0 }}
                slotProps={{
                    inputLabel: {
                        shrink: true,
                    },
                    htmlInput: {
                        min: expenseFilterStore.startDate,
                        max: today,
                    },
                }}
            />

            <FormControl sx={{ flex: 1 }}>
                <InputLabel>Source</InputLabel>
                <Select
                    label="Source"
                    multiple
                    value={expenseFilterStore.sources}
                    onChange={(e) => {
                        const value = e.target.value
                        const selectedAccounts =
                            typeof value === 'string' ? value.split(',') : value
                        expenseFilterStore.updateSource(selectedAccounts)
                    }}
                    renderValue={(selected) => selected.join(', ')}
                >
                    {expenseFilterStore.sourceOptions.map(
                        ({ value, label }) => (
                            <MenuItem key={value} value={value}>
                                {label}
                            </MenuItem>
                        )
                    )}
                </Select>
            </FormControl>

            <FormControl sx={{ flex: 1 }}>
                <InputLabel>Category</InputLabel>
                <Select
                    label="Category"
                    multiple
                    value={expenseFilterStore.categories}
                    onChange={(e) => {
                        const value = e.target.value
                        const selectedCategories =
                            typeof value === 'string' ? value.split(',') : value
                        expenseFilterStore.updateCategories(selectedCategories)
                    }}
                    renderValue={(selected) => {
                        return selected
                            .map(
                                (id) =>
                                    expenseCategoryStore.getCategoryById(id)
                                        ?.label
                            )
                            .join(', ')
                    }}
                >
                    {expenseCategoryStore.categories.map(({ id, label }) => (
                        <MenuItem key={id} value={id}>
                            {label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{ flex: 1 }}>
                <InputLabel>Labels</InputLabel>
                <Select
                    label="Labels"
                    multiple
                    value={expenseFilterStore.labels}
                    onChange={(e) => {
                        const value = e.target.value
                        const selectedLabels =
                            typeof value === 'string' ? value.split(',') : value
                        expenseFilterStore.updateLabels(selectedLabels)
                    }}
                    renderValue={(selected) => selected.join(', ')}
                >
                    {expenseFilterStore.labelOptions.map((label) => (
                        <MenuItem key={label} value={label}>
                            {label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Stack>
    )
}
