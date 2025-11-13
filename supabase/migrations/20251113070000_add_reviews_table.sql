-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  photo_urls TEXT[],
  is_approved BOOLEAN DEFAULT false,
  admin_reply TEXT,
  admin_reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_menu_item ON reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- View to aggregate ratings for menu items
CREATE OR REPLACE VIEW menu_items_with_ratings AS
SELECT
  mi.*,
  COALESCE(AVG(r.rating), 0) AS avg_rating,
  COUNT(r.id) AS review_count,
  COUNT(CASE WHEN r.rating >= 4 THEN 1 END) AS positive_reviews
FROM menu_items mi
LEFT JOIN reviews r ON mi.id = r.menu_item_id AND r.is_approved = true
GROUP BY mi.id;

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved reviews
CREATE POLICY IF NOT EXISTS "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

-- Policy: Anyone can insert reviews (for customers)
CREATE POLICY IF NOT EXISTS "Anyone can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can update reviews (for approval and replies)
CREATE POLICY IF NOT EXISTS "Admins can update reviews"
  ON reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Admins can delete reviews
CREATE POLICY IF NOT EXISTS "Admins can delete reviews"
  ON reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );