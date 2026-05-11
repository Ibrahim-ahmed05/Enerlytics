"use client"

import { useState } from "react"
import { signUp } from "@/lib/auth-actions"
import Link from "next/link"
import { Zap, Mail, Lock, Hash, Loader2, ArrowRight, CheckCircle2, Eye, EyeOff, BarChart3, TrendingUp, Sparkles } from "lucide-react"

export default function RegisterPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [accountNumber, setAccountNumber] = useState("")

    const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 13)
        setAccountNumber(value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        formData.set("accountNumber", accountNumber)

        const result = await signUp(formData)

        if (result.success) {
            setSuccess(true)
        } else {
            setError(result.message)
        }

        setLoading(false)
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-white border border-slate-200/60 shadow-2xl rounded-2xl p-8 text-center space-y-6">
                        <div className="mx-auto h-20 w-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <CheckCircle2 className="h-10 w-10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-slate-900">Check Your Email!</h1>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                We&apos;ve sent a verification link to your email address.
                                Please click the link to verify your account and start using Enerlytics.
                            </p>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <p className="text-sm text-blue-700">
                                <strong>Note:</strong> Your electricity bills are being fetched in the background.
                                They&apos;ll be ready when you log in after verifying your email.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
                        >
                            Go to Login <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/" className="block text-sm text-slate-400 hover:text-blue-600 transition-colors">
                            ← Back to home
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left side — Branding panel */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
                {/* Decorative shapes */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/[0.03] rounded-full" />
                </div>

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-white">
                            Ener<span className="text-emerald-200">lytics</span>
                        </span>
                    </Link>

                    {/* Center content */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold text-white leading-tight">
                                Start saving on<br />your electricity
                            </h2>
                            <p className="text-emerald-100 mt-4 text-lg leading-relaxed max-w-md">
                                Create your free account and get instant access to your bill history, forecasts, and energy-saving insights.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: BarChart3, text: "View all your past bills in one place" },
                                { icon: TrendingUp, text: "Predict next month's electricity cost" },
                                { icon: Sparkles, text: "Get personalized tips to save money" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center">
                                        <item.icon className="h-4 w-4 text-emerald-200" />
                                    </div>
                                    <span className="text-emerald-100 text-sm">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-emerald-200/60 text-sm">
                        © {new Date().getFullYear()} Enerlytics. Built for KE consumers.
                    </p>
                </div>
            </div>

            {/* Right side — Register form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-50/60 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-50/40 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 w-full max-w-md space-y-6">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2.5 justify-center mb-2">
                        <div className="h-10 w-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-900">
                            Ener<span className="text-emerald-600">lytics</span>
                        </span>
                    </div>

                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create account</h1>
                        <p className="text-slate-500 mt-2">Sign up to start tracking your electricity bills</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    placeholder="Min. 6 characters"
                                    className="w-full h-12 pl-12 pr-12 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="accountNumber" className="text-sm font-medium text-slate-700">
                                KE Account Number
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    id="accountNumber"
                                    name="accountNumber"
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    value={accountNumber}
                                    onChange={handleAccountNumberChange}
                                    placeholder="13-digit account number"
                                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all font-mono tracking-wider"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-400">e.g., 0400002891237</p>
                                <p className={`text-xs font-medium transition-colors ${accountNumber.length === 13 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {accountNumber.length}/13 digits
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-3.5">
                                <p className="text-sm text-red-600 text-center">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || accountNumber.length !== 13}
                            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-sm hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-white text-slate-400">Already have an account?</span>
                        </div>
                    </div>

                    {/* Login link */}
                    <Link
                        href="/login"
                        className="flex w-full h-12 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all items-center justify-center gap-2"
                    >
                        Sign in to your account
                    </Link>

                    <p className="text-center">
                        <Link href="/" className="text-sm text-slate-400 hover:text-emerald-600 transition-colors">
                            ← Back to home
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
