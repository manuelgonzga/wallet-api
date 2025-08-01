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
import { verifyClerkTokenDebug } from "../middleware/verifyClerkTokenDebug.js"
import { 
  validateUserAuthorization, 
  validateSettingsTagOwnership, 
  validateTransactionOwnership,
  validateTransactionData 
} from "../middleware/validation.js"

const router = express.Router()

// Ruta de prueba sin autenticación para verificar conectividad
router.get("/test", (req, res) => {
  res.json({ message: "Transactions route working", timestamp: new Date().toISOString() });
});

// Usar middleware de debug temporalmente
router.use(verifyClerkTokenDebug);

// Obtener transacciones del periodo activo del usuario
// Temporalmente sin validateUserAuthorization para debugging
router.get("/:userId", getTransactionByUserId);

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