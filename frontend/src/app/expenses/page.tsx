'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Expense } from '../../types/types';
import { expenseService } from '../../services/expenseService';
import { authService } from '../../services/authService';
import ExpenseForm from '../../components/ExpenseForm';
import CategoryManager from '../../components/CategoryManager';

type SortField = 'date' | 'amount' | 'title';
type SortOrder = 'asc' | 'desc';

export default function ExpensesPage() {
    const router = useRouter();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [filterMonth, setFilterMonth] = useState<number | null>(null);
    const [filterYear, setFilterYear] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadExpenses = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await expenseService.getExpenses(
                filterMonth || undefined,
                filterYear || undefined
            );
            setExpenses(data);
        } catch (err) {
            console.log("LOAD EXPENSES ERROR:", err);
            setError('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    }, [filterMonth, filterYear]);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }
        loadExpenses();
    }, [filterMonth, filterYear, loadExpenses, router]);

    const applyFiltersAndSort = useCallback(() => {
        let filtered = [...expenses];
        if (searchQuery.trim()) {
            filtered = filtered.filter((exp) =>
                exp.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (categoryFilter !== null) {
            filtered = filtered.filter((exp) => exp.category_id === categoryFilter);
        }
        filtered.sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;
            switch (sortField) {
                case 'date':
                    aValue = new Date(a.date).getTime();
                    bValue = new Date(b.date).getTime();
                    break;
                case 'amount':
                    aValue = a.amount;
                    bValue = b.amount;
                    break;
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                default:
                    return 0;
            }
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });
        setFilteredExpenses(filtered);
    }, [expenses, searchQuery, categoryFilter, sortField, sortOrder]);

    useEffect(() => {
        applyFiltersAndSort();
    }, [expenses, searchQuery, categoryFilter, sortField, sortOrder, applyFiltersAndSort]);

    const handleAdd = () => {
        setEditingExpense(null);
        setShowForm(true);
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            setError('');
            await expenseService.deleteExpense(id);
            setSuccess('Expense deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
            loadExpenses();
        } catch (err) {
            console.log("DELETE ERROR:", err);
            setError('Failed to delete expense');
        }
    };

    const handleSubmit = async (data: { title: string; amount: number; categoryId: number | null; date: string }) => {
        try {
            setError('');
            if (editingExpense) {
                await expenseService.updateExpense(editingExpense.id, data);
                setSuccess('Expense updated successfully');
            } else {
                await expenseService.createExpense(data);
                setSuccess('Expense added successfully');
            }
            setTimeout(() => setSuccess(''), 3000);
            setShowForm(false);
            setEditingExpense(null);
            loadExpenses();
        } catch (err) {
            throw err;
        }
    };

    const handleExport = async () => {
        try {
            setError('');
            await expenseService.exportToCSV();
            setSuccess('Expenses exported successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.log("EXPORT ERROR:", err);
            setError('Failed to export expenses');
        }
    };

    const clearFilters = () => {
        setFilterMonth(null);
        setFilterYear(null);
        setSearchQuery('');
        setCategoryFilter(null);
        setSortField('date');
        setSortOrder('desc');
    };

    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const averageAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;

    const categories = Array.from(
        new Map(
            expenses
                .filter((exp) => exp.category_id && exp.category_name)
                .map((exp) => [exp.category_id, { id: exp.category_id, name: exp.category_name }])
        ).values()
    );

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        return sortOrder === 'asc' ? (
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-zinc-950 dark:via-slate-900 dark:to-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading expenses...</p>
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
                                Expense Tracker
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage and track all your expenses
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
                                href="/analytics"
                                className="px-5 py-2.5 bg-linear-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5"
                            >
                                Analytics
                            </Link>
                            <button
                                onClick={() => setShowCategoryManager(!showCategoryManager)}
                                className="px-5 py-2.5 bg-linear-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                            >
                                {showCategoryManager ? 'Hide' : 'Manage'} Categories
                            </button>
                            <button
                                onClick={handleExport}
                                className="px-5 py-2.5 bg-linear-to-r from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5"
                            >
                                Export CSV
                            </button>
                            <button
                                onClick={handleAdd}
                                className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Expense
                            </button>
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

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-400 rounded-r-xl shadow-lg animate-pulse">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {success}
                        </div>
                    </div>
                )}

                {/* Error Message */}
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

                {/* Category Manager */}
                {showCategoryManager && (
                    <div className="mb-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 p-6">
                        <CategoryManager />
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="group relative overflow-hidden p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Amount</p>
                            </div>
                            <p className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                ₹ {totalAmount.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-emerald-500/10 to-green-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-linear-to-br from-emerald-500 to-green-600 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Expenses</p>
                            </div>
                            <p className="text-3xl font-bold bg-linear-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                                {filteredExpenses.length}
                            </p>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-linear-to-br from-purple-500 to-pink-600 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Average</p>
                            </div>
                            <p className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                                ₹ {averageAmount.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-linear-to-br from-orange-500 to-red-600 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Filters & Search</h2>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search expenses by title..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Filter Row */}
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Month</label>
                            <select
                                value={filterMonth || ''}
                                onChange={(e) => setFilterMonth(e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">All Months</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                    <option key={month} value={month}>
                                        {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
                            <select
                                value={filterYear || ''}
                                onChange={(e) => setFilterYear(e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">All Years</option>
                                {Array.from({ length: 5 }, (_, i) => currentYear - i).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                            <select
                                value={categoryFilter || ''}
                                onChange={(e) => setCategoryFilter(e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id ?? ''}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={clearFilters}
                            className="px-6 py-3 bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-zinc-800 animate-slideUp">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                                </h2>
                            </div>
                            <ExpenseForm
                                expense={editingExpense}
                                onSubmit={handleSubmit}
                                onCancel={() => {
                                    setShowForm(false);
                                    setEditingExpense(null);
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Expenses List */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
                    {filteredExpenses.length === 0 ? (
                        <div className="text-center py-16">
                            <svg className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                                {expenses.length === 0 ? 'No expenses yet' : 'No matching expenses'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {expenses.length === 0
                                    ? 'Start tracking your expenses by adding your first one!'
                                    : 'Try adjusting your filters to see more results.'}
                            </p>
                            {expenses.length === 0 && (
                                <button
                                    onClick={handleAdd}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Your First Expense
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-800">
                                        <tr className="border-b-2 border-gray-200 dark:border-zinc-700">
                                            <th
                                                className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors group"
                                                onClick={() => handleSort('title')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Title
                                                    <SortIcon field="title" />
                                                </div>
                                            </th>
                                            <th
                                                className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors group"
                                                onClick={() => handleSort('amount')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Amount
                                                    <SortIcon field="amount" />
                                                </div>
                                            </th>
                                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th
                                                className="text-left py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors group"
                                                onClick={() => handleSort('date')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Date
                                                    <SortIcon field="date" />
                                                </div>
                                            </th>
                                            <th className="text-right py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                        {filteredExpenses.map((expense, idx) => (
                                            <tr
                                                key={expense.id}
                                                className={`hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-zinc-800 dark:hover:to-zinc-800 transition-all ${idx % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50/50 dark:bg-zinc-900/50'
                                                    }`}
                                            >
                                                <td className="py-4 px-6">
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {expense.title}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-bold text-lg bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                                        ₹ {Number(expense.amount).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {expense.category_name ? (
                                                        <span className="inline-flex px-3 py-1.5 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-full text-xs font-semibold shadow-lg">
                                                            {expense.category_name}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                                                            Uncategorized
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-gray-600 dark:text-gray-400 font-medium">
                                                    {new Date(expense.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(expense)}
                                                            className="px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                                            title="Edit expense"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(expense.id)}
                                                            className="px-4 py-2 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                                            title="Delete expense"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Results Count */}
                            <div className="px-6 py-4 bg-linear-to-r from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-800 border-t border-gray-200 dark:border-zinc-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center font-medium">
                                    Showing {filteredExpenses.length} of {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}