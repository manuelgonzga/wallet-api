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
export async function createUserSettings(req, res) {
  try {
    const { user_id, total_amount, period_days } = req.body;

    if (!user_id || total_amount === undefined || period_days === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Usamos UPSERT con ON CONFLICT para insertar o actualizar en una sola query
    const result = await sql`
      INSERT INTO user_settings (user_id, total_amount, period_days)
      VALUES (${user_id}, ${total_amount}, ${period_days})
      ON CONFLICT (user_id) DO UPDATE SET
        total_amount = EXCLUDED.total_amount,
        period_days = EXCLUDED.period_days
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
