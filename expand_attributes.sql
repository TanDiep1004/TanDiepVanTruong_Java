-- Script mở rộng toàn diện thuộc tính mắt kính (Eyewear Specifications, Dimensions & Features)

-- 1. Cập nhật & Bổ sung bảng attributes
INSERT INTO attributes (id, name, created_at) VALUES
(1, 'Màu sắc gọng (Frame Color)', NOW()),
(2, 'Chất liệu gọng (Frame Material)', NOW()),
(3, 'Tính năng tròng (Lens Features)', NOW()),
(4, 'Giới tính (Gender)', NOW()),
(5, 'Kiểu dáng gọng (Frame Shape)', NOW()),
(6, 'Chất liệu tròng (Lens Material)', NOW()),
(7, 'Màu sắc tròng (Lens Color)', NOW()),
(8, 'Chiều rộng tròng (Lens Width)', NOW()),
(9, 'Chiều rộng cầu kính (Bridge Width)', NOW()),
(10, 'Chiều dài càng kính (Temple Length)', NOW()),
(11, 'Trọng lượng kính (Weight)', NOW()),
(12, 'Chống tia UV (UV Protection)', NOW()),
(13, 'Chống ánh sáng xanh (Blue Light)', NOW()),
(14, 'Chống lóa / Phản quang (Anti-glare)', NOW()),
(15, 'Chống trầy xước (Anti-scratch)', NOW()),
(16, 'Tròng đổi màu khi ra nắng (Photochromic)', NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 2. Thêm các giá trị chi tiết vào bảng attribute_values
-- Thuộc tính 1: Màu sắc gọng
INSERT IGNORE INTO attribute_values (attribute_id, value, price, created_at) VALUES
(1, 'Đen Nhám (Matte Black)', 0.00, NOW()),
(1, 'Vàng Kim (Gold)', 200000.00, NOW()),
(1, 'Bạc Sang Trọng (Silver)', 150000.00, NOW()),
(1, 'Đồi Mồi (Tortoise Havana)', 250000.00, NOW()),
(1, 'Xám Trong Suốt (Crystal Grey)', 100000.00, NOW()),
(1, 'Xanh Đen (Navy Blue)', 100000.00, NOW());

-- Thuộc tính 2: Chất liệu gọng
INSERT IGNORE INTO attribute_values (attribute_id, value, price, created_at) VALUES
(2, 'Titanium Siêu Nhẹ (Chống gỉ sét)', 500000.00, NOW()),
(2, 'Nhựa Acetate Cao Cấp', 200000.00, NOW()),
(2, 'Nhựa dẻo TR90 Siêu bền', 150000.00, NOW()),
(2, 'Kim loại mạ Crom / Niken', 100000.00, NOW()),
(2, 'Hợp kim Nhôm - Magie Thể Thao', 350000.00, NOW());

-- Thuộc tính 4: Giới tính (Gender)
INSERT IGNORE INTO attribute_values (attribute_id, value, price, created_at) VALUES
(4, 'Nam (Men)', 0.00, NOW()),
(4, 'Nữ (Women)', 0.00, NOW()),
(4, 'Unisex (Cả Nam & Nữ)', 0.00, NOW());

-- Thuộc tính 5: Kiểu dáng gọng (Frame Shape)
INSERT IGNORE INTO attribute_values (attribute_id, value, price, created_at) VALUES
(5, 'Vuông (Square)', 0.00, NOW()),
(5, 'Tròn (Round)', 0.00, NOW()),
(5, 'Chữ nhật (Rectangle)', 0.00, NOW()),
(5, 'Phi công (Aviator)', 0.00, NOW()),
(5, 'Mắt mèo (Cat-eye)', 0.00, NOW()),
(5, 'Bầu dục (Oval)', 0.00, NOW()),
(5, 'Đa giác (Geometric)', 0.00, NOW());

-- Thuộc tính 6: Chất liệu tròng (Lens Material)
INSERT IGNORE INTO attribute_values (attribute_id, value, price, created_at) VALUES
(6, 'Nhựa Polycarbonate Chống Vỡ', 250000.00, NOW()),
(6, 'Thủy tinh khoáng (Mineral Glass)', 350000.00, NOW()),
(6, 'Tròng High-Index 1.67 Siêu Mỏng', 600000.00, NOW()),
(6, 'Tròng High-Index 1.74 Tối Ưu Độ Cận', 950000.00, NOW()),
(6, 'Nhựa CR-39 Tiêu Chuẩn', 0.00, NOW());

-- Thuộc tính 7: Màu sắc tròng (Lens Color)
INSERT IGNORE INTO attribute_values (attribute_id, value, price, created_at) VALUES
(7, 'Trong suốt (Kính cận / không độ)', 0.00, NOW()),
(7, 'Xám khói (Grey)', 150000.00, NOW()),
(7, 'Trà Nâu (Brown)', 150000.00, NOW()),
(7, 'Xanh Rêu Classic G-15', 200000.00, NOW()),
(7, 'Tráng Gương Bạc (Silver Flash)', 250000.00, NOW()),
(7, 'Xanh Dương Gradient', 200000.00, NOW());

-- Thuộc tính 8: Chiều rộng tròng (Lens Width)
INSERT IGNORE INTO attribute_values (attribute_id, value, price, created_at) VALUES
(8, '48 mm (Cỡ nhỏ)', 0.00, NOW()),
(8, '50 mm (Tiêu chuẩn)', 0.00, NOW()),
(8, '52 mm (Cỡ vừa)', 0.00, NOW()),
(8, '54 mm (Cỡ lớn)', 0.00, NOW()),
(8, '58 mm (Phi công Aviator)', 0.00, NOW());

-- Thuộc tính 9: Chiều rộng cầu kính (Bridge Width)
INSERT IGNORE INTO attribute_values (attribute_id, value, price, created_at) VALUES
(9, '16 mm (Mũi nhỏ)', 0.00, NOW()),
(9, '18 mm (Tiêu chuẩn)', 0.00, NOW()),
(9, '20 mm (Cầu rộng)', 0.00, NOW()),
(9, '22 mm', 0.00, NOW());

-- Thuộc tính 10: Chiều dài càng kính (Temple Length)
INSERT IGNORE INTO attribute_values (attribute_id, value, price, created_at) VALUES
(10, '135 mm (Ngắn)', 0.00, NOW()),
(10, '140 mm (Tiêu chuẩn Á Đông)', 0.00, NOW()),
(10, '145 mm (Dài)', 0.00, NOW()),
(10, '150 mm', 0.00, NOW());

-- Thuộc tính 11: Trọng lượng kính (Weight)
INSERT IGNORE INTO attribute_values (attribute_id, value, price, created_at) VALUES
(11, '15 g (Siêu nhẹ không hằn sống mũi)', 0.00, NOW()),
(11, '18 g (Tiêu chuẩn êm ái)', 0.00, NOW()),
(11, '22 g (Đầm chắc tay)', 0.00, NOW()),
(11, '28 g (Thể thao chịu lực)', 0.00, NOW());

-- Thuộc tính 12: Chống tia UV (UV Protection)
INSERT IGNORE INTO attribute_values (attribute_id, value, price, created_at) VALUES
(12, 'Chuẩn UV400 (Chống 100% UVA & UVB)', 150000.00, NOW()),
(12, 'UV380 Tiêu chuẩn', 0.00, NOW());

-- Thuộc tính 13: Chống ánh sáng xanh (Blue Light)
INSERT IGNORE INTO attribute_values (attribute_id, value, price, created_at) VALUES
(13, 'Có - Công nghệ Lọc Ánh Sáng Xanh BlueControl', 300000.00, NOW()),
(13, 'Không có', 0.00, NOW());

-- Thuộc tính 14: Chống lóa / Phản quang (Anti-glare)
INSERT IGNORE INTO attribute_values (attribute_id, value, price, created_at) VALUES
(14, 'Có - Phủ váng AR Giảm Chói Ban Đêm', 200000.00, NOW()),
(14, 'Không có', 0.00, NOW());

-- Thuộc tính 15: Chống trầy xước (Anti-scratch)
INSERT IGNORE INTO attribute_values (attribute_id, value, price, created_at) VALUES
(15, 'Có - Phủ lớp Nano Hard-Coat Chống Trầy', 150000.00, NOW()),
(15, 'Không có', 0.00, NOW());

-- Thuộc tính 16: Tròng đổi màu khi ra nắng (Photochromic)
INSERT IGNORE INTO attribute_values (attribute_id, value, price, created_at) VALUES
(16, 'Có - Đổi màu Transitions Gen 8 theo tia UV', 650000.00, NOW()),
(16, 'Không có', 0.00, NOW());
