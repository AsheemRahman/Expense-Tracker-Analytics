import { Request, Response } from "express";
import { query } from "../config/prisma";


class CategoryController {

    async getCategories(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            const result = await query(
                `SELECT id, name, created_by
                 FROM categories
                 WHERE created_by IS NULL OR created_by = $1`,
                [userId]
            );

            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch categories", error });
        }
    }

    async createCategory(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            const { name } = req.body;

            const result = await query(
                `INSERT INTO categories (name, created_by)
                 VALUES ($1, $2)
                 RETURNING id, name, created_by`,
                [name, userId]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ message: "Failed to create category", error });
        }
    }
}

export default CategoryController;