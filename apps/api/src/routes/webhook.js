const express = require('express');
const router = express.Router();
const pool = require('../db');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

router.post('/stripe', async (req, res) => {
  if (!stripe) {
    return res.status(400).json({ error: 'Stripe not configured' });
  }
  
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send('Webhook signature verification failed');
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const slot_id = session.metadata.slot_id;
    
    try {
      // 冪等処理チェック
      const eventCheck = await pool.query('SELECT id FROM stripe_events WHERE event_id = $1', [event.id]);
      if (eventCheck.rows.length > 0) {
        return res.json({ received: true, note: 'Already processed' });
      }
      
      await pool.query('BEGIN');
      
      // consumed化
      await pool.query(
        'UPDATE slots SET status = \'consumed\', stripe_session_id = $1, amount_jpy_snapshot = $2, purchased_at = NOW() WHERE id = $3',
        [session.id, session.amount_total, slot_id]
      );
      
      // イベント記録
      await pool.query('INSERT INTO stripe_events (event_id, event_type) VALUES ($1, $2)', [event.id, event.type]);
      
      await pool.query('COMMIT');
      
      console.log('[Webhook] Slot consumed:', slot_id);
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Webhook processing error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  res.json({ received: true });
});

module.exports = router;
