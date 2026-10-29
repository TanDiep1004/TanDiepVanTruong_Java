SET NAMES utf8mb4;
USE matkinh_db;

-- 1. Cập nhật và bổ sung 3 biến thể màu sắc, độ cận, giá tiền cho tất cả Sản phẩm hiện có:

-- Product 1: Kính Râm Ray-Ban Aviator Classic RB3025 G-15
UPDATE product_variants SET color='Vàng Mạ Kim Tròng Xanh G-15', degree='0.00 (Không độ)', price=1500000.00, stock_quantity=45 WHERE id=1;
UPDATE product_variants SET color='Đen Mờ Tròng Đen Khói', degree='0.00 (Không độ)', price=1650000.00, stock_quantity=30 WHERE id=2;
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (1800000.00, 1, 20, 1, 'Bạc Bạch Kim Tròng Tráng Gương', '0.00 (Không độ)');

-- Product 2: Gọng Kính Cận Gucci Square Acetate Frame Gold
UPDATE product_variants SET color='Đen Acetate Logo Vàng Gold', degree='0.00 (Không độ)', price=4800000.00, stock_quantity=25 WHERE id=3;
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (5100000.00, 1, 20, 2, 'Đồi Mồi Acetate Hổ Phách', '1.50 độ');
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (5400000.00, 1, 15, 2, 'Trong Suốt Viền Vàng', '2.50 độ');

-- Product 3: Kính Râm Gentle Monster Her 01 Oversized Black
UPDATE product_variants SET color='Đen Bóng Tròng Zeiss Đen Khói', degree='0.00 (Không độ)', price=6200000.00, stock_quantity=14 WHERE id=4;
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (6500000.00, 1, 18, 3, 'Trong Suốt Tròng Nâu Trà', '0.00 (Không độ)');
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (6800000.00, 1, 12, 3, 'Đồi Mồi Tròng Tím Tráng Gương', '0.00 (Không độ)');

-- Product 102: Gọng Kính Cận Ray-Ban Wayfarer Classic RB2140 Black
UPDATE product_variants SET color='Đen Nhám Classic', degree='0.00 (Không độ)', price=2950000.00, stock_quantity=40 WHERE id=28;
UPDATE product_variants SET color='Đen Bóng Acetate', degree='1.50 độ', price=3150000.00, stock_quantity=23 WHERE id=29;
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (3350000.00, 1, 18, 102, 'Đồi Mồi Nâu Trầm', '2.50 độ');

-- Product 103: Gọng Kính Cận Ray-Ban Clubmaster Round Optics RX5154
UPDATE product_variants SET color='Đồi Mồi Viền Vàng Gold', degree='0.00 (Không độ)', price=3450000.00, stock_quantity=19 WHERE id=30;
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (3650000.00, 1, 25, 103, 'Đen Bóng Viền Bạc Silver', '1.25 độ');
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (3850000.00, 1, 15, 103, 'Xám Khói Viền Titan', '2.25 độ');

-- Product 105: Kính Râm Gucci Cat-Eye Sunglasses GG0061S
UPDATE product_variants SET color='Đen Nhám Mắt Mèo Quý Phái', degree='0.00 (Không độ)', price=5500000.00, stock_quantity=12 WHERE id=32;
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (5800000.00, 1, 15, 105, 'Đồi Mồi Tròng Nâu Gradient', '0.00 (Không độ)');
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (6100000.00, 1, 10, 105, 'Trắng Sữa Viền Vàng Logo GG', '0.00 (Không độ)');

-- Product 106: Gọng Kính Cận Gucci Oval Metal Optics Titanium
UPDATE product_variants SET color='Vàng Bạch Kim Titanium', degree='0.00 (Không độ)', price=5200000.00, stock_quantity=18 WHERE id=33;
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (5500000.00, 1, 20, 106, 'Bạc Sáng Kim Titanium', '1.75 độ');
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (5800000.00, 1, 14, 106, 'Hồng Kim Mạ Vàng Rose Gold', '2.75 độ');

