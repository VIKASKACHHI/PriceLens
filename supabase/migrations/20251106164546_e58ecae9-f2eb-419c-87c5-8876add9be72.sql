-- Temporarily allow NULL owner_id for sample data
ALTER TABLE shops ALTER COLUMN owner_id DROP NOT NULL;

-- Insert sample shops with NULL owner_id (can be claimed by shopkeepers later)
INSERT INTO shops (id, name, address, contact, category, owner_id, latitude, longitude, rating) VALUES
('10000000-0000-0000-0000-000000000001', 'Rajesh Mobile', 'Shop 12, Main Road, Supela, Bhilai, Chhattisgarh 490023', '+91 98765 43210', 'Mobile Phones', NULL, 21.2090, 81.3797, 4.5),
('10000000-0000-0000-0000-000000000002', 'Amit Electronics', 'Near Bus Stand, Supela, Bhilai, Chhattisgarh 490023', '+91 98765 43211', 'Electronics & Accessories', NULL, 21.2095, 81.3802, 4.2),
('10000000-0000-0000-0000-000000000003', 'Priya Accessories Hub', 'Shop 5, Market Complex, Supela, Bhilai, Chhattisgarh 490023', '+91 98765 43212', 'Mobile Accessories', NULL, 21.2085, 81.3790, 4.7),
('10000000-0000-0000-0000-000000000004', 'Sanjay Mobile World', 'Opposite Temple, Supela Road, Bhilai, Chhattisgarh 490023', '+91 98765 43213', 'Mobile Phones & Repair', NULL, 21.2100, 81.3808, 4.3),
('10000000-0000-0000-0000-000000000005', 'Neha Phone Point', 'Shop 8, Gandhi Chowk, Supela, Bhilai, Chhattisgarh 490023', '+91 98765 43214', 'Mobile Phones', NULL, 21.2092, 81.3795, 4.6);

-- Insert sample products
INSERT INTO products (name, description, price, category, shop_id, image_url) VALUES
-- Rajesh Mobile products
('Samsung Galaxy S24', 'Latest flagship with AI features, 8GB RAM, 256GB storage', 74999, 'Smartphones', '10000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'),
('iPhone 15', '128GB, Blue color, sealed pack with warranty', 79900, 'Smartphones', '10000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1592286927505-b17d26c49eeb?w=400'),
('OnePlus 12R', '8GB+128GB, Cool Blue, Snapdragon 8 Gen 2', 39999, 'Smartphones', '10000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'),
('Redmi Note 13 Pro', '8GB+256GB, 200MP camera, AMOLED display', 23999, 'Smartphones', '10000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400'),

-- Amit Electronics products
('Samsung Galaxy S24', 'Brand new, 8GB+256GB, 1 year warranty', 76999, 'Smartphones', '10000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'),
('Realme 12 Pro+', '8GB+256GB, Periscope camera, Fast charging', 29999, 'Smartphones', '10000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'),
('Wireless Earbuds', 'Premium TWS earbuds, 30hrs battery, ANC', 1999, 'Accessories', '10000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400'),
('Power Bank 20000mAh', 'Fast charging support, dual USB ports', 1299, 'Accessories', '10000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1609592806855-c7bb3fe3e33a?w=400'),

-- Priya Accessories Hub products
('Tempered Glass Screen Guard', 'Edge to edge protection, anti-scratch', 199, 'Accessories', '10000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400'),
('Silicon Back Cover', 'Shockproof, available in multiple colors', 149, 'Accessories', '10000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400'),
('Wireless Earbuds Pro', 'ANC, 40hrs playback, IPX5 water resistant', 2499, 'Accessories', '10000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400'),
('Fast Charger 65W', 'Type-C cable included, universal compatibility', 799, 'Accessories', '10000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400'),
('Phone Stand Holder', 'Adjustable, sturdy aluminum build', 299, 'Accessories', '10000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1609977830726-0f7b469c2def?w=400'),

-- Sanjay Mobile World products
('iPhone 15', '128GB, Black, full warranty', 78900, 'Smartphones', '10000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1592286927505-b17d26c49eeb?w=400'),
('Vivo V30 Pro', '12GB+256GB, 50MP Aura Light camera', 41999, 'Smartphones', '10000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'),
('Redmi Note 13 Pro', '8GB+256GB, Midnight Black', 24499, 'Smartphones', '10000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400'),
('Screen Replacement Service', 'Original display, 6 months warranty', 2999, 'Services', '10000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'),

-- Neha Phone Point products
('OnePlus 12R', '8GB+128GB, Iron Gray', 38999, 'Smartphones', '10000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'),
('Samsung Galaxy S24', '8GB+256GB, Phantom Black, sealed', 75499, 'Smartphones', '10000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'),
('Oppo Reno 11 Pro', '12GB+256GB, 50MP Sony camera', 39999, 'Smartphones', '10000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'),
('Power Bank 10000mAh', 'Compact design, 22.5W fast charge', 899, 'Accessories', '10000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1609592806855-c7bb3fe3e33a?w=400');

-- Update RLS policy to allow viewing shops even with NULL owner_id
DROP POLICY IF EXISTS "Shopkeepers can update their own shop" ON shops;
CREATE POLICY "Shopkeepers can update their own shop" ON shops
  FOR UPDATE USING (owner_id IS NULL OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Shopkeepers can delete their own shop" ON shops;
CREATE POLICY "Shopkeepers can delete their own shop" ON shops
  FOR DELETE USING (owner_id IS NOT NULL AND auth.uid() = owner_id);