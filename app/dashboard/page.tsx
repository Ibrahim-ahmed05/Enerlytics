"use client"

import { useState, useCallback, useMemo, memo, useEffect } from "react"
import { getBillData, PredictionResult } from "@/lib/actions"
import { BillGraph } from "@/components/BillGraph"
import { BillList } from "@/components/BillList"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Zap, TrendingUp, ArrowRight, BarChart3, Sparkles, RefreshCw, Activity, DollarSign, Gauge } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { useAuth } from "@/components/AuthProvider"
import { rescrapeUserBills } from "@/lib/auth-actions"

export default function DashboardPage() {
    const { user, accountNumber, loading: authLoading } = useAuth()
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [data, setData] = useState<PredictionResult | null>(null)
    const [error, setError] = useState("")

    // Auto-fetch bills when user is loaded and has an account number
    useEffect(() => {
        if (accountNumber && !data && !loading) {
            fetchBills()
        }
    }, [accountNumber])

    const fetchBills = useCallback(async () => {
        if (!accountNumber) return

        setLoading(true)
        setError("")
        setData(null)

        try {
            const result = await getBillData(accountNumber)
            if (result.accountFound) {
                setData(result)
            } else {
                setError("No bills found for your account yet. Bills may still be processing — try refreshing in a minute.")
            }
        } catch (err) {
            console.error("Error:", err)
            setError("An error occurred while fetching data. Please try again.")
        } finally {
            setLoading(false)
        }
    }, [accountNumber])

    const handleRefresh = async () => {
        setRefreshing(true)
        try {
            const result = await rescrapeUserBills()
            if (result.success) {
                await fetchBills()
            } else {
                setError(result.message)
            }
        } catch (err) {
            setError("Failed to refresh bills.")
        } finally {
            setRefreshing(false)
        }
    }

    // Compute stats from data
    const stats = useMemo(() => {
        if (!data || !data.history.length) return null
        const history = data.history
        const latest = history[history.length - 1]
        const totalUnits = history.reduce((s, h) => s + h.currentMonthUnits, 0)
        const totalPrice = history.reduce((s, h) => s + h.currentMonthPrice, 0)
        const avgUnits = Math.round(totalUnits / history.length)
        const avgPrice = Math.round(totalPrice / history.length)
        // Find peak usage and the month it occurred
        const peakRecord = [...history].reduce((max, curr) => 
            curr.currentMonthUnits > max.currentMonthUnits ? curr : max, history[0]
        )
        
        const maxUnits = peakRecord.currentMonthUnits
        const peakMonth = peakRecord.monthName
        const minUnits = Math.min(...history.map(h => h.currentMonthUnits))

        return {
            latestUnits: latest.currentMonthUnits,
            latestPrice: latest.currentMonthPrice,
            avgUnits,
            avgPrice,
            maxUnits,
            peakMonth,
            minUnits,
            totalBills: history.length,
        }
    }, [data])

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4 md:p-8 font-sans relative">
                {/* Subtle background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/15 rounded-full blur-3xl" />
                </div>

                <div className="max-w-6xl mx-auto space-y-8 relative z-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                                User's Dashboard
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <p className="text-slate-500">Welcome back!</p>
                                {accountNumber && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-medium text-blue-700">
                                        <Zap className="h-3 w-3" /> {accountNumber}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                            variant="outline"
                        >
                            {refreshing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh Bills
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Loading State */}
                    {(loading || authLoading) && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="relative">
                                <div className="h-20 w-20 rounded-full border-4 border-blue-100 flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            </div>
                            <p className="text-slate-600 font-medium mt-6">Loading your electricity data...</p>
                            <p className="text-slate-400 text-sm mt-1">This may take a moment</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                        <Card className="border border-red-100 bg-red-50/50">
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <p className="text-sm text-red-600 text-center">{error}</p>
                                    <Button
                                        onClick={fetchBills}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Try Again
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Dashboard Content */}
                    {data && !loading && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                            {/* KPI Cards */}
                            {stats && (
                                <div className="grid gap-4 md:grid-cols-4">
                                    <Card className="border border-slate-200/80 bg-white shadow-md hover:shadow-lg transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-medium text-slate-500">Latest Bill</p>
                                                <div className="h-9 w-9 bg-blue-50 rounded-lg flex items-center justify-center">
                                                    <DollarSign className="h-4 w-4 text-blue-600" />
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold text-slate-900">
                                                PKR {stats.latestPrice.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">{stats.latestUnits} units consumed</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border border-slate-200/80 bg-white shadow-md hover:shadow-lg transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-medium text-slate-500">Avg. Monthly</p>
                                                <div className="h-9 w-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                                                    <Activity className="h-4 w-4 text-emerald-600" />
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold text-slate-900">
                                                PKR {stats.avgPrice.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">{stats.avgUnits} units/month avg</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border border-slate-200/80 bg-white shadow-md hover:shadow-lg transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-medium text-slate-500">Peak Usage</p>
                                                <div className="h-9 w-9 bg-orange-50 rounded-lg flex items-center justify-center">
                                                    <Gauge className="h-4 w-4 text-orange-600" />
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {stats.maxUnits.toLocaleString()} <span className="text-sm font-normal text-slate-400">kWh</span>
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Highest usage in {stats.peakMonth}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border border-slate-200/80 bg-white shadow-md hover:shadow-lg transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-medium text-slate-500">Next Month</p>
                                                <div className="h-9 w-9 bg-purple-50 rounded-lg flex items-center justify-center">
                                                    <TrendingUp className="h-4 w-4 text-purple-600" />
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold text-slate-900">
                                                PKR {data.prediction.nextMonthPrice.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">{data.prediction.nextMonthUnits} units predicted</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Quick Navigation Cards */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <Link href="/forecast" className="block group">
                                    <Card className="border border-blue-200/60 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 overflow-hidden relative hover:border-blue-300">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
                                                <TrendingUp className="h-5 w-5" /> View Detailed Forecast
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-blue-700 text-sm flex items-center gap-2">
                                                See AI-powered predictions for your next month&apos;s bill
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>

                                <Link href="/suggestions" className="block group">
                                    <Card className="border border-emerald-200/60 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 overflow-hidden relative hover:border-emerald-300">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="flex items-center gap-2 text-emerald-900 text-lg">
                                                <Sparkles className="h-5 w-5" /> Energy Saving Tips
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-emerald-700 text-sm flex items-center gap-2">
                                                Get personalized suggestions to reduce your consumption
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </div>

                            {/* Consumption History Graph */}
                            <Card className="border border-slate-200/80 bg-white shadow-md">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-bold text-slate-900">Consumption Trend</CardTitle>
                                            <p className="text-sm text-slate-500 mt-1">Historical bill analysis for your account</p>
                                        </div>
                                        <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <BarChart3 className="h-5 w-5 text-blue-600" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <BillGraph data={data.history} />
                                </CardContent>
                            </Card>

                            {/* Detailed History Table */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-slate-900">Detailed Billing History</h2>
                                <BillList data={data.history} />
                            </div>
                        </div>
                    )}

                    {/* Empty state when no data and not loading */}
                    {!data && !loading && !authLoading && !error && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="h-20 w-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                                <BarChart3 className="h-10 w-10 text-slate-300" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">No Bill Data Yet</h2>
                            <p className="text-slate-500 text-center max-w-md mb-6">
                                Your bills are being fetched from the KE portal. This can take a few minutes after registration.
                            </p>
                            <Button
                                onClick={handleRefresh}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Fetch Bills Now
                            </Button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}
