import { Category, CreateCategoryRequest } from '../types/types';
import { authService } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

export const categoryService = {
    async getCategories(): Promise<Category[]> {
        const response = await fetch(`${API_BASE_URL}/api/category`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            if (response.status === 401) {
                authService.logout();
                window.location.href = '/login';
            }
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch categories');
        }
        return response.json();
    },

    async createCategory(data: CreateCategoryRequest): Promise<Category> {
        const response = await fetch(`${API_BASE_URL}/api/category`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create category');
        }
        return response.json();
    },
};