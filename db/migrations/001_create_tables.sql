CREATE TABLE series (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  total_slots INTEGER NOT NULL DEFAULT 100000,
  price_jpy INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE slots (
  id SERIAL PRIMARY KEY,
  series_id INTEGER NOT NULL REFERENCES series(id),
  slot_number INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'unallocated',
  reserve_expires_at TIMESTAMP,
  purchased_at TIMESTAMP,
  user_id VARCHAR(255),
  stripe_session_id VARCHAR(255),
  amount_jpy_snapshot INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(series_id, slot_number)
);

CREATE INDEX idx_slots_status ON slots(status);
CREATE INDEX idx_slots_reserve_expires ON slots(reserve_expires_at) WHERE status = 'reserved';

CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  series_id INTEGER NOT NULL REFERENCES series(id),
  type VARCHAR(20) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stripe_events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE win_assignments (
  id SERIAL PRIMARY KEY,
  series_id INTEGER NOT NULL REFERENCES series(id),
  slot_number INTEGER NOT NULL,
  win_type VARCHAR(50) NOT NULL,
  asset_id INTEGER REFERENCES assets(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(series_id, slot_number)
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id INTEGER,
  reason TEXT NOT NULL,
  diff_json JSONB,
  request_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

INSERT INTO series (name, description, total_slots, price_jpy, status)
VALUES ('デモシリーズ', 'デモ用のくじシリーズ', 100000, 0, 'active');

INSERT INTO slots (series_id, slot_number, status)
SELECT 1, generate_series(1, 100000), 'unallocated';
