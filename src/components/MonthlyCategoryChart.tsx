import React from 'react'
import { PieChart } from '@mui/x-charts/PieChart'

interface MonthlyCategoryChartProps {
    data: { label: string; value: number }[]
}

export const MonthlyCategoryChart: React.FC<MonthlyCategoryChartProps> = ({
    data,
}) => {
    return (
        <PieChart
            height={350}
            series={[
                {
                    data,
                    valueFormatter: (item) => `$${item.value.toFixed(2)}`,
                },
            ]}
        />
    )
}
