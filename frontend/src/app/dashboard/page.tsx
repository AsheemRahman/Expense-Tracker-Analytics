'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Expense } from '../../types/types';
import { expenseService } from '../../services/expenseService';
import { authService } from '../../services/authService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export default function DashboardPage() {
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

    // Calculate this month's total
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const thisMonthExpenses = expenses.filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() + 1 === currentMonth && expDate.getFullYear() === currentYear;
    });
    const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Calculate last month's total
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const lastMonthExpenses = expenses.filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() + 1 === lastMonth && expDate.getFullYear() === lastMonthYear;
    });
    const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Get recent 5 expenses
    const recentExpenses = [...expenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    // Category distribution for pie chart
    const categoryData = expenses.reduce((acc, exp) => {
        const category = exp.category_name || 'Uncategorized';
        acc[category] = (acc[category] || 0) + Number(exp.amount);
        return acc;
    }, {} as Record<string, number>);

    const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
        name,
        value: parseFloat(Number(value).toFixed(2)),
    }));

    // Last 6 months data for bar chart
    const getLast6Months = () => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - 1 - i, 1);
            months.push({
                month: date.getMonth() + 1,
                year: date.getFullYear(),
                name: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
            });
        }
        return months;
    };

    const last6Months = getLast6Months();
    const monthlyData = last6Months.map(({ month, year, name }) => {
        const monthExpenses = expenses.filter((exp) => {
            const expDate = new Date(exp.date);
            return expDate.getMonth() + 1 === month && expDate.getFullYear() === year;
        });
        const total = monthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        return {
            name,
            amount: parseFloat(Number(total).toFixed(2)),
        };
    });

    // Calculate percentage change
    const percentageChange = lastMonthTotal > 0
        ? (((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)
        : thisMonthTotal > 0 ? '100' : '0';

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-zinc-950 dark:via-slate-900 dark:to-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-zinc-950 dark:via-slate-900 dark:to-zinc-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
                                Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Track your expenses and financial insights
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href="/expenses"
                                className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
                            >
                                All Expenses
                            </Link>
                            <Link
                                href="/analytics"
                                className="px-5 py-2.5 bg-linear-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5"
                            >
                                Analytics
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
                        {error}
                    </div>
                )}

                {/* Monthly Totals Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="group relative overflow-hidden p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">This Month</p>
                            </div>
                            <p className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-3">
                                ₹ {Number(thisMonthTotal).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {thisMonthExpenses.length} expense{thisMonthExpenses.length !== 1 ? 's' : ''} recorded
                            </p>
                        </div>
                    </div>
                    <div className="group relative overflow-hidden p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-500/10 to-green-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-linear-to-br from-emerald-500 to-green-600 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Last Month</p>
                            </div>
                            <p className="text-4xl font-bold bg-linear-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent mb-3">
                                ₹ {lastMonthTotal.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {lastMonthExpenses.length} expense{lastMonthExpenses.length !== 1 ? 's' : ''}
                                </p>
                                {percentageChange !== '0' && (
                                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${parseFloat(percentageChange) >= 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                                        {parseFloat(percentageChange) >= 0 ? '↑' : '↓'}
                                        {Math.abs(parseFloat(percentageChange))}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Pie Chart - Category Distribution */}
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
                        {categoryChartData.length > 0 ? (
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
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
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
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                                <div className="text-center">
                                    <svg className="w-16 h-16 mx-auto mb-3 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p>No category data available</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bar Chart - Last 6 Months */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-linear-to-br from-blue-500 to-cyan-600 rounded-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                Last 6 Months Trends
                            </h2>
                        </div>
                        {monthlyData.some(d => d.amount > 0) ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => `₹ ${Number(value).toFixed(2)}`}
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            color: '#000',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="amount"
                                        fill="url(#colorGradient)"
                                        radius={[8, 8, 0, 0]}
                                    />
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                                <div className="text-center">
                                    <svg className="w-16 h-16 mx-auto mb-3 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <p>No expense data for the last 6 months</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Expenses */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-linear-to-br from-orange-500 to-red-600 rounded-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Expenses</h2>
                        </div>
                        <Link
                            href="/expenses"
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium group transition-colors"
                        >
                            View All
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                    {recentExpenses.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200 dark:border-zinc-800">
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="text-left py-4 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentExpenses.map((expense, idx) => (
                                        <tr
                                            key={expense.id}
                                            className={`border-b border-gray-100 dark:border-zinc-800 hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-zinc-800 dark:hover:to-zinc-800 transition-all ${idx === 0 ? 'bg-blue-50/30 dark:bg-zinc-800/50' : ''}`}
                                        >
                                            <td className="py-4 px-4">
                                                <span className="font-semibold text-gray-800 dark:text-white">
                                                    {expense.title}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="font-bold text-lg bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                                    ₹ {Number(expense.amount).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="inline-flex px-3 py-1.5 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-full text-xs font-semibold shadow-lg">
                                                    {expense.category_name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm font-medium">
                                                {new Date(expense.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <svg className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                                No recent expenses
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                Add your first expense to get started!
                            </p>
                        </div>
                    )}
                </div>

                {expenses.length === 0 && (
                    <div className="mt-8 text-center py-16 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl border-2 border-dashed border-blue-300 dark:border-zinc-700">
                        <svg className="w-24 h-24 mx-auto mb-4 text-blue-400 dark:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                            No expenses yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            Start tracking your expenses to gain insights into your spending habits
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
                )}
            </div>
        </div>
    );
}