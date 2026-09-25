import { Category, Warehouse, Product } from '../types';

export const FALLBACK_CATEGORIES: Category[] = [
  { category_id: "cat_comp_01", name: "Computing and Servers", description: "High performance compute resources and servers" },
  { category_id: "cat_elec_02", name: "Hardware Accelerators and Components", description: "GPUs, TPUs, CPUs and core components" },
  { category_id: "cat_audio_03", name: "Audio Equipment", description: "Professional studio monitors, wireless headsets, and microphones" },
  { category_id: "cat_net_04", name: "Networking and IoT", description: "Distributed gateways, smart edge sensors, and mesh routers" },
  { category_id: "cat_storage_05", name: "Storage and Memory", description: "High speed NVMe SSDs, NAS HDDs, and RAM" },
  { category_id: "cat_display_06", name: "Displays and Monitors", description: "High refresh rate gaming monitors and color accurate displays" },
  { category_id: "cat_periph_07", name: "Peripherals and Input Devices", description: "Keyboards, mice, and controller accessories" },
  { category_id: "cat_power_08", name: "Power and Cooling Systems", description: "UPS, Power supplies, and thermal cooling solutions" },
  { category_id: "cat_daily_09", name: "Daily Essentials & Groceries", description: "Fresh roast coffee, protein snacks, hydration & pantry necessities" },
  { category_id: "cat_daily_10", name: "Campus & Office Stationery", description: "Journals, gel pens, fast GaN chargers, and desktop organizers" },
  { category_id: "cat_daily_11", name: "Personal Care & Wellness", description: "Electric toothbrushes, blue light glasses, and ergonomics" }
];

export const FALLBACK_WAREHOUSES: Warehouse[] = [
  { warehouse_id: "wh_hyd_01", name: "Hyderabad Central Distribution Hub", city: "Hyderabad", state: "Telangana", capacity: 25000, active_stock: 1420 },
  { warehouse_id: "wh_blr_01", name: "Bangalore Tech Logistics Hub", city: "Bangalore", state: "Karnataka", capacity: 30000, active_stock: 1850 },
  { warehouse_id: "wh_mum_01", name: "Mumbai Western Regional Hub", city: "Mumbai", state: "Maharashtra", capacity: 40000, active_stock: 2100 },
  { warehouse_id: "wh_del_01", name: "Delhi Logistics Center", city: "Delhi NCR", state: "Delhi", capacity: 20000, active_stock: 980 }
];

