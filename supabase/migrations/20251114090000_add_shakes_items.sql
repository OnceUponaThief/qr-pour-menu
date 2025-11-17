-- Insert Shakes items into menu_items if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.menu_items WHERE LOWER(name) = 'chocolate shake') THEN
    INSERT INTO public.menu_items (name, category, price, available)
    VALUES ('Chocolate Shake', 'shakes', 250, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.menu_items WHERE LOWER(name) = 'strawberry shake') THEN
    INSERT INTO public.menu_items (name, category, price, available)
    VALUES ('Strawberry Shake', 'shakes', 250, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.menu_items WHERE LOWER(name) = 'vanilla shake') THEN
    INSERT INTO public.menu_items (name, category, price, available)
    VALUES ('Vanilla Shake', 'shakes', 200, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.menu_items WHERE LOWER(name) = 'oreo shake') THEN
    INSERT INTO public.menu_items (name, category, price, available)
    VALUES ('Oreo Shake', 'shakes', 270, true);
  END IF;
END $$;