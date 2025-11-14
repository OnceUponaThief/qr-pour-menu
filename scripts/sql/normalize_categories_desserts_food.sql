-- Normalize categories: move certain items to Desserts or Food for better organization
-- Idempotent and non-destructive: only updates category and ensures availability

BEGIN;

-- Desserts: Brownie and Ice Cream scoops
WITH dessert_items(name, category) AS (
  VALUES
    ('SIZZLING BROWNIE', 'desserts'),
    ('VANILLA ICE CREAM SCOOP', 'desserts'),
    ('STRAWBERRY ICE CREAM SCOOP', 'desserts')
)
UPDATE public.menu_items m
SET category = d.category,
    available = COALESCE(m.available, true)
FROM dessert_items d
WHERE upper(m.name) = upper(d.name);

-- Food: Hot beverages commonly treated as cafe items
-- Note: If you prefer these under 'drinks', change 'food' to 'drinks' below
WITH food_beverages(name, category) AS (
  VALUES
    ('LEMON TEA', 'food'),
    ('MASALA CHAI', 'food'),
    ('MOCHA', 'food'),
    ('SPANISH COFFEE', 'food')
)
UPDATE public.menu_items m
SET category = f.category,
    available = COALESCE(m.available, true)
FROM food_beverages f
WHERE upper(m.name) = upper(f.name);

COMMIT;