"use client"

import { Button } from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"

interface ApplianceCounterProps {
    label: string
    count: number
    onChange: (newCount: number) => void
    icon?: React.ReactNode
}

export function ApplianceCounter({ label, count, onChange, icon }: ApplianceCounterProps) {
    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
                {icon && <div className="text-slate-500">{icon}</div>}
                <span className="font-medium text-slate-700">{label}</span>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() => onChange(Math.max(0, count - 1))}
                    disabled={count <= 0}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-bold text-slate-900">{count}</span>
                <Button
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() => onChange(count + 1)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
