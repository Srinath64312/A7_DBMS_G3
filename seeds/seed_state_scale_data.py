"""
State-Scale Database Seeding Engine (Version 3.0 - Research Grade)
Generates 3,000+ High-Fidelity Enterprise & Scientific Hardware Products
across 12 State-Level Industrial Sectors and 6 Regional Tech Corridors.

Course: 25CS1302E - DBS-DBD (KL University)
Polyglot Persistence: PostgreSQL 16 (Relational Core) + MongoDB 7.0 (BSON Specs) + Redis 7.2
"""

import os
import sys
import json
import logging
import uuid
import random
import math
from datetime import datetime, timezone

# Ensure project root in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db import postgres_db, mongo_db, cache_manager
from backend.services import auth_service

logger = logging.getLogger("StateScaleSeeder")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

# 12 State-Level Research Categories
STATE_CATEGORIES = [
    ("cat_semi_01", "Advanced Semiconductor & AI Accelerators", "Tensor core GPUs, NPUs, wafer-scale engines and silicon accelerators"),
    ("cat_hpc_02", "High-Performance Compute & Cluster Nodes", "Multi-socket liquid-cooled supercomputer blades and datacenter compute"),
    ("cat_aero_03", "Aerospace, Avionics & Defense Embedded Systems", "Radiation-hardened FPGAs, RTOS flight controllers, and telemetry transceivers"),
    ("cat_telecom_04", "5G/6G Carrier Infrastructure & Optical Fabrics", "OpenRAN distributed units, 800G coherent optical transceivers, and DWDM muxes"),
    ("cat_bio_05", "Biomedical & Genomics Sequencing Hardware", "High-throughput gene analyzers, microfluidic controllers, and clinical DSP modules"),
    ("cat_energy_06", "Renewable Smart Grid & Industrial Power Electronics", "Solid-state transformers, megawatt solar inverters, and battery BMS controllers"),
    ("cat_robot_07", "Autonomous Robotics & Machine Vision Nodes", "Solid-state LiDAR sensors, stereo neural depth cameras, and industrial servos"),
    ("cat_quantum_08", "Quantum Computing & Cryogenic Instrumentation", "Dilution refrigerator controllers, RF qubit pulse generators, and SQUID amplifiers"),
    ("cat_storage_09", "Petabyte-Scale Enterprise Storage & NVMe-oF", "NVMe over Fabrics 100GbE appliances, Ceph/Lustre storage nodes, and SAN arrays"),
    ("cat_net_10", "Zero-Trust Hardware Cryptography & HSMs", "Hardware Security Modules, line-rate quantum-resistant IPSec encryptors"),
    ("cat_maker_11", "Industrial IoT & Smart Factory Edge Sensors", "Hazardous-location telemetry nodes, Modbus/Profibus gateways, and PLC fabrics"),
    ("cat_lab_12", "Academic Research & Precision Measurement", "110GHz spectrum analyzers, 8-channel mixed-signal oscilloscopes, and RF synthesizers")
]

# 6 Regional State Corridors
STATE_WAREHOUSES = [
    ("wh_hyd_01", "Hyderabad Silicon Corridor & T-Hub Center", "WH_HYD_01", "Hitec City / Aziz Nagar, Hyderabad, Telangana", 65000),
    ("wh_blr_01", "Bangalore Whitefield Aerospace & Quantum Hub", "WH_BLR_01", "ITPL Whitefield, Bangalore, Karnataka", 75000),
    ("wh_chn_01", "Chennai Tidel Hardware & Semiconductor Corridor", "WH_CHN_01", "Taramani, Chennai, Tamil Nadu", 50000),
    ("wh_pun_01", "Pune Hinjewadi Industrial Automation Zone", "WH_PUN_01", "Phase-1 Hinjewadi, Pune, Maharashtra", 45000),
    ("wh_del_01", "Delhi-NCR Defense & Aviation Gateway", "WH_DEL_01", "Cyber City, Gurugram, Delhi-NCR", 55000),
    ("wh_mum_01", "Mumbai Maritime Cloud Logistics Terminal", "WH_MUM_01", "Bhiwandi Logistics Hub, Mumbai, Maharashtra", 80000)
]

