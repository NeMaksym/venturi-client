import React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'

interface YearlyCategoryChartProps {
    data: Record<string, number[]>
}

const xLabels = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
]

export const YearlyCategoryChart: React.FC<YearlyCategoryChartProps> = ({
    data,
}) => {
    return (
        <LineChart
            height={350}
            series={Object.entries(data).map(([category, amounts]) => ({
                id: category,
                data: amounts,
                label: category,
            }))}
            xAxis={[{ scaleType: 'point', data: xLabels }]}
            hideLegend
        />
    )
}
