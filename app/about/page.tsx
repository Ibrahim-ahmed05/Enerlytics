"use client"

import Link from "next/link"
import Image from "next/image"
import { Zap, ArrowRight, GraduationCap, Brain, Cpu, Users, Award, ChevronRight, Linkedin } from "lucide-react"
import { useAuth } from "@/components/AuthProvider"

const teamMembers = [
  {
    name: "Ibrahim Ahmed",
    rollNumber: "22K-4341",
    initials: "IA",
    gradient: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-500/30",
    linkedin: "https://www.linkedin.com/in/ibrahim-ahmed05/",
  },
  {
    name: "Abdulhadi Yaseen",
    rollNumber: "22K-4250",
    initials: "AY",
    gradient: "from-indigo-500 to-purple-600",
    shadow: "shadow-indigo-500/30",
    linkedin: "https://www.linkedin.com/in/abdulhadi-yaseen/",
  },
  {
    name: "Saad Yousuf",
    rollNumber: "22K-4572",
    initials: "SY",
    gradient: "from-purple-500 to-pink-600",
    shadow: "shadow-purple-500/30",
    linkedin: "https://www.linkedin.com/in/muhammadsaadyousuf/",
  },
]

const models = [
  {
    name: "Bidirectional LSTM",
    shortName: "Bi-LSTM",
    icon: Brain,
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
    shadow: "shadow-blue-500/20",
    description:
      "A powerful recurrent neural network that processes electricity consumption sequences in both forward and backward directions, capturing complex temporal dependencies to deliver accurate bill predictions.",
    highlights: ["Temporal pattern recognition", "Sequential data processing", "Long-range dependencies", "Bidirectional context"],
  },
  {
    name: "Temporal Fusion Transformer",
    shortName: "TFT",
    icon: Cpu,
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    shadow: "shadow-emerald-500/20",
    description:
      "A state-of-the-art transformer architecture designed specifically for multi-horizon time-series forecasting, leveraging attention mechanisms to model seasonal electricity consumption trends and external factors.",
    highlights: ["Multi-horizon forecasting", "Attention mechanisms", "Seasonal trend modeling", "Interpretable predictions"],
  },
]

