package com.klh.commerce.inventory.controller;

import com.klh.commerce.inventory.model.InventoryRecord;
import com.klh.commerce.inventory.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    @GetMapping
    public ResponseEntity<List<InventoryRecord>> getAllInventory() {
        return ResponseEntity.ok(inventoryRepository.findAll());
    }

    @GetMapping("/{productId}")
    public ResponseEntity<List<InventoryRecord>> getInventoryByProduct(@PathVariable String productId) {
        List<InventoryRecord> records = inventoryRepository.findByProductId(productId);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getServiceStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "SpringBoot Inventory Microservice");
        status.put("framework", "Spring Boot 3.2.0");
        status.put("database", "PostgreSQL (klhdb)");
        status.put("status", "UP");
        status.put("records_count", inventoryRepository.count());
        return ResponseEntity.ok(status);
    }
}
