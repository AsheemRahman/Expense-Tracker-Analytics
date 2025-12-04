import { Router } from "express";
import ExpenseController from "../controllers/expenseController";
import authMiddleware from "../middleware/authMiddleware";


const router = Router();
const expenseController = new ExpenseController();


router.get("/", authMiddleware(), expenseController.getExpenses.bind(expenseController));
router.post("/", authMiddleware(), expenseController.createExpense.bind(expenseController));
router.put("/:id", authMiddleware(), expenseController.updateExpense.bind(expenseController));
router.delete("/:id", authMiddleware(), expenseController.deleteExpense.bind(expenseController));

router.get("/export", authMiddleware(), expenseController.exportExpensesCSV.bind(expenseController));


export default router;