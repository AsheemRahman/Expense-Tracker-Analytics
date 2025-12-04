import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../types/types';
import { authService } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

export const expenseService = {
    async getExpenses(month?: number, year?: number): Promise<Expense[]> {
        const params = new URLSearchParams();
        if (month) params.append('month', month.toString());
        if (year) params.append('year', year.toString());
        const queryString = params.toString();
        const url = `${API_BASE_URL}/api/expenses${queryString ? `?${queryString}` : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            if (response.status === 401) {
                authService.logout();
                window.location.href = '/login';
            }
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch expenses');
        }
        return response.json();
    },

    async createExpense(data: CreateExpenseRequest): Promise<Expense> {
        const response = await fetch(`${API_BASE_URL}/api/expenses`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                title: data.title,
                amount: data.amount,
                categoryId: data.categoryId,
                date: data.date,
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create expense');
        }
        return response.json();
    },

    async updateExpense(id: number, data: UpdateExpenseRequest): Promise<Expense> {
        const response = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update expense');
        }
        return response.json();
    },

    async deleteExpense(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete expense');
        }
    },

    async exportToCSV(): Promise<void> {
        const token = authService.getToken();
        const response = await fetch(`${API_BASE_URL}/api/expenses/export`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to export expenses');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'expenses.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
};