export default function AboutPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/60 to-indigo-100/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-gradient-to-br from-sky-100/50 to-blue-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-indigo-100/40 to-purple-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "10s" }} />
      </div>

      {/* Top Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Ener<span className="text-blue-600">lytics</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/" className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
            Home
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
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
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <GraduationCap className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Final Year Project — FAST-NUCES</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6 animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
          About{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Enerlytics
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          An AI-powered electricity bill management and forecasting platform developed as a{" "}
          <strong className="text-slate-800">Final Year Project</strong> at FAST National University of Computer and Emerging Sciences.
        </p>
      </section>

      {/* University Banner */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 md:p-12 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/15 to-purple-600/10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 p-1.5">
                <Image
                  src="/image.png"
                  alt="FAST National University logo"
                  width={88}
                  height={88}
                  className="rounded-xl object-contain"
                />
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full mb-3">
                <Award className="h-3.5 w-3.5 text-blue-300" />
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Final Year Project 2025-26</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                FAST National University of Computer &amp; Emerging Sciences, Karachi
              </h2>
              <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
                This project was developed by students of the Computer Science department, combining machine learning research with modern web engineering to deliver real-world electricity consumption insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Overview */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">The Project</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">What is Enerlytics?</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Bill Automation",
              desc: "Automatically scrapes and stores KE electricity bill history — no manual data entry required.",
              gradient: "from-blue-500 to-blue-600",
              shadow: "shadow-blue-500/20",
            },
            {
              icon: Brain,
              title: "AI Forecasting",
              desc: "Uses state-of-the-art deep learning models to predict future bills with high accuracy.",
              gradient: "from-indigo-500 to-purple-600",
              shadow: "shadow-indigo-500/20",
            },
            {
              icon: Award,
              title: "Energy Tips",
              desc: "Delivers personalized recommendations to help users reduce electricity costs every month.",
              gradient: "from-emerald-500 to-teal-600",
              shadow: "shadow-emerald-500/20",
            },
          ].map((item, i) => (
            <div key={i} className="group bg-white border border-slate-200/80 rounded-2xl p-7 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className={`h-12 w-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center shadow-lg ${item.shadow} mb-5`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Forecasting Models */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">AI Models</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Forecasting Architectures</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto text-base">
            Two cutting-edge deep learning models power our electricity bill forecasting engine.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {models.map((model, i) => (
            <div
              key={i}
              className={`group relative bg-white border ${model.border} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
            >
              {/* Background accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${model.gradient} opacity-5 rounded-full -translate-y-8 translate-x-8 group-hover:opacity-10 transition-opacity`} />

              <div className="relative z-10">
                <div className="flex items-start gap-4 mb-5">
                  <div className={`h-14 w-14 bg-gradient-to-br ${model.gradient} rounded-2xl flex items-center justify-center shadow-lg ${model.shadow} flex-shrink-0`}>
                    <model.icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <div className={`inline-block px-2.5 py-1 ${model.bg} rounded-lg mb-1`}>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{model.shortName}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{model.name}</h3>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-5">{model.description}</p>

                <div className="space-y-2">
                  {model.highlights.map((h, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-slate-700 font-medium">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ensemble note */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Ensemble Approach</span>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed max-w-2xl mx-auto">
            Both models are combined into an <strong>ensemble pipeline</strong> that leverages the strengths of each architecture — delivering superior accuracy compared to any single model alone.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">The Team</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Meet the Developers</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto text-base">
            Computer Science students at FAST-NUCES who built this platform from the ground up.
          </p>
        </div>

        {/* Group Photo Card */}
        <div className="relative mb-10 rounded-3xl overflow-hidden shadow-2xl border-2 border-blue-100 group">
          {/* Decorative glow ring */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/10 z-10 pointer-events-none" />

          {/* The Image */}
          <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
            <Image
              src="/about image.jpeg"
              alt="Enerlytics team — Ibrahim Ahmed, Abdulhadi Yaseen, and Saad Yousuf"
              fill
              className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              priority
              sizes="(max-width: 768px) 100vw, 90vw"
            />
            {/* Bottom gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-20" />
          </div>

          {/* Bottom label on the image */}
          <div className="absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/30 backdrop-blur-sm border border-blue-400/40 rounded-full mb-2">
                  <div className="h-1.5 w-1.5 bg-blue-300 rounded-full animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-semibold text-blue-200 uppercase tracking-wider">Final Year Project — FAST-NUCES 2025-26</span>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">The Engineering Team</h3>
                <p className="text-slate-300 text-xs sm:text-sm mt-1">Three CS students who turned data science into a real product.</p>
              </div>
              {/* Name chips — hidden on xs, visible from sm */}
              <div className="hidden sm:flex gap-2 flex-nowrap flex-shrink-0">
                {teamMembers.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full"
                  >
                    <div className={`h-5 w-5 bg-gradient-to-br ${m.gradient} rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0`}>
                      {m.initials}
                    </div>
                    <span className="text-white text-xs font-semibold whitespace-nowrap">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Individual Member Cards */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {teamMembers.map((member, i) => (
            <div
              key={i}
              className="group bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center relative overflow-hidden"
            >
              {/* Subtle BG */}
              <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />

              {/* All content stacked in a flex column so each element is always on its own line */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Avatar */}
                <div className={`h-20 w-20 bg-gradient-to-br ${member.gradient} rounded-2xl flex items-center justify-center shadow-xl ${member.shadow} mb-5 text-white text-xl font-bold transform group-hover:scale-105 transition-transform duration-300`}>
                  {member.initials}
                </div>

                {/* Name with LinkedIn */}
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/name flex items-center gap-1.5 mb-3 hover:text-blue-600 transition-colors"
                >
                  <h3 className="text-lg font-bold text-slate-900 group-hover/name:text-blue-600 transition-colors">{member.name}</h3>
                  <Linkedin className="h-4 w-4 text-slate-300 group-hover/name:text-blue-500 transition-colors" />
                </a>

                {/* Roll number — always on its own line */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full mb-4">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 tracking-wide">{member.rollNumber}</span>
                </div>

                <div className="w-full pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 font-medium">BS Computer Science</p>
                  <p className="text-xs text-slate-400">FAST-NUCES</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
          <div className="relative z-10">
            <GraduationCap className="h-12 w-12 text-blue-400 mx-auto mb-6" />
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Try Enerlytics Today</h2>
            <p className="text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
              Experience AI-powered electricity bill forecasting built by passionate CS students at FAST-NUCES.
            </p>
            <Link
              href={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl text-base font-semibold hover:bg-slate-50 transition-all shadow-xl group"
            >
              Get Started Free
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
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} Enerlytics. Final Year Project — FAST-NUCES.</p>
        </div>
      </footer>
    </div>
  )
}
