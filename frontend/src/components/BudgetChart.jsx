/**
 * BudgetChart — renders a PieChart (by category) and BarChart (by day)
 * using recharts.
 */
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'

const PIE_COLORS = ['#6366f1', '#a855f7', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4']

/**
 * Parse a cost string like "₹2500" or "$30" → number
 */
function parseCost(str) {
    if (!str) return 0
    const match = String(str).replace(/[₹$,]/g, '').match(/[\d.]+/)
    return match ? parseFloat(match[0]) : 0
}

export default function BudgetChart({ itinerary, collaborators = [] }) {
    if (!itinerary || itinerary.length === 0) return null

    // --- Daily spend bar chart ---
    const dailyData = itinerary.map((day) => {
        const total = (day.places || []).reduce((sum, p) => sum + parseCost(p.estimated_cost), 0)
        return { name: `Day ${day.day}`, amount: total }
    })

    // --- Category pie chart ---
    const categoryMap = {}
    itinerary.forEach((day) => {
        ; (day.places || []).forEach((place) => {
            const cost = parseCost(place.estimated_cost)
            if (cost === 0) return
            const cats = place.category?.length ? place.category : ['Other']
            cats.forEach((cat) => {
                categoryMap[cat] = (categoryMap[cat] || 0) + cost / cats.length
            })
        })
    })

    const pieData = Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value: Math.round(value) }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)

    const totalBudget = dailyData.reduce((s, d) => s + d.amount, 0)
    const participants = 1 + (collaborators?.length || 0)
    const perPerson = participants > 1 ? Math.round(totalBudget / participants) : totalBudget

    if (totalBudget === 0) return null

    return (
        <div className="glass-card p-6 mt-8">
            <h2 className="text-xl font-bold text-white mb-1">💰 Budget Breakdown</h2>
            <div className="flex flex-col gap-1 mb-6">
                <p className="text-gray-500 text-sm">Estimated total: <span className="text-white font-semibold">₹{totalBudget.toLocaleString('en-IN')}</span></p>
                {participants > 1 && (
                    <p className="text-gray-500 text-sm">
                        Expense per person ({participants} participants): <span className="text-emerald-400 font-semibold">₹{perPerson.toLocaleString('en-IN')}</span>
                    </p>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Bar chart — daily spending */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">Daily Spending</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dailyData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                            <Tooltip
                                contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f9fafb' }}
                                formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Estimated']}
                            />
                            <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie chart — by category */}
                {pieData.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-300 mb-4">By Category</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieData.map((_, idx) => (
                                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f9fafb' }}
                                    formatter={(v, n) => [`₹${Number(v).toLocaleString('en-IN')}`, n]}
                                />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(val) => <span style={{ color: '#9ca3af', fontSize: 11 }}>{val}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    )
}
