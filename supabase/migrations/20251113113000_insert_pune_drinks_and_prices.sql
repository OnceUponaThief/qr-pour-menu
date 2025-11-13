-- Insert/Update Pune (India) drinks with typical local bar pricing
-- Idempotent: inserts missing items, updates price/category for existing names (case-insensitive)
-- Categories align with app filters: 'imfl', 'beer', 'breezers', 'wine', 'liqueurs', 'cocktails', 'mocktails', 'shots'

BEGIN;

WITH items(name, category, price) AS (
  VALUES
  -- IMFL (30 ml pours)
  ('BLENDERS PRIDE 30 ML',         'imfl', 220.00),
  ('ROYAL STAG 30 ML',             'imfl', 180.00),
  ('IMPERIAL BLUE 30 ML',          'imfl', 170.00),
  ('8PM 30 ML',                    'imfl', 170.00),
  ('MCDOWELL''S NO.1 30 ML',       'imfl', 180.00),
  ('SIGNATURE 30 ML',              'imfl', 260.00),
  ('ANTIQUITY BLUE 30 ML',         'imfl', 280.00),
  ('ROYAL CHALLENGE 30 ML',        'imfl', 240.00),
  ('TEACHERS 30 ML',               'imfl', 450.00),
  ('BLACK DOG 30 ML',              'imfl', 450.00),
  ('JAMESON IRISH WHISKEY 30 ML',  'imfl', 550.00),
  ('JIM BEAM 30 ML',               'imfl', 500.00),
  ('JACK DANIELS 30 ML',           'imfl', 850.00),
  ('JOHNNIE WALKER BLACK LABEL 30 ML','imfl', 1100.00),

  -- Rum (30 ml)
  ('OLD MONK 30 ML',               'imfl', 140.00),
  ('BACARDI WHITE RUM 30 ML',      'imfl', 280.00),

  -- Vodka (30 ml)
  ('WHITE MISCHIEF 30 ML',         'imfl', 170.00),
  ('ROMANOV 30 ML',                'imfl', 170.00),
  ('SMIRNOFF 30 ML',               'imfl', 280.00),
  ('ABSOLUT 30 ML',                'imfl', 450.00),

  -- Gin (30 ml)
  ('BLUE RIBAND 30 ML',            'imfl', 170.00),
  ('BEEFEATER 30 ML',              'imfl', 450.00),
  ('BOMBAY SAPPHIRE 30 ML',        'imfl', 500.00),

  -- Brandy (30 ml)
  ('HONEY BEE 30 ML',              'imfl', 170.00),
  ('MANSION HOUSE 30 ML',          'imfl', 180.00),

  -- Tequila (30 ml)
  ('JOSE CUERVO 30 ML',            'imfl', 600.00),
  ('SIERRA 30 ML',                 'imfl', 550.00),

  -- Liqueurs (30 ml)
  ('BAILEYS 30 ML',                'liqueurs', 600.00),
  ('KAHLUA 30 ML',                 'liqueurs', 550.00),
  ('JAGERMEISTER 30 ML',           'liqueurs', 700.00),

  -- Beer (pint / 330-500 ml depending on brand)
  ('KINGFISHER PREMIUM PINT',      'beer', 220.00),
  ('KINGFISHER ULTRA PINT',        'beer', 320.00),
  ('BIRA 91 BLONDE PINT',          'beer', 350.00),
  ('BIRA 91 WHITE PINT',           'beer', 360.00),
  ('BUDWEISER PINT',               'beer', 350.00),
  ('TUBORG STRONG PINT',           'beer', 300.00),
  ('CARLSBERG ELEPHANT PINT',      'beer', 350.00),
  ('CORONA PINT',                  'beer', 650.00),

  -- Breezers
  ('BACARDI BREEZER LIME',         'breezers', 300.00),
  ('BACARDI BREEZER ORANGE',       'breezers', 300.00),
  ('BACARDI BREEZER CRANBERRY',    'breezers', 300.00),

  -- Wine (glass and bottle)
  ('SULA CHENIN BLANC GLASS',      'wine', 450.00),
  ('SULA SAUVIGNON BLANC GLASS',   'wine', 500.00),
  ('SULA SHIRAZ GLASS',            'wine', 450.00),
  ('SULA CHENIN BLANC BOTTLE',     'wine', 1900.00),
  ('SULA SAUVIGNON BLANC BOTTLE',  'wine', 2100.00),
  ('SULA SHIRAZ BOTTLE',           'wine', 1900.00),
  ('FRATELLI SANGIOVESE GLASS',    'wine', 550.00),
  ('FRATELLI SANGIOVESE BOTTLE',   'wine', 2200.00),

  -- Cocktails
  ('MOJITO',                       'cocktails', 450.00),
  ('CLASSIC MARGARITA',            'cocktails', 550.00),
  ('COSMOPOLITAN',                 'cocktails', 550.00),
  ('LONG ISLAND ICED TEA',         'cocktails', 700.00),
  ('WHISKEY SOUR',                 'cocktails', 500.00),
  ('OLD FASHIONED',                'cocktails', 550.00),
  ('PINA COLADA',                  'cocktails', 500.00),
  ('SEX ON THE BEACH',             'cocktails', 550.00),

  -- Mocktails
  ('VIRGIN MOJITO',                'mocktails', 250.00),
  ('SHIRLEY TEMPLE',               'mocktails', 250.00),
  ('FRUIT PUNCH',                  'mocktails', 280.00),
  ('BLUE LAGOON',                  'mocktails', 280.00),

  -- Shots
  ('TEQUILA SHOT',                 'shots', 600.00),
  ('JAGER SHOT',                   'shots', 700.00),
  ('KAMIKAZE SHOT',                'shots', 350.00),
  ('B-52 SHOT',                    'shots', 450.00)
)

-- Insert any missing items
INSERT INTO public.menu_items (name, description, price, category, image_url, available, modifiers, dietary_preferences, seasonal, chef_special, sort_order)
SELECT i.name, NULL, i.price, i.category, NULL, true, '[]'::jsonb, '[]'::jsonb, false, false, 0
FROM items i
WHERE NOT EXISTS (
  SELECT 1 FROM public.menu_items m WHERE upper(m.name) = upper(i.name)
);

-- Update existing items to ensure category and price reflect local Pune pricing
UPDATE public.menu_items m
SET category = i.category,
    price = i.price,
    available = true
FROM items i
WHERE upper(m.name) = upper(i.name);

COMMIT;