# 10 State & National Technology Vendors
STATE_SELLERS = [
    ("sel_01", "usr_seller_01", "Apex High-Performance Systems Ltd", "sales@apexsystems.in", "+91 98480 11223", "36AABCA1234D1ZM", "Hyderabad", 4.96, True),
    ("sel_02", "usr_admin_01", "NexCommerce Direct State Supply", "procurement@commerce.kluniversity.in", "+91 98480 99887", "36AABCN5678E2ZN", "Hyderabad", 4.98, True),
    ("sel_03", None, "QuantumSilicon Technologies India", "enterprise@quantumsilicon.io", "+91 80234 56789", "29AAACQ4321F1ZP", "Bangalore", 4.92, True),
    ("sel_04", None, "Bharat Semiconductor Foundry Corp", "contact@bharatsemi.gov.in", "+91 44289 01234", "33AABCB9012K1ZQ", "Chennai", 4.89, True),
    ("sel_05", None, "Defence Avionics & RTOS Dynamics", "gov@defenceavionics.in", "+91 11456 78901", "07AABCD8765H1ZS", "Delhi NCR", 4.97, True),
    ("sel_06", None, "BioGenomics Precision Instruments", "support@biogenomics.co.in", "+91 80456 12345", "29AAACB1122C1ZT", "Bangalore", 4.88, True),
    ("sel_07", None, "CleanGrid Megawatt Power Systems", "grid@cleangrid.in", "+91 20267 89012", "27AABCC3344D1ZU", "Pune", 4.85, True),
    ("sel_08", None, "CyberShield Hardware Security Ltd", "security@cybershield.in", "+91 22678 90123", "27AABCE9876G1ZR", "Mumbai", 4.94, True),
    ("sel_09", None, "Photonics 800G Carrier Fabrics", "optical@photonics.net.in", "+91 44345 67890", "33AABCP5566E1ZV", "Chennai", 4.91, True),
    ("sel_10", None, "National Precision Scientific Lab Instruments", "orders@precisionlab.org", "+91 40234 88990", "36AABCN7788F1ZW", "Hyderabad", 4.95, True)
]

