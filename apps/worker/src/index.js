require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function processExpiredReservations() {
  console.log('[Worker] Processing expired reservations...');
  
  try {
    const result = await pool.query(
      \UPDATE slots 
       SET status = 'unallocated', reserve_expires_at = NULL, updated_at = NOW()
       WHERE status = 'reserved' AND reserve_expires_at < NOW()
       RETURNING id, series_id, slot_number\
    );
    
    if (result.rowCount > 0) {
      console.log(\[Worker] Released \ expired reservations\);
    }
  } catch (error) {
    console.error('[Worker] Error processing expired reservations:', error);
  }
}

// Run every 60 seconds
setInterval(processExpiredReservations, 60000);

console.log('[Worker] Started. Checking expired reservations every 60s...');
processExpiredReservations(); // Run immediately on start
