import React from 'react';

interface HeroBannerProps {
  onSelectCategory: (catId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCategory }) => {
  return (
    <div className="relative mb-6">
      {/* Background Graphic */}
      <div className="h-64 sm:h-80 md:h-96 w-full bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-between px-6 md:px-16 text-white relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-2xl z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#febd69]/20 text-[#febd69] border border-[#febd69]/30 px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase">
            <i className="fa-solid fa-server"></i> Next-Gen Enterprise Hardware
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Distributed Compute, AI Acceleration & Resilient Storage
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm max-w-xl">
            Powered by ACID Transactions on PostgreSQL, Flexible NoSQL Catalog on MongoDB, Distributed Locks on Redis, and Vector Similarity Search.
          </p>
        </div>

        {/* Decorative Server Visual */}
        <div className="hidden lg:flex flex-col items-center justify-center z-10 opacity-90">
          <div className="relative p-6 bg-slate-900/80 border border-slate-700/60 rounded-xl shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] text-gray-400 font-mono ml-2">NexCommerce Kernel v2.4</span>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="text-emerald-400">✓ klhdb (PostgreSQL) Status: READY</div>
              <div className="text-cyan-400">✓ mongo_catalog Cluster: ACTIVE</div>
              <div className="text-amber-400">✓ redis_lock_cache: SYNCED (TTL 300s)</div>
              <div className="text-purple-400">✓ AI Vector Embeddings: 384-DIM LOADED</div>
            </div>
          </div>
        </div>

        {/* Gradient bottom fade into page body */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--bg-page)] to-transparent pointer-events-none"></div>
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
