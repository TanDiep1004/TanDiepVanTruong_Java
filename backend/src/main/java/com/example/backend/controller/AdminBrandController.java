package com.example.backend.controller;

import com.example.backend.security.CustomUserDetails;
import com.example.backend.dto.ApiResponse;
import com.example.backend.entity.Brand;
import com.example.backend.entity.Product;
import com.example.backend.entity.ProductImage;
import com.example.backend.entity.ProductVariant;
import com.example.backend.entity.User;
import com.example.backend.repository.BrandRepository;
import com.example.backend.repository.ProductImageRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.ProductVariantRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/brands")
@RequiredArgsConstructor
public class AdminBrandController {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            return userRepository.findById(userDetails.getUser().getId()).orElse(null);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Brand>>> getAllBrands() {
        List<Brand> brands = brandRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(brands, "Lấy danh sách Thương hiệu thành công!"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Brand>> createBrand(@RequestBody Brand brand) {
        if (brand.getSlug() == null || brand.getSlug().isEmpty()) {
            brand.setSlug(brand.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        }
        if (brand.getStatus() == null) {
            brand.setStatus(1);
        }

        User user = getAuthenticatedUser();
        if (user != null) {
            brand.setCreatedBy(user);
            brand.setUpdatedBy(user);
        }

        Brand saved = brandRepository.save(brand);
        return ResponseEntity.ok(ApiResponse.success(saved, "Thêm Thương hiệu mới thành công!"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Brand>> updateBrand(@PathVariable Integer id, @RequestBody Brand req) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Thương hiệu ID: " + id));

        brand.setName(req.getName());
        if (req.getSlug() != null && !req.getSlug().isEmpty()) {
            brand.setSlug(req.getSlug());
        }
        brand.setLogo(req.getLogo());
        brand.setDescription(req.getDescription());
        if (req.getSortOrder() != null) {
            brand.setSortOrder(req.getSortOrder());
        }
        if (req.getStatus() != null) {
            brand.setStatus(req.getStatus());
        }

        User user = getAuthenticatedUser();
        if (user != null) {
            brand.setUpdatedBy(user);
        }

        Brand updated = brandRepository.save(brand);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật Thương hiệu thành công!"));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<String>> deleteBrand(@PathVariable Integer id) {
        if (!brandRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Không tìm thấy Thương hiệu để xóa!"));
        }

        try {
            // Kiểm tra trước xem thương hiệu này có chứa sản phẩm nào đã phát sinh đơn hàng không
            Integer orderCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM order_details od JOIN product_variants pv ON od.variant_id = pv.id JOIN products p ON pv.product_id = p.id WHERE p.brand_id = ?",
                Integer.class, id
            );
            
            if (orderCount != null && orderCount > 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error(400, "Không thể xóa Thương hiệu này vì có Sản phẩm bên trong đã phát sinh Đơn hàng. Vui lòng chuyển trạng thái sang 'Ẩn' để bảo toàn dữ liệu."));
            }

            // Tự động giải phóng các sản phẩm liên quan đến thương hiệu này trước khi xóa
            List<Product> products = productRepository.findByBrandId(id);
            for (Product p : products) {
                List<ProductVariant> variants = productVariantRepository.findByProductId(p.getId());
                productVariantRepository.deleteAll(variants);
                productVariantRepository.flush();

                List<ProductImage> images = productImageRepository.findByProductId(p.getId());
                productImageRepository.deleteAll(images);
                productImageRepository.flush();

                productRepository.delete(p);
                productRepository.flush();
            }

            brandRepository.deleteById(id);
            brandRepository.flush();
            return ResponseEntity.ok(ApiResponse.success("Xóa", "Xóa Thương hiệu thành công!"));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Không thể xóa Thương hiệu này vì có Sản phẩm bên trong đã phát sinh Đơn hàng. Vui lòng chuyển trạng thái sang 'Ẩn' để bảo toàn dữ liệu."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Không thể xóa thương hiệu: " + e.getMessage()));
        }
    }
}
