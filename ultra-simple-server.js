// Servidor ULTRA SIMPLE para debugging extremo
import express from "express";
import cors from "cors";

const app = express();
const PORT = 4000;

// CORS súper permisivo
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['*'],
  credentials: false
}));

app.use(express.json());

// Middleware de logging súper detallado
app.use((req, res, next) => {
  console.log('\n🔍 ULTRA SIMPLE SERVER LOG:');
  console.log(`📍 ${req.method} ${req.url}`);
  console.log('📥 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📥 Body:', JSON.stringify(req.body, null, 2));
  console.log('📥 Params:', JSON.stringify(req.params, null, 2));
  console.log('📥 Query:', JSON.stringify(req.query, null, 2));
  console.log('⏰ Timestamp:', new Date().toISOString());
  next();
});

// Rutas ultra simples
app.get('/api/transactions/test', (req, res) => {
  console.log('✅ Test route hit');
  res.json({ 
    message: "Ultra simple server working",
    timestamp: new Date().toISOString()
  });
});

app.get('/api/transactions/:userId', (req, res) => {
  console.log('✅ GET transactions route hit');
  console.log('📊 UserId:', req.params.userId);
  
  res.json({
    success: true,
    message: "Transactions fetched (mock)",
    data: [
      {
        id: 1,
        amount: 50,
        description: "Test expense",
        category: "food",
        type: "expense",
        date: new Date().toISOString()
      },
      {
        id: 2,
        amount: 100,
        description: "Test income",
        category: "salary",
        type: "income",
        date: new Date().toISOString()
      }
    ],
    userId: req.params.userId,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/transactions', (req, res) => {
  console.log('✅ POST transactions route hit');
  console.log('📊 Body:', req.body);
  
  res.json({
    success: true,
    message: "Transaction created (mock)",
    data: {
      id: Math.floor(Math.random() * 1000),
      ...req.body,
      created_at: new Date().toISOString()
    }
  });
});

// Catch all para ver qué rutas se están intentando
app.use('*', (req, res) => {
  console.log('❓ Unmatched route:', req.method, req.originalUrl);
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    url: req.originalUrl,
    availableRoutes: [
      'GET /api/transactions/test',
      'GET /api/transactions/:userId',
      'POST /api/transactions'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ULTRA SIMPLE SERVER running on port ${PORT}`);
  console.log(`📍 Test URL: http://localhost:${PORT}/api/transactions/test`);
  console.log('🔍 All requests will be logged in detail');
});
