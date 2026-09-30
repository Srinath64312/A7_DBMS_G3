package com.klh.commerce.inventory.repository;

import com.klh.commerce.inventory.model.InventoryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryRecord, String> {
    List<InventoryRecord> findByProductId(String productId);
    List<InventoryRecord> findByWarehouseId(String warehouseId);
    Optional<InventoryRecord> findByProductIdAndWarehouseId(String productId, String warehouseId);
}
