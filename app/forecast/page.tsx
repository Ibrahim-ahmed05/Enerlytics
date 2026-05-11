"use client"

import { useState, useCallback, useEffect } from "react"
import { getBillData, PredictionResult } from "@/lib/actions"
import { BillGraph } from "@/components/BillGraph"
import { BillList } from "@/components/BillList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, AlertTriangle } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { useAuth } from "@/components/AuthProvider"

export default function ForecastPage() {
    const { accountNumber, loading: authLoading } = useAuth()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<PredictionResult | null>(null)
    const [error, setError] = useState("")

    const fetchForecast = useCallback(async () => {
        if (!accountNumber) return

        setLoading(true)
        setError("")
        setData(null)

        try {
            const result = await getBillData(accountNumber)
            if (result.accountFound) {
                setData(result)
            } else {
                setError("No data found for your account.")
            }
        } catch (err) {
            console.error("Error:", err)
            setError("Failed to fetch data. Please try again.")
        } finally {
            setLoading(false)
        }
    }, [accountNumber])

    useEffect(() => {
        if (accountNumber) {
            fetchForecast()
        }
    }, [accountNumber])

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow min-h-screen bg-white p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-8">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Bill Forecast</h1>
                            <p className="text-slate-500">Analyze history and predict future costs</p>
                        </div>
                    </div>

                    {(loading || authLoading) && (
                        <div className="text-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-slate-600 font-medium">Loading forecast data...</p>
                        </div>
                    )}

                    {!data && !loading && !authLoading && (
                        <div className="text-center py-20">
                            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                            <p className="text-slate-600 font-medium">
                                {error || "Loading your forecast..."}
                            </p>
                        </div>
                    )}

                    {data && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Prediction Highlight */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none shadow-xl">
                                    <CardHeader>
                                        <CardTitle className="text-indigo-50 font-semibold">Next Month Prediction</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-bold text-white">PKR {data.prediction.nextMonthPrice.toLocaleString()}</span>
                                        </div>
                                        <p className="text-indigo-50 mt-2">
                                            Estimated usage: {data.prediction.nextMonthUnits} Units
                                        </p>
                                        <div className="mt-6 flex items-center gap-2 text-sm bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
                                            {data.prediction.is_ensemble_model ? (
                                                <>
                                                    <TrendingUp className="h-4 w-4 text-emerald-300" />
                                                    <span className="text-white">AI Prediction (TFT + LSTM Ensemble)</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertTriangle className="h-4 w-4 text-yellow-200" />
                                                    <span className="text-white">Prediction based on historical average</span>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border border-slate-200 shadow-md bg-white">
                                    <CardHeader>
                                        <CardTitle className="text-slate-900 font-semibold">Analysis</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-slate-700">
                                            Based on your consumption patterns, your bill is expected to be
                                            <span className="font-semibold text-slate-900"> consistent </span>
                                            with your recent average.
                                        </p>
                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 w-[70%]" />
                                        </div>
                                        <p className="text-xs text-slate-600">Confidence Score: 85%</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Graph Section */}
                            <div>
                                <div className="mb-4">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Bill History</h2>
                                    <p className="text-slate-600">View all your past bills in one comprehensive graph</p>
                                </div>
                                <BillGraph data={data.history} />
                            </div>

                            {/* Detailed List */}
                            <BillList data={[
                                {
                                    accountNumber: accountNumber || '',
                                    currentMonthUnits: data.prediction.nextMonthUnits,
                                    currentMonthPrice: data.prediction.nextMonthPrice,
                                    monthIndex: (data.history.length > 0 ? (data.history[data.history.length - 1].monthIndex + 1) % 12 : 0),
                                    monthName: "Next Month (PREDICTED)",
                                    isPredicted: true
                                },
                                ...data.history
                            ]} />

                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}
