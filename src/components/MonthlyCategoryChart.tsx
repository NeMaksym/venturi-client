import React from 'react'
import { PieChart } from '@mui/x-charts/PieChart'

interface MonthlyCategoryChartProps {
    data: { label: string; value: number }[]
    height: number
}

export const MonthlyCategoryChart: React.FC<MonthlyCategoryChartProps> = ({
    data,
    height,
}) => {
    return (
        <PieChart
            height={height}
            series={[
                {
                    data,
                    valueFormatter: (item) => `$${item.value.toFixed(2)}`,
                },
            ]}
        />
    )
}
