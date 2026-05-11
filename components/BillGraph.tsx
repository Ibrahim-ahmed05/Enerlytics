"use client"

import { memo, useMemo } from "react"
import { BillData } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts"

interface BillGraphProps {
    data: BillData[]
}

export const BillGraph = memo(function BillGraph({ data }: BillGraphProps) {
    // Memoize chart data to prevent recalculation
    const chartData = useMemo(() =>
        data.map((item) => ({
            name: item.monthName || `Month ${item.monthIndex + 1}`,
            price: item.currentMonthPrice,
            units: item.currentMonthUnits,
        })),
        [data]
    )

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="w-full h-[350px] md:h-[500px] shadow-xl border border-slate-200 bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3 md:py-4">
                    <CardTitle className="text-slate-900 font-bold text-base md:text-lg">Bill History Trend</CardTitle>
                    <p className="text-[10px] md:text-xs text-slate-500">Historical monthly bill analysis</p>
                </CardHeader>
                <CardContent className="h-[260px] md:h-[400px] pt-4 md:pt-6 px-2 md:px-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 10,
                                bottom: 10,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100" vertical={false} />
                            <XAxis
                                dataKey="name"
                                className="text-xs font-medium text-slate-700"
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                                tick={{ fill: '#475569' }}
                            />
                            <YAxis
                                className="text-xs font-medium text-slate-700"
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `PKR ${(value / 1000).toFixed(1)}k`}
                                tick={{ fill: '#475569' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '12px',
                                    color: '#1e293b'
                                }}
                                formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Amount']}
                                labelStyle={{ color: '#3b82f6', fontWeight: 600 }}
                                cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                                strokeWidth={3}
                                animationDuration={800}
                                isAnimationActive={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
})
