import { clerkClient } from "@clerk/clerk-sdk-node";
import { sql } from "../config/db.js";
import { VALID_CURRENCIES, isValidCurrency } from "../constants/currencies.js";
import { validateInput } from "../middleware/validation.js";

// Obtener información de la cuenta del usuario
export const getAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validar userId
    const userIdValidation = validateInput.userId(userId);
    if (!userIdValidation.isValid) {
      return res.status(400).json({ error: userIdValidation.error });
    }

    // Verificar autorización
    if (userId !== req.auth?.userId) {
      return res.status(403).json({ error: "Forbidden: You can only access your own account" });
    }

    const accounts = await sql`
      SELECT user_id, username, currency_preference, created_at, updated_at 
      FROM account 
      WHERE user_id = ${userId}
    `;

    if (accounts.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json(accounts[0]);
  } catch (error) {
    console.error("Error getting account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Crear o actualizar información de la cuenta (upsert)
export const createOrUpdateAccount = async (req, res) => {
  try {
    const { user_id, username, currency_preference } = req.body;

    // Validar que todos los campos estén presentes
    if (!user_id || !username || !currency_preference) {
      return res.status(400).json({ error: "All fields are required: user_id, username, currency_preference" });
    }

    // Validar user_id
    const userIdValidation = validateInput.userId(user_id);
    if (!userIdValidation.isValid) {
      return res.status(400).json({ error: userIdValidation.error });
    }

    // Verificar autorización - el usuario solo puede crear/actualizar su propia cuenta
    if (user_id !== req.auth?.userId) {
      return res.status(403).json({ error: "Forbidden: You can only manage your own account" });
    }

    // Validar username
    const usernameValidation = validateInput.username(username);
    if (!usernameValidation.isValid) {
      return res.status(400).json({ error: usernameValidation.error });
    }

    // Validar currency preference
    const currencyValidation = validateInput.currencyPreference(currency_preference);
    if (!currencyValidation.isValid) {
      return res.status(400).json({ error: currencyValidation.error });
    }

    const result = await sql`
      INSERT INTO account (user_id, username, currency_preference, updated_at)
      VALUES (${user_id}, ${usernameValidation.value}, ${currencyValidation.value}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        username = EXCLUDED.username,
        currency_preference = EXCLUDED.currency_preference,
        updated_at = CURRENT_TIMESTAMP
      RETURNING user_id, username, currency_preference, created_at, updated_at
    `;

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error creating/updating account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Actualizar solo el nombre de usuario
export const updateUsername = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username } = req.body;

    // Validar userId
    const userIdValidation = validateInput.userId(userId);
    if (!userIdValidation.isValid) {
      return res.status(400).json({ error: userIdValidation.error });
    }

    // Verificar autorización
    if (userId !== req.auth?.userId) {
      return res.status(403).json({ error: "Forbidden: You can only update your own account" });
    }

    // Validar username
    const usernameValidation = validateInput.username(username);
    if (!usernameValidation.isValid) {
      return res.status(400).json({ error: usernameValidation.error });
    }

    const result = await sql`
      UPDATE account 
      SET username = ${usernameValidation.value}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
      RETURNING user_id, username, currency_preference, created_at, updated_at
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Actualizar solo la preferencia de moneda
export const updateCurrencyPreference = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currency_preference } = req.body;

    // Validar userId
    const userIdValidation = validateInput.userId(userId);
    if (!userIdValidation.isValid) {
      return res.status(400).json({ error: userIdValidation.error });
    }

    // Verificar autorización
    if (userId !== req.auth?.userId) {
      return res.status(403).json({ error: "Forbidden: You can only update your own account" });
    }

    // Validar currency preference
    const currencyValidation = validateInput.currencyPreference(currency_preference);
    if (!currencyValidation.isValid) {
      return res.status(400).json({ error: currencyValidation.error });
    }

    const result = await sql`
      UPDATE account 
      SET currency_preference = ${currencyValidation.value}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
      RETURNING user_id, username, currency_preference, created_at, updated_at
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error updating currency preference:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Obtener todas las monedas válidas
export const getValidCurrencies = async (req, res) => {
  try {
    res.status(200).json(VALID_CURRENCIES);
  } catch (error) {
    console.error("Error getting valid currencies:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User ID not found in auth." });
    }

    // Borrar usuario de Clerk
    await clerkClient.users.deleteUser(userId);

    // Borrar datos en base de datos
    await sql`DELETE FROM transactions WHERE user_id = ${userId}`;
    await sql`DELETE FROM user_settings WHERE user_id = ${userId}`;
    await sql`DELETE FROM account WHERE user_id = ${userId}`;

    console.log(`User ${userId} deleted.`);

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
