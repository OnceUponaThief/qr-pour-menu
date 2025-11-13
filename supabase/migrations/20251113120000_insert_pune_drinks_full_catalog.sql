-- Pune (India) Full Bar Catalog: Inserts/Updates with local pricing
-- Safe to run multiple times: inserts missing, updates existing by name (case-insensitive)
-- Categories used by the app: 'imfl','beer','breezers','wine','liqueurs','cocktails','mocktails','shots'

BEGIN;

WITH items(name, category, price) AS (
  VALUES
  -- WHISKEY (IMFL & Imported) 30 ml
  ('OFFICER''S CHOICE 30 ML',            'imfl', 160.00),
  ('DIRECTOR''S SPECIAL 30 ML',          'imfl', 160.00),
  ('BAGPIPER 30 ML',                     'imfl', 160.00),
  ('ROYAL STAG 30 ML',                   'imfl', 180.00),
  ('IMPERIAL BLUE 30 ML',                'imfl', 170.00),
  ('MCDOWELL''S NO.1 30 ML',             'imfl', 180.00),
  ('BLENDERS PRIDE 30 ML',               'imfl', 220.00),
  ('SIGNATURE 30 ML',                    'imfl', 260.00),
  ('ANTIQUITY BLUE 30 ML',               'imfl', 280.00),
  ('ROYAL CHALLENGE 30 ML',              'imfl', 240.00),
  ('BLACK & WHITE 30 ML',                'imfl', 400.00),
  ('VAT 69 30 ML',                       'imfl', 420.00),
  ('100 PIPERS 30 ML',                   'imfl', 450.00),
  ('TEACHERS 30 ML',                     'imfl', 450.00),
  ('BLACK DOG 30 ML',                    'imfl', 450.00),
  ('JACK DANIELS 30 ML',                 'imfl', 850.00),
  ('JAMESON IRISH WHISKEY 30 ML',        'imfl', 550.00),
  ('JIM BEAM 30 ML',                     'imfl', 500.00),
  ('JOHNNIE WALKER RED LABEL 30 ML',     'imfl', 700.00),
  ('JOHNNIE WALKER BLACK LABEL 30 ML',   'imfl', 1100.00),
  ('CHIVAS REGAL 12 30 ML',              'imfl', 1200.00),
  ('GLENFIDDICH 12 30 ML',               'imfl', 1400.00),
  ('GLENLIVET 12 30 ML',                 'imfl', 1400.00),
  ('PAUL JOHN BRILLIANCE 30 ML',         'imfl', 900.00),
  ('AMRUT FUSION 30 ML',                 'imfl', 1000.00),

  -- RUM 30 ml
  ('OLD MONK 30 ML',                     'imfl', 140.00),
  ('MCDOWELL''S NO.1 RUM 30 ML',         'imfl', 150.00),
  ('HERCULES RUM 30 ML',                 'imfl', 160.00),
  ('BACARDI WHITE RUM 30 ML',            'imfl', 280.00),
  ('BACARDI BLACK RUM 30 ML',            'imfl', 300.00),

  -- VODKA 30 ml
  ('WHITE MISCHIEF 30 ML',               'imfl', 170.00),
  ('ROMANOV 30 ML',                      'imfl', 170.00),
  ('MAGIC MOMENTS 30 ML',                'imfl', 220.00),
  ('SMIRNOFF 30 ML',                     'imfl', 280.00),
  ('ABSOLUT 30 ML',                      'imfl', 450.00),
  ('GREY GOOSE 30 ML',                   'imfl', 1200.00),

  -- GIN 30 ml
  ('BLUE RIBAND 30 ML',                  'imfl', 170.00),
  ('HAPUSA 30 ML',                       'imfl', 700.00),
  ('BOMBAY SAPPHIRE 30 ML',              'imfl', 500.00),
  ('BEEFEATER 30 ML',                    'imfl', 450.00),
  ('TANQUERAY 30 ML',                    'imfl', 500.00),

  -- BRANDY 30 ml
  ('HONEY BEE 30 ML',                    'imfl', 170.00),
  ('MANSION HOUSE 30 ML',                'imfl', 180.00),
  ('OLD ADMIRAL 30 ML',                  'imfl', 180.00),

  -- TEQUILA 30 ml
  ('JOSE CUERVO 30 ML',                  'imfl', 600.00),
  ('SIERRA 30 ML',                       'imfl', 550.00),

  -- LIQUEURS 30 ml
  ('BAILEYS 30 ML',                      'liqueurs', 600.00),
  ('KAHLUA 30 ML',                       'liqueurs', 550.00),
  ('COINTREAU 30 ML',                    'liqueurs', 700.00),
  ('TRIPLE SEC 30 ML',                   'liqueurs', 300.00),
  ('JAGERMEISTER 30 ML',                 'liqueurs', 700.00),

  -- BEER (pints)
  ('KINGFISHER PREMIUM PINT',            'beer', 220.00),
  ('KINGFISHER STRONG PINT',             'beer', 260.00),
  ('KINGFISHER ULTRA PINT',              'beer', 320.00),
  ('KINGFISHER ULTRA MAX PINT',          'beer', 360.00),
  ('BIRA 91 BLONDE PINT',                'beer', 350.00),
  ('BIRA 91 WHITE PINT',                 'beer', 360.00),
  ('BIRA 91 BOOM PINT',                  'beer', 350.00),
  ('BUDWEISER PINT',                     'beer', 350.00),
  ('BUDWEISER MAGNUM PINT',              'beer', 380.00),
  ('CARLSBERG ELEPHANT PINT',            'beer', 350.00),
  ('TUBORG STRONG PINT',                 'beer', 300.00),
  ('HEINEKEN PINT',                      'beer', 350.00),
  ('HOEGAARDEN PINT',                    'beer', 600.00),
  ('CORONA PINT',                        'beer', 650.00),

  -- BREEZERS
  ('BACARDI BREEZER LIME',               'breezers', 300.00),
  ('BACARDI BREEZER ORANGE',             'breezers', 300.00),
  ('BACARDI BREEZER CRANBERRY',          'breezers', 300.00),
  ('BACARDI BREEZER PEACH',              'breezers', 300.00),

  -- WINE (glass & bottle)
  ('SULA CHENIN BLANC GLASS',            'wine', 450.00),
  ('SULA SAUVIGNON BLANC GLASS',         'wine', 500.00),
  ('SULA SHIRAZ GLASS',                  'wine', 450.00),
  ('SULA DINDORI RESERVE SHIRAZ GLASS',  'wine', 700.00),
  ('SULA CHENIN BLANC BOTTLE',           'wine', 1900.00),
  ('SULA SAUVIGNON BLANC BOTTLE',        'wine', 2100.00),
  ('SULA SHIRAZ BOTTLE',                 'wine', 1900.00),
  ('SULA DINDORI RESERVE SHIRAZ BOTTLE', 'wine', 2800.00),
  ('FRATELLI SANGIOVESE GLASS',          'wine', 550.00),
  ('FRATELLI SANGIOVESE BOTTLE',         'wine', 2200.00),
  ('GROVER ZAMPA ART COLLECTION GLASS',  'wine', 450.00),
  ('GROVER ZAMPA ART COLLECTION BOTTLE', 'wine', 2000.00),
  ('YORK ARROS GLASS',                   'wine', 700.00),
  ('YORK ARROS BOTTLE',                  'wine', 2800.00),

  -- COCKTAILS
  ('MOJITO',                             'cocktails', 450.00),
  ('CLASSIC MARGARITA',                  'cocktails', 550.00),
  ('COSMOPOLITAN',                       'cocktails', 550.00),
  ('WHISKEY SOUR',                       'cocktails', 500.00),
  ('OLD FASHIONED',                      'cocktails', 550.00),
  ('NEGRONI',                            'cocktails', 600.00),
  ('DAIQUIRI',                           'cocktails', 500.00),
  ('MAI TAI',                            'cocktails', 600.00),
  ('MANHATTAN',                          'cocktails', 650.00),
  ('MINT JULEP',                         'cocktails', 550.00),
  ('LONG ISLAND ICED TEA',               'cocktails', 700.00),
  ('PINA COLADA',                        'cocktails', 500.00),
  ('SEX ON THE BEACH',                   'cocktails', 550.00),

  -- MOCKTAILS
  ('VIRGIN MOJITO',                      'mocktails', 250.00),
  ('SHIRLEY TEMPLE',                     'mocktails', 250.00),
  ('FRUIT PUNCH',                        'mocktails', 280.00),
  ('BLUE LAGOON',                        'mocktails', 280.00),
  ('MANGO BLOSSOM',                      'mocktails', 300.00),
  ('LEMON ICED TEA',                     'mocktails', 220.00),

  -- SHOTS
  ('TEQUILA SHOT',                       'shots', 600.00),
  ('JAGER SHOT',                         'shots', 700.00),
  ('KAMIKAZE SHOT',                      'shots', 350.00),
  ('B-52 SHOT',                          'shots', 450.00),
  ('BRAIN FREEZE SHOT',                  'shots', 350.00)
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