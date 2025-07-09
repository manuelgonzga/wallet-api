import express from "express";
import {
  createUserSettings,
  getUserSettings,
  deleteUserSettings
} from "../controllers/userSettingsController.js";

const router = express.Router();

router.get("/:userId", getUserSettings);

router.post("/", createUserSettings);

router.delete("/:userId", deleteUserSettings);

export default router;
