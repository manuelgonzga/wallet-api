// Controlador ULTRA SIMPLE para debugging

export const simpleGetTransactions = async (req, res) => {
  try {
    console.log('🎯 Simple controller hit - GET transactions');
    console.log('📥 Params:', req.params);
    console.log('📥 Query:', req.query);
    
    // Respuesta fija para testing
    res.json({
      success: true,
      message: "Simple controller working",
      data: [
        {
          id: 1,
          amount: 100,
          description: "Test transaction",
          category: "test",
          type: "expense",
          date: new Date().toISOString()
        }
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Simple controller error:', error);
    res.status(500).json({ 
      error: "Simple controller failed", 
      details: error.message 
    });
  }
};

export const simpleCreateTransaction = async (req, res) => {
  try {
    console.log('🎯 Simple controller hit - CREATE transaction');
    console.log('📥 Body:', req.body);
    
    // Respuesta fija para testing
    res.json({
      success: true,
      message: "Transaction created (mock)",
      data: {
        id: Math.floor(Math.random() * 1000),
        ...req.body,
        created_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Simple create controller error:', error);
    res.status(500).json({ 
      error: "Simple create controller failed", 
      details: error.message 
    });
  }
};
