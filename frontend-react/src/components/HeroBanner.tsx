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
      <div className="min-h-[390px] md:min-h-[420px] w-full bg-[#070b14] flex items-center justify-between px-6 md:px-14 py-8 text-white relative overflow-hidden rounded-2xl shadow-2xl border border-slate-800/60">
        
        {/* Accretion Disc WebGL Canvas */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-85">
          <AccretionDisc
            baseColor="#00f0ff"
            accentColor="#3b82f6"
            arms={7}
            tilt={36}
            core={5}
            speed={75}
            dotSize={185}
          />
        </div>

        {/* Ambient atmospheric lighting overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/95 via-[#030712]/60 to-transparent z-[1] pointer-events-none"></div>

        {/* Hero Title & Description */}
        <div className="max-w-2xl z-10 space-y-4 relative py-2">
          <div className="inline-flex items-center gap-2 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide uppercase shadow-sm backdrop-blur-md">
            <i className="fa-solid fa-atom animate-spin" style={{ animationDuration: '8s' }}></i> State Research Infrastructure Grid (3,000 Nodes)
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
            State-Scale Scientific Compute & Hardware Architecture
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm max-w-xl leading-relaxed drop-shadow">
            Autonomous multi-database platform managing 3,000+ state research nodes. Enforced by PostgreSQL 16 ACID two-phase locking, MongoDB polymorphic BSON specs, Redis distributed locks, and pgvector cosine similarity.
          </p>

          {/* Action Orbit Border Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <OrbitBorderButton
              label="Semiconductors & AI NPUs"
              stroke={{ color: "#00f0ff", size: 30, speed: 60 }}
              colors={{ fill: "#030712", textColor: "#00f0ff" }}
              rounded={9999}
              padding="8px 22px"
              onClick={() => onSelectCategory('cat_semi_01')}
            />
            <OrbitBorderButton
              label="HPC Supercomputer Blades"
              stroke={{ color: "#38bdf8", size: 30, speed: 50 }}
              colors={{ fill: "#0b1120", textColor: "#38bdf8" }}
              rounded={9999}
              padding="8px 22px"
              onClick={() => onSelectCategory('cat_hpc_02')}
            />
            <OrbitBorderButton
              label="Quantum & Cryogenics"
              stroke={{ color: "#8b5cf6", size: 30, speed: 55 }}
              colors={{ fill: "#1e1b4b", textColor: "#c4b5fd" }}
              rounded={9999}
              padding="8px 22px"
              onClick={() => onSelectCategory('cat_quantum_08')}
            />
          </div>
        </div>

        {/* Decorative Server Visual */}
        <div className="hidden lg:flex flex-col items-center justify-center z-10 relative opacity-95">
          <div className="relative p-5 bg-slate-900/90 border border-cyan-500/30 rounded-xl shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] text-cyan-300 font-mono ml-2">Hyperion Research Grid v3.0</span>
            </div>
            <div className="space-y-2 font-mono text-xs">
              <div className="text-emerald-400 flex items-center gap-1.5"><i className="fa-solid fa-check"></i> klhdb (PostgreSQL 16): 3,000 NODES ACTIVE</div>
              <div className="text-cyan-400 flex items-center gap-1.5"><i className="fa-solid fa-check"></i> mongo_catalog: 3,000 BSON DOCS SYNCED</div>
              <div className="text-blue-400 flex items-center gap-1.5"><i className="fa-solid fa-check"></i> State Logistics Corridors: 6 HUBS ONLINE</div>
              <div className="text-purple-400 flex items-center gap-1.5"><i className="fa-solid fa-check"></i> pgvector Embeddings: 1536-DIM HNSW READY</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Feature Quick Cards directly below banner */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div 
          onClick={() => onSelectCategory('cat_semi_01')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-xl hover:border-cyan-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition">
                Semiconductors & AI Core
              </h3>
              <span className="text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded font-semibold">Wafer-Scale</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Tensor core GPUs, multi-die NPUs, and optical interconnect accelerators.
            </p>
          </div>
          <div className="mt-3 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 h-32 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&auto=format&fit=crop&q=80" 
              alt="Semiconductors" 
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-2.5 flex items-center gap-1">Explore Silicon Nodes <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i></span>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => onSelectCategory('cat_hpc_02')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-xl hover:border-cyan-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition">
                HPC Supercomputing Blades
              </h3>
              <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-semibold">Exascale</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Liquid-cooled multi-socket supercomputing blades with InfiniBand fabrics.
            </p>
          </div>
          <div className="mt-3 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 h-32 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80" 
              alt="HPC Supercomputers" 
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-2.5 flex items-center gap-1">Inspect Cluster Nodes <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i></span>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => onSelectCategory('cat_quantum_08')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-xl hover:border-cyan-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition">
                Quantum & Cryogenics
              </h3>
              <span className="text-[10px] font-mono uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded font-semibold">Sub-Kelvin</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              RF qubit pulse generators, dilution refrigerator controllers & SQUID amps.
            </p>
          </div>
          <div className="mt-3 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 h-32 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80" 
              alt="Quantum Instrumentation" 
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-2.5 flex items-center gap-1">View Quantum Instruments <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i></span>
        </div>

        {/* Card 4 */}
        <div 
          onClick={() => onSelectCategory('cat_aero_03')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-xl hover:border-cyan-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition">
                Aerospace & Avionics
              </h3>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-semibold">Rad-Hard</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Radiation-tolerant FPGAs, RTOS flight control units, and S-Band telemetry.
            </p>
          </div>
          <div className="mt-3 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 h-32 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=400&auto=format&fit=crop&q=80" 
              alt="Aerospace & Avionics" 
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-2.5 flex items-center gap-1">Inspect Avionics Nodes <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i></span>
        </div>

      </div>
    </div>
  );
};
