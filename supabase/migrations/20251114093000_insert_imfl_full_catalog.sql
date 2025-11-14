-- Insert comprehensive IMFL catalog with 30ml/60ml/90ml modifiers and mark low-end brands unavailable
-- Run via: supabase db push (requires Supabase CLI and project setup)

WITH new_items AS (
  SELECT * FROM (
    VALUES
    -- Low-end Whisky (marked unavailable)
    ('ROYAL STAG', 'Whisky - Hinjewadi Pune pricing', 'imfl', false, '[{"id":"30ml","name":"30ml","price":200},{"id":"60ml","name":"60ml","price":400},{"id":"90ml","name":"90ml","price":600}]'::jsonb),
    ('IMPERIAL BLUE', 'Whisky - Hinjewadi Pune pricing', 'imfl', false, '[{"id":"30ml","name":"30ml","price":180},{"id":"60ml","name":"60ml","price":360},{"id":"90ml","name":"90ml","price":540}]'::jsonb),
    ('MCDOWELLS NO.1 WHISKY', 'Whisky - Hinjewadi Pune pricing', 'imfl', false, '[{"id":"30ml","name":"30ml","price":180},{"id":"60ml","name":"60ml","price":360},{"id":"90ml","name":"90ml","price":540}]'::jsonb),
    ('OFFICERS CHOICE', 'Whisky - Hinjewadi Pune pricing', 'imfl', false, '[{"id":"30ml","name":"30ml","price":170},{"id":"60ml","name":"60ml","price":340},{"id":"90ml","name":"90ml","price":510}]'::jsonb),
    ('BAGPIPER', 'Whisky - Hinjewadi Pune pricing', 'imfl', false, '[{"id":"30ml","name":"30ml","price":160},{"id":"60ml","name":"60ml","price":320},{"id":"90ml","name":"90ml","price":480}]'::jsonb),
    ('8PM', 'Whisky - Hinjewadi Pune pricing', 'imfl', false, '[{"id":"30ml","name":"30ml","price":170},{"id":"60ml","name":"60ml","price":340},{"id":"90ml","name":"90ml","price":510}]'::jsonb),
    ('ROYAL CHALLENGE', 'Whisky - Hinjewadi Pune pricing', 'imfl', false, '[{"id":"30ml","name":"30ml","price":240},{"id":"60ml","name":"60ml","price":480},{"id":"90ml","name":"90ml","price":720}]'::jsonb),

    -- Premium Whisky
    ('OAKSMITH GOLD', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":300},{"id":"60ml","name":"60ml","price":600},{"id":"90ml","name":"90ml","price":900}]'::jsonb),
    ('BLACK & WHITE', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":350},{"id":"60ml","name":"60ml","price":700},{"id":"90ml","name":"90ml","price":1050}]'::jsonb),
    ('J & B RARE', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,     '[{"id":"30ml","name":"30ml","price":400},{"id":"60ml","name":"60ml","price":800},{"id":"90ml","name":"90ml","price":1200}]'::jsonb),
    ('TEACHER HIGHLAND', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,'[{"id":"30ml","name":"30ml","price":380},{"id":"60ml","name":"60ml","price":760},{"id":"90ml","name":"90ml","price":1140}]'::jsonb),
    ('TEACHER 50', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,     '[{"id":"30ml","name":"30ml","price":400},{"id":"60ml","name":"60ml","price":800},{"id":"90ml","name":"90ml","price":1200}]'::jsonb),
    ('J.W RED LABEL', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,   '[{"id":"30ml","name":"30ml","price":450},{"id":"60ml","name":"60ml","price":900},{"id":"90ml","name":"90ml","price":1350}]'::jsonb),
    ('J.W BLACK LABEL', 'Whisky - Hinjewadi Pune pricing', 'imfl', true, '[{"id":"30ml","name":"30ml","price":700},{"id":"60ml","name":"60ml","price":1400},{"id":"90ml","name":"90ml","price":2100}]'::jsonb),
    ('J.W DOUBLE BLACK', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,'[{"id":"30ml","name":"30ml","price":850},{"id":"60ml","name":"60ml","price":1700},{"id":"90ml","name":"90ml","price":2550}]'::jsonb),
    ('BLACK DOG TRIPLE GOLD', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,'[{"id":"30ml","name":"30ml","price":600},{"id":"60ml","name":"60ml","price":1200},{"id":"90ml","name":"90ml","price":1800}]'::jsonb),
    ('CHIVAS REGAL 12 YRS', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,'[{"id":"30ml","name":"30ml","price":700},{"id":"60ml","name":"60ml","price":1400},{"id":"90ml","name":"90ml","price":2100}]'::jsonb),
    ('DEWARS WHITE LABEL', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,'[{"id":"30ml","name":"30ml","price":450},{"id":"60ml","name":"60ml","price":900},{"id":"90ml","name":"90ml","price":1350}]'::jsonb),
    ('DEWARS 12YRS', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,   '[{"id":"30ml","name":"30ml","price":700},{"id":"60ml","name":"60ml","price":1400},{"id":"90ml","name":"90ml","price":2100}]'::jsonb),
    ('JAMESON IRISH WHISKEY', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,'[{"id":"30ml","name":"30ml","price":500},{"id":"60ml","name":"60ml","price":1000},{"id":"90ml","name":"90ml","price":1500}]'::jsonb),
    ('JACK DANIELS', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,   '[{"id":"30ml","name":"30ml","price":650},{"id":"60ml","name":"60ml","price":1300},{"id":"90ml","name":"90ml","price":1950}]'::jsonb),
    ('JIM BEAM', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,       '[{"id":"30ml","name":"30ml","price":450},{"id":"60ml","name":"60ml","price":900},{"id":"90ml","name":"90ml","price":1350}]'::jsonb),
    ('MONKEY SHOULDER', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,'[{"id":"30ml","name":"30ml","price":700},{"id":"60ml","name":"60ml","price":1400},{"id":"90ml","name":"90ml","price":2100}]'::jsonb),
    ('GLENFIDDICH 12YRS', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,'[{"id":"30ml","name":"30ml","price":1100},{"id":"60ml","name":"60ml","price":2200},{"id":"90ml","name":"90ml","price":3300}]'::jsonb),
    ('GLENLIVET 12YRS', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,'[{"id":"30ml","name":"30ml","price":1100},{"id":"60ml","name":"60ml","price":2200},{"id":"90ml","name":"90ml","price":3300}]'::jsonb),
    ('INDRI SINGLE MALT', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,'[{"id":"30ml","name":"30ml","price":700},{"id":"60ml","name":"60ml","price":1400},{"id":"90ml","name":"90ml","price":2100}]'::jsonb),
    ('AMRUT FUSION', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,   '[{"id":"30ml","name":"30ml","price":800},{"id":"60ml","name":"60ml","price":1600},{"id":"90ml","name":"90ml","price":2400}]'::jsonb),
    ('PAUL JOHN BRILLIANCE', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,'[{"id":"30ml","name":"30ml","price":700},{"id":"60ml","name":"60ml","price":1400},{"id":"90ml","name":"90ml","price":2100}]'::jsonb),
    ('PAUL JOHN BOLD', 'Whisky - Hinjewadi Pune pricing', 'imfl', true, '[{"id":"30ml","name":"30ml","price":700},{"id":"60ml","name":"60ml","price":1400},{"id":"90ml","name":"90ml","price":2100}]'::jsonb),

    -- Vodka
    ('WHITE MISCHIEF', 'Vodka - Hinjewadi Pune pricing', 'imfl', false, '[{"id":"30ml","name":"30ml","price":200},{"id":"60ml","name":"60ml","price":400},{"id":"90ml","name":"90ml","price":600}]'::jsonb),
    ('ROMANOV', 'Vodka - Hinjewadi Pune pricing', 'imfl', false,        '[{"id":"30ml","name":"30ml","price":200},{"id":"60ml","name":"60ml","price":400},{"id":"90ml","name":"90ml","price":600}]'::jsonb),
    ('MAGIC MOMENTS', 'Vodka - Hinjewadi Pune pricing', 'imfl', false,  '[{"id":"30ml","name":"30ml","price":250},{"id":"60ml","name":"60ml","price":500},{"id":"90ml","name":"90ml","price":750}]'::jsonb),
    ('SMIRNOFF', 'Vodka - Hinjewadi Pune pricing', 'imfl', true,        '[{"id":"30ml","name":"30ml","price":300},{"id":"60ml","name":"60ml","price":600},{"id":"90ml","name":"90ml","price":900}]'::jsonb),
    ('SMIRNOFF FLAVOUR', 'Vodka - Hinjewadi Pune pricing', 'imfl', true,'[{"id":"30ml","name":"30ml","price":320},{"id":"60ml","name":"60ml","price":640},{"id":"90ml","name":"90ml","price":960}]'::jsonb),
    ('ABSOLUT', 'Vodka - Hinjewadi Pune pricing', 'imfl', true,         '[{"id":"30ml","name":"30ml","price":450},{"id":"60ml","name":"60ml","price":900},{"id":"90ml","name":"90ml","price":1350}]'::jsonb),
    ('KETEL ONE', 'Vodka - Hinjewadi Pune pricing', 'imfl', true,       '[{"id":"30ml","name":"30ml","price":700},{"id":"60ml","name":"60ml","price":1400},{"id":"90ml","name":"90ml","price":2100}]'::jsonb),
    ('GREY GOOSE', 'Vodka - Hinjewadi Pune pricing', 'imfl', true,      '[{"id":"30ml","name":"30ml","price":900},{"id":"60ml","name":"60ml","price":1800},{"id":"90ml","name":"90ml","price":2700}]'::jsonb),

    -- Rum
    ('OLD MONK DARK', 'Rum - Hinjewadi Pune pricing', 'imfl', false,    '[{"id":"30ml","name":"30ml","price":250},{"id":"60ml","name":"60ml","price":500},{"id":"90ml","name":"90ml","price":750}]'::jsonb),
    ('OLD MONK WHITE', 'Rum - Hinjewadi Pune pricing', 'imfl', false,   '[{"id":"30ml","name":"30ml","price":250},{"id":"60ml","name":"60ml","price":500},{"id":"90ml","name":"90ml","price":750}]'::jsonb),
    ('BACARDI CARTA BLANCA', 'Rum - Hinjewadi Pune pricing', 'imfl', true,'[{"id":"30ml","name":"30ml","price":300},{"id":"60ml","name":"60ml","price":600},{"id":"90ml","name":"90ml","price":900}]'::jsonb),
    ('BACARDI BLACK', 'Rum - Hinjewadi Pune pricing', 'imfl', true,     '[{"id":"30ml","name":"30ml","price":300},{"id":"60ml","name":"60ml","price":600},{"id":"90ml","name":"90ml","price":900}]'::jsonb),
    ('BACARDI LIMON', 'Rum - Hinjewadi Pune pricing', 'imfl', true,     '[{"id":"30ml","name":"30ml","price":320},{"id":"60ml","name":"60ml","price":640},{"id":"90ml","name":"90ml","price":960}]'::jsonb),
    ('CAPTAIN MORGAN', 'Rum - Hinjewadi Pune pricing', 'imfl', true,    '[{"id":"30ml","name":"30ml","price":300},{"id":"60ml","name":"60ml","price":600},{"id":"90ml","name":"90ml","price":900}]'::jsonb),

    -- Brandy
    ('HONEY BEE', 'Brandy - Hinjewadi Pune pricing', 'imfl', false,     '[{"id":"30ml","name":"30ml","price":250},{"id":"60ml","name":"60ml","price":500},{"id":"90ml","name":"90ml","price":750}]'::jsonb),
    ('MANSION HOUSE', 'Brandy - Hinjewadi Pune pricing', 'imfl', false, '[{"id":"30ml","name":"30ml","price":300},{"id":"60ml","name":"60ml","price":600},{"id":"90ml","name":"90ml","price":900}]'::jsonb),

    -- Gin (premium)
    ('GREATER THAN', 'Gin - Hinjewadi Pune pricing', 'imfl', true,      '[{"id":"30ml","name":"30ml","price":350},{"id":"60ml","name":"60ml","price":700},{"id":"90ml","name":"90ml","price":1050}]'::jsonb),
    ('GORDONS', 'Gin - Hinjewadi Pune pricing', 'imfl', true,           '[{"id":"30ml","name":"30ml","price":350},{"id":"60ml","name":"60ml","price":700},{"id":"90ml","name":"90ml","price":1050}]'::jsonb),
    ('BEEFEATER', 'Gin - Hinjewadi Pune pricing', 'imfl', true,         '[{"id":"30ml","name":"30ml","price":400},{"id":"60ml","name":"60ml","price":800},{"id":"90ml","name":"90ml","price":1200}]'::jsonb),
    ('BOMBAY SAPPHIRE', 'Gin - Hinjewadi Pune pricing', 'imfl', true,   '[{"id":"30ml","name":"30ml","price":450},{"id":"60ml","name":"60ml","price":900},{"id":"90ml","name":"90ml","price":1350}]'::jsonb),
    ('TANQUERAY', 'Gin - Hinjewadi Pune pricing', 'imfl', true,         '[{"id":"30ml","name":"30ml","price":500},{"id":"60ml","name":"60ml","price":1000},{"id":"90ml","name":"90ml","price":1500}]'::jsonb),
    ('JAISALMER', 'Gin - Hinjewadi Pune pricing', 'imfl', true,         '[{"id":"30ml","name":"30ml","price":600},{"id":"60ml","name":"60ml","price":1200},{"id":"90ml","name":"90ml","price":1800}]'::jsonb)
  ) AS v(name, description, category, available, modifiers)
)

-- 1) Insert any missing rows
INSERT INTO public.menu_items (name, description, price, category, image_url, available, modifiers, dietary_preferences)
SELECT ni.name, ni.description, (ni.modifiers->0->>'price')::numeric, ni.category, NULL, ni.available, ni.modifiers, '[]'::jsonb
FROM new_items ni
LEFT JOIN public.menu_items mi ON mi.name = ni.name
WHERE mi.id IS NULL;

-- 2) Update rows that already exist
UPDATE public.menu_items mi
SET description = ni.description,
    category    = ni.category,
    modifiers   = ni.modifiers,
    price       = (ni.modifiers->0->>'price')::numeric,
    available   = CASE 
                    WHEN ni.available = false THEN false 
                    ELSE COALESCE(mi.available, true)
                  END
FROM new_items ni
WHERE mi.name = ni.name;