package com.klh.commerce.inventory.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.OffsetDateTime;

@Entity
@Table(name = "inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryRecord {
    @Id
    @Column(name = "inventory_id", length = 64)
    private String inventoryId;

    @Column(name = "product_id", nullable = false, length = 64)
    private String productId;

    @Column(name = "warehouse_id", nullable = false, length = 64)
    private String warehouseId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "reserved_qty", nullable = false)
    private Integer reservedQty;

    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
