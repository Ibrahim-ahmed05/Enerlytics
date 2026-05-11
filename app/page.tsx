"use client"

import Link from "next/link"
import { Zap, BarChart3, TrendingUp, Sparkles, ArrowRight, Shield, Clock, Users } from "lucide-react"
import { useAuth } from "@/components/AuthProvider"

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/60 to-indigo-100/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-gradient-to-br from-sky-100/50 to-blue-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-indigo-100/40 to-purple-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Top Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-5">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Ener<span className="text-blue-600">lytics</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/about"
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
          >
            About
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-700">AI-Powered Electricity Analytics</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 leading-[0.95] animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
            Take Control of{" "}
            <br className="hidden md:block" />
            Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Electricity Bills
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
            Track your KE electricity bills, analyze consumption patterns, and get
            AI-powered predictions to save money every month.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-base font-semibold shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 hover:from-blue-700 hover:to-indigo-700 transition-all group"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-base font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-md"
            >
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-slate-900">100+</p>
              <p className="text-sm text-slate-500 mt-1">Accounts Tracked</p>
            </div>
            <div className="h-10 w-px bg-slate-200 hidden md:block" />
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-slate-900">85%</p>
              <p className="text-sm text-slate-500 mt-1">Prediction Accuracy</p>
            </div>
            <div className="h-10 w-px bg-slate-200 hidden md:block" />
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-slate-900">15%</p>
              <p className="text-sm text-slate-500 mt-1">Avg. Bill Reduction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Everything you need to manage{" "}
            <br className="hidden md:block" />
            your electricity costs
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: BarChart3,
              title: "Bill Analysis",
              description: "View comprehensive bill history with detailed monthly breakdowns, interactive charts, and consumption trends.",
              gradient: "from-blue-500 to-blue-600",
              bg: "bg-blue-50",
              shadow: "shadow-blue-500/20",
            },
            {
              icon: TrendingUp,
              title: "Smart Forecasting",
              description: "Get AI-powered predictions for your future bills based on historical consumption patterns and seasonal data.",
              gradient: "from-emerald-500 to-emerald-600",
              bg: "bg-emerald-50",
              shadow: "shadow-emerald-500/20",
            },
            {
              icon: Sparkles,
              title: "Energy Tips",
              description: "Receive personalized recommendations to reduce your electricity consumption and save money every month.",
              gradient: "from-purple-500 to-purple-600",
              bg: "bg-purple-50",
              shadow: "shadow-purple-500/20",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white border border-slate-200/80 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`h-14 w-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg ${feature.shadow} mb-6`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">How it works</p>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Get started in minutes
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: Users,
              title: "Create Account",
              description: "Sign up with your email and 13-digit KE account number. Verify your email to get started.",
            },
            {
              step: "02",
              icon: Clock,
              title: "Automatic Bill Fetch",
              description: "We automatically fetch all your past electricity bills from the KE portal — no manual uploads needed.",
            },
            {
              step: "03",
              icon: BarChart3,
              title: "View Insights",
              description: "Analyze your consumption patterns, view interactive charts, and get AI-powered predictions for future bills.",
            },
          ].map((item, index) => (
            <div key={index} className="relative text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-50 border-2 border-blue-100 rounded-2xl mb-6">
                <item.icon className="h-7 w-7 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 md:right-auto md:left-1/2 md:ml-6 md:-top-1 h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust / Security Banner */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
          <div className="relative z-10">
            <Shield className="h-12 w-12 text-blue-400 mx-auto mb-6" />
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Your data is safe with us
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
              We use industry-standard encryption and Supabase for secure authentication.
              Your billing data is only accessible to you.
            </p>
            <Link
              href={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl text-base font-semibold hover:bg-slate-50 transition-all shadow-xl group"
            >
              Start Tracking Your Bills
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-100 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Ener<span className="text-blue-600">lytics</span></span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">About</Link>
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Enerlytics. Built for KE consumers in Pakistan.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
