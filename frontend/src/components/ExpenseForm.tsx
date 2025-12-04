'use client';

import { useState, useEffect } from 'react';
import { Expense, Category, FormErrors } from '../types/types';
import { categoryService } from '../services/categoryService';

interface ExpenseFormProps {
    expense?: Expense | null;
    onSubmit: (data: { title: string; amount: number; categoryId: number | null; date: string }) => Promise<void>;
    onCancel: () => void;
}

export default function ExpenseForm({ expense, onSubmit, onCancel }: ExpenseFormProps) {
    const [formData, setFormData] = useState({
        title: expense?.title || '',
        amount: expense?.amount.toString() || '',
        categoryId: expense?.category_id?.toString() || '',
        date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (err) {
            console.log("Error loading categories", err);
        }
    };

    const validateForm = () => {
        const errors: FormErrors = {};
        if (!formData.title.trim()) {
            errors.title = "Title is required.";
        } else if (formData.title.length < 3) {
            errors.title = "Title must be at least 3 characters.";
        }
        if (!formData.amount) {
            errors.amount = "Amount is required.";
        } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
            errors.amount = "Amount must be a positive number.";
        }
        if (!formData.date) {
            errors.date = "Date is required.";
        }
        if (!formData.categoryId) {
            errors.category = "Category is required.";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            await onSubmit({
                title: formData.title,
                amount: parseFloat(formData.amount),
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
                date: formData.date,
            });
        } catch (err) {
            console.log("Error submitting expense form", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                    Title
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white
                        ${formErrors.title ? 'border-red-500' : 'border-gray-300 dark:border-zinc-700'}
                    `}
                    placeholder="Enter expense title"
                />
                {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
            </div>

            {/* Amount */}
            <div>
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                    Amount
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white
                        ${formErrors.amount ? 'border-red-500' : 'border-gray-300 dark:border-zinc-700'}
                    `}
                    placeholder="0.00"
                />
                {formErrors.amount && <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>}
            </div>

            {/* Category */}
            <div>
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                    Category
                </label>
                <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white"
                >
                    <option value="">No Category</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
            </div>

            {/* Date */}
            <div>
                <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                    Date
                </label>
                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white
                        ${formErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-zinc-700'}
                    `}
                />
                {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                    {loading ? 'Saving...' : expense ? 'Update' : 'Add'}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-black dark:text-white rounded-lg"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