export const FALLBACK_PRODUCTS: Product[] = [
  {
    product_id: "prod_lap_01",
    category_id: "cat_comp_01",
    category_name: "Computing and Servers",
    name: "UltraBook Pro 16 AI Workstation",
    sku: "UB-AI-16-PRO",
    price: 1499.99,
    description: "Next-gen laptop powered by 16-Core Neural Engine, 32GB LPDDR5X, 1TB NVMe Gen 4 SSD, and 4K Mini-LED display.",
    image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    total_stock: 45
  },
  {
    product_id: "prod_edge_02",
    category_id: "cat_elec_02",
    category_name: "Hardware Accelerators and Components",
    name: "Neural Edge AI Accelerator PCIe Gen5",
    sku: "EDGE-AI-128TOPS",
    price: 649.50,
    description: "Dedicated vector computing and edge inference accelerator with 128 TOPS INT8 performance.",
    image_url: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80",
    total_stock: 18
  },
  {
    product_id: "prod_audio_03",
    category_id: "cat_audio_03",
    category_name: "Audio Equipment",
    name: "Quantum ANC Spatial Audio Headset",
    sku: "AUDIO-ANC-Q7",
    price: 279.00,
    description: "High-fidelity wireless studio headset with active noise cancellation and low-latency Bluetooth 5.4.",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    total_stock: 62
  },
  {
    product_id: "prod_srv_01",
    category_id: "cat_comp_01",
    category_name: "Computing and Servers",
    name: "Dell PowerEdge R760 Rack Server",
    sku: "DELL-R760-2U",
    price: 4500.00,
    description: "Dual Intel Xeon Platinum processors, 512GB ECC DDR5, redundant hot-swap power supplies.",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
    total_stock: 12
  },
  {
    product_id: "prod_srv_02",
    category_id: "cat_comp_01",
    category_name: "Computing and Servers",
    name: "HPE ProLiant DL380 Gen11",
    sku: "HPE-DL380-G11",
    price: 4200.00,
    description: "Enterprise grade 2U compute server optimized for VMware vSphere and hybrid cloud workloads.",
    image_url: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80",
    total_stock: 15
  },
  {
    product_id: "prod_gpu_01",
    category_id: "cat_elec_02",
    category_name: "Hardware Accelerators and Components",
    name: "NVIDIA RTX 4090 24GB GDDR6X",
    sku: "NV-RTX4090-24G",
    price: 1799.00,
    description: "Flagship Ada Lovelace architecture with 16384 CUDA cores and DLSS 3.5 AI frame generation.",
    image_url: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=80",
    total_stock: 24
  },
  {
    product_id: "prod_gpu_02",
    category_id: "cat_elec_02",
    category_name: "Hardware Accelerators and Components",
    name: "NVIDIA H100 80GB SXM5 Tensor Core",
    sku: "NV-H100-80G-SXM",
    price: 32000.00,
    description: "Hopper architecture accelerator for large language model pretraining and transformer workloads.",
    image_url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80",
    total_stock: 4
  },
  {
    product_id: "prod_ssd_01",
    category_id: "cat_storage_05",
    category_name: "Storage and Memory",
    name: "Samsung 990 PRO 4TB NVMe M.2 SSD",
    sku: "SAM-990PRO-4TB",
    price: 349.99,
    description: "PCIe 4.0 NVMe with read speeds up to 7450 MB/s, optimized for heavy data workloads.",
    image_url: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80",
    total_stock: 80
  },
  {
    product_id: "prod_ssd_02",
    category_id: "cat_storage_05",
    category_name: "Storage and Memory",
    name: "Crucial T700 2TB PCIe Gen5 NVMe",
    sku: "CRU-T700-2TB",
    price: 289.99,
    description: "Blazing fast Gen5 NVMe SSD reaching up to 12,400 MB/s sequential read performance.",
    image_url: "https://images.unsplash.com/photo-1541728472741-03e45a58cf88?w=600&auto=format&fit=crop&q=80",
    total_stock: 50
  },
  {
    product_id: "prod_net_01",
    category_id: "cat_net_04",
    category_name: "Networking and IoT",
    name: "Cisco Nexus 9300-FX3 400GbE Spine Switch",
    sku: "CSCO-N9300-400G",
    price: 8500.00,
    description: "High-density 400G datacenter leaf and spine switch supporting low-latency cloud fabrics.",
    image_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80",
    total_stock: 8
  },
  {
    product_id: "prod_net_02",
    category_id: "cat_net_04",
    category_name: "Networking and IoT",
    name: "Ubiquiti UniFi Dream Machine Special Edition",
    sku: "UBNT-UDM-SE",
    price: 499.00,
    description: "All-in-one 10G enterprise gateway router, PoE switch, and network security appliance.",
    image_url: "https://images.unsplash.com/photo-1551808525-51a94da548ce?w=600&auto=format&fit=crop&q=80",
    total_stock: 35
  },
  {
    product_id: "prod_mon_01",
    category_id: "cat_display_06",
    category_name: "Displays and Monitors",
    name: "Dell UltraSharp 32 6K Monitor (U3224KB)",
    sku: "DELL-U3224KB-6K",
    price: 2599.00,
    description: "6K resolution IPS Black panel with built-in 4K HDR webcam and 140W USB-C Thunderbolt 4.",
    image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
    total_stock: 20
  },
  {
    product_id: "prod_kb_01",
    category_id: "cat_periph_07",
    category_name: "Peripherals and Input Devices",
    name: "Logitech MX Master 3S Wireless Mouse",
    sku: "LOGI-MX3S-GRY",
    price: 99.99,
    description: "Ergonomic wireless performance mouse with 8K DPI Darkfield tracking and Quiet Clicks.",
    image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
    total_stock: 120
  },
  {
    product_id: "prod_pwr_01",
    category_id: "cat_power_08",
    category_name: "Power and Cooling Systems",
    name: "APC Smart-UPS On-Line 3000VA Rackmount",
    sku: "APC-SRT3000-2U",
    price: 1899.00,
    description: "Double-conversion online UPS with pure sine wave output and zero transfer time for server racks.",
    image_url: "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=600&auto=format&fit=crop&q=80",
    total_stock: 16
  },
  // Daily Essentials & Groceries
  {
    product_id: "prod_daily_01",
    category_id: "cat_daily_09",
    category_name: "Daily Essentials & Groceries",
    name: "Artisan Dark Roast Colombian Whole Bean Coffee (1kg)",
    sku: "GROC-COF-1KG",
    price: 18.99,
    description: "100% Arabica single-origin high-altitude beans with rich dark chocolate, toasted hazelnut, and caramel undertones. Freshly roasted.",
    image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80",
    tags: ["coffee", "arabica", "groceries", "daily", "beverage"],
    total_stock: 140
  },
  {
    product_id: "prod_daily_02",
    category_id: "cat_daily_09",
    category_name: "Daily Essentials & Groceries",
    name: "Organic Whey Protein & Almond Energy Bars (Pack of 12)",
    sku: "GROC-BAR-12PK",
    price: 24.50,
    description: "20g pure whey isolate protein per bar with crushed California almonds, zero added sugar, gluten-free, and prebiotic fiber.",
    image_url: "https://images.unsplash.com/photo-1622484216802-0e3194a2f8b5?w=600&auto=format&fit=crop&q=80",
    tags: ["protein", "snacks", "nutrition", "fitness", "bars"],
    total_stock: 110
  },
  {
    product_id: "prod_daily_03",
    category_id: "cat_daily_09",
    category_name: "Daily Essentials & Groceries",
    name: "Smart Insulated Temperature Display Water Bottle (750ml)",
    sku: "GROC-BTL-750",
    price: 22.99,
    description: "Double-walled vacuum insulated food-grade 304 stainless steel. Keeps drinks cold 24h or hot 12h. Touch LED temperature cap.",
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
    tags: ["bottle", "hydration", "thermal", "water", "daily"],
    total_stock: 85
  },
  {
    product_id: "prod_daily_04",
    category_id: "cat_daily_09",
    category_name: "Daily Essentials & Groceries",
    name: "Ceremonial Grade Uji Japanese Matcha Green Tea (100g)",
    sku: "GROC-MTC-100G",
    price: 19.99,
    description: "First-harvest stone-ground Japanese matcha rich in L-theanine and EGCG antioxidants for sustained clean focus and alertness.",
    image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
    tags: ["tea", "matcha", "organic", "green tea", "beverage"],
    total_stock: 70
  },
  {
    product_id: "prod_daily_05",
    category_id: "cat_daily_09",
    category_name: "Daily Essentials & Groceries",
    name: "Roasted Himalayan Pink Salted California Almonds (500g)",
    sku: "GROC-ALM-500G",
    price: 13.49,
    description: "Slow dry-roasted nonpareil California almonds lightly dusted with pure Himalayan mineral salt. High in healthy fats and magnesium.",
    image_url: "https://images.unsplash.com/photo-1508061252224-43775270e0a4?w=600&auto=format&fit=crop&q=80",
    tags: ["almonds", "nuts", "healthy snacks", "groceries"],
    total_stock: 160
  },
  // Campus & Office Stationery
  {
    product_id: "prod_daily_06",
    category_id: "cat_daily_10",
    category_name: "Campus & Office Stationery",
    name: "Hardcover Dot-Grid Spiral Notebook Journal (3-Pack)",
    sku: "OFF-NOTE-3PK",
    price: 16.99,
    description: "120gsm heavy ink-bleed resistant ivory pages. Heavy duty water-resistant hardcover with elastic closure and inner storage pocket.",
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    tags: ["notebook", "stationery", "journal", "campus", "study"],
    total_stock: 125
  },
  {
    product_id: "prod_daily_07",
    category_id: "cat_daily_10",
    category_name: "Campus & Office Stationery",
    name: "Quick-Dry Japanese Gel Ink Rollerball Pens 0.5mm (10-Pack)",
    sku: "OFF-PENS-10PK",
    price: 11.99,
    description: "Ultra-fine tungsten carbide 0.5mm tip with fade-proof archival pigment ink. Anti-smear quick dry formula for smooth writing.",
    image_url: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80",
    tags: ["pens", "stationery", "gel pen", "writing", "office"],
    total_stock: 180
  },
  {
    product_id: "prod_daily_08",
    category_id: "cat_daily_10",
    category_name: "Campus & Office Stationery",
    name: "65W GaN III 3-Port Fast Wall Charger (2x USB-C + USB-A)",
    sku: "ELEC-GAN-65W",
    price: 32.99,
    description: "Gallium Nitride (GaN III) fast power adapter. Powers laptops, tablets, and phones simultaneously with dynamic thermal regulation.",
    image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
    tags: ["charger", "gan", "usb-c", "power", "travel", "campus"],
    total_stock: 90
  },
  {
    product_id: "prod_daily_09",
    category_id: "cat_daily_10",
    category_name: "Campus & Office Stationery",
    name: "Magnetic Weighted Silicone Desktop Cable Organizer (2-Pack)",
    sku: "OFF-CBL-MGT",
    price: 13.99,
    description: "Heavy weighted anti-slip silicone base with precision magnetic collar clips. Keeps charging wires and cords securely in place.",
    image_url: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=80",
    tags: ["desk", "organizer", "cable", "clean setup", "office"],
    total_stock: 145
  },
  // Personal Care & Wellness
  {
    product_id: "prod_daily_10",
    category_id: "cat_daily_11",
    category_name: "Personal Care & Wellness",
    name: "Sonic Pulse Electric Toothbrush with Travel Case & 6 Heads",
    sku: "WELL-BRUSH-01",
    price: 29.99,
    description: "42,000 vibrations per minute sonic maglev motor with 5 smart cleaning modes and 60-day USB-C rechargeable battery. IPX7 waterproof.",
    image_url: "https://images.unsplash.com/photo-1559591937-e1032b53587b?w=600&auto=format&fit=crop&q=80",
    tags: ["electric toothbrush", "oral care", "grooming", "hygiene"],
    total_stock: 75
  },
  {
    product_id: "prod_daily_11",
    category_id: "cat_daily_11",
    category_name: "Personal Care & Wellness",
    name: "Blue Light Blocking Computer Glasses (Anti-Glare UV400)",
    sku: "WELL-BLU-GLS",
    price: 18.50,
    description: "TR90 ultra-lightweight flexible frame with multi-layer anti-reflective coating. Filters 99% harmful blue rays from monitors.",
    image_url: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&auto=format&fit=crop&q=80",
    tags: ["glasses", "blue light", "eye care", "ergonomics", "coding"],
    total_stock: 105
  },
  {
    product_id: "prod_daily_12",
    category_id: "cat_daily_11",
    category_name: "Personal Care & Wellness",
    name: "Orthopedic Memory Foam Ergonomic Chair Cushion",
    sku: "WELL-CUSH-01",
    price: 26.99,
    description: "High-density heat-responsive memory foam with U-shaped ergonomic cut-out. Alleviates tailbone pressure during extended study hours.",
    image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80",
    tags: ["cushion", "ergonomic", "seat", "wellness", "study"],
    total_stock: 65
  }
];
