import express from "express";
import {
  createUserSettings,
  getUserSettings,
  deleteUserSettings,
  updateUserCurrency
} from "../controllers/userSettingsController.js";

const router = express.Router();

router.get("/:userId", getUserSettings);

router.post("/", createUserSettings);

router.delete("/:userId", deleteUserSettings);

router.patch("/:userId/currency", updateUserCurrency);

export default router;
