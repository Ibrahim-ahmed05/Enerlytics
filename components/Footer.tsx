"use client"

import Link from "next/link"
import { Zap, Mail, Github, Linkedin, Twitter } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-slate-50 text-slate-600 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-bold text-xl text-slate-900">
                                Smart <span className="text-blue-600">Energy</span>
                            </span>
                        </div>
                        <p className="text-slate-500 mb-4 max-w-md text-sm leading-relaxed">
                            Take control of your electricity consumption with AI-powered forecasting,
                            personalized insights, and smart energy management tools.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-slate-900 font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/forecast" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">
                                    Bill Forecast
                                </Link>
                            </li>
                            <li>
                                <Link href="/suggestions" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">
                                    Energy Tips
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-slate-900 font-semibold mb-4 text-sm uppercase tracking-wider">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors text-sm">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 mt-8 pt-8 text-center text-slate-400 text-xs">
                    <p>&copy; {new Date().getFullYear()} Enerlytics. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}




