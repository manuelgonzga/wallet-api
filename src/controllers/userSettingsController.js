import { sql } from "../config/db.js";

// Obtener configuración de usuario por user_id
export async function getUserSettings(req, res) {
  try {
    const { userId } = req.params;

    const settings = await sql`
      SELECT * FROM user_settings WHERE user_id = ${userId}
    `;

    if (settings.length === 0) {
      return res.status(404).json({ message: "User settings not found" });
    }

    res.status(200).json(settings[0]);
  } catch (error) {
    console.error("Error getting user settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Crear o actualizar configuración de usuario (upsert)
// Nota: start_date NO se actualiza en el ON CONFLICT, y se asigna automáticamente al crear por la DB
export async function createUserSettings(req, res) {
  try {
    const { user_id, total_amount, period_days, currency } = req.body;

    if (!user_id || total_amount === undefined || period_days === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await sql`
      INSERT INTO user_settings (user_id, total_amount, period_days, currency)
      VALUES (${user_id}, ${total_amount}, ${period_days}, ${currency || 'USD'})
      ON CONFLICT (user_id) DO UPDATE SET
        total_amount = EXCLUDED.total_amount,
        period_days = EXCLUDED.period_days,
        currency = COALESCE(EXCLUDED.currency, user_settings.currency)
      RETURNING *
    `;

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error creating/updating user settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Eliminar configuración de usuario por user_id
export async function deleteUserSettings(req, res) {
  try {
    const { userId } = req.params;

    const result = await sql`
      DELETE FROM user_settings WHERE user_id = ${userId} RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "User settings not found" });
    }

    res.status(200).json({ message: "User settings deleted successfully" });
  } catch (error) {
    console.error("Error deleting user settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUserCurrency(req, res) {
  try {
    const { userId } = req.params;
    const { currency } = req.body;

    if (!currency) {
      return res.status(400).json({ message: "Currency is required" });
    }

    const result = await sql`
      UPDATE user_settings
      SET currency = ${currency}
      WHERE user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "User settings not found" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error updating currency:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
