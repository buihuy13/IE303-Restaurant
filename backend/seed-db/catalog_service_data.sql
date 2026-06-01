-- Static reference data for catalog_service
-- This file is seeded during PostgreSQL initialization

-- Seed categories
INSERT INTO categories (cate_name) VALUES
('Gà'),
('Trà sữa'),
('Pizza'),
('Cơm tấm'),
('Bún bò'),
('Bánh mì'),
('Phở'),
('Bánh xèo'),
('Bánh cuốn'),
('Bánh bao'),
('Cháo'),
('Bún chả'),
('Bún đậu mắm tôm'),
('Bánh tráng trộn'),
('Bánh tráng nướng'),
('Bánh tráng cuốn'),
('Bánh tráng chiên'),
('Bánh tráng hấp'),
('Bánh tráng xào'),
('Bánh tráng nướng muối ớt')
ON CONFLICT (cate_name) DO NOTHING;

-- Seed sizes (note: table name is "sizes" not "size")
INSERT INTO sizes (name) VALUES
('S'),
('M'),
('L'),
('XL')
ON CONFLICT (name) DO NOTHING;
