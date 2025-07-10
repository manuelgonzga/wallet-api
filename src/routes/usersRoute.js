import express from "express";
import { deleteAccount } from "../controllers/accountController.js";
import { verifyClerkToken } from "../middleware/verifyClerkToken.js";

const router = express.Router();

// POST /api/users/delete-account
router.post("/delete-account", verifyClerkToken, deleteAccount);

export default router;
