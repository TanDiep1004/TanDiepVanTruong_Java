package com.example.backend.controller;

import com.example.backend.security.CustomUserDetails;
import com.example.backend.security.JwtTokenProvider;
import com.example.backend.security.CustomUserDetailsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.backend.dto.ApiResponse;
import com.example.backend.entity.Category;
import com.example.backend.entity.Product;
import com.example.backend.entity.ProductImage;
import com.example.backend.entity.ProductVariant;
import com.example.backend.entity.User;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductImageRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.ProductVariantRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.util.StringUtils;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Autowired
    private CustomUserDetailsService userDetailsService;
    
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
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
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(categories, "Lấy danh sách Danh mục thành công!"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Category>> createCategory(
            @RequestBody Category category) {
        if (category.getSlug() == null || category.getSlug().isEmpty()) {
            category.setSlug(category.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        }
        if (category.getStatus() == null) {
            category.setStatus(1);
        }

        User user = getAuthenticatedUser();
        if (user != null) {
            category.setCreatedBy(user);
            category.setUpdatedBy(user);
        }

        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success(saved, "Thêm Danh mục mới thành công!"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(
            @PathVariable Integer id, 
            @RequestBody Category req) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Danh mục ID: " + id));

        category.setName(req.getName());
        if (req.getSlug() != null && !req.getSlug().isEmpty()) {
            category.setSlug(req.getSlug());
        }
        category.setDescription(req.getDescription());
        if (req.getSortOrder() != null) {
            category.setSortOrder(req.getSortOrder());
        }
        if (req.getStatus() != null) {
            category.setStatus(req.getStatus());
        }

        User user = getAuthenticatedUser();
        if (user != null) {
            category.setUpdatedBy(user);
        }

        Category updated = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật Danh mục thành công!"));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable Integer id) {
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Không tìm thấy Danh mục để xóa!"));
        }

        try {
            Integer orderCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM order_details od JOIN product_variants pv ON od.variant_id = pv.id JOIN products p ON pv.product_id = p.id WHERE p.category_id = ?",
                Integer.class, id
            );
            
            if (orderCount != null && orderCount > 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error(400, "Không thể xóa Danh mục này vì có Sản phẩm bên trong đã phát sinh Đơn hàng. Vui lòng chuyển trạng thái sang 'Ẩn' để bảo toàn dữ liệu."));
            }

            List<Product> products = productRepository.findByCategoryId(id);
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

            categoryRepository.deleteById(id);
            categoryRepository.flush();
            return ResponseEntity.ok(ApiResponse.success("Xóa", "Xóa Danh mục thành công!"));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Không thể xóa Danh mục này vì có Sản phẩm bên trong đã phát sinh Đơn hàng. Vui lòng chuyển trạng thái sang 'Ẩn' để bảo toàn dữ liệu."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Không thể xóa danh mục: " + e.getMessage()));
        }
    }
}

