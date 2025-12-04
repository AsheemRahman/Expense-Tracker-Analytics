import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/prisma";
import authRouter from "./routes/authRoutes";
import categoryRouter from "./routes/categoryRoutes";
import expensesRouter from "./routes/expenseRoutes";

const app = express();
const port = process.env.PORT || 5000;


//-------------------------- Cors -------------------------------

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    })
);


//--------------------------- middlewares -----------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//----------------------- Config PostgreSQL -----------------------

connectDB();

//--------------------------- routes ----------------------------

app.use("/api/auth", authRouter);
app.use("/api/category", categoryRouter);
app.use("/api/expenses", expensesRouter);


//----------------------- Server is running -----------------------

app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
});