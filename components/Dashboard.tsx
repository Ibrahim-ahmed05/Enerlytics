"use client"

import { BillData, PredictionResult } from "@/lib/actions"
import { BillGraph } from "./BillGraph"
import { BillList } from "./BillList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, TrendingUp, AlertCircle, Sun, Snowflake } from "lucide-react"

interface DashboardProps {
    data: PredictionResult
}

export function Dashboard({ data }: DashboardProps) {
    const lastBill = data.history[data.history.length - 1];
    const prediction = data.prediction;

    // Calculate percentage change
    const priceChange = lastBill
        ? ((prediction.nextMonthPrice - lastBill.currentMonthPrice) / lastBill.currentMonthPrice) * 100
        : 0;

    const isIncrease = priceChange > 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">
                            Last Month Bill
                        </CardTitle>
                        <Zap className="h-4 w-4 text-blue-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">PKR {lastBill?.currentMonthPrice.toLocaleString() ?? 0}</div>
                        <p className="text-xs text-blue-100 mt-1">
                            {lastBill?.currentMonthUnits} Units
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">
                            Predicted Next Bill
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">PKR {prediction.nextMonthPrice.toLocaleString()}</div>
                        <p className="text-xs text-purple-100 mt-1">
                            Estimated {prediction.nextMonthUnits} Units
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white/60 backdrop-blur-md border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Forecast Trend
                        </CardTitle>
                        <AlertCircle className={`h-4 w-4 ${isIncrease ? 'text-red-500' : 'text-green-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                            {isIncrease ? '+' : ''}{priceChange.toFixed(1)}%
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            vs Last Month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8 md:grid-cols-2">
                <BillGraph data={data.history} />
                <div className="space-y-8">
                    <BillList data={data.history} />

                    <EnergyTips />
                </div>
            </div>
        </div>
    )
}

function EnergyTips() {
    const month = new Date().getMonth(); // 0-11
    const isSummer = month >= 4 && month <= 8; // May to September
    const isWinter = month >= 10 || month <= 1; // November to February

    let tipTitle = "Energy Saving Tip";
    let tipContent = "Turn off unnecessary lights and appliances when not in use.";
    let Icon = Zap;

    if (isSummer) {
        tipTitle = "Summer Efficiency";
        tipContent = "It's hot outside! Set your AC to 26°C and use fans to circulate cool air efficiently. Avoid using heat-generating appliances during the day.";
        Icon = Sun;
    } else if (isWinter) {
        tipTitle = "Winter Savings";
        tipContent = "It's getting cold! Turn off fans and ACs. Open curtains during the day to let sunlight warm your home naturally.";
        Icon = Snowflake;
    }

    return (
        <Card className="bg-green-50/50 border-green-100">
            <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                    <Icon className="h-4 w-4" /> {tipTitle}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-green-700">
                    {tipContent}
                </p>
            </CardContent>
        </Card>
    )
}