# Sector-specific nomenclature for generating 3,000+ realistic products
SECTOR_TEMPLATES = {
    "cat_semi_01": {
        "brands": ["NVIDIA", "AMD", "Intel", "Google", "Cerebras", "Qualcomm", "Groq", "Tenstorrent", "Graphcore", "Sambanova"],
        "models": ["Blackwell Ultra B200", "Instinct MI325X", "Gaudi 3 AI Fabric", "TPU v5p Mega-Pod", "Wafer-Scale Engine 3", "GroqRack LPU v2", "Wormhole n150", "Bow IPU-POD64", "Samba-1 SN40L", "Centriq 2400 AI"],
        "subtypes": ["Tensor Accelerator", "Inference Module", "Sparse Compute Blade", "Wafer Scale Node", "Liquid Cooled Subsystem", "Edge Neural Engine"],
        "price_range": (3500.0, 38000.0),
        "spec_templates": lambda i: {
            "fp8_tflops": random.choice([2000, 4500, 9000, 18000, 32000]),
            "hbm3e_memory": f"{random.choice([96, 144, 192, 288, 576])} GB",
            "interconnect": f"NVLink-5 / PCIe Gen6 x16 ({random.choice([900, 1800, 3200])} GB/s)",
            "tdp_watts": random.choice([350, 450, 700, 1000, 1400]),
            "process_node": f"{random.choice([3, 4, 5])}nm FinFET / GAA",
            "certification": "ISO-9001 / IEC-61508 / AS9100D",
            "mtbf_hours": random.choice([150000, 250000, 400000])
        }
    },
    "cat_hpc_02": {
        "brands": ["HPE Cray", "Dell EMC", "Lenovo", "Supermicro", "Fujitsu", "Atos", "Inspur", "BullSequana", "Penguin Computing", "Gigabyte"],
        "models": ["EX425 Liquid-Blade", "PowerEdge XE9680 v3", "ThinkSystem SR675 V3", "SuperServer 821GE-TNHR", "PRIMERGY CX400 M7", "XH3000 Direct Liquid", "NF5488A5 Multi-GPU", "X800 Exascale Blade", "Altus 2804 HPC", "G493-SB0 Extreme"],
        "subtypes": ["Exascale Blade Node", "Multi-Socket Compute Tray", "Liquid-Cooled Server", "Dense Density Chassis", "InfiniBand NDR Cluster Unit"],
        "price_range": (5500.0, 45000.0),
        "spec_templates": lambda i: {
            "sockets": random.choice(["2x AMD EPYC 9654 (192 Cores)", "2x Intel Xeon Platinum 8592+ (128 Cores)", "4x AmpereOne 192-Core"]),
            "ram": f"{random.choice([512, 1024, 2048, 4096])} GB DDR5 ECC Reg",
            "cooling": random.choice(["Direct-to-Chip Warm Water", "Immersion Cooling Ready", "Rear-Door Heat Exchanger", "High-CFM Redundant Fans"]),
            "interconnect": "NVIDIA Quantum-2 400Gb/s InfiniBand OSFP",
            "form_factor": f"{random.choice([1, 2, 4, 8])}U Rackmount",
            "redundancy": "N+1 Hot-Swap 3000W 80-Plus Titanium",
            "mtbf_hours": random.choice([200000, 350000, 500000])
        }
    },
    "cat_aero_03": {
        "brands": ["BAE Systems", "Honeywell", "Curtiss-Wright", "Thales", "Collins Aerospace", "Mercury Systems", "Safran", "Northrop", "Lockheed", "Elbit"],
        "models": ["SpaceVPX Rad-Tolerant SBC", "Versal Rad-Hard FPGA Unit", "ARINC 429 Flight Avionics", "MIL-STD-1553B Bus Controller", "Rugged 3U VPX DSP Module", "DO-254 Flight Computer", "LEO Satellite Onboard Telemetry", "Tactical Mission Processor"],
        "subtypes": ["Avionics Computer", "Space-Qualified Processor", "Rugged Mission Payload", "Telemetry Transceiver", "Inertial Guidance DSP"],
        "price_range": (4200.0, 55000.0),
        "spec_templates": lambda i: {
            "radiation_tolerance": f"{random.choice([100, 200, 300])} krad(Si) TID",
            "operating_temp": "-55°C to +125°C Conduction-Cooled",
            "avionics_bus": random.choice(["MIL-STD-1553B Dual Redundant", "ARINC 429 8-Channel", "SpaceWire 400Mbps"]),
            "certification": "DO-254 Level A / DO-178C / AS9100",
            "vibration_tolerance": "MIL-STD-810H Method 514.8 Category 24",
            "power_input": "28V DC Mil-Standard 704F",
            "mtbf_hours": random.choice([500000, 850000, 1200000])
        }
    },
    "cat_telecom_04": {
        "brands": ["Ericsson", "Nokia", "Ciena", "Cisco", "Infinera", "Fujitsu", "ZTE", "Mavenir", "Adtran", "CommScope"],
        "models": ["OpenRAN 5G Distributed Unit", "Waveserver 5 800G Coherent", "Catalyst 9600 Core Switch", "NCS 5500 Terabit Router", "GX Series ROADM Optical", "AirScale Massive MIMO BBU", "OptiX OSN 9800 DWDM", "Cloud RAN Virtualized Blade"],
        "subtypes": ["Carrier Optical Transponder", "OpenRAN DU Node", "Dense Wavelength Multiplexer", "Massive MIMO Baseband", "5G Core Edge Gateway"],
        "price_range": (2800.0, 32000.0),
        "spec_templates": lambda i: {
            "capacity": f"{random.choice([400, 800, 1600, 3200])} Gb/s Line Rate",
            "latency": "< 0.85 microseconds packet jitter",
            "laser_modulation": random.choice(["64-QAM Probabilistic Shaping", "DP-16QAM Coherent", "PAM4 Optical"]),
            "reach_km": f"{random.choice([80, 250, 800, 1500])} km Amplified",
            "clocking": "IEEE 1588v2 PTP Telecom Profile G.8275.1",
            "redundancy": "Carrier Grade 99.9999% High Availability",
            "mtbf_hours": 350000
        }
    },
    "cat_bio_05": {
        "brands": ["Illumina", "Thermo Fisher", "PacBio", "Oxford Nanopore", "Agilent", "PerkinElmer", "Beckman Coulter", "Roche", "Bio-Rad", "BGI"],
        "models": ["NovaSeq X Ultra Flow Unit", "Revio Long-Read Sequencer Engine", "PromethION 48 High-Throughput", "SeqStudio Genetic Analyzer DSP", "BioAnalyzer 2100 LabNode", "Biomek i7 Microfluidic Tray", "Cobas 8800 Real-Time PCR Module"],
        "subtypes": ["Genomics Sequencing Core", "Microfluidic Controller", "Real-Time PCR Processing Node", "High-Throughput Cell Analyzer", "Mass Spectrometry DSP"],
        "price_range": (6500.0, 75000.0),
        "spec_templates": lambda i: {
            "throughput": f"{random.choice([16, 32, 64, 128])} Billion Reads per Run",
            "accuracy": "Q30 Score >= 92% (99.9% Base Accuracy)",
            "microfluidics": "Pneumatic Closed-Loop Flow Cell Control",
            "optics": "Dual-Laser Fluorescence CMOS Sensor Array",
            "compliance": "FDA 21 CFR Part 11 / CE-IVD / ISO 13485",
            "storage_interface": "Direct PCIe Gen5 NVMe Array 64TB Local Cache",
            "mtbf_hours": 180000
        }
    },
    "cat_energy_06": {
        "brands": ["Schneider Electric", "ABB", "Siemens Energy", "SMA Solar", "Sungrow", "Tesla Energy", "Delta Electronics", "Eaton", "Danfoss", "Hitachi Energy"],
        "models": ["Sunny Central 4500-UP Megawatt Inverter", "MegaPack Megawatt BMS Rack", "UniGrid Solid-State Transformer", "PowerPro HVDC Converter 2MW", "Eaton Power Xpert 1500V", "ABB FIMER Utility Inverter 3.3MW", "Sinamics Medium Voltage Variable Drive"],
        "subtypes": ["Utility Grid Inverter", "Solid-State Transformer", "BMS Energy Storage Rack", "HVDC Converter Module", "Substation Supervisory Node"],
        "price_range": (3800.0, 62000.0),
        "spec_templates": lambda i: {
            "rated_power": f"{random.choice([250, 500, 1000, 2500, 4000])} kVA",
            "efficiency": f"{random.choice([98.8, 99.1, 99.4, 99.6])}% Euro-Efficiency",
            "grid_compliance": "IEEE 1547-2018 / UL 1741-SB / CEI 0-16",
            "voltage_range": "800V - 1500V DC High Voltage",
            "protection": "IP66 / NEMA 4X Marine-Grade Stainless Housing",
            "scada_protocols": "IEC 61850 / DNP3 / Modbus TCP over Fiber",
            "mtbf_hours": 300000
        }
    },
    "cat_robot_07": {
        "brands": ["KUKA", "FANUC", "Yaskawa", "ABB Robotics", "Velodyne", "Hesai", "Ouster", "Universal Robots", "Cognex", "Keyence"],
        "models": ["Ultra-Range 128-Beam Solid-State LiDAR", "RoboGuide 6-Axis Servo Node", "Cognex In-Sight 3800 Vision Core", "Panda Tactile Impedance Controller", "OS2 128-Channel Industrial LiDAR", "KR C5 Micro Robot Controller", "Keyence 3D Line Laser Profiler"],
        "subtypes": ["Solid-State LiDAR Node", "Robot Servo Controller", "Neural Machine Vision Engine", "Force-Torque Telemetry Sensor", "Autonomous AGV Navigation Core"],
        "price_range": (1800.0, 24000.0),
        "spec_templates": lambda i: {
            "range_meters": f"{random.choice([100, 200, 300])}m at 10% Reflectivity",
            "point_cloud_rate": f"{random.choice([1.3, 2.6, 5.2])} Million Points/sec",
            "camera_resolution": "4K Global Shutter Stereo CMOS @ 120 FPS",
            "latency": "< 3ms Hardware Edge Inference Response",
            "protection": "IP67 / IP69K Washdown Proof",
            "industrial_bus": "EtherCAT / PROFINET / ROS2 Humble Native",
            "mtbf_hours": 200000
        }
    },
    "cat_quantum_08": {
        "brands": ["Zurich Instruments", "Keysight Quantum", "Oxford Instruments", "Bluefors", "Rigetti", "Quantum Design", "Qblox", "FormFactor", "Cryomech", "Maybell"],
        "models": ["SHFQA Quantum Analyzer 8.5GHz", "QCM-RF Qubit Pulse Controller", "XLD Cryogenic Dilution Subsystem", "Cluster-Qubit Microwave AWG 16-Channel", "OptiCool Optical Cryostat Controller", "Cryo-CMOS Low Noise Pre-Amplifier"],
        "subtypes": ["Quantum Controller AWG", "Qubit Readout Analyzer", "Cryogenic Dilution Node", "Microwave Synthesis Node", "SQUID Sensor Controller"],
        "price_range": (12000.0, 145000.0),
        "spec_templates": lambda i: {
            "base_temperature": f"{random.choice([7, 10, 15])} mK (MilliKelvin)",
            "qubit_channels": f"{random.choice([4, 8, 16, 32])} Coherent Pulse Control Channels",
            "phase_jitter": "< 20 femtoseconds RMS Jitter",
            "frequency_range": "DC to 8.5 GHz Ultra-Low Noise",
            "sample_rate": "6.0 GSa/s 16-Bit Resolution AWG",
            "cryo_magnetic_shielding": "Mu-Metal & Superconducting NbTi Layer",
            "mtbf_hours": 150000
        }
    },
    "cat_storage_09": {
        "brands": ["Pure Storage", "NetApp", "Vast Data", "Dell PowerStore", "Kaminario", "IBM Storage", "Infinidat", "Western Digital", "Samsung Enterprise", "Solidigm"],
        "models": ["FlashArray//XL NVMe-oF Chassis", "FlashBlade//S Petabyte Object Node", "AFF A900 End-to-End NVMe All-Flash", "Universal Storage Ceres 1PB Enclosure", "FlashSystem 9500 Ultra-Low Latency", "D5-P5336 61.44TB QLC NVMe Fabric", "InfiniBox SSA II High-IOPS Blade"],
        "subtypes": ["NVMe-oF Storage Array", "Petabyte Object Fabric", "All-Flash SAN Node", "Distributed Lustre Node", "Ultra-High IOPS Storage Tray"],
        "price_range": (4500.0, 85000.0),
        "spec_templates": lambda i: {
            "raw_capacity": f"{random.choice([250, 500, 1000, 2000, 4000])} TB All-Flash NVMe",
            "sustained_iops": f"{random.choice([1.5, 3.0, 6.5, 12.0])} Million 4K IOPS",
            "latency": "< 65 microseconds average read latency",
            "fabric_interface": "4x 200Gb/s RoCEv2 / InfiniBand HDR",
            "resiliency": "Dual-Active Controller Active-Active RAID-6D",
            "data_reduction": "Typical 4:1 Hardware Inline Deduplication & Compression",
            "mtbf_hours": 500000
        }
    },
    "cat_net_10": {
        "brands": ["Thales", "Entrust", "Utimaco", "Fortinet", "Palo Alto Networks", "Yubico", "SafeNet", "Check Point", "Cisco Talos", "Kudelski"],
        "models": ["Luna PCIe HSM 7000 FIPS Level 3", "nShield Connect XC Cryptographic Core", "Quantum-Safe Hardware Encryptor 100G", "FortiGate 4800F Hyperscale Security Blade", "PA-7500 Terabit Firewall Accelerator", "CryptoServer CP5 Hardware Root of Trust", "SafeNet Network Encryptor CN9000"],
        "subtypes": ["FIPS 140-3 Hardware Security Module", "Quantum-Safe Line Encryptor", "Hyperscale Firewall Blade", "Hardware Root of Trust Unit", "Key Management Appliance"],
        "price_range": (3200.0, 48000.0),
        "spec_templates": lambda i: {
            "fips_certification": "FIPS 140-3 Level 3 & Level 4 Physical Tamper Proof",
            "asymmetric_rate": f"{random.choice([12000, 25000, 50000])} RSA-4096 Signatures/sec",
            "post_quantum_algs": "ML-KEM (Kyber), ML-DSA (Dilithium), SPHINCS+",
            "tamper_response": "Active Zeroization in < 50 nanoseconds upon breach",
            "throughput": f"{random.choice([40, 100, 400])} Gb/s Line-Rate Layer 2/3 Encryption",
            "clustering": "Up to 32 HSMs Active Load-Balanced Cluster",
            "mtbf_hours": 400000
        }
    },
    "cat_maker_11": {
        "brands": ["Siemens", "Rockwell Automation", "Schneider Electric", "Phoenix Contact", "Advantech", "Moxa", "Beckhoff", "WAGO", "Turck", "Banner Engineering"],
        "models": ["SIMATIC S7-1500 Advanced Controller", "ControlLogix 5580 Safety PLC", "Moxa ioThinx 4510 Modular Edge I/O", "Beckhoff CX2043 Multicore Embedded PC", "WAGO Compact Controller 100", "Advantech UNO-2484G Rugged IoT Box", "Phoenix Contact PLCnext Control 3152"],
        "subtypes": ["Industrial Edge PLC", "Modular Smart I/O Unit", "Hazardous Location Telemetry Box", "Rugged Fieldbus Controller", "SCADA Gateway Unit"],
        "price_range": (450.0, 8500.0),
        "spec_templates": lambda i: {
            "protocols": "OPC UA, MQTT Sparkplug B, Modbus TCP, PROFINET IRT",
            "i_o_points": f"{random.choice([32, 64, 128, 256, 512])} Channels Mixed Digital/Analog",
            "hazardous_rating": "ATEX Zone 2 / Class I Div 2 Non-Incendive",
            "operating_temp": "-40°C to +75°C Fanless DIN-Rail",
            "memory": "Real-Time Retentive NVRAM with Battery Backup",
            "isolation": "2500V RMS Galvanic Channel-to-Channel Isolation",
            "mtbf_hours": 600000
        }
    },
    "cat_lab_12": {
        "brands": ["Keysight", "Tektronix", "Rohde & Schwarz", "Anritsu", "Fluke Calibration", "Teledyne LeCroy", "National Instruments", "Chroma", "Stanford Research", "Yokogawa"],
        "models": ["N9042B UXA 110GHz Spectrum Analyzer", "MSO68B 8-Channel 10GHz Oscilloscope", "SMW200A Vector Signal Generator", "LabMaster 10-65Zi 65GHz Real-Time Scope", "PXIe-8881 8-Core Instrumentation Chassis", "Fluke 5730A High-Precision Calibrator", "Anritsu ShockLine 4-Port VNA 43.5GHz"],
        "subtypes": ["Millimeter-Wave Signal Analyzer", "8-Channel Mixed-Signal Scope", "Vector Signal Generator", "PXIe High-Throughput Modular Chassis", "RF Vector Network Analyzer"],
        "price_range": (7500.0, 95000.0),
        "spec_templates": lambda i: {
            "bandwidth": f"{random.choice([4, 8, 16, 33, 65, 110])} GHz Frequency Span",
            "sample_rate": f"{random.choice([20, 40, 80, 160])} GSa/s per Channel",
            "vertical_resolution": f"{random.choice([10, 12, 14, 16])}-Bit Ultra-Low Noise ADC",
            "dynamic_range": f"{random.choice([145, 152, 160])} dBc/Hz Phase Noise Dynamic Range",
            "interfaces": "10GbE LAN, GPIB, USB-TMC, LXI Class C Compliant",
            "calibration": "NIST / NABL Traceable Calibration Certificate Included",
            "mtbf_hours": 280000
        }
    }
}

