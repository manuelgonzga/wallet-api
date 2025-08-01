import { isValidCurrency } from "../constants/currencies.js";

// Validar entrada de datos comunes
export const validateInput = {
  // Validar user_id
  userId: (userId) => {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return { isValid: false, error: "User ID is required and must be a non-empty string" };
    }
    if (userId.length > 255) {
      return { isValid: false, error: "User ID must be less than 255 characters" };
    }
    return { isValid: true };
  },

  // Validar username
  username: (username) => {
    if (!username || typeof username !== 'string') {
      return { isValid: false, error: "Username is required and must be a string" };
    }
    
    const trimmed = username.trim();
    if (trimmed.length === 0) {
      return { isValid: false, error: "Username cannot be empty" };
    }
    if (trimmed.length > 100) {
      return { isValid: false, error: "Username must be less than 100 characters" };
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) {
      return { isValid: false, error: "Username can only contain letters, numbers, dots, hyphens, and underscores" };
    }
    
    return { isValid: true, value: trimmed };
  },

  // Validar currency preference
  currencyPreference: (currency) => {
    if (!currency || typeof currency !== 'string') {
      return { isValid: false, error: "Currency preference is required and must be a string" };
    }
    
    const upperCurrency = currency.toUpperCase().trim();
    if (!isValidCurrency(upperCurrency)) {
      return { isValid: false, error: "Invalid currency preference" };
    }
    
    return { isValid: true, value: upperCurrency };
  },

  // Validar amount para transacciones
  amount: (amount) => {
    if (amount === undefined || amount === null) {
      return { isValid: false, error: "Amount is required" };
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return { isValid: false, error: "Amount must be a valid number" };
    }
    if (numAmount <= 0) {
      return { isValid: false, error: "Amount must be greater than 0" };
    }
    if (numAmount > 999999.99) {
      return { isValid: false, error: "Amount cannot exceed 999,999.99" };
    }
    
    // Verificar que no tenga más de 2 decimales
    const decimalCount = (numAmount.toString().split('.')[1] || '').length;
    if (decimalCount > 2) {
      return { isValid: false, error: "Amount cannot have more than 2 decimal places" };
    }
    
    return { isValid: true, value: numAmount };
  },

  // Validar título de transacción
  transactionTitle: (title) => {
    if (!title || typeof title !== 'string') {
      return { isValid: false, error: "Transaction title is required and must be a string" };
    }
    
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      return { isValid: false, error: "Transaction title cannot be empty" };
    }
    if (trimmed.length > 255) {
      return { isValid: false, error: "Transaction title must be less than 255 characters" };
    }
    
    return { isValid: true, value: trimmed };
  },

  // Validar categoría
  category: (category) => {
    if (!category || typeof category !== 'string') {
      return { isValid: false, error: "Category is required and must be a string" };
    }
    
    const trimmed = category.trim();
    if (trimmed.length === 0) {
      return { isValid: false, error: "Category cannot be empty" };
    }
    if (trimmed.length > 100) {
      return { isValid: false, error: "Category must be less than 100 characters" };
    }
    
    // Lista de categorías válidas (puedes expandir esto)
    const validCategories = [
      'Food & Drinks', 'Shopping', 'Transportation', 'Entertainment', 
      'Bills', 'Health', 'Education', 'Travel', 'Pets', 'Sports', 
      'Gifts', 'Housing', 'Utilities', 'Subscriptions', 'Work/Business', 'Other'
    ];
    
    if (!validCategories.includes(trimmed)) {
      return { isValid: false, error: "Invalid category" };
    }
    
    return { isValid: true, value: trimmed };
  },
  amount: (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return { isValid: false, error: "Amount must be a valid number" };
    }
    if (!isFinite(numAmount)) {
      return { isValid: false, error: "Amount must be a finite number" };
    }
    if (Math.abs(numAmount) > 999999.99) {
      return { isValid: false, error: "Amount cannot exceed 999,999.99" };
    }
    
    return { isValid: true, value: numAmount };
  },

  // Validar title/descripción
  title: (title) => {
    if (!title || typeof title !== 'string') {
      return { isValid: false, error: "Title is required and must be a string" };
    }
    
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      return { isValid: false, error: "Title cannot be empty" };
    }
    if (trimmed.length > 255) {
      return { isValid: false, error: "Title must be less than 255 characters" };
    }
    
    return { isValid: true, value: trimmed };
  }
};

