"use client"

import { useState } from "react"
import { signIn } from "@/lib/auth-actions"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Zap, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff, AlertCircle, BarChart3, TrendingUp, Sparkles } from "lucide-react"
import { Suspense } from "react"

function LoginForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const searchParams = useSearchParams()
    const urlError = searchParams.get("error")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const result = await signIn(formData)

        if (!result.success) {
            setError(result.message)
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left side — Branding panel */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
                {/* Decorative shapes */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/[0.03] rounded-full" />
                </div>

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-white">
                            Ener<span className="text-blue-200">lytics</span>
                        </span>
                    </div>

                    {/* Center content */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold text-white leading-tight">
                                Welcome back to<br />Enerlytics
                            </h2>
                            <p className="text-blue-100 mt-4 text-lg leading-relaxed max-w-md">
                                Track your electricity bills, view consumption trends, and get AI-powered predictions.
                            </p>
                        </div>

                        {/* Feature list */}
                        <div className="space-y-4">
                            {[
                                { icon: BarChart3, text: "Interactive consumption charts" },
                                { icon: TrendingUp, text: "AI-powered bill forecasting" },
                                { icon: Sparkles, text: "Personalized energy saving tips" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center">
                                        <item.icon className="h-4 w-4 text-blue-200" />
                                    </div>
                                    <span className="text-blue-100 text-sm">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom */}
                    <p className="text-blue-200/60 text-sm">
                        © {new Date().getFullYear()} Enerlytics. Built for KE consumers.
                    </p>
                </div>
            </div>

            {/* Right side — Login form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
                {/* Subtle bg */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-50/60 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-50/40 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 w-full max-w-md space-y-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2.5 justify-center mb-4">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-900">
                            Ener<span className="text-blue-600">lytics</span>
                        </span>
                    </div>

                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Sign in</h1>
                        <p className="text-slate-500 mt-2">Enter your credentials to access your dashboard</p>
                    </div>

                    {/* URL Error */}
                    {urlError && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-600">{urlError}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
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
                                    placeholder="Enter your password"
                                    className="w-full h-12 pl-12 pr-12 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
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

                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-3.5">
                                <p className="text-sm text-red-600 text-center">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
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
                            <span className="px-4 bg-white text-slate-400">New to Enerlytics?</span>
                        </div>
                    </div>

                    {/* Register link */}
                    <Link
                        href="/register"
                        className="flex w-full h-12 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all items-center justify-center gap-2"
                    >
                        Create a new account
                    </Link>

                    {/* Back to home */}
                    <p className="text-center">
                        <Link href="/" className="text-sm text-slate-400 hover:text-blue-600 transition-colors">
                            ← Back to home
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
