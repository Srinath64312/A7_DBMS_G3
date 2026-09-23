import React from 'react';
import { AccretionDisc } from './AccretionDisc';
import { OrbitBorderButton } from './OrbitBorderButton';

interface HeroBannerProps {
  onSelectCategory: (catId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCategory }) => {
  return (
    <div className="relative mb-6">
      {/* Background Graphic with Live WebGL Accretion Disc */}
      <div className="h-80 sm:h-96 md:h-[420px] w-full bg-[#070b14] flex items-center justify-between px-6 md:px-16 text-white relative overflow-hidden rounded-xl shadow-2xl">
        
        {/* Accretion Disc WebGL Canvas */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-85">
          <AccretionDisc
            baseColor="#FF5F00"
            accentColor="#ffd814"
            arms={7}
            tilt={36}
            core={5}
            speed={75}
            dotSize={185}
          />
        </div>

        {/* Ambient atmospheric lighting overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b14]/90 via-[#070b14]/40 to-transparent z-[1] pointer-events-none"></div>

        {/* Hero Title & Description */}
        <div className="max-w-2xl z-10 space-y-3 relative">
          <div className="inline-flex items-center gap-2 bg-[#febd69]/20 text-[#febd69] border border-[#febd69]/40 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm backdrop-blur-md">
            <i className="fa-solid fa-atom animate-spin" style={{ animationDuration: '8s' }}></i> Next-Gen Enterprise Hardware
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
            Distributed Compute, AI Acceleration & Resilient Storage
          </h1>
          <p className="text-gray-200 text-xs sm:text-sm max-w-xl leading-relaxed drop-shadow">
            Powered by ACID Transactions on PostgreSQL, Flexible NoSQL Catalog on MongoDB, Distributed Locks on Redis, and Vector Similarity Search.
          </p>

          {/* Action Orbit Border Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <OrbitBorderButton
              label="Explore Compute Nodes"
              stroke={{ color: "#febd69", size: 30, speed: 60 }}
              colors={{ fill: "#131921", textColor: "#febd69" }}
              rounded={9999}
              padding="8px 20px"
              onClick={() => onSelectCategory('cat_comp_01')}
            />
            <OrbitBorderButton
              label="Tensor Accelerators"
              stroke={{ color: "#38bdf8", size: 30, speed: 50 }}
              colors={{ fill: "#0f172a", textColor: "#38bdf8" }}
              rounded={9999}
              padding="8px 20px"
              onClick={() => onSelectCategory('cat_elec_02')}
            />
          </div>
        </div>

        {/* Decorative Server Visual */}
        <div className="hidden lg:flex flex-col items-center justify-center z-10 relative opacity-95">
          <div className="relative p-5 bg-slate-900/80 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] text-gray-400 font-mono ml-2">NexCommerce Kernel v2.4</span>
            </div>
            <div className="space-y-2 font-mono text-xs">
              <div className="text-emerald-400 flex items-center gap-1.5"><i className="fa-solid fa-check"></i> klhdb (PostgreSQL) Status: READY</div>
              <div className="text-cyan-400 flex items-center gap-1.5"><i className="fa-solid fa-check"></i> mongo_catalog Cluster: ACTIVE</div>
              <div className="text-amber-400 flex items-center gap-1.5"><i className="fa-solid fa-check"></i> redis_lock_cache: SYNCED (TTL 300s)</div>
              <div className="text-purple-400 flex items-center gap-1.5"><i className="fa-solid fa-check"></i> AI Vector Embeddings: 384-DIM LOADED</div>
            </div>
          </div>
        </div>

        {/* Gradient bottom fade into page body */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--bg-page)] to-transparent pointer-events-none z-[2]"></div>
      </div>

      {/* 4 Feature Quick Cards overlapping banner */}
      <div className="max-w-[1700px] mx-auto px-4 -mt-16 sm:-mt-24 z-20 relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div 
          onClick={() => onSelectCategory('cat_comp_01')}
          className="bg-white dark:bg-slate-900 border border-[#d5d9d9] dark:border-slate-800 p-4 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <h3 className="font-bold text-sm md:text-base text-[#0f1111] dark:text-slate-100 group-hover:text-[#e47911] transition">
              Compute & Server Nodes
            </h3>
            <p className="text-xs text-[#565959] dark:text-slate-400 mt-1">
              Multi-socket Xeon & EPYC rack-mount nodes for scalable microservices.
            </p>
          </div>
          <div className="mt-3 overflow-hidden rounded bg-slate-100 dark:bg-slate-800 h-32 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80" 
              alt="Compute Nodes" 
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="text-xs font-semibold text-[#007185] dark:text-sky-400 mt-2 block">Explore Servers &rarr;</span>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => onSelectCategory('cat_elec_02')}
          className="bg-white dark:bg-slate-900 border border-[#d5d9d9] dark:border-slate-800 p-4 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <h3 className="font-bold text-sm md:text-base text-[#0f1111] dark:text-slate-100 group-hover:text-[#e47911] transition">
              Hardware Accelerators
            </h3>
            <p className="text-xs text-[#565959] dark:text-slate-400 mt-1">
              High-throughput Tensor Core GPUs for AI vector indexing & inference.
            </p>
          </div>
          <div className="mt-3 overflow-hidden rounded bg-slate-100 dark:bg-slate-800 h-32 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&auto=format&fit=crop&q=80" 
              alt="Hardware Accelerators" 
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="text-xs font-semibold text-[#007185] dark:text-sky-400 mt-2 block">Shop Accelerators &rarr;</span>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => onSelectCategory('cat_storage_05')}
          className="bg-white dark:bg-slate-900 border border-[#d5d9d9] dark:border-slate-800 p-4 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <h3 className="font-bold text-sm md:text-base text-[#0f1111] dark:text-slate-100 group-hover:text-[#e47911] transition">
              Storage & NVMe Fabrics
            </h3>
            <p className="text-xs text-[#565959] dark:text-slate-400 mt-1">
              PCIe Gen5 enterprise SSDs, SAN/NAS arrays, and high-IOPS caches.
            </p>
          </div>
          <div className="mt-3 overflow-hidden rounded bg-slate-100 dark:bg-slate-800 h-32 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&auto=format&fit=crop&q=80" 
              alt="Storage" 
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="text-xs font-semibold text-[#007185] dark:text-sky-400 mt-2 block">View Storage Arrays &rarr;</span>
        </div>

        {/* Card 4 */}
        <div 
          onClick={() => onSelectCategory('cat_net_04')}
          className="bg-white dark:bg-slate-900 border border-[#d5d9d9] dark:border-slate-800 p-4 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <h3 className="font-bold text-sm md:text-base text-[#0f1111] dark:text-slate-100 group-hover:text-[#e47911] transition">
              Networking & Spine Switches
            </h3>
            <p className="text-xs text-[#565959] dark:text-slate-400 mt-1">
              100GbE / 400GbE low-latency optical interconnects and managed fabric switches.
            </p>
          </div>
          <div className="mt-3 overflow-hidden rounded bg-slate-100 dark:bg-slate-800 h-32 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&auto=format&fit=crop&q=80" 
              alt="Networking" 
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="text-xs font-semibold text-[#007185] dark:text-sky-400 mt-2 block">Browse Network Gear &rarr;</span>
        </div>

      </div>
    </div>
  );
};
