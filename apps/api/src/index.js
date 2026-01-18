const express = require('express');
const cors = require('cors');
require('dotenv').config();

const purchaseRoutes = require('./routes/purchase');
const webhookRoutes = require('./routes/webhook');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/api/purchase', purchaseRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log('🚀 API server running on port ' + PORT);
  console.log('📊 Health check: http://localhost:' + PORT + '/health');
});
