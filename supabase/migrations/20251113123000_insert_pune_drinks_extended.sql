-- Pune (India) Extended Bar Catalog: Inserts/Updates with local pricing
-- Safe to run multiple times: inserts missing, updates existing by name (case-insensitive)
-- Categories used by the app: 'imfl','beer','breezers','wine','liqueurs','cocktails','mocktails','shots'

BEGIN;

WITH items(name, category, price) AS (
  VALUES
  -- WHISKEY (IMFL & Imported) 30 ml
  ('ROYAL GREEN 30 ML',                  'imfl', 200.00),
  ('OAKSMITH GOLD 30 ML',                'imfl', 280.00),
  ('OAKSMITH INTERNATIONAL 30 ML',       'imfl', 240.00),
  ('STERLING RESERVE B10 30 ML',         'imfl', 200.00),
  ('STERLING RESERVE B7 30 ML',          'imfl', 180.00),
  ('ROCKFORD RESERVE 30 ML',             'imfl', 250.00),
  ('ROCKFORD CLASSIC 30 ML',             'imfl', 230.00),
  ('BLACK & WHITE 30 ML',                'imfl', 400.00),
  ('VAT 69 30 ML',                       'imfl', 420.00),
  ('100 PIPERS 8Y 30 ML',                'imfl', 480.00),
  ('100 PIPERS 12Y 30 ML',               'imfl', 650.00),
  ('TEACHERS 50 30 ML',                  'imfl', 500.00),
  ('BALLANTINE''S FINEST 30 ML',         'imfl', 500.00),
  ('DEWAR''S WHITE LABEL 30 ML',         'imfl', 500.00),
  ('MONKEY SHOULDER 30 ML',              'imfl', 1200.00),
  ('JOHNNIE WALKER DOUBLE BLACK 30 ML',  'imfl', 1400.00),
  ('JOHNNIE WALKER GOLD LABEL 30 ML',    'imfl', 1600.00),
  ('CHIVAS REGAL 18 30 ML',              'imfl', 1800.00),
  ('GLENMORANGIE 10 30 ML',              'imfl', 1500.00),
  ('TALISKER 10 30 ML',                  'imfl', 1700.00),
  ('LAGAVULIN 16 30 ML',                 'imfl', 2200.00),
  ('HIGHLAND PARK 12 30 ML',             'imfl', 1500.00),
  ('PAUL JOHN EDITED 30 ML',             'imfl', 950.00),
  ('AMRUT SINGLE MALT 30 ML',            'imfl', 1200.00),

  -- RUM 30 ml
  ('OLD MONK GOLD RESERVE 30 ML',        'imfl', 180.00),
  ('CAPTAIN MORGAN 30 ML',               'imfl', 300.00),
  ('CONTESSA XXX RUM 30 ML',             'imfl', 180.00),

  -- VODKA 30 ml
  ('MAGIC MOMENTS GREEN APPLE 30 ML',    'imfl', 240.00),
  ('MAGIC MOMENTS ORANGE 30 ML',         'imfl', 240.00),
  ('SMIRNOFF GREEN APPLE 30 ML',         'imfl', 320.00),
  ('STOLICHNAYA 30 ML',                  'imfl', 500.00),
  ('CIROC 30 ML',                        'imfl', 1200.00),

  -- GIN 30 ml
  ('GREATER THAN 30 ML',                 'imfl', 500.00),
  ('GORDON''S 30 ML',                    'imfl', 450.00),
  ('HENDRICK''S 30 ML',                  'imfl', 1200.00),

  -- BRANDY 30 ml
  ('REM''Y MARTIN VSOP 30 ML',           'imfl', 1800.00),

  -- TEQUILA 30 ml
  ('PATRON SILVER 30 ML',                'imfl', 1500.00),
  ('DON JULIO BLANCO 30 ML',             'imfl', 1600.00),

  -- LIQUEURS 30 ml
  ('APEROL 30 ML',                       'liqueurs', 600.00),
  ('CAMPARI 30 ML',                      'liqueurs', 600.00),
  ('AMARETTO DISARONNO 30 ML',           'liqueurs', 700.00),
  ('MIDORI 30 ML',                        'liqueurs', 700.00),
  ('BLUE CURACAO 30 ML',                 'liqueurs', 300.00),
  ('VERMOUTH DRY 30 ML',                 'liqueurs', 250.00),
  ('VERMOUTH SWEET 30 ML',               'liqueurs', 250.00),

  -- BEER (pints/cans)
  ('SIMBA STRONG PINT',                  'beer', 320.00),
  ('SIMBA WIT PINT',                     'beer', 350.00),
  ('WHITE OWL ACE PINT',                 'beer', 350.00),
  ('WHITE OWL DIABLO PINT',              'beer', 360.00),
  ('EFFINGUT HEFEWEIZEN PINT',           'beer', 450.00),
  ('EFFINGUT CITRA ALE PINT',            'beer', 500.00),
  ('INDEPENDENCE BREWING WIT PINT',      'beer', 450.00),
  ('INDEPENDENCE BREWING IPA PINT',      'beer', 500.00),
  ('STELLA ARTOIS PINT',                 'beer', 600.00),
  ('ASAHI SUPER DRY PINT',               'beer', 650.00),

  -- BREEZERS (additional)
  ('BACARDI BREEZER BLACKBERRY',         'breezers', 300.00),
  ('BACARDI BREEZER WATERMELON',         'breezers', 300.00),

  -- WINE (additional glass & bottle)
  ('SULA RASA GLASS',                    'wine', 900.00),
  ('SULA RASA BOTTLE',                   'wine', 3500.00),
  ('GROVER LA RESERVE GLASS',            'wine', 700.00),
  ('GROVER LA RESERVE BOTTLE',           'wine', 2800.00),
  ('FRATELLI MS GLASS',                  'wine', 700.00),
  ('FRATELLI MS BOTTLE',                 'wine', 2600.00),
  ('JACOBS CREEK CLASSIC GLASS',         'wine', 600.00),
  ('JACOBS CREEK CLASSIC BOTTLE',        'wine', 2400.00),
  ('YELLOW TAIL SHIRAZ GLASS',           'wine', 600.00),
  ('YELLOW TAIL SHIRAZ BOTTLE',          'wine', 2400.00),

  -- COCKTAILS (extended)
  ('APEROL SPRITZ',                      'cocktails', 600.00),
  ('ESPRESSO MARTINI',                   'cocktails', 600.00),
  ('AMARETTO SOUR',                      'cocktails', 550.00),
  ('GIN BASIL SMASH',                    'cocktails', 550.00),
  ('PALOMA',                             'cocktails', 550.00),
  ('CAIPIROSKA',                         'cocktails', 500.00),
  ('CAIPIRINHA',                         'cocktails', 500.00),
  ('SIDECAR',                            'cocktails', 600.00),
  ('TOM COLLINS',                        'cocktails', 500.00),
  ('BLOODY MARY',                        'cocktails', 550.00),

  -- MOCKTAILS (extended)
  ('VIRGIN MARY',                        'mocktails', 250.00),
  ('VIRGIN PINA COLADA',                 'mocktails', 300.00),
  ('STRAWBERRY LEMONADE',                'mocktails', 280.00),
  ('KIWI COOLER',                        'mocktails', 300.00),
  ('GINGER LEMONADE',                    'mocktails', 250.00),

  -- SHOTS (extended)
  ('PICKLEBACK SHOT',                    'shots', 350.00),
  ('FIREBALL SHOT',                      'shots', 500.00)
)

-- Insert missing items
INSERT INTO public.menu_items (name, description, price, category, image_url, available, modifiers, dietary_preferences, seasonal, chef_special, sort_order)
SELECT i.name, NULL, i.price, i.category, NULL, true, '[]'::jsonb, '[]'::jsonb, false, false, 0
FROM items i
WHERE NOT EXISTS (
  SELECT 1 FROM public.menu_items m WHERE upper(m.name) = upper(i.name)
);

-- Update existing items to align category and pricing
UPDATE public.menu_items m
SET category = i.category,
    price = i.price,
    available = true
FROM items i
WHERE upper(m.name) = upper(i.name);

COMMIT;