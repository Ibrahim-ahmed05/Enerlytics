"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Sun, Snowflake, Lightbulb, Fan, Thermometer, Loader2, ArrowRight, TrendingDown, DollarSign, Calendar } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { useAuth } from "@/components/AuthProvider"
import { getBillData, getRecommendations, PredictionResult } from "@/lib/actions"

interface Recommendation {
    priority: number;
    title: string;
    description: string;
    impact: "High" | "Medium" | "Low";
    units_saved: number;
    financial_saving: string;
    action: string;
}

export default function SuggestionsPage() {
    const { accountNumber } = useAuth()
    const [loading, setLoading] = useState(true)
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [predictionData, setPredictionData] = useState<PredictionResult | null>(null)
    const [error, setError] = useState("")

    const [dateInfo, setDateInfo] = useState<{ month: number; isSummer: boolean; isWinter: boolean; dayOfMonth: number }>({
        month: 0,
        isSummer: false,
        isWinter: false,
        dayOfMonth: 1
    })

    useEffect(() => {
        const now = new Date()
        const m = now.getMonth()
        setDateInfo({
            month: m,
            isSummer: m >= 4 && m <= 8,
            isWinter: m >= 10 || m <= 1,
            dayOfMonth: now.getDate()
        })
    }, [])

    const { isSummer, isWinter, dayOfMonth } = dateInfo;

    const fetchAllData = useCallback(async () => {
        if (!accountNumber) return
        
        setLoading(true)
        setError("")
        try {
            // 1. Get prediction data
            const billData = await getBillData(accountNumber)
            setPredictionData(billData)

            // 2. Calculate remaining days (Simplified: assuming 30 day cycle from 1st)
            const today = new Date()
            const remainingDays = 30 - today.getDate()
            
            // 3. Get recommendations
            if (billData.prediction.nextMonthUnits > 0) {
                const recs = await getRecommendations(billData.prediction.nextMonthUnits, Math.max(1, remainingDays))
                setRecommendations(recs)
            }
        } catch (err) {
            console.error("Failed to fetch suggestions", err)
            setError("Could not load personalized recommendations.")
        } finally {
            setLoading(false)
        }
    }, [accountNumber])

    useEffect(() => {
        if (accountNumber) {
            fetchAllData()
        }
    }, [accountNumber, fetchAllData])

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-slate-50 p-4 md:p-8 font-sans">
                <div className="max-w-6xl mx-auto space-y-8">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Smart Recommendations</h1>
                            <p className="text-slate-500 mt-1">Rule-based energy optimization for your home</p>
                        </div>
                        <Button
                            onClick={fetchAllData}
                            variant="outline"
                            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            Refresh Analysis
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                            <p className="text-slate-600 font-medium">Analyzing your consumption patterns...</p>
                        </div>
                    ) : (
                        <>
                            {/* Forecast Context Card */}
                            {predictionData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row gap-8 items-center">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-2 text-blue-600 font-semibold uppercase tracking-wider text-xs">
                                                <TrendingDown className="h-4 w-4" /> Current Trajectory
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-800">
                                                You are projected to consume <span className="text-blue-600">{predictionData.prediction.nextMonthUnits} units</span> this month.
                                            </h2>
                                            <p className="text-slate-600">
                                                Based on your current usage, you will likely fall into <span className="font-semibold">
                                                    {predictionData.prediction.nextMonthUnits <= 100 ? 'Slab 1 (0-100)' :
                                                     predictionData.prediction.nextMonthUnits <= 200 ? 'Slab 2 (100-200)' :
                                                     predictionData.prediction.nextMonthUnits <= 300 ? 'Slab 3 (200-300)' :
                                                     predictionData.prediction.nextMonthUnits <= 700 ? 'Slab 4 (300-700)' : 'Slab 5 (Above 700)'}
                                                </span>. 
                                                Follow the steps below to stay in a lower slab and save money.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                <p className="text-xs text-blue-600 font-medium mb-1 uppercase">Next Slab</p>
                                                <p className="text-2xl font-bold text-blue-900">
                                                    {predictionData.prediction.nextMonthUnits <= 100 ? '100' :
                                                     predictionData.prediction.nextMonthUnits <= 200 ? '200' :
                                                     predictionData.prediction.nextMonthUnits <= 300 ? '300' :
                                                     predictionData.prediction.nextMonthUnits <= 700 ? '700' : '700+'}
                                                </p>
                                                <p className="text-xs text-blue-700/60 mt-1">Units Threshold</p>
                                            </div>
                                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                                <p className="text-xs text-emerald-600 font-medium mb-1 uppercase">Days Left</p>
                                                <p className="text-2xl font-bold text-emerald-900">{Math.max(1, 30 - dayOfMonth)}</p>
                                                <p className="text-xs text-emerald-700/60 mt-1">In Cycle</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Seasonal Context */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
                            >
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                                    <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                        {isSummer ? <Sun className="h-10 w-10 text-yellow-300" /> : <Snowflake className="h-10 w-10 text-blue-100" />}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-xl font-bold mb-1">Peak Hour Awareness</h3>
                                        <p className="text-blue-100">
                                            K-Electric peak hours are <span className="font-bold text-white">5:00 PM to 11:00 PM</span>. 
                                            Electricity rates are significantly higher during this window.
                                        </p>
                                    </div>
                                    <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-sm font-medium backdrop-blur-sm">
                                        Currently in {isSummer ? 'Summer' : 'Winter'} Cycle
                                    </div>
                                </div>
                            </motion.div>

                            {/* Recommendations Table-like View */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" /> 
                                    Priority Recommendations
                                </h3>

                                <motion.div
                                    variants={container}
                                    initial="hidden"
                                    animate="show"
                                    className="space-y-4"
                                >
                                    {recommendations.length > 0 ? (
                                        recommendations.map((rec, index) => (
                                            <motion.div key={index} variants={item}>
                                                <Card className="overflow-hidden border-slate-200 hover:border-blue-300 transition-colors group">
                                                    <div className="flex flex-col md:flex-row">
                                                        <div className={`w-2 ${rec.priority === 1 ? 'bg-red-500' : rec.priority === 2 ? 'bg-orange-500' : 'bg-blue-500'}`} />
                                                        <CardContent className="p-0 flex-1">
                                                            <div className="flex flex-col md:flex-row items-stretch md:items-center">
                                                                <div className="p-6 flex-1">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                                                                            {rec.priority}
                                                                        </span>
                                                                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                                            {rec.title}
                                                                        </h4>
                                                                    </div>
                                                                    <p className="text-slate-600 text-sm">{rec.description}</p>
                                                                </div>
                                                                
                                                                <div className="flex border-t md:border-t-0 md:border-l border-slate-100">
                                                                    <div className="px-6 py-4 md:py-6 flex flex-col justify-center border-r md:border-r-0 border-slate-100 min-w-[140px]">
                                                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Estimated Saving</p>
                                                                        <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                                                                            <ArrowRight className="h-3 w-3" /> {rec.units_saved} kWh
                                                                        </p>
                                                                    </div>
                                                                    <div className="px-6 py-4 md:py-6 flex flex-col justify-center bg-slate-50/50 min-w-[160px]">
                                                                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Financial Impact</p>
                                                                        <p className="text-sm font-bold text-slate-900">{rec.financial_saving}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <Card className="p-12 text-center border-dashed border-2 border-slate-200">
                                            <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Zap className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <h4 className="text-lg font-semibold text-slate-800">You're doing great!</h4>
                                            <p className="text-slate-500 max-w-sm mx-auto mt-2">
                                                Your current trajectory is well within the low-usage slab. No major reductions are required at this time.
                                            </p>
                                        </Card>
                                    )}
                                </motion.div>
                            </div>
                            
                            {/* KE Tariff Info */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="border-slate-200 bg-white shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" /> KE Slab Structure
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {[
                                                { slab: "0 - 100 Units", price: "Rs. 16.48" },
                                                { slab: "101 - 200 Units", price: "Rs. 22.95" },
                                                { slab: "201 - 300 Units", price: "Rs. 27.14" },
                                                { slab: "301 - 700 Units", price: "Rs. 38.46" },
                                                { slab: "Above 700 Units", price: "Rs. 47.20" },
                                            ].map((row, i) => (
                                                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                                    <span className="text-sm text-slate-600">{row.slab}</span>
                                                    <span className="text-sm font-bold text-slate-900">{row.price}</span>
                                                </div>
                                            ))}
                                        </div>

                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200 bg-white shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" /> Billing Cycle Stats
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-slate-500">Cycle Progress</span>
                                                    <span className="font-medium text-slate-700">{dayOfMonth}/30 Days</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-blue-500 rounded-full" 
                                                        style={{ width: `${(dayOfMonth / 30) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed italic">
                                                *Calculations assume a standard 30-day billing cycle. Personalized recommendations are based on your ensemble forecast trajectory.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}
