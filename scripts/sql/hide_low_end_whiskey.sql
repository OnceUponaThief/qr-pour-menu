-- Hide low-end whiskey brands to maintain premium bar image
-- Non-destructive: sets available = false (does not delete rows)
-- Matches case-insensitively and covers size variants like 30 ML / 60 ML / 90 ML

BEGIN;

-- Mark selected low-end whiskey brands as unavailable
WITH low_end AS (
  SELECT brand FROM (
    VALUES
      ('OFFICER''S CHOICE'),
      ('DIRECTOR''S SPECIAL'),
      ('BAGPIPER'),
      ('IMPERIAL BLUE'),
      ('ROYAL STAG'),
      ('MCDOWELL''S NO.1'),
      ('8PM')
  ) v(brand)
)
UPDATE public.menu_items m
SET available = false
WHERE EXISTS (
  SELECT 1
  FROM low_end l
  WHERE upper(m.name) LIKE upper(l.brand) || '%'
);

-- Ensure mid-tier and premium whiskey remain available
WITH keepers AS (
  SELECT brand FROM (
    VALUES
      ('BLENDERS PRIDE'),
      ('SIGNATURE'),
      ('ANTIQUITY BLUE'),
      ('ROYAL CHALLENGE'),
      ('BLACK & WHITE'),
      ('VAT 69'),
      ('100 PIPERS'),
      ('TEACHERS'),
      ('BLACK DOG'),
      ('JACK DANIELS'),
      ('JAMESON'),
      ('JIM BEAM'),
      ('JOHNNIE WALKER RED LABEL'),
      ('JOHNNIE WALKER BLACK LABEL'),
      ('CHIVAS REGAL'),
      ('GLENFIDDICH'),
      ('GLENLIVET'),
      ('PAUL JOHN'),
      ('AMRUT')
  ) v(brand)
)
UPDATE public.menu_items m
SET available = true
WHERE EXISTS (
  SELECT 1 FROM keepers k WHERE upper(m.name) LIKE upper(k.brand) || '%'
);

COMMIT;