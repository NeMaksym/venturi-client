import React from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

interface BankOption {
    value: string
    label: string
}

interface BankCardsProps {
    value: string
    options: BankOption[]
    onClick: (value: string) => void
}

export const BankCards: React.FC<BankCardsProps> = ({
    value,
    options,
    onClick,
}) => {
    return (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {options.map((option) => {
                const isSelected = option.value === value
                return (
                    <Card
                        key={option.value}
                        variant={isSelected ? 'outlined' : 'elevation'}
                        sx={{
                            width: 100,
                            height: 100,
                            borderColor: isSelected
                                ? 'primary.main'
                                : undefined,
                            boxShadow: isSelected ? 6 : 1,
                        }}
                    >
                        <CardActionArea
                            onClick={() => onClick(option.value)}
                            sx={{ height: '100%' }}
                        >
                            <CardContent
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                }}
                            >
                                <Typography component="div">
                                    {option.label}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                )
            })}
        </Box>
    )
}
