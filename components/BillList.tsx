import { memo } from "react"
import { BillData } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BillListProps {
    data: BillData[]
}

export const BillList = memo(function BillList({ data }: BillListProps) {
    if (!data || data.length === 0) return null

    return (
        <Card className="w-full border border-slate-200 shadow-xl bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-slate-900 font-bold">Detailed Billing History</CardTitle>
                <p className="text-xs text-slate-500">Breakdown of your monthly consumption and charges</p>
            </CardHeader>
            <CardContent className="p-0">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-bold">Billing Month</th>
                                <th scope="col" className="px-6 py-4 font-bold text-center">Units Consumed</th>
                                <th scope="col" className="px-6 py-4 font-bold text-right">Amount (PKR)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((item, index) => (
                                <tr key={index} className={`transition-colors group ${item.isPredicted ? 'bg-indigo-50 hover:bg-indigo-100 border-l-4 border-indigo-500' : 'hover:bg-blue-50/30'}`}>
                                    <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                                        {item.monthName || `Month ${index + 1}`}
                                        {item.isPredicted && (
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 bg-indigo-200/50 px-2 py-0.5 rounded-full">
                                                Predicted
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-600 font-medium">
                                        <span className={`px-2.5 py-1 rounded-md ${item.isPredicted ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100'}`}>
                                            {item.currentMonthUnits.toLocaleString()} kWh
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`font-bold ${item.isPredicted ? 'text-indigo-600' : 'text-blue-600'}`}>
                                            {item.currentMonthPrice.toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-100">
                    {data.map((item, index) => (
                        <div key={index} className={`p-4 flex items-center justify-between transition-colors ${item.isPredicted ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-slate-50'}`}>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-slate-900">{item.monthName || `Month ${index + 1}`}</p>
                                    {item.isPredicted && (
                                        <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-200/50 px-2 py-0.5 rounded-full">
                                            Pred
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs font-medium text-slate-500">
                                    Usage: <span className={item.isPredicted ? 'text-indigo-700' : 'text-slate-700'}>{item.currentMonthUnits.toLocaleString()} kWh</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className={`text-lg font-black leading-tight ${item.isPredicted ? 'text-indigo-600' : 'text-blue-600'}`}>
                                    <span className={`text-[10px] font-bold block ${item.isPredicted ? 'text-indigo-400' : 'text-blue-400'}`}>PKR</span>
                                    {item.currentMonthPrice.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
})
