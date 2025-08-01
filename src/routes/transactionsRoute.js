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
import { 
  simpleGetTransactions,
  simpleCreateTransaction 
} from "../controllers/simpleTransactionsController.js"
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

// TEMPORALMENTE SIN AUTENTICACIÓN - SOLO PARA DEBUGGING
// router.use(verifyClerkTokenDebug);

// Obtener transacciones del periodo activo del usuario
// USANDO CONTROLADOR SIMPLE PARA TESTING
router.get("/:userId", simpleGetTransactions);

// Obtener transacciones por settings_tag específico (historial)
router.get("/tag/:settingsTag", getTransactionsByTag);

// Crear nueva transacción (se asocia al periodo activo)
// USANDO CONTROLADOR SIMPLE PARA TESTING
router.post("/", simpleCreateTransaction);

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