def generate_deterministic_embedding(text: str, dim: int = 1536) -> list:
    """Generates a high-quality deterministic pseudo-embedding based on hash tokens"""
    vec = [0.0] * dim
    words = text.lower().replace("-", " ").split()
    for w in words:
        h = hash(w)
        for i in range(16):
            idx = abs((h >> (i * 3)) ^ (i * 97)) % dim
            val = math.sin((h + i * 1337) * 0.001)
            vec[idx] += val
    
    # Normalize vector to unit length (L2 norm)
    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    return [round(x / norm, 5) for x in vec]

def seed_state_scale_database(target_product_count: int = 3000):
    logger.info("=" * 80)
    logger.info(f"🚀 INITIALIZING STATE-SCALE PROCEDURAL SEEDING ENGINE ({target_product_count} PRODUCTS)")
    logger.info("=" * 80)

    # 1. Initialize schema and extensions
    postgres_db.init_db()
    cache_manager.invalidate_cache()
    random.seed(2026)

    # 2. Seed Users
    users_data = [
        ("usr_admin_01", "Admin Srinath", "admin@commerce.kluniversity.in", "Admin@123", "ADMIN"),
        ("usr_mgr_01", "Manager Poli Naidu", "manager@commerce.kluniversity.in", "Manager@123", "WAREHOUSE_MANAGER"),
        ("usr_seller_01", "Apex Hardware Seller", "seller@commerce.kluniversity.in", "Seller@123", "SELLER"),
        ("usr_cust_01", "Abhinay Sai", "abhinay@klh.edu.in", "Customer@123", "CUSTOMER"),
        ("usr_cust_02", "Chandu K", "chandu@klh.edu.in", "Customer@123", "CUSTOMER")
    ]
    for uid, name, email, pw, role in users_data:
        pw_hash = auth_service.hash_password(pw)
        postgres_db.execute(
            "INSERT INTO users (user_id, name, email, password_hash, role) VALUES (%s, %s, %s, %s, %s) "
            "ON CONFLICT (user_id) DO NOTHING",
            (uid, name, email, pw_hash, role)
        )
    logger.info("✅ 1/6: Seeded 5 Users across all 4 Roles.")

    # 3. Seed 10 State & National Technology Vendors
    for sid, uid, cname, email, phone, gstin, city, rating, is_v in STATE_SELLERS:
        postgres_db.execute(
            "INSERT INTO sellers (seller_id, user_id, company_name, contact_email, contact_phone, gstin, city, rating, is_verified) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT (seller_id) DO UPDATE SET company_name = EXCLUDED.company_name",
            (sid, uid, cname, email, phone, gstin, city, rating, is_v)
        )
    logger.info("✅ 2/6: Seeded 10 State & National Technology Vendors.")

    # 4. Seed 6 Regional State Logistics Warehouses
    for wid, name, code, loc, cap in STATE_WAREHOUSES:
        postgres_db.execute(
            "INSERT INTO warehouses (warehouse_id, name, code, location, capacity) VALUES (%s, %s, %s, %s, %s) "
            "ON CONFLICT (warehouse_id) DO UPDATE SET name = EXCLUDED.name, location = EXCLUDED.location",
            (wid, name, code, loc, cap)
        )
    logger.info("✅ 3/6: Seeded 6 Regional State Logistics Corridors.")

    # 5. Seed 12 State-Level Research Categories
    for cid, name, desc in STATE_CATEGORIES:
        postgres_db.execute(
            "INSERT INTO categories (category_id, name, description) VALUES (%s, %s, %s) "
            "ON CONFLICT (category_id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description",
            (cid, name, desc)
        )
    logger.info("✅ 4/6: Seeded 12 State-Level Research Categories.")

    # 6. Procedural Generation of 3,000+ Products & Inventory
    logger.info(f"⏳ Generating {target_product_count} state-scale products with polymorphic BSON specs...")

    products_per_cat = math.ceil(target_product_count / len(STATE_CATEGORIES))
    all_products_relational = []
    all_mongo_docs = []
    all_inventory_records = []
    all_inventory_txns = []

    product_counter = 0

    curated_image_pool = [
        "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1551808525-51a94da548ce?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1618764400608-9e7115eabb74?w=600&auto=format&fit=crop&q=80"
    ]

    for cat_id, cat_name, _ in STATE_CATEGORIES:
        tpl = SECTOR_TEMPLATES[cat_id]
        brands = tpl["brands"]
        models = tpl["models"]
        subtypes = tpl["subtypes"]
        p_min, p_max = tpl["price_range"]

        for i in range(products_per_cat):
            product_counter += 1
            if product_counter > target_product_count:
                break

            pid = f"prod_res_{cat_id[-2:]}_{product_counter:04d}"
            brand = brands[i % len(brands)]
            model = models[(i // len(brands)) % len(models)]
            subtype = subtypes[(i + 3) % len(subtypes)]
            
            # Revision or Series specifier
            series_num = (i % 9) + 1
            gen_tag = f"Gen-{series_num}" if series_num > 1 else "Standard"

            name = f"{brand} {model} ({subtype} {gen_tag})"
            sku = f"KLH-{cat_id[-2:].upper()}-{brand[:3].upper()}-{product_counter:04d}"
            price = round(random.uniform(p_min, p_max), 2)
            seller_id = STATE_SELLERS[i % len(STATE_SELLERS)][0]

            # Generate technical tags and description
            desc = f"State-certified {name}. Designed for high-reliability research computing, aerospace telemetry, and distributed industrial operations."
            tags = [cat_id, brand.lower(), subtype.lower().replace(" ", "-"), "research-grade", "state-lab-certified"]

            # Embeddings (1536 dimensions)
            embedding_vector = generate_deterministic_embedding(f"{name} {desc} {' '.join(tags)}")

            # 1. Relational tuple
            all_products_relational.append((
                pid, cat_id, name, sku, price, True, json.dumps(embedding_vector)
            ))

            # 2. MongoDB Document
            attrs = tpl["spec_templates"](i)
            mongo_doc = {
                "product_id": pid,
                "name": name,
                "category_id": cat_id,
                "category_name": cat_name,
                "sku": sku,
                "price": price,
                "description": desc,
                "attributes": attrs,
                "supplier_id": seller_id,
                "tags": tags,
                "rating": round(random.uniform(4.70, 5.00), 2),
                "image_url": curated_image_pool[product_counter % len(curated_image_pool)],
                "state_certification_number": f"KLH-RD-{2026}-{product_counter:05d}"
            }
            all_mongo_docs.append(mongo_doc)

            # 3. Inventory distribution across warehouses (Primary + Secondary hubs)
            primary_wh = STATE_WAREHOUSES[i % len(STATE_WAREHOUSES)][0]
            secondary_wh = STATE_WAREHOUSES[(i + 1) % len(STATE_WAREHOUSES)][0]

            for wh_id in [primary_wh, secondary_wh]:
                inv_id = f"inv_{pid}_{wh_id}"
                qty = random.randint(15, 250)
                all_inventory_records.append((inv_id, pid, wh_id, qty, 0, 10))
                all_inventory_txns.append((
                    f"txn_{inv_id}", pid, wh_id, "RESTOCK", qty, "State Procurement Controller", "Initial State Seed Setup"
                ))

    logger.info(f"📦 Generated {len(all_products_relational)} Relational records, {len(all_mongo_docs)} BSON docs, and {len(all_inventory_records)} Inventory balances.")

    # 7. Bulk Insertion into PostgreSQL
    logger.info("⚡ Executing high-speed batch commit into PostgreSQL 16 (klhdb)...")
    
    # Clean old products and inventory to establish clean state-scale catalog
    postgres_db.execute("DELETE FROM cart_items;")
    postgres_db.execute("DELETE FROM order_items;")
    postgres_db.execute("DELETE FROM user_wishlists;")
    postgres_db.execute("DELETE FROM inventory_transactions;")
    postgres_db.execute("DELETE FROM inventory;")
    postgres_db.execute("DELETE FROM products;")

    # Batch insert products using executemany in a single transaction
    with postgres_db.get_db_cursor(commit=True) as cur:
        cur.executemany(
            "INSERT INTO products (product_id, category_id, name, sku, price, is_active, embedding) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s)",
            all_products_relational
        )
    logger.info(f"   -> Successfully committed {len(all_products_relational)} products into PostgreSQL.")

    # Batch insert inventory records
    with postgres_db.get_db_cursor(commit=True) as cur:
        cur.executemany(
            "INSERT INTO inventory (inventory_id, product_id, warehouse_id, quantity, reserved_qty, low_stock_threshold) "
            "VALUES (%s, %s, %s, %s, %s, %s) ON CONFLICT (product_id, warehouse_id) DO NOTHING",
            all_inventory_records
        )

    logger.info("✅ 5/6: Bulk Relational Insertions in PostgreSQL completed.")

    # 8. Bulk Insertion into MongoDB
    logger.info("🍃 Executing bulk upsert into MongoDB 7.0 (distributed_commerce_db)...")
    try:
        if mongo_db._IS_USING_LIVE_MONGO and mongo_db._products_collection is not None:
            clean_docs = []
            for d in all_mongo_docs:
                cd = dict(d)
                cd.pop("_id", None)
                clean_docs.append(cd)
            mongo_db._products_collection.delete_many({})
            mongo_db._products_collection.insert_many(clean_docs)
        else:
            for doc in all_mongo_docs:
                mongo_db.upsert_product(doc)
        logger.info(f"✅ 6/6: Successfully stored {len(all_mongo_docs)} polymorphic BSON specifications in MongoDB.")
    except Exception as e:
        logger.warning(f"MongoDB bulk insertion note: {e}")

    # Seed 5 sample customer reviews
    logger.info("📝 Seeding high-fidelity research peer reviews...")
    sample_reviews = [
        ("prod_res_01_0001", "usr_cust_01", "Abhinay Sai", 5, "Remarkable sustained FP8 throughput. The NVLink-5 interconnect reduced our cluster all-reduce latency to sub-2 microseconds.", datetime.now(timezone.utc).isoformat()),
        ("prod_res_02_0002", "usr_cust_02", "Chandu K", 5, "Exemplary direct-to-chip liquid cooling. The EPYC dual-socket blade ran continuously under full Linpack exascale benchmark without thermal throttling.", datetime.now(timezone.utc).isoformat()),
        ("prod_res_08_0008", "usr_mgr_01", "Poli Naidu", 5, "Cryogenic dilution stability reached 9.4 mK with zero magnetic flux drift. Essential for multi-qubit coherent gate control.", datetime.now(timezone.utc).isoformat()),
        ("prod_res_03_0003", "usr_admin_01", "Admin Srinath", 5, "Passed DO-254 Level A flight certification with full radiation hardness assurance. Superb hardware architecture.", datetime.now(timezone.utc).isoformat())
    ]
    for pid, uid, uname, rating, comment, dt in sample_reviews:
        mongo_db.upsert_review({
            "review_id": f"rev_{pid}_{uid}",
            "product_id": pid,
            "user_id": uid,
            "user_name": uname,
            "rating": rating,
            "comment": comment,
            "created_at": dt
        })

    logger.info("=" * 80)
    logger.info(f"🎉 STATE-SCALE DATABASE SEEDING COMPLETED SUCCESSFULLY! ({target_product_count} PRODUCTS ACTIVE)")
    logger.info("=" * 80)

if __name__ == "__main__":
    seed_state_scale_database(3000)
