-- Extend IMFL catalog with additional Hinjewadi Pune brands and 30/60/90ml modifiers
-- Run in Supabase SQL Editor (recommended) or via supabase db push.

WITH new_items AS (
  SELECT * FROM (
    VALUES
    -- Additional Whisky (mix of mid-tier and premium)
    ('BLENDERS PRIDE', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":300},{"id":"60ml","name":"60ml","price":600},{"id":"90ml","name":"90ml","price":900}]'::jsonb),
    ('SIGNATURE RARE AGED', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":300},{"id":"60ml","name":"60ml","price":600},{"id":"90ml","name":"90ml","price":900}]'::jsonb),
    ('ANTIQUITY BLUE', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":320},{"id":"60ml","name":"60ml","price":640},{"id":"90ml","name":"90ml","price":960}]'::jsonb),
    ('ROCKFORD RESERVE', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":300},{"id":"60ml","name":"60ml","price":600},{"id":"90ml","name":"90ml","price":900}]'::jsonb),
    ('VAT 69', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":350},{"id":"60ml","name":"60ml","price":700},{"id":"90ml","name":"90ml","price":1050}]'::jsonb),
    ('BALLANTINES FINEST', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":380},{"id":"60ml","name":"60ml","price":760},{"id":"90ml","name":"90ml","price":1140}]'::jsonb),
    ('GRANTS', 'Whisky - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":350},{"id":"60ml","name":"60ml","price":700},{"id":"90ml","name":"90ml","price":1050}]'::jsonb),
    ('DSP BLACK', 'Whisky - Hinjewadi Pune pricing', 'imfl', false,  '[{"id":"30ml","name":"30ml","price":200},{"id":"60ml","name":"60ml","price":400},{"id":"90ml","name":"90ml","price":600}]'::jsonb),
    ('ARISTOCRAT PREMIUM', 'Whisky - Hinjewadi Pune pricing', 'imfl', false,  '[{"id":"30ml","name":"30ml","price":200},{"id":"60ml","name":"60ml","price":400},{"id":"90ml","name":"90ml","price":600}]'::jsonb),

    -- Additional Vodka
    ('MAGIC MOMENTS FLAVOURS', 'Vodka - Hinjewadi Pune pricing', 'imfl', false,  '[{"id":"30ml","name":"30ml","price":270},{"id":"60ml","name":"60ml","price":540},{"id":"90ml","name":"90ml","price":810}]'::jsonb),
    ('FUEL VODKA', 'Vodka - Hinjewadi Pune pricing', 'imfl', false,  '[{"id":"30ml","name":"30ml","price":280},{"id":"60ml","name":"60ml","price":560},{"id":"90ml","name":"90ml","price":840}]'::jsonb),
    ('ERISTOFF', 'Vodka - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":320},{"id":"60ml","name":"60ml","price":640},{"id":"90ml","name":"90ml","price":960}]'::jsonb),

    -- Additional Rum
    ('CONTESSA RUM', 'Rum - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":260},{"id":"60ml","name":"60ml","price":520},{"id":"90ml","name":"90ml","price":780}]'::jsonb),
    ('HERCULES XXX RUM', 'Rum - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":240},{"id":"60ml","name":"60ml","price":480},{"id":"90ml","name":"90ml","price":720}]'::jsonb),
    ('OLD PORT RUM', 'Rum - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":260},{"id":"60ml","name":"60ml","price":520},{"id":"90ml","name":"90ml","price":780}]'::jsonb),

    -- Additional Brandy
    ('OLD ADMIRAL BRANDY', 'Brandy - Hinjewadi Pune pricing', 'imfl', false,  '[{"id":"30ml","name":"30ml","price":280},{"id":"60ml","name":"60ml","price":560},{"id":"90ml","name":"90ml","price":840}]'::jsonb),
    ('MCDOWELLS NO.1 BRANDY', 'Brandy - Hinjewadi Pune pricing', 'imfl', false,  '[{"id":"30ml","name":"30ml","price":280},{"id":"60ml","name":"60ml","price":560},{"id":"90ml","name":"90ml","price":840}]'::jsonb),

    -- Additional Gin
    ('BLUE RIBAND', 'Gin - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":280},{"id":"60ml","name":"60ml","price":560},{"id":"90ml","name":"90ml","price":840}]'::jsonb),
    ('STRANGER & SONS', 'Gin - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":450},{"id":"60ml","name":"60ml","price":900},{"id":"90ml","name":"90ml","price":1350}]'::jsonb),
    ('HAPUSA', 'Gin - Hinjewadi Pune pricing', 'imfl', true,  '[{"id":"30ml","name":"30ml","price":600},{"id":"60ml","name":"60ml","price":1200},{"id":"90ml","name":"90ml","price":1800}]'::jsonb)
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