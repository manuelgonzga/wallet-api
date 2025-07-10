import express from "express";
import { 
  deleteAccount,
  getAccount, 
  createOrUpdateAccount, 
  updateUsername, 
  updateCurrencyPreference, 
  getValidCurrencies 
} from "../controllers/accountController.js";
import { verifyClerkToken } from "../middleware/verifyClerkToken.js";
import { validateUserAuthorization } from "../middleware/validation.js";

const router = express.Router();

// GET /api/account/currencies - Obtener monedas válidas (no requiere autenticación)
router.get("/currencies", getValidCurrencies);

// GET /api/account/:userId - Obtener información de la cuenta
router.get("/:userId", verifyClerkToken, validateUserAuthorization, getAccount);

// POST /api/account - Crear o actualizar cuenta
router.post("/", verifyClerkToken, createOrUpdateAccount);

// PUT /api/account/:userId/username - Actualizar nombre de usuario
router.put("/:userId/username", verifyClerkToken, validateUserAuthorization, updateUsername);

// PUT /api/account/:userId/currency - Actualizar preferencia de moneda
router.put("/:userId/currency", verifyClerkToken, validateUserAuthorization, updateCurrencyPreference);

// POST /api/account/delete-account - Eliminar cuenta completa
router.post("/delete-account", verifyClerkToken, deleteAccount);

export default router;
