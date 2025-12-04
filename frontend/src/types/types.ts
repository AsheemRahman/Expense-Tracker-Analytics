export interface User {
    id: string;
    name: string;
    email: string;
}

export interface SignupRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    status: boolean;
    message: string;
    token?: string;
    user?: User;
}

export interface Expense {
    id: number;
    title: string;
    amount: number;
    category_id: number | null;
    created_by: string;
    date: string;
    category_name?: string;
}

export interface CreateExpenseRequest {
    title: string;
    amount: number;
    categoryId: number | null;
    date: string;
}

export interface UpdateExpenseRequest {
    title?: string;
    amount?: number;
    categoryId?: number | null;
    date?: string;
}

export interface Category {
    id: number;
    name: string;
    created_by: string | null;
}

export interface CreateCategoryRequest {
    name: string;
}

export interface FormErrors {
    title?: string;
    amount?: string;
    date?: string;
    category?: string;
}

export type FormSignErrors = {
    name: string;
    email: string;
    password: string;
};
