/**
 * BudgetChart — renders a PieChart (by category) and BarChart (by day)
 * using recharts, plus a proportional group budget-split calculator.
 */
import { useEffect, useState } from 'react'
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
const GROUP_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#a855f7', '#06b6d4', '#ec4899']

/**
 * Parse a cost string like "₹2500" or "$30" → number
 */
function parseCost(str) {
    if (!str) return 0
    const match = String(str).replace(/[₹$,]/g, '').match(/[\d.]+/)
    return match ? parseFloat(match[0]) : 0
}

/** Small pill badge */
function Badge({ label, color = '#6366f1' }) {
    return (
        <span
            style={{ background: color + '22', border: `1px solid ${color}55`, color }}
            className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
        >
            {label}
        </span>
    )
}

export default function BudgetChart({ itinerary, collaborators = [], canEdit = true, initialGroups = null, onPersistGroups = null }) {
     const buildDefaultGroups = (participantCount) => {
         const groupCount = Math.max(1, Number(participantCount) || 0)
         return Array.from({ length: groupCount }).map((_, idx) => ({
             id: idx + 1,
             name: `Family ${idx + 1}`,
             members: 1,
         }))
     }

    // ── Group-split state ──────────────────────────────────────────────
    const [groups, setGroups] = useState(() => buildDefaultGroups(1 + (collaborators?.length || 0)))
    const [appliedGroups, setAppliedGroups] = useState(() => buildDefaultGroups(1 + (collaborators?.length || 0)))
    const [splitResult, setSplitResult] = useState(null)
    const [nextId, setNextId] = useState(() => (Math.max(1, 1 + (Number(collaborators?.length) || 0)) + 1))
    const [isAutoGroups, setIsAutoGroups] = useState(() => !(Array.isArray(initialGroups) && initialGroups.length > 0))

    useEffect(() => {
        if (!Array.isArray(initialGroups) || initialGroups.length === 0) return
        setGroups(initialGroups)
        setAppliedGroups(initialGroups)
        const maxId = initialGroups.reduce((m, g) => Math.max(m, Number(g.id) || 0), 0)
        setNextId(maxId + 1)
        setSplitResult(null)
        setIsAutoGroups(false)
    }, [initialGroups])

    useEffect(() => {
        if (!isAutoGroups) return
        if (Array.isArray(initialGroups) && initialGroups.length > 0) return

        const defaults = buildDefaultGroups(1 + (collaborators?.length || 0))
        setGroups(defaults)
        setAppliedGroups(defaults)
        const maxId = defaults.reduce((m, g) => Math.max(m, Number(g.id) || 0), 0)
        setNextId(maxId + 1)
        setSplitResult(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collaborators?.length, isAutoGroups])

    if (!itinerary || itinerary.length === 0) return null

    // --- Daily spend bar chart ---
    const dailyData = itinerary.map((day) => {
        const total = (day.places || []).reduce((sum, p) => sum + parseCost(p.estimated_cost), 0)
        return { name: `Day ${day.day}`, amount: total }
    })

    // --- Category pie chart ---
    const categoryMap = {}
    itinerary.forEach((day) => {
        ;(day.places || []).forEach((place) => {
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

    const shouldShowSplit = canEdit || participants > 1 || (Array.isArray(initialGroups) && initialGroups.length > 0)

    const computeSplitResult = (groupsToUse) => {
        const valid = (groupsToUse || []).filter((g) => g?.name?.trim() && Number(g.members) > 0)
        if (valid.length < 2) return null
        const totalMembers = valid.reduce((s, g) => s + Number(g.members), 0)
        const results = valid.map((g, idx) => {
            const ratio = Number(g.members) / totalMembers
            return {
                name: g.name.trim(),
                members: Number(g.members),
                ratio,
                amount: Math.round(totalBudget * ratio),
                color: GROUP_COLORS[idx % GROUP_COLORS.length],
            }
        })
        return { results, totalMembers, totalBudget }
    }

    useEffect(() => {
        setSplitResult(computeSplitResult(appliedGroups))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalBudget, appliedGroups])

    // ── Group-split handlers ───────────────────────────────────────────
    const addGroup = () => {
        if (!canEdit) return
        setIsAutoGroups(false)
        setGroups((prev) => [...prev, { id: nextId, name: `Group ${nextId}`, members: 1 }])
        setNextId((n) => n + 1)
        setSplitResult(null)
    }

    const removeGroup = (id) => {
        if (!canEdit) return
        setIsAutoGroups(false)
        setGroups((prev) => prev.filter((g) => g.id !== id))
        setSplitResult(null)
    }

    const updateGroup = (id, field, value) => {
        if (!canEdit) return
        setIsAutoGroups(false)
        setGroups((prev) =>
            prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
        )
        setSplitResult(null)
    }

    const calculateSplit = () => {
        if (!canEdit) return
        const computed = computeSplitResult(groups)
        if (!computed) return
        setIsAutoGroups(false)
        setSplitResult(computed)
        setAppliedGroups(groups)
        if (typeof onPersistGroups === 'function') onPersistGroups(groups)
    }

    return (
        <div className="glass-card p-6 mt-8">
            <h2 className="text-xl font-bold text-white mb-1">💰 Budget Breakdown</h2>
            <div className="flex flex-col gap-1 mb-6">
                <p className="text-gray-500 text-sm">
                    Estimated total:{' '}
                    <span className="text-white font-semibold">
                        ₹{totalBudget.toLocaleString('en-IN')}
                    </span>
                </p>
                {participants > 1 && (
                    <p className="text-gray-500 text-sm">
                        Expense per person ({participants} participants):{' '}
                        <span className="text-emerald-400 font-semibold">
                            ₹{perPerson.toLocaleString('en-IN')}
                        </span>
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

            {/* ── Split Budget by Groups ─────────────────────────────────── */}
            {shouldShowSplit && (
                <div className="mt-10 pt-8 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="text-lg font-bold text-white">🏠 Split Budget by Groups</h3>
                            <p className="text-gray-500 text-xs mt-0.5">
                                Add each family / party with their member count — we'll split the total proportionally.
                            </p>
                        </div>
                        <button
                            onClick={addGroup}
                            disabled={!canEdit}
                            className="text-xs px-3 py-1.5 rounded-lg bg-brand-500/15 border border-brand-400/30 text-brand-300 hover:bg-brand-500/25 transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            + Add Group
                        </button>
                    </div>

                    {/* Group inputs */}
                    <div className="mt-5 space-y-3">
                        {groups.map((g, idx) => (
                            <div
                                key={g.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                            >
                                {/* Color dot */}
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ background: GROUP_COLORS[idx % GROUP_COLORS.length] }}
                                />

                                {/* Name input */}
                                <input
                                    type="text"
                                    value={g.name}
                                    onChange={(e) => updateGroup(g.id, 'name', e.target.value)}
                                    placeholder="Group name"
                                    disabled={!canEdit}
                                    className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 outline-none border-b border-white/10 focus:border-brand-400/60 transition-colors pb-0.5"
                                />

                                {/* Members input */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-gray-500 text-xs">👤</span>
                                    <button
                                        onClick={() => updateGroup(g.id, 'members', Math.max(1, Number(g.members) - 1))}
                                        disabled={!canEdit}
                                        className="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-sm font-bold"
                                    >
                                        −
                                    </button>
                                    <span className="text-white font-semibold text-sm w-5 text-center">
                                        {g.members}
                                    </span>
                                    <button
                                        onClick={() => updateGroup(g.id, 'members', Number(g.members) + 1)}
                                        disabled={!canEdit}
                                        className="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-sm font-bold"
                                    >
                                        +
                                    </button>
                                    <span className="text-gray-500 text-xs ml-1">members</span>
                                </div>

                                {/* Remove */}
                                {groups.length > 1 && (
                                    <button
                                        onClick={() => removeGroup(g.id)}
                                        disabled={!canEdit}
                                        className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none ml-1 disabled:opacity-40 disabled:cursor-not-allowed"
                                        title="Remove group"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Calculate button */}
                    <button
                        onClick={calculateSplit}
                        disabled={!canEdit || groups.filter((g) => g.name.trim() && Number(g.members) > 0).length < 2}
                        className="mt-5 w-full py-3 rounded-xl font-semibold text-sm transition-all
                            bg-gradient-to-r from-brand-600 to-purple-600 text-white
                            hover:from-brand-500 hover:to-purple-500 shadow-lg shadow-brand-500/20
                            disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        ⚡ Calculate Split
                    </button>

                    {/* Result cards */}
                    {splitResult && (
                        <div className="mt-8 animate-slide-up">
                        {/* Summary line */}
                        <p className="text-gray-400 text-sm mb-5">
                            Total{' '}
                            <span className="text-white font-semibold">
                                ₹{splitResult.totalBudget.toLocaleString('en-IN')}
                            </span>{' '}
                            split across{' '}
                            <span className="text-white font-semibold">
                                {splitResult.totalMembers} people
                            </span>{' '}
                            in {splitResult.results.length} groups — proportional by group size.
                        </p>

                        {/* Group result cards */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {splitResult.results.map((r) => (
                                <div
                                    key={r.name}
                                    className="rounded-2xl p-5 border"
                                    style={{
                                        background: r.color + '12',
                                        borderColor: r.color + '40',
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ background: r.color }}
                                        />
                                        <span className="text-white font-bold text-base">{r.name}</span>
                                    </div>

                                    {/* Members & share */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <Badge
                                            label={`${r.members} ${r.members === 1 ? 'person' : 'people'}`}
                                            color={r.color}
                                        />
                                        <Badge
                                            label={`${(r.ratio * 100).toFixed(1)}%`}
                                            color={r.color}
                                        />
                                    </div>

                                    {/* Amount */}
                                    <p className="text-2xl font-black" style={{ color: r.color }}>
                                        ₹{r.amount.toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: r.color + 'aa' }}>
                                        ₹{Math.round(r.amount / r.members).toLocaleString('en-IN')} per person
                                    </p>

                                    {/* Proportion bar */}
                                    <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${(r.ratio * 100).toFixed(1)}%`,
                                                background: r.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Stacked visual bar */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-3">
                                Proportional Share Comparison
                            </h4>
                            <div className="flex rounded-xl overflow-hidden h-8">
                                {splitResult.results.map((r) => (
                                    <div
                                        key={r.name}
                                        className="flex items-center justify-center text-white text-xs font-bold transition-all duration-700 overflow-hidden"
                                        style={{
                                            width: `${(r.ratio * 100).toFixed(2)}%`,
                                            background: r.color,
                                        }}
                                        title={`${r.name}: ₹${r.amount.toLocaleString('en-IN')} (${(r.ratio * 100).toFixed(1)}%)`}
                                    >
                                        {r.ratio > 0.12 ? `${(r.ratio * 100).toFixed(0)}%` : ''}
                                    </div>
                                ))}
                            </div>
                            {/* Legend */}
                            <div className="flex flex-wrap gap-3 mt-3">
                                {splitResult.results.map((r) => (
                                    <div key={r.name} className="flex items-center gap-1.5">
                                        <div
                                            className="w-2.5 h-2.5 rounded-sm"
                                            style={{ background: r.color }}
                                        />
                                        <span className="text-gray-400 text-xs">{r.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Per-person comparison table */}
                        <div className="mt-8 rounded-xl overflow-hidden border border-white/10">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-white/5">
                                        <th className="text-left text-gray-400 font-semibold px-4 py-3">Group</th>
                                        <th className="text-center text-gray-400 font-semibold px-4 py-3">Members</th>
                                        <th className="text-center text-gray-400 font-semibold px-4 py-3">Share %</th>
                                        <th className="text-right text-gray-400 font-semibold px-4 py-3">Total Owed</th>
                                        <th className="text-right text-gray-400 font-semibold px-4 py-3">Per Person</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {splitResult.results.map((r, idx) => (
                                        <tr
                                            key={r.name}
                                            className={idx % 2 === 0 ? 'bg-transparent' : 'bg-white/3'}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-2.5 h-2.5 rounded-full"
                                                        style={{ background: r.color }}
                                                    />
                                                    <span className="text-white font-medium">{r.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-300">{r.members}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className="font-semibold"
                                                    style={{ color: r.color }}
                                                >
                                                    {(r.ratio * 100).toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-white font-bold">
                                                ₹{r.amount.toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-4 py-3 text-right text-emerald-400 font-medium">
                                                ₹{Math.round(r.amount / r.members).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-white/10 bg-white/5">
                                        <td className="px-4 py-3 text-gray-400 font-semibold">Total</td>
                                        <td className="px-4 py-3 text-center text-gray-300 font-semibold">
                                            {splitResult.totalMembers}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-400">100%</td>
                                        <td className="px-4 py-3 text-right text-white font-black">
                                            ₹{splitResult.totalBudget.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 py-3 text-right text-emerald-400 font-semibold">
                                            ₹{Math.round(splitResult.totalBudget / splitResult.totalMembers).toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
