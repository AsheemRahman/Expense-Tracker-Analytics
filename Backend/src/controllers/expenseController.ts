import { Request, Response } from "express";
import { query } from "../config/prisma";
import { exportCSV } from "../utils/csvExport";


class ExpenseController {

    async getExpenses(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            const { month, year } = req.query;

            const params: any[] = [userId];
            let whereClause = "e.created_by = $1";

            if (month && year) {
                const start = new Date(Number(year), Number(month) - 1, 1);
                const end = new Date(Number(year), Number(month), 0);
                params.push(start, end);
                whereClause += ` AND e.date BETWEEN $2 AND $3`;
            }

            const result = await query(
                `SELECT
                e.id,
                e.title,
                e.amount,
                e.category_id AS expense_category_id,
                e.created_by,
                e.date,
                c.id AS category_id,
                c.name AS category_name
                FROM expenses e
                LEFT JOIN categories c ON e.category_id = c.id
                WHERE ${whereClause}
                ORDER BY e.date DESC`,
                params
            );
            res.status(200).json(result.rows);
        } catch (error) {
            console.error("GET EXPENSES ERROR:", error);
            res.status(500).json({ message: "Failed to fetch expenses", error });
        }
    };

    async createExpense(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            const { title, amount, categoryId, date } = req.body;

            const result = await query(
                `INSERT INTO expenses (title, amount, category_id, created_by, date)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, title, amount, category_id, created_by, date`,
                [title, amount, categoryId, userId, new Date(date)]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ message: "Failed to create expense", error });
        }
    }

    async updateExpense(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.userId;

            const fields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            for (const [key, value] of Object.entries(req.body)) {
                fields.push(`${key} = $${paramIndex++}`);
                values.push(value);
            }

            values.push(Number(id), userId);

            const result = await query(
                `UPDATE expenses
                SET ${fields.join(", ")}
                WHERE id = $${paramIndex++} AND created_by = $${paramIndex}
                RETURNING id, title, amount, category_id, created_by, date`,
                values
            );

            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ message: "Failed to update expense", error });
        }
    }

    async deleteExpense(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.userId;

            await query(
                `DELETE FROM expenses
                WHERE id = $1 AND created_by = $2`,
                [Number(id), userId]
            );

            res.json({ message: "Deleted" });
        } catch (error) {
            res.status(500).json({ message: "Failed to delete expense", error });
        }
    }

    async exportExpensesCSV(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId;

            const result = await query(
                `SELECT e.id, e.title, e.amount, e.category_id, e.created_by, e.date,
                        c.id as category_id, c.name as category_name
                FROM expenses e
                LEFT JOIN categories c ON e.category_id = c.id
                WHERE e.created_by = $1
                ORDER BY e.date DESC`,
                [userId]
            );

            const csv = await exportCSV(result.rows);
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", "attachment; filename=expenses.csv");
            res.send(csv);
        } catch (error) {
            res.status(500).json({ message: "Failed to export expenses", error });
        }
    }
}

export default ExpenseController;