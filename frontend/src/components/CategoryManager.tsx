'use client';

import { useState, useEffect } from 'react';
import { Category } from '../types/types';
import { categoryService } from '../services/categoryService';

export default function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (err) {
            if (err instanceof Error)
            setError(err.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await categoryService.createCategory({ name: categoryName });
            setCategoryName('');
            setShowForm(false);
            loadCategories();
        } catch (err) {
            if (err instanceof Error)
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black dark:text-white">Categories</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    {showForm ? 'Cancel' : 'Add Category'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded">
                    {error}
                </div>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            placeholder="Category name"
                            required
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-white"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </form>
            )}

            <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                    <span
                        key={category.id}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                    >
                        {category.name}
                    </span>
                ))}
            </div>
        </div>
    );
}