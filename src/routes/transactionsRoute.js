import express from "express"
import { createTransaction, deleteTransaction, getSummaryByUserId, getTransactionByUserId, updateTransaction } from "../controllers/transactionsController.js"

const router = express.Router()

export default router

router.get("/:userId", getTransactionByUserId);

router.post("/", createTransaction);

router.delete("/:id", deleteTransaction);

router.get("/summary/:userId", getSummaryByUserId);

router.put("/:id", updateTransaction);