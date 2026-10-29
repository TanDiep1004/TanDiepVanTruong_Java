package com.example.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeDto {
    private Integer id;
    private String name;
    private String group; // "SPECS", "DIMENSIONS", "FEATURES"
    private List<AttributeValueDto> values;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AttributeValueDto {
        private Integer id;
        private String value;
        private BigDecimal price;
    }
}