// Middleware para sanitizar inputs
export const sanitizeRequest = (req, res, next) => {
  try {
    // Sanitizar parámetros de la URL
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = req.params[key].trim();
        }
      });
    }

    // Sanitizar query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = req.query[key].trim();
        }
      });
    }

    // Sanitizar body
    if (req.body && typeof req.body === 'object') {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      });
    }

    next();
  } catch (error) {
    console.error("Sanitization error:", error);
    return res.status(400).json({ error: "Invalid request format" });
  }
};

// Middleware para validar autorización de usuario
export const validateUserAuthorization = (req, res, next) => {
  try {
    const { userId } = req.params;
    const authUserId = req.auth?.userId;

    if (!authUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Verificar que el usuario solo pueda acceder a sus propios datos
    if (userId && userId !== authUserId) {
      return res.status(403).json({ 
        error: "Forbidden", 
        message: "You can only access your own data" 
      });
    }

    next();
  } catch (error) {
    console.error("Authorization validation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Middleware para validar que el settings_tag pertenece al usuario autenticado
export const validateSettingsTagOwnership = async (req, res, next) => {
  try {
    const { settingsTag } = req.params;
    const authUserId = req.auth?.userId;

    if (!authUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!settingsTag) {
      return res.status(400).json({ error: "Settings tag is required" });
    }

    // Importar sql aquí para evitar dependencia circular
    const { sql } = await import("../config/db.js");

    // Verificar que el settings_tag pertenece al usuario autenticado
    const settingsOwnership = await sql`
      SELECT user_id FROM user_settings 
      WHERE settings_tag = ${settingsTag} AND user_id = ${authUserId}
      LIMIT 1
    `;

    if (settingsOwnership.length === 0) {
      return res.status(403).json({ 
        error: "Forbidden", 
        message: "You can only access your own settings and transactions" 
      });
    }

    next();
  } catch (error) {
    console.error("Settings tag validation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Middleware para validar que una transacción pertenece al usuario autenticado
export const validateTransactionOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authUserId = req.auth?.userId;

    if (!authUserId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!id) {
      return res.status(400).json({ error: "Transaction ID is required" });
    }

    // Importar sql aquí para evitar dependencia circular
    const { sql } = await import("../config/db.js");

    // Verificar que la transacción pertenece al usuario autenticado
    const transactionOwnership = await sql`
      SELECT t.id FROM transactions t
      JOIN user_settings us ON t.settings_tag = us.settings_tag
      WHERE t.id = ${id} AND us.user_id = ${authUserId}
      LIMIT 1
    `;

    if (transactionOwnership.length === 0) {
      return res.status(404).json({ 
        error: "Transaction not found", 
        message: "Transaction not found or you don't have permission to access it" 
      });
    }

    next();
  } catch (error) {
    console.error("Transaction ownership validation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Middleware para validar datos de transacción en POST/PUT
export const validateTransactionData = (req, res, next) => {
  try {
    const { title, amount, category } = req.body;
    
    // Validar título
    const titleValidation = validateInput.transactionTitle(title);
    if (!titleValidation.isValid) {
      return res.status(400).json({ error: titleValidation.error });
    }
    req.body.title = titleValidation.value;
    
    // Validar amount
    const amountValidation = validateInput.amount(amount);
    if (!amountValidation.isValid) {
      return res.status(400).json({ error: amountValidation.error });
    }
    req.body.amount = amountValidation.value;
    
    // Validar categoría
    const categoryValidation = validateInput.category(category);
    if (!categoryValidation.isValid) {
      return res.status(400).json({ error: categoryValidation.error });
    }
    req.body.category = categoryValidation.value;
    
    next();
  } catch (error) {
    console.error("Transaction data validation error:", error);
    return res.status(400).json({ error: "Invalid transaction data" });
  }
};
