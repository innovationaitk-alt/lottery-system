-- ?????????

-- 1. series ????? animation_video_url ??????
ALTER TABLE series ADD COLUMN IF NOT EXISTS animation_video_url TEXT;

-- 2. slots ????????????????
ALTER TABLE slots ADD COLUMN IF NOT EXISTS card_name VARCHAR(255);
ALTER TABLE slots ADD COLUMN IF NOT EXISTS card_image_url TEXT;
ALTER TABLE slots ADD COLUMN IF NOT EXISTS card_value INTEGER;
ALTER TABLE slots ADD COLUMN IF NOT EXISTS card_rarity VARCHAR(50);
ALTER TABLE slots ADD COLUMN IF NOT EXISTS card_description TEXT;

-- 3. ?????????
ALTER TABLE slots DROP COLUMN IF EXISTS win_type;
ALTER TABLE slots DROP COLUMN IF EXISTS win_details;
ALTER TABLE slots DROP COLUMN IF EXISTS win_rank;