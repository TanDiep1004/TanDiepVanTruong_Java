package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.AttributeDto;
import com.example.backend.entity.Attribute;
import com.example.backend.entity.AttributeValue;
import com.example.backend.repository.AttributeRepository;
import com.example.backend.repository.AttributeValueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attributes")
@RequiredArgsConstructor
public class AttributeController {

    private final AttributeRepository attributeRepository;
    private final AttributeValueRepository attributeValueRepository;

    private String determineGroup(Integer id) {
        if (id == null) return "SPECS";
        if (id >= 8 && id <= 11) return "DIMENSIONS";
        if (id >= 12 && id <= 16) return "FEATURES";
        return "SPECS";
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttributeDto>>> getAllAttributes() {
        List<Attribute> attributes = attributeRepository.findAll();
        List<AttributeDto> dtos = new ArrayList<>();

        for (Attribute attr : attributes) {
            List<AttributeValue> vals = attributeValueRepository.findByAttributeId(attr.getId());
            List<AttributeDto.AttributeValueDto> valDtos = vals.stream()
                    .map(v -> AttributeDto.AttributeValueDto.builder()
                            .id(v.getId())
                            .value(v.getValue())
                            .price(v.getPrice() != null ? v.getPrice() : BigDecimal.ZERO)
                            .build())
                    .collect(Collectors.toList());

            dtos.add(AttributeDto.builder()
                    .id(attr.getId())
                    .name(attr.getName())
                    .group(determineGroup(attr.getId()))
                    .values(valDtos)
                    .build());
        }

        return ResponseEntity.ok(ApiResponse.success(dtos, "Lấy danh sách thuộc tính mắt kính thành công!"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AttributeDto>> getAttributeById(@PathVariable Integer id) {
        Attribute attr = attributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thuộc tính với ID: " + id));

        List<AttributeValue> vals = attributeValueRepository.findByAttributeId(attr.getId());
        List<AttributeDto.AttributeValueDto> valDtos = vals.stream()
                .map(v -> AttributeDto.AttributeValueDto.builder()
                        .id(v.getId())
                        .value(v.getValue())
                        .price(v.getPrice() != null ? v.getPrice() : BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());

        AttributeDto dto = AttributeDto.builder()
                .id(attr.getId())
                .name(attr.getName())
                .group(determineGroup(attr.getId()))
                .values(valDtos)
                .build();

        return ResponseEntity.ok(ApiResponse.success(dto, "Lấy chi tiết thuộc tính thành công!"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Attribute>> createAttribute(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Tên thuộc tính không được để trống!");
        }

        Attribute attr = Attribute.builder()
                .name(name.trim())
                .build();
        Attribute saved = attributeRepository.save(attr);
        return ResponseEntity.ok(ApiResponse.success(saved, "Thêm thuộc tính thành công!"));
    }

    @PostMapping("/{id}/values")
    public ResponseEntity<ApiResponse<AttributeValue>> addAttributeValue(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {

        Attribute attr = attributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thuộc tính với ID: " + id));

        String value = (String) body.get("value");
        if (value == null || value.trim().isEmpty()) {
            throw new RuntimeException("Giá trị thuộc tính không được để trống!");
        }

        BigDecimal price = BigDecimal.ZERO;
        if (body.get("price") != null) {
            price = new BigDecimal(body.get("price").toString());
        }

        AttributeValue val = AttributeValue.builder()
                .attribute(attr)
                .value(value.trim())
                .price(price)
                .build();
        AttributeValue saved = attributeValueRepository.save(val);

        return ResponseEntity.ok(ApiResponse.success(saved, "Thêm giá trị thuộc tính thành công!"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAttribute(@PathVariable Integer id) {
        List<AttributeValue> vals = attributeValueRepository.findByAttributeId(id);
        attributeValueRepository.deleteAll(vals);
        attributeRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa thuộc tính thành công!"));
    }

    @DeleteMapping("/values/{valId}")
    public ResponseEntity<ApiResponse<Void>> deleteAttributeValue(@PathVariable Integer valId) {
        attributeValueRepository.deleteById(valId);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa giá trị thuộc tính thành công!"));
    }
}
