import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import CategoryController from "../controllers/categoryController";


const router = Router();
const categoryController = new CategoryController();


router.get("/", authMiddleware(), categoryController.getCategories.bind(categoryController));
router.post("/", authMiddleware(), categoryController.createCategory.bind(categoryController));


export default router;