import express from "express";
import {
  createUserSettings,
  getUserSettings,
  getUserSettingsHistory,
  getUserSettingsByTag,
  deleteUserSettings
} from "../controllers/userSettingsController.js";

const router = express.Router();

// Obtener configuración activa del usuario
router.get("/:userId", getUserSettings);

// Obtener historial de configuraciones del usuario
router.get("/:userId/history", getUserSettingsHistory);

// Obtener configuración por settings_tag
router.get("/tag/:settingsTag", getUserSettingsByTag);

// Crear nueva configuración (desactiva la anterior)
router.post("/", createUserSettings);

// Desactivar configuración actual
router.delete("/:userId", deleteUserSettings);

export default router;
