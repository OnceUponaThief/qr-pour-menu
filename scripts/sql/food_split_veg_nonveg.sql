-- food_split_veg_nonveg.sql
-- Purpose: Introduce split food categories: food_veg and food_non_veg
-- - Move known vegetarian items (desserts, tea/chai/coffee) to food_veg
-- - Keep availability = true
-- Safety: Idempotent category updates

BEGIN;

-- Create veg split: desserts
UPDATE menu_items
SET category = 'food_veg', available = TRUE
WHERE LOWER(category) IN ('food', 'desserts')
  AND (
    UPPER(name) LIKE '%BROWNIE%'
    OR UPPER(name) LIKE '%ICE CREAM%'
    OR UPPER(name) LIKE '%SCOOP%'
  );

-- Create veg split: hot beverages
UPDATE menu_items
SET category = 'food_veg', available = TRUE
WHERE LOWER(category) IN ('food')
  AND (
    UPPER(name) LIKE '%TEA%'
    OR UPPER(name) LIKE '%CHAI%'
    OR UPPER(name) LIKE '%COFFEE%'
    OR UPPER(name) LIKE '%MOCHA%'
  );

-- Optional: move any remaining 'desserts' to food_veg by default
UPDATE menu_items
SET category = 'food_veg', available = TRUE
WHERE LOWER(category) = 'desserts';

-- Placeholder for non-veg mapping (extend with actual items when available)
-- UPDATE menu_items
-- SET category = 'food_non_veg', available = TRUE
-- WHERE LOWER(category) IN ('food')
--   AND UPPER(name) SIMILAR TO '(CHICKEN|MUTTON|FISH|PRAWN|EGG)%';

COMMIT;