package com.example.backend.controller;

import com.example.backend.security.CustomUserDetails;
import com.example.backend.dto.ApiResponse;
import com.example.backend.entity.Promotion;
import com.example.backend.entity.PromotionProduct;
import com.example.backend.entity.PromotionProductId;
import com.example.backend.entity.User;
import com.example.backend.repository.PromotionProductRepository;
import com.example.backend.repository.PromotionRepository;
import com.example.backend.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/promotions")
@RequiredArgsConstructor
public class AdminPromotionController {

    private final PromotionRepository promotionRepository;
    private final PromotionProductRepository promotionProductRepository;
    private final com.example.backend.repository.ProductRepository productRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            return userRepository.findById(userDetails.getUser().getId()).orElse(null);
        }
        return null;
    }

    @Data
    public static class PromotionDto {
        private Integer id;
        private String name;
        private String code;
        private String discountType;
        private BigDecimal discountValue;
        private String applyTo; // "all" hoặc "specific"
        private Integer status;
        private List<Integer> productIds;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Promotion>>> getAllPromotions() {
        List<Promotion> promotions = promotionRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(promotions, "Lấy danh sách Khuyến mãi thành công!"));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<Promotion>> createPromotion(@RequestBody PromotionDto dto) {
        Promotion promotion = Promotion.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .discountType(dto.getDiscountType())
                .discountValue(dto.getDiscountValue())
                .applyTo(dto.getApplyTo() != null ? dto.getApplyTo() : "all")
                .status(dto.getStatus() != null ? dto.getStatus() : 1)
                .startDatetime(LocalDateTime.now().minusDays(1))
                .endDatetime(LocalDateTime.now().plusYears(1))
                .build();

        User user = getAuthenticatedUser();
        if (user != null) {
            promotion.setCreatedBy(user);
            promotion.setUpdatedBy(user);
        }

        Promotion saved = promotionRepository.save(promotion);

        if ("specific".equalsIgnoreCase(saved.getApplyTo()) && dto.getProductIds() != null) {
            for (Integer productId : dto.getProductIds()) {
                PromotionProduct pp = new PromotionProduct();
                pp.setId(new PromotionProductId(productId, saved.getId()));
                pp.setPromotion(saved);
                pp.setProduct(productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found")));
                promotionProductRepository.save(pp);
            }
        }

        return ResponseEntity.ok(ApiResponse.success(saved, "Thêm Khuyến mãi mới thành công!"));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<Promotion>> updatePromotion(@PathVariable Integer id, @RequestBody PromotionDto dto) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Khuyến mãi ID: " + id));

        promotion.setName(dto.getName());
        promotion.setCode(dto.getCode());
        promotion.setDiscountType(dto.getDiscountType());
        promotion.setDiscountValue(dto.getDiscountValue());
        if (dto.getApplyTo() != null) {
            promotion.setApplyTo(dto.getApplyTo());
        }
        if (dto.getStatus() != null) {
            promotion.setStatus(dto.getStatus());
        }

        User user = getAuthenticatedUser();
        if (user != null) {
            promotion.setUpdatedBy(user);
        }

        Promotion updated = promotionRepository.save(promotion);

        // Xóa danh sách cũ và cập nhật danh sách sản phẩm mới được chọn
        List<PromotionProduct> oldList = promotionProductRepository.findByPromotionId(id);
        promotionProductRepository.deleteAll(oldList);

        if ("specific".equalsIgnoreCase(updated.getApplyTo()) && dto.getProductIds() != null) {
            for (Integer productId : dto.getProductIds()) {
                PromotionProduct pp = new PromotionProduct();
                pp.setId(new PromotionProductId(productId, updated.getId()));
                pp.setPromotion(updated);
                pp.setProduct(productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found")));
                promotionProductRepository.save(pp);
            }
        }

        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật Khuyến mãi thành công!"));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<String>> deletePromotion(@PathVariable Integer id) {
        if (!promotionRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Không tìm thấy Khuyến mãi để xóa!"));
        }

        try {
            List<PromotionProduct> pps = promotionProductRepository.findByPromotionId(id);
            promotionProductRepository.deleteAll(pps);

            promotionRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success("Xóa", "Xóa Khuyến mãi thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Không thể xóa khuyến mãi: " + e.getMessage()));
        }
    }
}
