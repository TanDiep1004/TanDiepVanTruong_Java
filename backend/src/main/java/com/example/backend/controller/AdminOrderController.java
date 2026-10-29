package com.example.backend.controller;

import com.example.backend.security.CustomUserDetails;
import com.example.backend.dto.ApiResponse;
import com.example.backend.entity.Order;
import com.example.backend.entity.User;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            return userRepository.findById(userDetails.getUser().getId()).orElse(null);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Order>>> getAllOrdersAdmin() {
        List<Order> orders = orderRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(orders, "Lấy danh sách đơn hàng quản trị thành công!"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @PathVariable Integer id,
            @RequestParam String status) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + id));

        order.setStatus(status);

        User user = getAuthenticatedUser();
        if (user != null) {
            order.setUpdatedBy(user);
        }

        Order updatedOrder = orderRepository.save(order);

        return ResponseEntity.ok(ApiResponse.success(updatedOrder, "Cập nhật trạng thái đơn hàng #" + id + " thành '" + status + "' thành công!"));
    }
}
