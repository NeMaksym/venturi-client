import React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'

interface YearlyCategoryChartProps {
    data: Record<string, number[]>
    height: number
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
    height,
}) => {
    return (
        <LineChart
            height={height}
            series={Object.entries(data).map(([category, amounts]) => ({
                id: category,
                data: amounts,
                label: category,
                valueFormatter: (v: number | null) =>
                    v != null ? `$${v.toFixed(2)}` : '',
            }))}
            xAxis={[{ scaleType: 'point', data: xLabels }]}
            yAxis={[
                {
                    valueFormatter: (v: number | null) =>
                        v != null ? `$${v}` : '',
                },
            ]}
            hideLegend
        />
    )
}
