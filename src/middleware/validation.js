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
