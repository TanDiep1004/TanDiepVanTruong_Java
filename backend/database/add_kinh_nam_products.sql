SET NAMES utf8mb4;
USE matkinh_db;

-- 1. Sản phẩm 1: Kính Mát Nam Ray-Ban Clubmaster Classic RB3016
INSERT INTO products (name, description, content, price, original_price, brand_id, category_id, status, created_by, updated_by, created_at, updated_at)
VALUES (
    'Kính Mát Nam Ray-Ban Clubmaster Classic RB3016',
    'Thiết kế nửa gọng (browline) cổ điển vượt thời gian, kết hợp giữa nhựa acetate đen bóng và viền kim loại vàng gold sang trọng.',
    '<p>Kính Mát Nam Ray-Ban Clubmaster Classic RB3016 là biểu tượng của phong cách nam tính, lịch lãm và đầy cuốn hút. Tròng kính thủy tinh xanh rau muống G-15 cao cấp giúp hấp thụ 85% ánh sáng nhìn thấy và chặn hầu hết ánh sáng xanh, mang lại độ tương phản màu sắc tự nhiên và sắc nét nhất.</p><p>Sản phẩm phù hợp với nhiều khuôn mặt nam giới, thích hợp cho cả dạo phố, lái xe và các buổi gặp mặt sang trọng.</p>',
    3450000.00,
    4200000.00,
    1,
    14,
    1,
    1,
    1,
    NOW(),
    NOW()
);
SET @prod1_id = LAST_INSERT_ID();

-- Hình ảnh cho SP 1
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(@prod1_id, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800', 1),
(@prod1_id, 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=800', 0);

-- Biến thể cho SP 1
INSERT INTO product_variants (product_id, color, degree, price, stock_quantity, status) VALUES
(@prod1_id, 'Đen Mạ Vàng Gold', '0.00 (Không độ)', 3450000.00, 25, 1),
(@prod1_id, 'Đồi Mồi Cổ Điển', '0.00 (Không độ)', 3600000.00, 18, 1);


-- 2. Sản phẩm 2: Kính Cận Nam Gentle Monster South Side B4
INSERT INTO products (name, description, content, price, original_price, brand_id, category_id, status, created_by, updated_by, created_at, updated_at)
VALUES (
    'Kính Cận Nam Gentle Monster South Side B4',
    'Gọng kính cận nam dáng vuông bản vừa thời thượng, viền dày dặn tôn lên đường nét góc cạnh nam tính cho khuôn mặt.',
    '<p>Gentle Monster South Side B4 là mẫu gọng kính cận bán chạy hàng đầu thế giới của thương hiệu Hàn Quốc. Thiết kế hai chấm kim loại tròn đặc trưng ở góc mắt kính cùng chất liệu Acetate hữu cơ siêu bền, không phai màu, đem lại cảm giác đeo đầm tay nhưng vẫn vô cùng êm ái suốt cả ngày dài làm việc.</p>',
    4800000.00,
    5500000.00,
    3,
    14,
    1,
    1,
    1,
    NOW(),
    NOW()
);
SET @prod2_id = LAST_INSERT_ID();

-- Hình ảnh cho SP 2
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(@prod2_id, 'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800', 1),
(@prod2_id, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800', 0);

-- Biến thể cho SP 2
INSERT INTO product_variants (product_id, color, degree, price, stock_quantity, status) VALUES
(@prod2_id, 'Đen Bóng Nam Tính', '0.00 (Không độ)', 4800000.00, 30, 1),
(@prod2_id, 'Đen Bóng Nam Tính', '1.50 độ', 4950000.00, 15, 1),
(@prod2_id, 'Xám Khói Trong Suốt', '0.00 (Không độ)', 5000000.00, 20, 1);


-- 3. Sản phẩm 3: Kính Thể Thao Nam Oakley Holbrook Matte Black
INSERT INTO products (name, description, content, price, original_price, brand_id, category_id, status, created_by, updated_by, created_at, updated_at)
VALUES (
    'Kính Thể Thao Nam Oakley Holbrook Matte Black',
    'Mẫu kính thể thao phong cách cổ điển pha hiện đại, gọng O-Matter siêu nhẹ chịu lực cùng tròng Prizm Black phân cực chống lóa.',
    '<p>Oakley Holbrook là kiệt tác kính râm thể thao Mỹ mang dấu ấn của những cuộc phiêu lưu. Công nghệ High Definition Optics (HDO) độc quyền của Oakley giúp tầm nhìn chuẩn xác, không biến dạng, chống va đập tiêu chuẩn quân đội, lý tưởng cho phái mạnh khi chạy bộ, lái xe mô tô, leo núi hay tham gia các hoạt động ngoài trời.</p>',
    3900000.00,
    4600000.00,
    4,
    14,
    1,
    1,
    1,
    NOW(),
    NOW()
);
SET @prod3_id = LAST_INSERT_ID();

-- Hình ảnh cho SP 3
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(@prod3_id, 'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=800', 1),
(@prod3_id, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800', 0);

-- Biến thể cho SP 3
INSERT INTO product_variants (product_id, color, degree, price, stock_quantity, status) VALUES
(@prod3_id, 'Đen Nhám Tròng Prizm Black', '0.00 (Không độ)', 3900000.00, 20, 1),
(@prod3_id, 'Xanh Navy Tròng Prizm Sapphire', '0.00 (Không độ)', 4100000.00, 12, 1);


-- 4. Sản phẩm 4: Kính Mát Nam Gucci Aviator Square GG0010S
INSERT INTO products (name, description, content, price, original_price, brand_id, category_id, status, created_by, updated_by, created_at, updated_at)
VALUES (
    'Kính Mát Nam Gucci Aviator Square GG0010S',
    'Kính phi công dáng vuông khỏe khoắn, phối sọc kẻ Web xanh đỏ trứ danh của nhà mốt Gucci Italy.',
    '<p>Kính Mát Nam Gucci Aviator Square GG0010S là sự giao thoa hoàn hảo giữa phong cách thời trang xa xỉ và khí chất nam tính mạnh mẽ. Tròng kính xám khói tráng dầu chống bám vân tay, chặn tia cực tím UVA/UVB 100%, bảo vệ đôi mắt tối ưu đồng thời khẳng định đẳng cấp quý ông thành đạt.</p>',
    6200000.00,
    7500000.00,
    2,
    14,
    1,
    1,
    1,
    NOW(),
    NOW()
);
SET @prod4_id = LAST_INSERT_ID();

-- Hình ảnh cho SP 4
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(@prod4_id, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800', 1),
(@prod4_id, 'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800', 0);

-- Biến thể cho SP 4
INSERT INTO product_variants (product_id, color, degree, price, stock_quantity, status) VALUES
(@prod4_id, 'Đen Viền Kim Loại Gold', '0.00 (Không độ)', 6200000.00, 15, 1),
(@prod4_id, 'Đồi Mồi Havana Sọc Web', '0.00 (Không độ)', 6500000.00, 10, 1);
