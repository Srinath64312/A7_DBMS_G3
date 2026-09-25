import React from 'react';
import { User, Category, Role } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAcademicLab: (tab?: 'sql_workbench' | 'lab_questions' | 'schema_erd' | 'acid_lab' | 'telemetry' | 'viva_guide') => void;
  onOpenTestRunner: () => void;
  onOpenRestock: () => void;
  onSwitchRole: (role: Role) => void;
  theme: 'light' | 'dark' | 'forest';
  onOpenAddressModal?: () => void;
  onOpenAddProduct?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  user,
  categories,
  selectedCategory,
  onSelectCategory,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenAuth,
  onLogout,
  onOpenAcademicLab,
  onOpenTestRunner,
  onOpenRestock,
  onSwitchRole,
  theme,
  onOpenAddressModal,
  onOpenAddProduct
}) => {
  if (!isOpen) return null;

  const role: Role = user?.role || 'CUSTOMER';
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'WAREHOUSE_MANAGER';
  const isStaff = isAdmin || isManager;

  const getCategoryIcon = (cid: string) => {
    switch (cid) {
      case 'cat_comp_01': return 'fa-server';
      case 'cat_elec_02': return 'fa-microchip';
      case 'cat_audio_03': return 'fa-headphones';
      case 'cat_net_04': return 'fa-network-wired';
      case 'cat_storage_05': return 'fa-hard-drive';
      case 'cat_display_06': return 'fa-desktop';
      case 'cat_periph_07': return 'fa-keyboard';
      case 'cat_power_08': return 'fa-bolt';
      case 'cat_daily_09': return 'fa-mug-hot';
      case 'cat_daily_10': return 'fa-pen-ruler';
      case 'cat_daily_11': return 'fa-heart-pulse';
      default: return 'fa-box';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none animate-fadeIn">
      {/* Dark backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      ></div>

      {/* Slide-in Sidebar Panel */}
      <div 
        className={`absolute inset-y-0 left-0 max-w-full flex ${
          theme === 'forest' 
            ? 'bg-[#061810] text-emerald-50 border-r border-emerald-900/60' 
            : theme === 'dark' 
              ? 'bg-[#0b0f19] text-slate-100 border-r border-slate-800' 
              : 'bg-white text-gray-900 border-r border-gray-200'
        } w-80 sm:w-96 shadow-2xl z-10 flex-col justify-between transition-all duration-300`}
      >
        
        {/* Top Header with User Profile & Role Indicator */}
        <div className={`${
          theme === 'forest' 
            ? 'bg-[#04100b] border-b border-emerald-950' 
            : theme === 'dark' 
              ? 'bg-[#080c14] border-b border-slate-800' 
              : 'bg-[#131921] text-white'
        } p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-md ring-2 ring-white/20">
              {user ? user.name.charAt(0).toUpperCase() : <i className="fa-solid fa-user text-sm"></i>}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold truncate max-w-[190px]">
                {user ? user.name : 'Welcome, Guest'}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                  isAdmin 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                    : isManager 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                      : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                }`}>
                  {isAdmin ? '👑 ADMIN (SUPERUSER)' : isManager ? '🏢 WAREHOUSE MGR' : '🛍️ CUSTOMER'}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer"
            title="Close Menu"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Quick Role Switcher for Demonstration / Viva Defense */}
        <div className="px-4 py-2 bg-black/10 dark:bg-black/30 border-b border-black/10 dark:border-white/5 flex items-center justify-between gap-1 text-[11px]">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Demo RBAC:</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => onSwitchRole('CUSTOMER')}
              className={`px-2 py-0.5 rounded font-mono text-[10px] transition ${
                role === 'CUSTOMER' 
                  ? 'bg-sky-600 text-white font-bold shadow-sm' 
                  : 'text-gray-400 hover:text-sky-400'
              }`}
              title="Switch to Customer Mode"
            >
              Cust
            </button>
            <button 
              onClick={() => onSwitchRole('WAREHOUSE_MANAGER')}
              className={`px-2 py-0.5 rounded font-mono text-[10px] transition ${
                role === 'WAREHOUSE_MANAGER' 
                  ? 'bg-emerald-600 text-white font-bold shadow-sm' 
                  : 'text-gray-400 hover:text-emerald-400'
              }`}
              title="Switch to Warehouse Manager Mode"
            >
              Mgr
            </button>
            <button 
              onClick={() => onSwitchRole('ADMIN')}
              className={`px-2 py-0.5 rounded font-mono text-[10px] transition ${
                role === 'ADMIN' 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                  : 'text-gray-400 hover:text-amber-400'
              }`}
              title="Switch to Admin Mode"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          
          {/* ========================================================
              SECTION 1: CUSTOMER VIEW (Visible to ALL roles)
             ======================================================== */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Digital Storefront
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 font-bold">
                Customer View
              </span>
            </div>

            <div className="space-y-0.5 text-xs">
              <button
                onClick={() => { onSelectCategory(''); onClose(); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${
                  selectedCategory === '' 
                    ? 'bg-amber-500/15 text-amber-500 font-bold' 
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <i className="fa-solid fa-boxes-stacked w-4 text-center text-amber-500"></i>
                  <span>All Hardware Categories</span>
                </div>
                <i className="fa-solid fa-angle-right text-[10px] opacity-40"></i>
              </button>

              {/* Dynamic Categories */}
              {categories.map(cat => (
                <button
                  key={cat.category_id}
                  onClick={() => { onSelectCategory(cat.category_id); onClose(); }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                    selectedCategory === cat.category_id 
                      ? 'bg-amber-500/15 text-amber-500 font-bold' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <i className={`fa-solid ${getCategoryIcon(cat.category_id)} w-4 text-center text-gray-400`}></i>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <i className="fa-solid fa-angle-right text-[10px] opacity-40"></i>
                </button>
              ))}

              {/* Customer Utilities */}
              <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-800 space-y-0.5">
                <button
                  onClick={() => { onOpenCart(); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-cart-shopping w-4 text-center text-amber-500"></i>
                    <span>Shopping Cart</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { onOpenWishlist(); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-heart w-4 text-center text-rose-500"></i>
                    <span>My Wishlist</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { onOpenOrders(); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-box-open w-4 text-center text-cyan-500"></i>
                    <span>My Orders & Tracking</span>
                  </div>
                  <i className="fa-solid fa-angle-right text-[10px] opacity-40"></i>
                </button>

                {onOpenAddressModal && (
                  <button
                    onClick={() => { onOpenAddressModal(); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-location-dot w-4 text-center text-amber-500"></i>
                      <span>Delivery Addresses (3 Saved)</span>
                    </div>
                    <i className="fa-solid fa-angle-right text-[10px] opacity-40"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================
              SECTION 2: WAREHOUSE & INVENTORY (Visible to MGR & ADMIN)
             ======================================================== */}
          {isStaff ? (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between px-2 mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Warehouse Operations
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                  {isAdmin ? 'Superuser' : 'Staff Access'}
                </span>
              </div>

              <div className="space-y-0.5 text-xs">
                {onOpenAddProduct && (
                  <button
                    onClick={() => { onOpenAddProduct(); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 font-bold transition mb-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <i className="fa-solid fa-plus w-4 text-center text-amber-500"></i>
                      <span>+ Add New Product to Catalog</span>
                    </div>
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">Catalog</span>
                  </button>
                )}

                <button
                  onClick={() => { onOpenOrders(); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 font-bold transition mb-1"
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-boxes-packing w-4 text-center text-sky-500"></i>
                    <span>All Customer Orders & Dispatch</span>
                  </div>
                  <span className="text-[10px] bg-sky-600 text-white font-bold px-1.5 py-0.5 rounded">Ledger</span>
                </button>

                <button
                  onClick={() => { onOpenRestock(); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-semibold transition"
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-warehouse w-4 text-center text-emerald-500"></i>
                    <span>Warehouse Hubs & Stock Restock</span>
                  </div>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </button>

                <div className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 my-1 space-y-1.5 text-[11px]">
                  <div className="font-bold flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <i className="fa-solid fa-warehouse text-emerald-500"></i>
                    <span>Active Hub Capacities:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-gray-500 dark:text-gray-400">
                    <div>HYD: <span className="text-emerald-500 font-bold">25,000 units</span></div>
                    <div>BLR: <span className="text-emerald-500 font-bold">30,000 units</span></div>
                    <div>MUM: <span className="text-emerald-500 font-bold">40,000 units</span></div>
                    <div>DEL: <span className="text-emerald-500 font-bold">20,000 units</span></div>
                  </div>
                </div>

                <button
                  onClick={() => { onOpenAcademicLab('telemetry'); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition text-gray-700 dark:text-gray-300"
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-lock w-4 text-center text-amber-500"></i>
                    <span>Redis Stock Lock Inspector</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-500">TTL 600s</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 opacity-60">
              <div className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800/40 text-[11px] text-gray-400 flex items-center gap-2">
                <i className="fa-solid fa-lock text-gray-400"></i>
                <span>Warehouse Tools (Manager / Admin Only)</span>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 3: ADMINISTRATOR & ACADEMIC HUB (ADMIN ONLY)
             ======================================================== */}
          {isAdmin ? (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between px-2 mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500">
                  Administrator & Academic Hub
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-black">
                  Full Superuser
                </span>
              </div>

              <div className="space-y-0.5 text-xs">
                <button
                  onClick={() => { onOpenAcademicLab('sql_workbench'); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 font-bold hover:from-amber-500/30 hover:to-orange-500/30 transition shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-graduation-cap w-4 text-center text-amber-400"></i>
                    <span>Academic DBMS Command Center</span>
                  </div>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </button>

                <button
                  onClick={() => { onOpenAcademicLab('acid_lab'); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition text-cyan-400"
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-shield-halved w-4 text-center"></i>
                    <span>ACID Simulation (Commit vs Rollback)</span>
                  </div>
                </button>

                <button
                  onClick={() => { onOpenAcademicLab('schema_erd'); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition text-purple-400"
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-diagram-project w-4 text-center"></i>
                    <span>Schema Explorer & ERD</span>
                  </div>
                </button>

                <button
                  onClick={() => { onOpenAcademicLab('lab_questions'); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition text-emerald-400"
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-list-check w-4 text-center"></i>
                    <span>35 University Lab Queries Benchmark</span>
                  </div>
                </button>

                <button
                  onClick={() => { onOpenAcademicLab('viva_guide'); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition text-amber-300"
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-chalkboard-user w-4 text-center"></i>
                    <span>Professor Viva Defense Cheat-Sheet</span>
                  </div>
                </button>

                <button
                  onClick={() => { onOpenTestRunner(); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition text-yellow-300 font-semibold"
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-vial-circle-check w-4 text-center"></i>
                    <span>System Automated Test Suite (TC01-14)</span>
                  </div>
                </button>

                <a
                  href="./docs/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition text-sky-400"
                >
                  <div className="flex items-center gap-2.5">
                    <i className="fa-solid fa-bolt w-4 text-center text-[#ffd814]"></i>
                    <span>Interactive OpenAPI Swagger Docs (/docs)</span>
                  </div>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </a>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 opacity-60">
              <div className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800/40 text-[11px] text-gray-400 flex items-center gap-2">
                <i className="fa-solid fa-shield-cat text-gray-400"></i>
                <span>Admin & Academic Lab (Admin Superuser Only)</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Area with Session Actions */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-black/5 dark:bg-black/20 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Theme: <strong className="capitalize text-gray-200">{theme}</strong></span>
            <span className="font-mono">v2.4 PostgreSQL • Redis</span>
          </div>

          {user ? (
            <button
              onClick={() => { onLogout(); onClose(); }}
              className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-lg font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              <span>Sign Out ({user.name.split(' ')[0]})</span>
            </button>
          ) : (
            <button
              onClick={() => { onOpenAuth(); onClose(); }}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-user"></i>
              <span>Sign In / Register</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
