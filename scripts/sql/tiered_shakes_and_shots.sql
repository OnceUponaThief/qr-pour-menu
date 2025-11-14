-- tiered_shakes_and_shots.sql
-- Purpose: Implement user-defined pricing tiers
-- - Treat JAGER BOMB as an exception at ₹599
-- - Shakes tiering: Vanilla/Strawberry ₹270; Oreo ₹299; Thick/Premium 349–399; clamp all others 270–399
-- Safety: Idempotent updates

BEGIN;

-- 1) JAGER BOMB explicit pricing
UPDATE menu_items
SET price = 599
WHERE LOWER(category) = 'shots'
  AND UPPER(name) = 'JAGER BOMB'
  AND (price IS NULL OR price <> 599);

-- 2) Shakes: specific item pricing
UPDATE menu_items
SET price = 270
WHERE LOWER(category) = 'shakes'
  AND UPPER(name) IN ('VANILLA SHAKE', 'STRAWBERRY SHAKE')
  AND (price IS NULL OR price <> 270);

UPDATE menu_items
SET price = 299
WHERE LOWER(category) = 'shakes'
  AND UPPER(name) IN ('OREO SHAKE')
  AND (price IS NULL OR price <> 299);

-- 3) Shakes: premium/thick variants band 349–399
UPDATE menu_items
SET price = LEAST(GREATEST(COALESCE(NULLIF(price, 0), 349), 349), 399)
WHERE LOWER(category) = 'shakes'
  AND (
    LOWER(name) LIKE '%thick%'
    OR LOWER(name) LIKE '%premium%'
    OR LOWER(name) LIKE '%special%'
  );

-- 4) Shakes: clamp all remaining to 270–399, default 299
UPDATE menu_items
SET price = LEAST(GREATEST(COALESCE(NULLIF(price, 0), 299), 270), 399)
WHERE LOWER(category) = 'shakes';

COMMIT;