import { sql  } from "../config/db.js";

// Obtener transacciones del periodo activo de configuración
export async function getTransactionByUserId(req, res) {
    try {
        const { userId } = req.params;
        
        // Obtener configuración activa del usuario
        const activeSettings = await sql`
            SELECT settings_tag FROM user_settings 
            WHERE user_id = ${userId} AND is_active = true
            LIMIT 1
        `;

        if (activeSettings.length === 0) {
            return res.status(404).json({ message: "No active settings found for user" });
        }

        const settings_tag = activeSettings[0].settings_tag;

        const transactions = await sql`
            SELECT t.*, us.total_amount, us.period_days, us.start_date
            FROM transactions t
            JOIN user_settings us ON t.settings_tag = us.settings_tag
            WHERE t.settings_tag = ${settings_tag}
            ORDER BY t.created_at DESC
        `;

        res.status(200).json(transactions);
    } catch (error) {
        console.log("Error getting the transactions", error)
        res.status(500).json({ message: "Internal server error"})
    }
}

// Obtener transacciones por settings_tag específico (para historial)
export async function getTransactionsByTag(req, res) {
    try {
        const { settingsTag } = req.params;
        
        const transactions = await sql`
            SELECT t.*, us.total_amount, us.period_days, us.start_date
            FROM transactions t
            JOIN user_settings us ON t.settings_tag = us.settings_tag
            WHERE t.settings_tag = ${settingsTag}
            ORDER BY t.created_at DESC
        `;

        res.status(200).json(transactions);
    } catch (error) {
        console.log("Error getting transactions by tag",error)
        res.status(500).json({ message: "Internal server error"})
    }
}

export async function createTransaction(req, res) {
    try {
        const {title, amount, category, user_id} = req.body;
        
        if(!title || !category || amount === undefined){
            return res.status(400).json({ message: "Title, amount, and category are required" });
        }

        // Validar que el amount sea un número válido y positivo
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: "Amount must be a positive number" });
        }
        
        // Obtener configuración activa del usuario
        const activeSettings = await sql`
            SELECT settings_tag FROM user_settings 
            WHERE user_id = ${user_id} AND is_active = true
            LIMIT 1
        `;

        if (activeSettings.length === 0) {
            return res.status(404).json({ message: "No active settings found for user. Please set up your budget first." });
        }

        const settings_tag = activeSettings[0].settings_tag;

        const transaction = await sql`
            INSERT INTO transactions(user_id, title, amount, category, settings_tag)
            VALUES (${user_id}, ${title}, ${parsedAmount}, ${category}, ${settings_tag})
            RETURNING *
        `;
        
        res.status(201).json(transaction[0]); 

    } catch (error) {
        console.log("Error creating transaction", error);
        res.status(500).json({ message: "Internal server error"});
    }
}

export async function deleteTransaction(req, res) {
    try {
        const { id } = req.params;

        if(isNaN(parseInt(id))){
            return res.status(400).json({message: "Invalid transaction ID"})
        }

        const result = await sql`
            DELETE FROM transactions WHERE id = ${id} RETURNING *
        `;

        if(result.length === 0){
            return res.status(404).json({message: "Transaction not found"})
        }

        res.status(200).json({message: "Transaction deleted succesfully"});
    } catch (error) {
        console.log("Error deleting the transaction",error)
        res.status(500).json({ message: "Internal server error"})
    }
}

export async function deleteAllTransactions(req, res) {
  try {
    const { userId } = req.params;
    const { settingsTag } = req.query; // Opcional: eliminar solo de un periodo específico

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (settingsTag) {
      // Eliminar transacciones de un periodo específico
      await sql`
        DELETE FROM transactions 
        WHERE user_id = ${userId} AND settings_tag = ${settingsTag}
      `;
    } else {
      // Eliminar todas las transacciones del usuario
      await sql`
        DELETE FROM transactions WHERE user_id = ${userId}
      `;
    }

    res.status(200).json({ message: "Transactions deleted successfully" });
  } catch (error) {
    console.error("Error deleting transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Obtener resumen solo del periodo activo
export async function getSummaryByUserId(req, res) {
    try {
        const {userId} = req.params;

        // Obtener configuración activa del usuario
        const activeSettings = await sql`
            SELECT settings_tag FROM user_settings 
            WHERE user_id = ${userId} AND is_active = true
            LIMIT 1
        `;

        if (activeSettings.length === 0) {
            return res.status(404).json({ message: "No active settings found for user" });
        }

        const settings_tag = activeSettings[0].settings_tag;

        const balanceResult = await sql`
            SELECT COALESCE(SUM(amount),0) as balance FROM transactions 
            WHERE settings_tag = ${settings_tag}
        `
        const incomeResult = await sql`
            SELECT COALESCE(SUM(amount),0) as income FROM transactions
            WHERE settings_tag = ${settings_tag} AND amount > 0
        `
        const expensesResult = await sql`
            SELECT COALESCE(SUM(amount),0) as expenses FROM transactions
            WHERE settings_tag = ${settings_tag} AND amount < 0
        `

        res.status(200).json({
            balance: balanceResult[0].balance,
            income: incomeResult[0].income,
            expenses: expensesResult[0].expenses,
            settings_tag: settings_tag
        })

    } catch (error) {
        console.log("Error getting the summary",error)
        res.status(500).json({ message: "Internal server error"})
    }
}

// Obtener resumen por settings_tag específico (para historial)
export async function getSummaryByTag(req, res) {
    try {
        const { settingsTag } = req.params;

        const balanceResult = await sql`
            SELECT COALESCE(SUM(amount),0) as balance FROM transactions 
            WHERE settings_tag = ${settingsTag}
        `
        const incomeResult = await sql`
            SELECT COALESCE(SUM(amount),0) as income FROM transactions
            WHERE settings_tag = ${settingsTag} AND amount > 0
        `
        const expensesResult = await sql`
            SELECT COALESCE(SUM(amount),0) as expenses FROM transactions
            WHERE settings_tag = ${settingsTag} AND amount < 0
        `

        res.status(200).json({
            balance: balanceResult[0].balance,
            income: incomeResult[0].income,
            expenses: expensesResult[0].expenses,
            settings_tag: settingsTag
        })

    } catch (error) {
        console.log("Error getting summary by tag",error)
        res.status(500).json({ message: "Internal server error"})
    }
}

export async function updateTransaction(req, res) {
  try {

    const { id } = req.params;
    const { title, amount, category } = req.body;

    if (!title?.trim() || isNaN(Number(amount)) || !category?.trim()) {
      return res.status(400).json({
        error: "All fields (title, amount, category) are required and must be valid."
      });
    }

    const cleanAmount = Number(amount);

    const result = await sql`
      UPDATE transactions
      SET title = ${title},
          amount = ${cleanAmount},
          category = ${category}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    res.status(200).json({
      message: "Transaction updated successfully",
      transaction: result[0],
    });

  } catch (error) {
    console.error("Error updating the transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