-- Product 107: Kính Râm Gentle Monster Her 01 Oversized Black
UPDATE product_variants SET color='Đen Mờ Tối Giản', degree='0.00 (Không độ)', price=6200000.00, stock_quantity=22 WHERE id=34;
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (6500000.00, 1, 16, 107, 'Hổ Phách Tròng Nâu Trà', '0.00 (Không độ)');
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (6800000.00, 1, 12, 107, 'Trong Suốt Tròng Đổi Màu', '0.00 (Không độ)');

-- Product 108: Gọng Kính Cận Gentle Monster South Side N01 Acetate
UPDATE product_variants SET color='Đen Acetate Góc Cạnh', degree='0.00 (Không độ)', price=5800000.00, stock_quantity=34 WHERE id=35;
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (6100000.00, 1, 22, 108, 'Đồi Mồi Cổ Điển', '1.50 độ');
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (6400000.00, 1, 15, 108, 'Đen Trong Suốt Smoke', '2.50 độ');

-- Product 109: Gọng Kính Cận Gentle Monster Lilit 01 Bold Transparent
UPDATE product_variants SET color='Trong Suốt Transparent Mờ', degree='0.00 (Không độ)', price=6500000.00, stock_quantity=10 WHERE id=36;
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (6800000.00, 1, 18, 109, 'Xám Trong Suốt Bold', '1.25 độ');
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (7100000.00, 1, 12, 109, 'Vàng Nhạt Transparent', '2.25 độ');

-- Product 112: Kính Mát Thể Thao Oakley Radar EV Path Prizm Road
UPDATE product_variants SET color='Đỏ Đen Thể Thao Prizm Road', degree='0.00 (Không độ)', price=4950000.00, stock_quantity=15 WHERE id=39;
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (5250000.00, 1, 20, 112, 'Xanh Dương Neon Prizm Sapphire', '0.00 (Không độ)');
INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES (5550000.00, 1, 12, 112, 'Đen Mờ Prizm Black Iridium', '0.00 (Không độ)');


-- 2. Thêm các Sản phẩm mới bổ sung cho đầy đủ mục:

-- Product 113: Gọng Kính Cận Nữ Gucci Butterfly Acetate Pink (Category 2: Gọng Kính Nữ, Brand 2: Gucci)
INSERT INTO products (id, name, price, original_price, description, content, status, brand_id, category_id, created_at)
VALUES (113, 'Gọng Kính Cận Nữ Gucci Butterfly Acetate Pink', 4800000.00, 5900000.00, 'Thiết kế dáng cánh bướm nữ tính tôn vinh đường nét khuôn mặt, chất liệu Acetate ánh hồng quyến rũ đính logo GG mạ vàng.', 'Chất liệu gọng: High-grade Acetate, Kích thước: 54-16-140, Xuất xứ: Ý', 1, 2, 2, '2026-08-05 08:00:00.000000');

INSERT INTO product_images (image_url, is_primary, product_id)
VALUES ('https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=800', 1, 113);

INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES
(4800000.00, 1, 25, 113, 'Hồng Trong Pastel', '0.00 (Không độ)'),
(5100000.00, 1, 20, 113, 'Đồi Mồi Nữ Tính', '1.50 độ'),
(5400000.00, 1, 15, 113, 'Trong Suốt Ánh Kim', '2.50 độ');


-- Product 114: Gọng Kính Cận Nữ Oakley Socket 5.0 Titanium (Category 2: Gọng Kính Nữ, Brand 4: Oakley)
INSERT INTO products (id, name, price, original_price, description, content, status, brand_id, category_id, created_at)
VALUES (114, 'Gọng Kính Cận Nữ Oakley Socket 5.0 Titanium', 3650000.00, 4500000.00, 'Khung kính Titanium siêu nhẹ thanh mảnh cho phái đẹp văn phòng, chân kính Unobtainium chống trượt.', 'Chất liệu gọng: Titanium nguyên khối, Kích thước: 51-17-138, Xuất xứ: Mỹ', 1, 4, 2, '2026-08-05 08:10:00.000000');

INSERT INTO product_images (image_url, is_primary, product_id)
VALUES ('https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800', 1, 114);

INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES
(3650000.00, 1, 30, 114, 'Bạc Ánh Hồng', '0.00 (Không độ)'),
(3950000.00, 1, 22, 114, 'Tím Titan Sang Trọng', '2.00 độ'),
(4250000.00, 1, 18, 114, 'Đen Satin', '3.00 độ');


-- Product 115: Kính Mát Thể Thao Oakley Flak 2.0 XL Black Iridium (Category 3: Kính Râm, Brand 4: Oakley)
INSERT INTO products (id, name, price, original_price, description, content, status, brand_id, category_id, created_at)
VALUES (115, 'Kính Mát Thể Thao Oakley Flak 2.0 XL Black Iridium', 4200000.00, 5200000.00, 'Thiết kế bán khung High Definition Optics tối ưu tầm nhìn rộng, tròng kính chống va đập tiêu chuẩn quân đội.', 'Chất liệu gọng: O Matter siêu nhẹ, Kích thước: Standard, Xuất xứ: Mỹ', 1, 4, 3, '2026-08-05 08:20:00.000000');

INSERT INTO product_images (image_url, is_primary, product_id)
VALUES ('https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800', 1, 115);

INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES
(4200000.00, 1, 35, 115, 'Đen Nhám Tròng Iridium', '0.00 (Không độ)'),
(4500000.00, 1, 25, 115, 'Xanh Dương Prizm Deep Water', '0.00 (Không độ)'),
(4800000.00, 1, 20, 115, 'Trắng Đỏ Racing Prizm', '0.00 (Không độ)');


-- Product 116: Gọng Kính Cận Nam Oakley Holbrook Rx Satin Black (Category 1: Gọng Kính Nam, Brand 4: Oakley)
INSERT INTO products (id, name, price, original_price, description, content, status, brand_id, category_id, created_at)
VALUES (116, 'Gọng Kính Cận Nam Oakley Holbrook Rx Satin Black', 3800000.00, 4600000.00, 'Mẫu gọng kính vuông nam tính biểu tượng Holbrook nay đã có phiên bản gọng cận công công sở lịch lãm.', 'Chất liệu gọng: O Matter, Kích thước: 56-18-137, Xuất xứ: Mỹ', 1, 4, 1, '2026-08-05 08:30:00.000000');

INSERT INTO product_images (image_url, is_primary, product_id)
VALUES ('https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800', 1, 116);

INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES
(3800000.00, 1, 40, 116, 'Đen Mờ Satin', '0.00 (Không độ)'),
(4100000.00, 1, 28, 116, 'Xám Trong Suốt Smoke', '1.75 độ'),
(4400000.00, 1, 20, 116, 'Xanh Ô Liu Matte Olive', '2.75 độ');


-- Product 117: Kính Râm Ray-Ban Erika Classic RB4171 Polished Brown (Category 3: Kính Râm, Brand 1: Ray-Ban)
INSERT INTO products (id, name, price, original_price, description, content, status, brand_id, category_id, created_at)
VALUES (117, 'Kính Râm Ray-Ban Erika Classic RB4171 Polished Brown', 3550000.00, 4300000.00, 'Dáng kính râm tròn Bo-Tròn mềm mại thời thượng, càng kính kim loại mỏng nhẹ đeo cực êm tai.', 'Chất liệu gọng: Nylon & Kim loại, Kích thước: 54-18-145, Xuất xứ: Ý', 1, 1, 3, '2026-08-05 08:40:00.000000');

INSERT INTO product_images (image_url, is_primary, product_id)
VALUES ('https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=800', 1, 117);

INSERT INTO product_variants (price, status, stock_quantity, product_id, color, degree) VALUES
(3550000.00, 1, 30, 117, 'Nâu Đồi Mồi Tròng Nâu', '0.00 (Không độ)'),
(3750000.00, 1, 25, 117, 'Đen Nhám Tròng Xám G-15', '0.00 (Không độ)'),
(3950000.00, 1, 18, 117, 'Hồng Đất Tráng Gương', '0.00 (Không độ)');
