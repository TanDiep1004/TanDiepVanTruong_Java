package com.example.backend.controller;

import com.example.backend.config.VNPayConfig;
import com.example.backend.dto.ApiResponse;
import com.example.backend.entity.Order;
import com.example.backend.repository.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/public/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final OrderRepository orderRepository;

    @GetMapping("/create-vnpay")
    public ResponseEntity<ApiResponse<Map<String, String>>> createVNPayPayment(
            @RequestParam("orderId") Integer orderId,
            @RequestParam("amount") Long amount,
            HttpServletRequest request
    ) {
        try {
            long vnpAmount = amount * 100; // VNPay quy định số tiền nhân 100
            String vnp_TxnRef = String.valueOf(orderId);
            String vnp_IpAddr = VNPayConfig.getIpAddress(request);

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", VNPayConfig.vnp_Version);
            vnp_Params.put("vnp_Command", VNPayConfig.vnp_Command);
            vnp_Params.put("vnp_TmnCode", VNPayConfig.vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(vnpAmount));
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang NTD Eyewear #" + orderId);
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", VNPayConfig.vnp_ReturnUrl);
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            // Sắp xếp các tham số theo thứ tự a-z
            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                    // Xây dựng chuỗi băm (hash data)
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                    // Xây dựng chuỗi query url
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }

            String queryUrl = query.toString();
            String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
            String paymentUrl = VNPayConfig.vnp_PayUrl + "?" + queryUrl;

            Map<String, String> responseData = new HashMap<>();
            responseData.put("paymentUrl", paymentUrl);
            responseData.put("orderId", String.valueOf(orderId));

            return ResponseEntity.ok(ApiResponse.success(responseData, "Tạo đường link thanh toán VNPAY thành công!"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error(500, "Lỗi khi tạo giao dịch VNPAY: " + e.getMessage()));
        }
    }

    @GetMapping("/vnpay-callback")
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleVNPayCallback(
            @RequestParam Map<String, String> allParams
    ) {
        try {
            String vnp_SecureHash = allParams.get("vnp_SecureHash");
            allParams.remove("vnp_SecureHashType");
            allParams.remove("vnp_SecureHash");

            // Kiểm tra chữ ký hợp lệ
            List<String> fieldNames = new ArrayList<>(allParams.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = allParams.get(fieldName);
                if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                }
            }

            String signValue = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
            boolean isValidSignature = signValue.equalsIgnoreCase(vnp_SecureHash);

            String responseCode = allParams.get("vnp_ResponseCode");
            String txnRef = allParams.get("vnp_TxnRef");
            boolean isSuccess = "00".equals(responseCode) && isValidSignature;

            Map<String, Object> result = new HashMap<>();
            result.put("orderId", txnRef);
            result.put("responseCode", responseCode);
            result.put("isSuccess", isSuccess);
            result.put("amount", allParams.get("vnp_Amount"));
            result.put("bankCode", allParams.get("vnp_BankCode"));
            result.put("transactionNo", allParams.get("vnp_TransactionNo"));

            if (isSuccess && txnRef != null) {
                try {
                    Integer orderId = Integer.parseInt(txnRef);
                    Optional<Order> orderOpt = orderRepository.findById(orderId);
                    if (orderOpt.isPresent()) {
                        Order order = orderOpt.get();
                        order.setStatus("Confirmed"); // Đã thanh toán và xác nhận
                        order.setPaymentMethod("VNPAY");
                        orderRepository.save(order);
                        result.put("orderStatus", "Confirmed");
                    }
                } catch (Exception ex) {
                    // Bỏ qua nếu là order id tạm thời ở local
                }
            }

            if (isSuccess) {
                return ResponseEntity.ok(ApiResponse.success(result, "Giao dịch VNPAY thành công!"));
            } else {
                return ResponseEntity.ok(ApiResponse.error(400, "Giao dịch VNPAY không thành công hoặc bị hủy!"));
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error(500, "Lỗi xử lý phản hồi VNPAY: " + e.getMessage()));
        }
    }
}
