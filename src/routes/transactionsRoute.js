import express from "express"
import { 
  createTransaction, 
  deleteTransaction, 
  getSummaryByUserId, 
  getSummaryByTag,
  getTransactionByUserId, 
  getTransactionsByTag,
  updateTransaction, 
  deleteAllTransactions 
} from "../controllers/transactionsController.js"
import { verifyClerkToken } from "../middleware/verifyClerkToken.js"
import { 
  validateUserAuthorization, 
  validateSettingsTagOwnership, 
  validateTransactionOwnership,
  validateTransactionData 
} from "../middleware/validation.js"

const router = express.Router()

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyClerkToken);

// Obtener transacciones del periodo activo del usuario
router.get("/:userId", validateUserAuthorization, getTransactionByUserId);

// Obtener transacciones por settings_tag específico (historial)
router.get("/tag/:settingsTag", getTransactionsByTag);

// Crear nueva transacción (se asocia al periodo activo)
router.post("/", createTransaction);

// Eliminar transacción específica
router.delete("/:id", deleteTransaction);

// Eliminar todas las transacciones del usuario (o de un periodo específico)
router.delete("/user/:userId", validateUserAuthorization, deleteAllTransactions);

// Obtener resumen del periodo activo
router.get("/summary/:userId", validateUserAuthorization, getSummaryByUserId);

// Obtener resumen por settings_tag específico (historial)
router.get("/summary/tag/:settingsTag", getSummaryByTag);

// Actualizar transacción
router.put("/:id", updateTransaction);

export default router