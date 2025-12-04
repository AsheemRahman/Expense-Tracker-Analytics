'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Expense } from '../../types/types';
import { expenseService } from '../../services/expenseService';
import { authService } from '../../services/authService';
import { XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

export default function AnalyticsPage() {
    const router = useRouter();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }
        loadExpenses();
    }, [router]);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await expenseService.getExpenses();
            setExpenses(data);
        } catch (err) {
            if (err instanceof Error)
                setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Group by category
    const categoryData = expenses.reduce((acc, exp) => {
        const category = exp.category_name || 'Uncategorized';
        acc[category] = (acc[category] || 0) + Number(exp.amount);
        return acc;
    }, {} as Record<string, number>);

    const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
        name,
        value: parseFloat(Number(value).toFixed(2)),
    }));

    // Group by month
    const monthlyData = expenses.reduce((acc, exp) => {
        const date = new Date(exp.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        acc[monthKey] = {
            name: monthName,
            amount: (acc[monthKey]?.amount || 0) + Number(exp.amount),
        };
        return acc;
    }, {} as Record<string, { name: string; amount: number }>);

    const monthlyChartData = Object.values(monthlyData)
        .map((item) => ({
            name: item.name,
            amount: parseFloat(Number(item.amount).toFixed(2)),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const averageExpense = expenses.length > 0 ? totalAmount / expenses.length : 0;

    // Top spending categories
    const topCategories = categoryChartData
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Recent trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
    });

    const dailyData = last7Days.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const dayExpenses = expenses.filter(exp => exp.date.startsWith(dateStr));
        const total = dayExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        return {
            name: date.toLocaleDateString('en-US', { weekday: 'short' }),
            amount: parseFloat(Number(total).toFixed(2))
        };
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-zinc-950 dark:via-slate-900 dark:to-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-zinc-950 dark:via-slate-900 dark:to-zinc-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
                                Analytics Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Deep insights into your spending patterns
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/dashboard"
                                className="px-5 py-2.5 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/expenses"
                                className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
                            >
                                All Expenses
                            </Link>
                            <button
                                onClick={() => {
                                    authService.logout();
                                    router.push('/login');
                                }}
                                className="px-5 py-2.5 bg-linear-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-r-xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="group relative overflow-hidden p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Expenses</p>
                            </div>
                            <p className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
                                ₹ {Number(totalAmount).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">All time spending</p>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-500/10 to-green-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-linear-to-br from-emerald-500 to-green-600 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Transactions</p>
                            </div>
                            <p className="text-4xl font-bold bg-linear-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent mb-2">
                                {expenses.length}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total recorded</p>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-linear-to-br from-purple-500 to-pink-600 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Average</p>
                            </div>
                            <p className="text-4xl font-bold bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                                ₹ {averageExpense.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Per transaction</p>
                        </div>
                    </div>
                </div>

                {expenses.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 p-16 text-center">
                        <svg className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No data yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Add some expenses to see detailed analytics and insights
                        </p>
                        <Link
                            href="/expenses"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Your First Expense
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Monthly Trend Chart */}
                            {monthlyChartData.length > 0 && (
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-linear-to-br from-blue-500 to-cyan-600 rounded-lg">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                            Monthly Spending Trend
                                        </h2>
                                    </div>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={monthlyChartData}>
                                            <defs>
                                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                                            <Tooltip
                                                formatter={(value: number) => `₹ ${value.toFixed(2)}`}
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    color: '#000',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Category Distribution Chart */}
                            {categoryChartData.length > 0 && (
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-linear-to-br from-purple-500 to-pink-600 rounded-lg">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                            Category Distribution
                                        </h2>
                                    </div>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={categoryChartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {categoryChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => `₹ ${value.toFixed(2)}`}
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        {/* Last 7 Days Trend & Top Categories */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Last 7 Days */}
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-linear-to-br from-orange-500 to-red-600 rounded-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                        Last 7 Days Activity
                                    </h2>
                                </div>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={dailyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                                        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                                        <Tooltip
                                            formatter={(value: number) => `₹ ${value.toFixed(2)}`}
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                color: '#000',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                padding: '12px',
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5 }} activeDot={{ r: 7 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Top Spending Categories */}
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-linear-to-br from-emerald-500 to-green-600 rounded-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                        Top Spending Categories
                                    </h2>
                                </div>
                                <div className="space-y-4">
                                    {topCategories.map((category, index) => {
                                        const percentage = (category.value / totalAmount) * 100;
                                        return (
                                            <div key={index} className="group">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                                        {category.name}
                                                    </span>
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        ₹ {category.value.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="relative h-3 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="absolute left-0 top-0 h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                                                        style={{
                                                            width: `${percentage}%`,
                                                            backgroundColor: COLORS[index % COLORS.length]
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 text-right">
                                                    {percentage.toFixed(1)}% of total
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}