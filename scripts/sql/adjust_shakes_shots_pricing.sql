-- adjust_shakes_shots_pricing.sql
-- Purpose: Apply pricing rules per user request
-- - Set all other shots (non-exception) to ₹299
-- - Ensure all shakes are priced between ₹270–₹399, with sensible defaults
--
-- Safety: Idempotent updates. Running multiple times yields the same result.
-- Assumptions: menu_items table has columns: name (text), category (text), price (numeric/int), available (bool)

BEGIN;

-- 1) Shots: Keep exceptions at their existing prices; set all other shots to ₹299
--    Exceptions list can be extended as needed.
WITH shot_exceptions AS (
  SELECT UNNEST(ARRAY[
    UPPER('B-52 SHOT'),
    UPPER('KOKUM HITMAN'),
    UPPER('JAGER BOMB')
  ]) AS ex_name
)
UPDATE menu_items mi
SET price = 299
WHERE LOWER(mi.category) = 'shots'
  AND NOT EXISTS (
    SELECT 1 FROM shot_exceptions se
    WHERE UPPER(mi.name) = se.ex_name
  )
  AND (
    mi.price IS NULL OR mi.price = 0 OR mi.price <> 299
  );

-- 2) Shakes: Enforce price band 270–399.
--    - If price is NULL/0, default to 299
--    - Clamp any existing price to the band [270, 399]
UPDATE menu_items mi
SET price = LEAST(GREATEST(COALESCE(NULLIF(mi.price, 0), 299), 270), 399)
WHERE LOWER(mi.category) = 'shakes';

COMMIT;

-- Notes:
-- - If you want specific shake variants at fixed points (e.g., Vanilla/Strawberry = 270, Oreo = 299, Premium/Thick = 349–399),
--   we can add item-level CASE rules above this clamp.