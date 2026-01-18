-- ??????????

CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  series_id INTEGER NOT NULL REFERENCES series(id),
  slot_id INTEGER NOT NULL REFERENCES slots(id),
  slot_number INTEGER NOT NULL,
  card_name VARCHAR(255),
  card_image_url TEXT,
  card_value INTEGER,
  card_rarity VARCHAR(50),
  card_description TEXT,
  animation_video_url TEXT,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_purchases_series_id ON purchases(series_id);
CREATE INDEX IF NOT EXISTS idx_purchases_slot_id ON purchases(slot_id);
CREATE INDEX IF NOT EXISTS idx_purchases_purchased_at ON purchases(purchased_at);