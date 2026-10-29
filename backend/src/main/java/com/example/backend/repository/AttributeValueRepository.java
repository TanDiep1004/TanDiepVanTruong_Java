package com.example.backend.repository;

import com.example.backend.entity.AttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttributeValueRepository extends JpaRepository<AttributeValue, Integer> {
    List<AttributeValue> findByAttributeId(Integer attributeId);
}
