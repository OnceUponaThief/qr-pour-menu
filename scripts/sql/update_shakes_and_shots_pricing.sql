-- Add pricing for all Shakes and Shots
-- Idempotent: updates by case-insensitive name match and category defaults
-- Safe defaults applied for any remaining NULL prices

BEGIN;

-- Explicit pricing for common Shakes/Milkshakes/Frappes/Smoothies
WITH shake_prices(name, price) AS (
  VALUES
    ('VANILLA SHAKE', 250.00),
    ('STRAWBERRY SHAKE', 250.00),
    ('OREO SHAKE', 280.00),
    ('MANGO SHAKE', 260.00),
    ('MIXED FRUIT SMOOTHIE', 280.00),
    ('MANGO SMOOTHIE', 280.00),
    ('VANILLA FRAPPE', 280.00),
    ('MOCHA FRAPPE', 300.00),
    ('MOCHA', 280.00),
    ('SPANISH COFFEE', 280.00),
    ('LEMON TEA', 150.00),
    ('MASALA CHAI', 150.00),
    ('VANILLA ICE CREAM SCOOP', 150.00),
    ('STRAWBERRY ICE CREAM SCOOP', 150.00),
    ('SIZZLING BROWNIE', 300.00)
)
UPDATE public.menu_items m
SET price = s.price,
    available = COALESCE(m.available, true)
FROM shake_prices s
WHERE upper(m.name) = upper(s.name)
  AND (m.category ILIKE 'shake%' OR m.category ILIKE 'milkshake%' OR m.category = 'shakes');

-- Explicit pricing for custom Shots (local signature names)
WITH shot_prices(name, price) AS (
  VALUES
    ('KOKUM HITMAN', 350.00),
    ('KOLHAPUR KICK', 350.00),
    ('AAMCHI AAG', 350.00),
    ('PUNE POISON', 350.00),
    ('SAHYADRI SMORE', 350.00),
    ('NAGPUR NITRO', 350.00),
    ('GOA GONE WILD', 350.00)
)
UPDATE public.menu_items m
SET price = s.price,
    available = COALESCE(m.available, true)
FROM shot_prices s
WHERE upper(m.name) = upper(s.name)
  AND m.category = 'shots';

-- Fallback: set safe defaults for any remaining Shakes with NULL price
UPDATE public.menu_items
SET price = 250.00,
    available = COALESCE(available, true)
WHERE (category ILIKE 'shake%' OR category ILIKE 'milkshake%' OR category = 'shakes')
  AND (price IS NULL OR price = 0);

-- Fallback: set safe defaults for any remaining Shots with NULL price
UPDATE public.menu_items
SET price = 350.00,
    available = COALESCE(available, true)
WHERE category = 'shots'
  AND (price IS NULL OR price = 0);

COMMIT;