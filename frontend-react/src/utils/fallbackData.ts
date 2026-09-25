import { Category, Warehouse, Product } from '../types';

export const FALLBACK_CATEGORIES: Category[] = [
  { category_id: "cat_comp_01", name: "Computing and Servers", description: "High performance compute resources and servers" },
  { category_id: "cat_elec_02", name: "Hardware Accelerators and Components", description: "GPUs, TPUs, CPUs and core components" },
  { category_id: "cat_audio_03", name: "Audio Equipment", description: "Professional studio monitors, wireless headsets, and microphones" },
  { category_id: "cat_net_04", name: "Networking and IoT", description: "Distributed gateways, smart edge sensors, and mesh routers" },
  { category_id: "cat_storage_05", name: "Storage and Memory", description: "High speed NVMe SSDs, NAS HDDs, and RAM" },
  { category_id: "cat_display_06", name: "Displays and Monitors", description: "High refresh rate gaming monitors and color accurate displays" },
  { category_id: "cat_periph_07", name: "Peripherals and Input Devices", description: "Keyboards, mice, and controller accessories" },
  { category_id: "cat_power_08", name: "Power and Cooling Systems", description: "UPS, Power supplies, and thermal cooling solutions" }
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
  }
];
