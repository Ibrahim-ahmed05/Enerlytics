"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, LineChart, Lightbulb, Zap, LogOut, User, Menu, X } from "lucide-react"
import { useAuth } from "@/components/AuthProvider"
import { signOut } from "@/lib/auth-actions"

export function Navbar() {
    const pathname = usePathname()
    const { user, accountNumber } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

    const links = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/forecast", label: "Forecast", icon: LineChart },
        { href: "/suggestions", label: "Suggestions", icon: Lightbulb },
    ]

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Section */}
                    <div className="flex-shrink-0">
                        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900">
                                Ener<span className="text-blue-600">lytics</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1 mx-auto">
                        {links.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-200/50"
                                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{link.label}</span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* User Section (Desktop) / Mobile Toggle */}
                    <div className="flex items-center gap-2">
                        {user && (
                            <div className="hidden md:flex items-center gap-3 ml-2 pl-4 border-l border-slate-200 text-sm">
                                <div className="flex flex-col text-right">
                                    <span className="text-xs text-slate-500 font-medium truncate max-w-[120px]">{user.email?.split('@')[0]}</span>
                                    {accountNumber && <span className="text-[10px] text-blue-600 font-mono tracking-tighter">{accountNumber}</span>}
                                </div>
                                <form action={signOut}>
                                    <button
                                        type="submit"
                                        className="h-9 w-9 flex items-center justify-center rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-slate-100"
                                        title="Sign Out"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Mobile Toggle Button */}
                        <div className="md:hidden">
                            <button
                                onClick={toggleMenu}
                                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
                            >
                                {isMenuOpen ? <X className="h-6 w-6 animate-in spin-in-90 duration-200" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white animate-in slide-in-from-top-4 duration-300 shadow-xl overflow-hidden pb-6">
                    <div className="px-4 pt-4 space-y-2">
                        {links.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-all",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                            : "text-slate-700 hover:bg-slate-50"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {link.label}
                                </Link>
                            )
                        })}
                        
                        {user && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-3 px-4 mb-4">
                                    <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                                        <p className="text-xs text-blue-600 font-mono">{accountNumber}</p>
                                    </div>
                                </div>
                                <form action={signOut} className="px-4">
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors shadow-sm"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Log Out
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
