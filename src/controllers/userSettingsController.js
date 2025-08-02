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
    const { user_id, total_amount, period_days, title, currency } = req.body;

    if (!user_id || total_amount === undefined || period_days === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Si no se proporciona título, generar uno por defecto
    const budgetTitle = title || `Budget Period ${new Date().toLocaleDateString()}`;
    
    // Si no se proporciona moneda, obtener la currency general del usuario
    let budgetCurrency = currency;
    if (!budgetCurrency) {
      // Obtener la currency general del usuario desde la tabla accounts
      const userAccount = await sql`
        SELECT currency FROM accounts WHERE user_id = ${user_id} LIMIT 1
      `;
      budgetCurrency = userAccount.length > 0 ? userAccount[0].currency : 'EUR';
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
      INSERT INTO user_settings (user_id, total_amount, period_days, settings_tag, title, currency, is_active)
      VALUES (${user_id}, ${total_amount}, ${period_days}, ${settings_tag}, ${budgetTitle}, ${budgetCurrency}, true)
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("Error creating user settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteUserSettingsByTag(req, res) {
  try {
    const { settingsTag } = req.params;
    
    console.log("Attempting to delete settings with tag:", settingsTag);
    console.log("Request params:", req.params);

    if (!settingsTag) {
      console.error("No settingsTag provided");
      return res.status(400).json({ message: "Settings tag is required" });
    }

    // Primero obtenemos la configuración por settingsTag
    const settings = await sql`
      SELECT is_active FROM user_settings WHERE settings_tag = ${settingsTag}
    `;

    console.log("Found settings:", settings);

    if (settings.length === 0) {
      console.error("Settings not found for tag:", settingsTag);
      return res.status(404).json({ message: "Settings not found" });
    }

    // Permitir eliminar períodos activos - ya no hay restricción
    // Primero eliminar todas las transacciones asociadas al settings_tag
    console.log("Deleting transactions for settings_tag:", settingsTag);
    const deletedTransactions = await sql`
      DELETE FROM transactions WHERE settings_tag = ${settingsTag} RETURNING id
    `;

    console.log("Deleted transactions:", deletedTransactions.length);

    // Luego eliminar la configuración de usuario
    const result = await sql`
      DELETE FROM user_settings WHERE settings_tag = ${settingsTag} RETURNING *
    `;

    console.log("Delete result:", result);

    if (result.length === 0) {
      console.error("No settings were deleted for tag:", settingsTag);
      return res.status(404).json({ message: "Settings not found" });
    }

    console.log("Settings deleted successfully:", result[0]);
    res.status(200).json({ 
      message: "Settings and associated transactions deleted successfully", 
      deleted: result[0],
      deletedTransactionsCount: deletedTransactions.length
    });
  } catch (error) {
    console.error("Error deleting user setting by tag:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Internal server error", error: error.message });
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
  } catch (error) {
    console.error("Error deleting user settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Actualizar configuración activa del usuario (sin crear nuevo periodo)
export async function updateActiveUserSettings(req, res) {
  try {
    const { user_id, total_amount, period_days } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    // Verificar que se está enviando al menos un campo para actualizar
    if (total_amount === undefined && period_days === undefined) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Construir query usando template literals con sql
    let result;
    
    if (total_amount !== undefined && period_days !== undefined) {
      // Actualizar ambos campos
      result = await sql`
        UPDATE user_settings 
        SET total_amount = ${total_amount}, period_days = ${period_days}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${user_id} AND is_active = true 
        RETURNING *
      `;
    } else if (total_amount !== undefined) {
      // Solo actualizar total_amount
      result = await sql`
        UPDATE user_settings 
        SET total_amount = ${total_amount}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${user_id} AND is_active = true 
        RETURNING *
      `;
    } else {
      // Solo actualizar period_days
      result = await sql`
        UPDATE user_settings 
        SET period_days = ${period_days}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${user_id} AND is_active = true 
        RETURNING *
      `;
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Active user settings not found" });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error updating active user settings:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
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

// Activar configuración específica por settings_tag
export async function activateUserSettingsByTag(req, res) {
  try {
    const { settingsTag } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Verificar que la configuración existe y pertenece al usuario
    const existingSettings = await sql`
      SELECT * FROM user_settings 
      WHERE settings_tag = ${settingsTag} AND user_id = ${user_id}
    `;

    if (existingSettings.length === 0) {
      return res.status(404).json({ message: "Settings not found or doesn't belong to user" });
    }

    // Desactivar todas las configuraciones actuales del usuario
    await sql`
      UPDATE user_settings 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${user_id} AND is_active = true
    `;

    // Activar la configuración específica
    await sql`
      UPDATE user_settings 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE settings_tag = ${settingsTag} AND user_id = ${user_id}
    `;

    // Obtener la configuración actualizada
    const updatedSettings = await sql`
      SELECT * FROM user_settings 
      WHERE settings_tag = ${settingsTag} AND user_id = ${user_id}
    `;

    res.status(200).json({
      settings: updatedSettings[0]
    });
  } catch (error) {
    console.error("Error activating settings:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

// Actualizar título de período activo
export async function updateActiveSettingsTitle(req, res) {
  try {
    const { userId } = req.params;
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: "Title is required" });
    }

    // Actualizar el título del período activo
    const result = await sql`
      UPDATE user_settings 
      SET title = ${title.trim()}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId} AND is_active = true
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Active settings not found" });
    }

    res.status(200).json({ 
      message: "Title updated successfully", 
      settings: result[0] 
    });
  } catch (error) {
    console.error("Error updating settings title:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Actualizar la moneda del período activo
export async function updateActiveSettingsCurrency(req, res) {
  try {
    const { userId } = req.params;
    const { currency } = req.body;

    if (!currency) {
      return res.status(400).json({ message: "Currency is required" });
    }

    if (currency.length !== 3) {
      return res.status(400).json({ message: "Currency must be a 3-letter code" });
    }

    const result = await sql`
      UPDATE user_settings 
      SET currency = ${currency.toUpperCase()}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId} AND is_active = true
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Active settings not found" });
    }

    res.status(200).json({ 
      message: "Currency updated successfully", 
      settings: result[0] 
    });
  } catch (error) {
    console.error("Error updating settings currency:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
