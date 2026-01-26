const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Environment validation
const requiredEnvVars = ['DATABASE_URL', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('[API] ERROR: Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Warn about optional but recommended env vars
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[API] WARNING: STRIPE_SECRET_KEY not set - Stripe payments will be disabled');
}
if (!process.env.S3_ENDPOINT) {
  console.warn('[API] WARNING: S3_ENDPOINT not set - File uploads may not work');
}

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
  console.log('[API] Server running on port ' + PORT);
  console.log('[API] Health check: http://localhost:' + PORT + '/health');
});
