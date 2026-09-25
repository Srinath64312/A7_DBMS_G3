"""
Database Seeding Script (Version 2.0)
Populates Relational Core, NoSQL Documents, and Distributed Inventory.
"""
import os
import sys
import json
import logging
import uuid
import random
from datetime import datetime, timedelta

# Ensure project root in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db import postgres_db, mongo_db, cache_manager
from backend.services import auth_service, intelligence_service

logger = logging.getLogger("DBSeeder")
logging.basicConfig(level=logging.INFO)

def seed_database():
    logger.info("🌱 Starting database initialization and seeding...")
    postgres_db.init_db()
    cache_manager.invalidate_cache()

    random.seed(42)

    # 1. Seed Users
    users_data = [
        ("usr_admin_01", "Admin Srinath", "admin@commerce.kluniversity.in", "Admin@123", "ADMIN"),
        ("usr_mgr_01", "Manager Poli Naidu", "manager@commerce.kluniversity.in", "Manager@123", "WAREHOUSE_MANAGER"),
        ("usr_cust_01", "Abhinay Sai", "abhinay@klh.edu.in", "Customer@123", "CUSTOMER"),
        ("usr_cust_02", "Chandu K", "chandu@klh.edu.in", "Customer@123", "CUSTOMER")
    ]
    for uid, name, email, pw, role in users_data:
        pw_hash = auth_service.hash_password(pw)
        postgres_db.execute(
            "INSERT INTO users (user_id, name, email, password_hash, role) VALUES (%s, %s, %s, %s, %s)",
            (uid, name, email, pw_hash, role)
        )
    logger.info("✅ Seeded 4 Users.")

    # 2. Seed User Addresses
    addresses_data = [
        ("addr_01", "usr_cust_01", "Block-C, KL University", "Hyderabad", "Telangana", "500075", "India", True),
        ("addr_02", "usr_cust_01", "Home-House, Jubilee Hills", "Hyderabad", "Telangana", "500033", "India", False),
        ("addr_03", "usr_cust_02", "Hostel-4, KL University", "Hyderabad", "Telangana", "500075", "India", True),
    ]
    for aid, uid, line, city, state, zip_c, country, is_def in addresses_data:
        postgres_db.execute(
            "INSERT INTO user_addresses (address_id, user_id, address_line1, city, state, zip, country, is_default) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (aid, uid, line, city, state, zip_c, country, is_def)
        )
    logger.info("✅ Seeded User Addresses.")

    # 3. Seed Warehouses
    warehouses_data = [
        ("wh_hyd_01", "Hyderabad Central Distribution Hub", "WH_HYD_01", "Aziz Nagar, Hyderabad, Telangana", 25000),
        ("wh_blr_01", "Bangalore Tech Logistics Hub", "WH_BLR_01", "Whitefield, Bangalore, Karnataka", 30000),
        ("wh_mum_01", "Mumbai Western Regional Hub", "WH_MUM_01", "Bhiwandi, Mumbai, Maharashtra", 40000),
        ("wh_del_01", "Delhi Logistics Center", "WH_DEL_01", "Gurugram, Delhi NCR", 20000)
    ]
    for wid, name, code, loc, cap in warehouses_data:
        postgres_db.execute(
            "INSERT INTO warehouses (warehouse_id, name, code, location, capacity) VALUES (%s, %s, %s, %s, %s)",
            (wid, name, code, loc, cap)
        )
    logger.info("✅ Seeded 4 Regional Warehouses.")

    # 4. Seed Categories
    categories_data = [
        ("cat_comp_01", "Computing and Servers", "High performance compute resources and servers"),
        ("cat_elec_02", "Hardware Accelerators and Components", "GPUs, TPUs, CPUs and core components"),
        ("cat_audio_03", "Audio Equipment", "Professional studio monitors, wireless headsets, and microphones"),
        ("cat_net_04", "Networking and IoT", "Distributed gateways, smart edge sensors, and mesh routers"),
        ("cat_storage_05", "Storage and Memory", "High speed NVMe SSDs, NAS HDDs, and RAM"),
        ("cat_display_06", "Displays and Monitors", "High refresh rate gaming monitors and color accurate displays"),
        ("cat_periph_07", "Peripherals and Input Devices", "Keyboards, mice, and controller accessories"),
        ("cat_power_08", "Power and Cooling Systems", "UPS, Power supplies, and thermal cooling solutions")
    ]
    for cid, name, desc in categories_data:
        postgres_db.execute(
            "INSERT INTO categories (category_id, name, description) VALUES (%s, %s, %s)",
            (cid, name, desc)
        )
    logger.info("✅ Seeded 8 Categories.")

    # 5. Seed Products (Hybrid)
    raw_products = {
        "cat_comp_01": [
            ("Dell PowerEdge R760 Rack Server", 4500.00, ["server", "enterprise", "compute"]),
            ("HPE ProLiant DL380 Gen11", 4200.00, ["server", "enterprise", "rack"]),
            ("Lenovo ThinkSystem SR650 V3", 4100.00, ["server", "compute", "datacenter"]),
            ("Supermicro SuperServer 1029P-WTR", 3800.00, ["server", "compute", "enterprise"]),
            ("Mac Studio M4 Ultra", 3999.00, ["apple", "desktop", "workstation", "creator"]),
            ("Mac Pro Tower (M2 Ultra)", 6999.00, ["apple", "desktop", "workstation"]),
            ("ThinkPad X1 Carbon Gen 12", 1599.00, ["laptop", "business", "portable"]),
            ("Dell XPS 15 9530", 1899.00, ["laptop", "creator", "premium"]),
            ("HP ZBook Studio 16 G10", 2100.00, ["laptop", "workstation", "business"]),
            ("Asus ROG Zephyrus G14", 1499.00, ["laptop", "gaming", "portable"]),
            ("Intel NUC 13 Extreme", 1199.00, ["desktop", "mini-pc", "barebone"]),
            ("Raspberry Pi 5 8GB", 80.00, ["sbc", "maker", "development"]),
            ("Framework Laptop 16", 1699.00, ["laptop", "modular", "repairable"])
        ],
        "cat_elec_02": [
            ("NVIDIA H100 Tensor Core GPU", 30000.00, ["gpu", "ai", "accelerator", "enterprise"]),
            ("NVIDIA RTX 4090 Founders Edition", 1599.00, ["gpu", "gaming", "creator"]),
            ("AMD Instinct MI300X", 25000.00, ["gpu", "ai", "accelerator"]),
            ("AMD Ryzen 9 7950X3D", 699.00, ["cpu", "processor", "gaming"]),
            ("Intel Core i9-14900K", 589.00, ["cpu", "processor", "desktop"]),
            ("Google Coral Edge TPU", 60.00, ["ai", "accelerator", "edge", "iot"]),
            ("Intel Movidius Neural Compute Stick 2", 80.00, ["ai", "usb", "vision"]),
            ("ASUS ROG Crosshair X670E Hero", 699.00, ["motherboard", "am5", "gaming"]),
            ("MSI MEG Z790 Godlike", 1199.00, ["motherboard", "lga1700", "premium"]),
            ("Gigabyte AORUS Gen5 10000 SSD", 349.00, ["storage", "ssd", "nvme", "pcie5"]),
            ("Corsair Dominator Titanium 64GB DDR5", 319.00, ["memory", "ram", "ddr5"]),
            ("G.Skill Trident Z5 RGB 96GB", 400.00, ["memory", "ram", "ddr5"]),
            ("EVGA SuperNOVA 1600 T2", 450.00, ["power", "psu", "titanium"])
        ],
        "cat_audio_03": [
            ("Sony WH-1000XM5 Wireless Headphones", 398.00, ["audio", "headphones", "music", "wireless", "listening", "sound", "anc"]),
            ("Bose QuietComfort Ultra", 429.00, ["audio", "headphones", "music", "wireless", "anc", "sound"]),
            ("Sennheiser HD 800 S", 1799.00, ["audio", "headphones", "audiophile", "music", "sound"]),
            ("Shure SM7B Vocal Microphone", 399.00, ["audio", "microphone", "podcast", "recording", "voice"]),
            ("Audio-Technica AT2020USB+", 149.00, ["audio", "microphone", "usb", "streaming"]),
            ("Focusrite Scarlett 2i2 4th Gen", 199.00, ["audio", "interface", "recording", "music"]),
            ("Universal Audio Apollo Twin X", 999.00, ["audio", "interface", "thunderbolt", "studio"]),
            ("Yamaha HS8 Studio Monitor", 399.00, ["audio", "speaker", "monitor", "studio", "music", "sound"]),
            ("KRK Rokit 5 G4", 189.00, ["audio", "speaker", "monitor", "studio", "music"]),
            ("JBL Charge 5 Portable Speaker", 149.00, ["speaker", "audio", "music", "portable", "bluetooth", "sound"]),
            ("Sonos Roam", 179.00, ["speaker", "audio", "music", "portable", "wireless", "smart"]),
            ("Ultimate Ears MEGABOOM 3", 199.00, ["speaker", "audio", "music", "portable", "waterproof", "sound"]),
            ("Apple AirPods Max", 549.00, ["audio", "headphones", "music", "wireless", "apple", "anc"]),
            ("Rode Wireless GO II", 299.00, ["audio", "microphone", "wireless", "creator"])
        ],
        "cat_net_04": [
            ("Cisco Catalyst 9300 Series Switch", 2500.00, ["networking", "switch", "enterprise"]),
            ("Ubiquiti UniFi Dream Machine Pro", 379.00, ["networking", "router", "gateway"]),
            ("Netgear Orbi Wi-Fi 6E Mesh System", 1499.00, ["networking", "wifi", "mesh", "wireless"]),
            ("ASUS ROG Rapture GT-AXE16000", 599.00, ["networking", "router", "wifi6e", "gaming"]),
            ("TP-Link Omada ER7206", 149.00, ["networking", "router", "vpn"]),
            ("MikroTik RouterBOARD 5009", 219.00, ["networking", "router", "homelab"]),
            ("Aruba Instant On AP22", 179.00, ["networking", "access-point", "wifi6"]),
            ("Raspberry Pi Pico W", 6.00, ["iot", "microcontroller", "wireless"]),
            ("Arduino Portenta H7", 104.00, ["iot", "microcontroller", "industrial"]),
            ("Espressif ESP32-S3-DevKitC-1", 15.00, ["iot", "dev-board", "wifi", "bluetooth"]),
            ("Philips Hue Smart Hub", 59.00, ["iot", "smarthome", "hub", "lighting"]),
            ("Aeotec Z-Pi 7 Z-Wave Plus", 40.00, ["iot", "z-wave", "smarthome"]),
            ("Shelly Pro 4PM", 110.00, ["iot", "relay", "smarthome", "din"]),
            ("Sonoff Zigbee 3.0 USB Dongle Plus", 25.00, ["iot", "zigbee", "dongle", "smarthome"])
        ],
        "cat_storage_05": [
            ("Samsung 990 Pro 2TB NVMe SSD", 169.00, ["storage", "ssd", "nvme", "pcie4"]),
            ("WD Black SN850X 1TB", 89.00, ["storage", "ssd", "nvme", "gaming"]),
            ("Crucial T700 2TB Gen5 NVMe", 299.00, ["storage", "ssd", "nvme", "pcie5"]),
            ("Seagate IronWolf Pro 20TB HDD", 399.00, ["storage", "hdd", "nas", "enterprise"]),
            ("WD Red Pro 22TB NAS HDD", 449.00, ["storage", "hdd", "nas"]),
            ("Synology DiskStation DS923+", 599.00, ["storage", "nas", "server", "enclosure"]),
            ("QNAP TS-464-8G NAS", 549.00, ["storage", "nas", "server"]),
            ("SanDisk Extreme Pro Portable SSD 4TB", 349.00, ["storage", "ssd", "portable", "usb-c"]),
            ("Samsung T9 Portable SSD 2TB", 239.00, ["storage", "ssd", "portable", "external"]),
            ("Kingston Fury Renegade 4TB", 359.00, ["storage", "ssd", "nvme", "ps5"]),
            ("Sabrent Rocket 4 Plus 8TB", 999.00, ["storage", "ssd", "nvme", "high-capacity"]),
            ("Lexar Professional 2000x 128GB SDXC", 169.00, ["storage", "sd-card", "photography"]),
            ("Corsair Vengeance 32GB DDR5 6000MHz", 115.00, ["memory", "ram", "ddr5", "desktop"]),
            ("TeamGroup T-Force Delta RGB 64GB", 209.00, ["memory", "ram", "ddr5", "rgb"])
        ],
        "cat_display_06": [
            ("LG UltraGear 27GP850-B 27\" QHD", 399.00, ["monitor", "display", "gaming", "1440p"]),
            ("Dell UltraSharp U2723QE 4K", 549.00, ["monitor", "display", "productivity", "4k"]),
            ("Samsung Odyssey OLED G9 49\"", 1599.00, ["monitor", "display", "ultrawide", "oled"]),
            ("ASUS ROG Swift OLED PG27AQDM", 899.00, ["monitor", "display", "oled", "gaming"]),
            ("Alienware AW3423DWF QD-OLED", 999.00, ["monitor", "display", "ultrawide", "oled"]),
            ("BenQ PD3220U DesignVue", 1099.00, ["monitor", "display", "creator", "4k"]),
            ("Apple Studio Display", 1599.00, ["monitor", "display", "apple", "5k"]),
            ("Pro Display XDR", 4999.00, ["monitor", "display", "apple", "6k", "pro"]),
            ("Gigabyte M32U 4K", 649.00, ["monitor", "display", "4k", "gaming"]),
            ("MSI MPG 321URX QD-OLED", 949.00, ["monitor", "display", "oled", "4k"]),
            ("Acer Predator X27U", 899.00, ["monitor", "display", "oled", "1440p"]),
            ("LG C3 42-inch OLED evo", 999.00, ["tv", "display", "oled", "gaming"]),
            ("Sony INZONE M9", 899.00, ["monitor", "display", "4k", "gaming"]),
            ("ViewSonic ColorPro VP2786-4K", 999.00, ["monitor", "display", "creator", "color-accurate"])
        ],
        "cat_periph_07": [
            ("Logitech MX Master 3S", 99.00, ["mouse", "peripheral", "productivity", "wireless"]),
            ("Logitech G Pro X Superlight 2", 159.00, ["mouse", "peripheral", "gaming", "lightweight"]),
            ("Razer DeathAdder V3 Pro", 149.00, ["mouse", "peripheral", "gaming", "wireless"]),
            ("Keychron Q1 Pro Mechanical Keyboard", 199.00, ["keyboard", "peripheral", "mechanical", "wireless"]),
            ("Wooting 60HE", 175.00, ["keyboard", "peripheral", "analog", "gaming"]),
            ("Corsair K100 RGB", 229.00, ["keyboard", "peripheral", "mechanical", "optical"]),
            ("NuPhy Halo75", 139.00, ["keyboard", "peripheral", "mechanical", "wireless"]),
            ("Elgato Stream Deck MK.2", 149.00, ["peripheral", "controller", "streaming", "macro"]),
            ("Wacom Cintiq Pro 27", 3499.00, ["peripheral", "tablet", "drawing", "display"]),
            ("Logitech Brio 4K Webcam", 169.00, ["peripheral", "webcam", "camera", "4k"]),
            ("Razer Kiyo Pro Ultra", 299.00, ["peripheral", "webcam", "camera", "streaming"]),
            ("YubiKey 5C NFC", 55.00, ["peripheral", "security", "token", "2fa"]),
            ("Xbox Elite Wireless Controller Series 2", 179.00, ["peripheral", "controller", "gaming"]),
            ("Sony DualSense Edge", 199.00, ["peripheral", "controller", "gaming", "ps5"])
        ],
        "cat_power_08": [
            ("APC Smart-UPS SRT 3000VA", 1899.00, ["power", "ups", "enterprise", "rack"]),
            ("CyberPower CP1500PFCLCD", 219.00, ["power", "ups", "backup", "sinewave"]),
            ("Eaton 5SC 1500VA", 450.00, ["power", "ups", "tower"]),
            ("Corsair RM1000x 1000W", 189.00, ["power", "psu", "gold", "modular"]),
            ("Seasonic PRIME TX-1600", 599.00, ["power", "psu", "titanium", "atx3"]),
            ("be quiet! Dark Power Pro 13 1600W", 459.00, ["power", "psu", "titanium", "quiet"]),
            ("NZXT Kraken Elite 360 RGB", 299.00, ["cooling", "aio", "liquid", "cpu"]),
            ("Corsair iCUE H150i ELITE LCD XT", 289.00, ["cooling", "aio", "liquid", "cpu"]),
            ("Arctic Liquid Freezer II 360", 139.00, ["cooling", "aio", "liquid", "performance"]),
            ("Cooler Master MasterLiquid PL360 Flux", 179.00, ["cooling", "aio", "liquid"]),
            ("Lian Li UNI FAN SL-INFINITY 120", 30.00, ["cooling", "fan", "rgb", "daisy-chain"]),
            ("Phanteks T30-120", 30.00, ["cooling", "fan", "performance", "thick"]),
            ("Noctua NF-A12x25 PWM", 32.00, ["cooling", "fan", "quiet", "premium"]),
            ("APC SurgeArrest Performance 11-Outlet", 35.00, ["power", "surge-protector", "strip"])
        ]
    }

    products_catalog = [
        {
            "product_id": "prod_lap_01",
            "category_id": "cat_comp_01",
            "name": "UltraBook Pro 16 AI Workstation",
            "sku": "UB-AI-16-PRO",
            "price": 1499.99,
            "description": "Next-gen laptop powered by 16-Core Neural Engine, 32GB LPDDR5X, 1TB NVMe Gen 4 SSD, and 4K Mini-LED display.",
            "brand": "NexTech",
            "attributes": {"processor": "16-Core Neural CPU", "memory_gb": 32, "storage": "1TB NVMe M.2", "display": "16-inch 4K Mini-LED (120Hz)"},
            "tags": ["laptop", "ai", "workstation", "portable", "compute"],
            "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"
        },
        {
            "product_id": "prod_edge_02",
            "category_id": "cat_elec_02",
            "name": "Neural Edge AI Accelerator PCIe",
            "sku": "EDGE-AI-128TOPS",
            "price": 649.50,
            "description": "Dedicated vector computing and edge inference accelerator with 128 TOPS INT8 performance.",
            "brand": "TensorFlow Core",
            "attributes": {"interface": "PCIe 5.0 x8", "compute_tops": 128},
            "tags": ["ai", "accelerator", "pcie", "hardware", "edge"],
            "image_url": "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500"
        },
        {
            "product_id": "prod_audio_03",
            "category_id": "cat_audio_03",
            "name": "Quantum ANC Spatial Audio Headset",
            "sku": "AUDIO-ANC-Q7",
            "price": 279.00,
            "description": "High-fidelity wireless studio headset with active noise cancellation and low-latency Bluetooth 5.4.",
            "brand": "AcousticLab",
            "attributes": {"battery_hours": 45, "anc_db_reduction": 42},
            "tags": ["audio", "headphones", "anc", "spatial", "wireless", "music", "sound", "listening"],
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
        }
    ]

    for cid, items in raw_products.items():
        cat_suffix = cid.split('_')[1]
        for i, (name, price, tags) in enumerate(items):
            pid = f"prod_{cat_suffix}_{i+10:02d}"
            brand = name.split()[0]
            products_catalog.append({
                "product_id": pid,
                "category_id": cid,
                "name": name,
                "sku": f"SKU-{pid.upper()}",
                "price": price,
                "description": f"Premium {name} with industry leading features and reliability.",
                "brand": brand,
                "attributes": {"brand": brand, "category": cid},
                "tags": tags,
                "image_url": ""
            })

    for p in products_catalog:
        emb = intelligence_service.generate_embedding(f"{p['name']} {p['description']}")
        postgres_db.execute(
            "INSERT INTO products (product_id, category_id, name, sku, price, is_active, embedding) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (p["product_id"], p["category_id"], p["name"], p["sku"], p["price"], True if postgres_db.is_postgres() else 1, json.dumps(emb))
        )
        # Assign a random rating between 3.5 and 5.0 for seeding
        random_rating = round(random.uniform(3.5, 5.0), 1)
        mongo_db.upsert_product({**p, "rating": random_rating})
    logger.info(f"✅ Seeded {len(products_catalog)} Products.")

    # 6. Seed Inventory
    inventory_allocations = []
    warehouses = ["wh_hyd_01", "wh_blr_01", "wh_mum_01", "wh_del_01"]
    inv_counter = 1
    for p in products_catalog:
        for w in warehouses:
            if p["product_id"] == "prod_lap_01" and w == "wh_hyd_01":
                qty = 35
            elif p["product_id"] == "prod_lap_01" and w == "wh_blr_01":
                qty = 50
            elif p["product_id"] == "prod_audio_03" and w == "wh_hyd_01":
                qty = 80
            elif p["product_id"] == "prod_edge_02" and w == "wh_del_01":
                qty = 40
            else:
                qty = random.randint(15, 100)
            inv_id = f"inv_{inv_counter:04d}"
            inventory_allocations.append((inv_id, p["product_id"], w, qty, 0))
            inv_counter += 1

    for inv_id, pid, wid, qty, rsv in inventory_allocations:
        postgres_db.execute(
            "INSERT INTO inventory (inventory_id, product_id, warehouse_id, quantity, reserved_qty, low_stock_threshold) VALUES (%s, %s, %s, %s, %s, 10)",
            (inv_id, pid, wid, qty, rsv)
        )
    logger.info(f"✅ Seeded {len(inventory_allocations)} Inventory Records.")

    # 7. Seed Coupons
    coupons_data = [
        ("coup_welcome", "WELCOME10", "PERCENT", 10.0, 100.0, datetime.now() + timedelta(days=365), 1000, 0),
        ("coup_student", "STUDENT20", "PERCENT", 20.0, 50.0, datetime.now() + timedelta(days=180), 500, 0),
        ("coup_flat50", "FLAT50", "FIXED", 50.0, 500.0, datetime.now() + timedelta(days=30), 100, 0),
    ]
    for cid, code, dtype, val, min_amt, exp, lim, used in coupons_data:
        postgres_db.execute(
            "INSERT INTO coupons (coupon_id, code, discount_type, discount_value, min_order_amount, expiry_date, usage_limit, times_used) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (cid, code, dtype, val, min_amt, exp, lim, used)
        )
    logger.info("✅ Seeded 3 Coupons.")

    # 8. Seed Reviews (MongoDB)
    reviews_data = []
    users = ["usr_cust_01", "usr_cust_02"]
    review_comments = [
        "Absolute beast of a machine!",
        "Fast, but gets a bit warm under load.",
        "Best I have ever used.",
        "Incredible performance for the price.",
        "Build quality is top notch.",
        "Exceeded all my expectations.",
        "A bit pricey, but worth every penny.",
        "Highly recommended for professionals.",
        "Looks great and works perfectly.",
        "Setup was a breeze.",
        "The best purchase I made this year.",
        "Very reliable and fast.",
        "Solid product, no complaints."
    ]
    
    # Generate 30 reviews for random products
    rev_counter = 1
    sampled_products = random.sample(products_catalog, 20)
    for p in sampled_products:
        num_reviews = random.randint(1, 3)
        for _ in range(num_reviews):
            rating = random.randint(4, 5)
            user_id = random.choice(users)
            comment = random.choice(review_comments)
            reviews_data.append({
                "review_id": f"rev_{rev_counter:03d}",
                "product_id": p["product_id"],
                "user_id": user_id,
                "rating": rating,
                "comment": comment,
                "created_at": datetime.now().isoformat()
            })
            rev_counter += 1

    for r in reviews_data:
        mongo_db.upsert_review(r)
    logger.info(f"✅ Seeded {len(reviews_data)} Product Reviews.")

    # 9. Seed Academic Benchmark Tables (dept & emp for Course 25CS1302E)
    try:
        postgres_db.execute("""
        CREATE TABLE IF NOT EXISTS dept (
            deptno INT PRIMARY KEY,
            dname VARCHAR(50) NOT NULL,
            loc VARCHAR(50)
        );
        """)
        postgres_db.execute("""
        CREATE TABLE IF NOT EXISTS emp (
            empno INT PRIMARY KEY,
            ename VARCHAR(50) NOT NULL,
            job VARCHAR(50) NOT NULL,
            mgr INT,
            hiredate DATE NOT NULL,
            sal NUMERIC(10, 2) NOT NULL,
            comm NUMERIC(10, 2) DEFAULT 0,
            deptno INT REFERENCES dept(deptno)
        );
        """)
        
        dept_rows = [
            (10, 'ACCOUNTING', 'NEW YORK'),
            (20, 'RESEARCH', 'DALLAS'),
            (30, 'SALES', 'CHICAGO'),
            (40, 'OPERATIONS', 'BOSTON')
        ]
        for dno, dnm, dlc in dept_rows:
            postgres_db.execute(
                "INSERT INTO dept (deptno, dname, loc) VALUES (%s, %s, %s) ON CONFLICT (deptno) DO NOTHING;",
                (dno, dnm, dlc)
            )

        emp_rows = [
            (7369, 'SMITH',  'CLERK',     7902, '2019-12-17', 3200.00, None,    20),
            (7499, 'ALLEN',  'SALESMAN',  7698, '2020-02-20', 3600.00, 300.00,  30),
            (7521, 'WARD',   'SALESMAN',  7698, '2020-02-22', 2500.00, 500.00,  30),
            (7566, 'JONES',  'MANAGER',   7839, '2018-04-02', 5975.00, None,    20),
            (7654, 'MARTIN', 'SALESMAN',  7698, '2021-09-28', 2500.00, 1400.00, 30),
            (7698, 'BLAKE',  'MANAGER',   7839, '2019-05-01', 4850.00, None,    30),
            (7782, 'CLARK',  'MANAGER',   7839, '2019-06-09', 4450.00, None,    10),
            (7788, 'SCOTT',  'ANALYST',   7566, '2020-04-19', 4000.00, None,    20),
            (7839, 'KING',   'PRESIDENT', None, '2017-11-17', 8000.00, None,    10),
            (7844, 'TURNER', 'SALESMAN',  7698, '2020-09-08', 3500.00, 0.00,    30),
            (7876, 'ADAMS',  'CLERK',     7788, '2021-05-23', 3100.00, None,    20),
            (7900, 'JAMES',  'CLERK',     7698, '2020-12-03', 2950.00, None,    30),
            (7902, 'FORD',   'ANALYST',   7566, '2019-12-03', 4000.00, None,    40),
            (7934, 'MILLER', 'CLERK',     7782, '2022-01-23', 3300.00, None,    10)
        ]
        for eno, enm, ejb, mgr, hdt, sal, comm, dno in emp_rows:
            postgres_db.execute(
                "INSERT INTO emp (empno, ename, job, mgr, hiredate, sal, comm, deptno) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT (empno) DO NOTHING;",
                (eno, enm, ejb, mgr, hdt, sal, comm, dno)
            )
        logger.info("✅ Seeded Academic Benchmark Tables (dept & emp).")
    except Exception as e:
        logger.warning(f"Academic benchmark tables seed notice: {e}")

    logger.info("🎉 Database Seeding Completed Successfully!")

if __name__ == "__main__":
    seed_database()
