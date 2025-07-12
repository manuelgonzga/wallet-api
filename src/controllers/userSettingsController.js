import { sql } from "../config/db.js";

// Obtener configuración activa de usuario por user_id
export async function getUserSettings(req, res) {
  try {
    const { userId } = req.params;

    const settings = await sql`
      SELECT * FROM user_settings 
      WHERE user_id = ${userId} AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
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

// Obtener historial de configuraciones de usuario
export async function getUserSettingsHistory(req, res) {
  try {
    const { userId } = req.params;

    const settings = await sql`
      SELECT * FROM user_settings 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    res.status(200).json(settings);
  } catch (error) {
    console.error("Error getting user settings history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Crear nueva configuración de usuario (desactiva la anterior)
export async function createUserSettings(req, res) {
  try {
    const { user_id, total_amount, period_days } = req.body;

    if (!user_id || total_amount === undefined || period_days === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Generar un settings_tag único
    const settings_tag = `${user_id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Desactivar configuraciones anteriores
    await sql`
      UPDATE user_settings 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${user_id} AND is_active = true
    `;

    // Crear nueva configuración activa
    const result = await sql`
      INSERT INTO user_settings (user_id, total_amount, period_days, settings_tag, is_active)
      VALUES (${user_id}, ${total_amount}, ${period_days}, ${settings_tag}, true)
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating user settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Eliminar configuración de usuario (marcar como inactiva)
export async function deleteUserSettings(req, res) {
  try {
    const { userId } = req.params;

    const result = await sql`
      UPDATE user_settings 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId} AND is_active = true
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Active user settings not found" });
    }

    res.status(200).json({ message: "User settings deactivated successfully" });
  } catch (error) {
    console.error("Error deleting user settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Obtener configuración por settings_tag
export async function getUserSettingsByTag(req, res) {
  try {
    const { settingsTag } = req.params;

    const settings = await sql`
      SELECT * FROM user_settings WHERE settings_tag = ${settingsTag}
    `;

    if (settings.length === 0) {
      return res.status(404).json({ message: "Settings not found" });
    }

    res.status(200).json(settings[0]);
  } catch (error) {
    console.error("Error getting settings by tag:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
