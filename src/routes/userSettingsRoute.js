import express from "express";
import {
  createUserSettings,
  getUserSettings,
  getUserSettingsHistory,
  getUserSettingsByTag,
  deleteUserSettings,
  deleteUserSettingsByTag,
  updateActiveUserSettings,
  activateUserSettingsByTag,
  updateActiveSettingsTitle
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

// Actualizar configuración activa (sin crear nuevo periodo)
router.patch("/active", updateActiveUserSettings);

// Actualizar título del período activo
router.patch("/:userId/title", updateActiveSettingsTitle);

// Borrar una configuracion por tag
router.delete('/:settingsTag/delete', deleteUserSettingsByTag);

// Activar configuración específica por tag
router.patch('/:settingsTag/activate', activateUserSettingsByTag);

// Desactivar configuración actual
router.delete("/:userId", deleteUserSettings);

export default router;
