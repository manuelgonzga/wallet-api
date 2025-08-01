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
      SELECT user_id, username, currency_preference, dark_mode, created_at, updated_at 
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
    console.log("[createOrUpdateAccount] req.body:", req.body);
    console.log("[createOrUpdateAccount] req.auth:", req.auth);
    const { user_id, username, currency_preference, dark_mode } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!user_id || !username || !currency_preference) {
      console.warn("[createOrUpdateAccount] Missing required fields", { user_id, username, currency_preference });
      return res.status(400).json({ error: "Required fields: user_id, username, currency_preference" });
    }

    // Validar user_id
    const userIdValidation = validateInput.userId(user_id);
    if (!userIdValidation.isValid) {
      console.warn("[createOrUpdateAccount] Invalid user_id:", user_id, userIdValidation.error);
      return res.status(400).json({ error: userIdValidation.error });
    }

    // Verificar autorización - el usuario solo puede crear/actualizar su propia cuenta
    if (user_id !== req.auth?.userId) {
      console.warn("[createOrUpdateAccount] Forbidden: user_id does not match token", { user_id, authUserId: req.auth?.userId });
      return res.status(403).json({ error: "Forbidden: You can only manage your own account" });
    }

    // Validar username
    const usernameValidation = validateInput.username(username);
    if (!usernameValidation.isValid) {
      console.warn("[createOrUpdateAccount] Invalid username:", username, usernameValidation.error);
      return res.status(400).json({ error: usernameValidation.error });
    }

    // Validar currency preference
    const currencyValidation = validateInput.currencyPreference(currency_preference);
    if (!currencyValidation.isValid) {
      console.warn("[createOrUpdateAccount] Invalid currency_preference:", currency_preference, currencyValidation.error);
      return res.status(400).json({ error: currencyValidation.error });
    }

    // Validar dark_mode (opcional, por defecto false)
    const darkModeValue = dark_mode !== undefined ? Boolean(dark_mode) : false;

    console.log("[createOrUpdateAccount] All validations passed", {
      user_id,
      username: usernameValidation.value,
      currency_preference: currencyValidation.value,
      dark_mode: darkModeValue
    });

    const result = await sql`
      INSERT INTO account (user_id, username, currency_preference, dark_mode, updated_at)
      VALUES (${user_id}, ${usernameValidation.value}, ${currencyValidation.value}, ${darkModeValue}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        username = EXCLUDED.username,
        currency_preference = EXCLUDED.currency_preference,
        dark_mode = EXCLUDED.dark_mode,
        updated_at = CURRENT_TIMESTAMP
      RETURNING user_id, username, currency_preference, dark_mode, created_at, updated_at
    `;

    console.log("[createOrUpdateAccount] SQL result:", result);
    res.status(200).json(result[0]);
  } catch (error) {
    console.error("[createOrUpdateAccount] Error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
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
      RETURNING user_id, username, currency_preference, dark_mode, created_at, updated_at
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
      RETURNING user_id, username, currency_preference, dark_mode, created_at, updated_at
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

// Actualizar solo la preferencia de modo oscuro
export const updateDarkMode = async (req, res) => {
  try {
    const { userId } = req.params;
    const { dark_mode } = req.body;

    // Validar userId
    const userIdValidation = validateInput.userId(userId);
    if (!userIdValidation.isValid) {
      return res.status(400).json({ error: userIdValidation.error });
    }

    // Verificar autorización
    if (userId !== req.auth?.userId) {
      return res.status(403).json({ error: "Forbidden: You can only update your own account" });
    }

    // Validar dark_mode (debe ser boolean)
    if (typeof dark_mode !== 'boolean') {
      return res.status(400).json({ error: "dark_mode must be a boolean value" });
    }

    const result = await sql`
      UPDATE account 
      SET dark_mode = ${dark_mode}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
      RETURNING user_id, username, currency_preference, dark_mode, created_at, updated_at
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json({
      success: true,
      message: "Dark mode preference updated successfully",
      account: result[0]
    });
  } catch (error) {
    console.error("Error updating dark mode preference:", error);
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
