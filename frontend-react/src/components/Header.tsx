import React from 'react';
import { User, Category, Address } from '../types';

interface HeaderProps {
  user: User | null;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark' | 'forest';
  onSelectTheme: (theme: 'light' | 'dark' | 'forest') => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  onOpenAcademicLab?: () => void;
  onOpenRestock?: () => void;
  onOpenSidebar?: () => void;
  onOpenAddressModal?: () => void;
  activeAddress?: Address | null;
  onOpenAddProduct?: () => void;
  isSemanticMode?: boolean;
  onToggleSemanticMode?: () => void;
  onOpenSemanticInspector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenAuth,
  onLogout,
  theme,
  onSelectTheme,
  onOpenAcademicLab,
  onOpenRestock,
  onOpenSidebar,
  onOpenAddressModal,
  activeAddress,
  onOpenAddProduct,
  isSemanticMode = false,
  onToggleSemanticMode,
  onOpenSemanticInspector
}) => {
  return (
    <header className={`${
      theme === 'forest' 
        ? 'bg-[#04100b] border-b border-emerald-950/80 shadow-emerald-950/20' 
        : theme === 'dark' 
          ? 'bg-[#080c14] border-b border-slate-800/80 shadow-black/40' 
          : 'bg-[#131921] border-b border-transparent'
    } text-white sticky top-0 z-40 select-none shadow-md transition-colors duration-250`}>
      <div className="max-w-[1700px] mx-auto flex items-center gap-2 px-3 py-1.5 md:gap-4 md:px-4">
        
        {/* Hamburger Menu Toggle (RBAC Sidebar) */}
        {onOpenSidebar && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="amazon-nav-item flex items-center justify-center p-2 rounded hover:border-white text-white cursor-pointer mr-1"
            title="Open RBAC Navigation Sidebar"
          >
            <i className="fa-solid fa-bars text-lg text-[#febd69]"></i>
          </button>
        )}

        {/* Logo */}
        <div 
          onClick={() => { onSelectCategory(''); onSearchChange(''); }}
          className="amazon-nav-item flex items-center gap-1 group py-1"
        >
          <div className="flex items-center text-xl md:text-2xl font-black tracking-tight">
            <span className="text-white">Nex</span>
            <span className="text-[#febd69]">Commerce</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono hidden sm:inline -mt-2 ml-0.5">.dist</span>
        </div>

        {/* Deliver To (Opens Address Modal) */}
        <div 
          onClick={onOpenAddressModal}
          className="amazon-nav-item hidden lg:flex items-center gap-1.5 text-xs cursor-pointer hover:border-white transition"
          title="Click to choose from saved delivery addresses or add new location"
        >
          <i className="fa-solid fa-location-dot text-[#febd69] text-base mt-1"></i>
          <div className="leading-tight">
            <span className="text-gray-400 text-[11px] block">
              Deliver to {activeAddress?.fullName ? activeAddress.fullName.split(' ')[0] : (user ? user.name.split(' ')[0] : 'Campus')}
            </span>
            <span className="font-bold text-white text-xs">
              {activeAddress ? `${activeAddress.city} ${activeAddress.postalCode}` : 'KL University 500075'}
            </span>
          </div>
        </div>

        {/* Search Bar with AI Semantic Mode */}
        <div className={`flex-1 flex items-center h-10 rounded-md overflow-hidden bg-white shadow-inner transition-all ${
          isSemanticMode ? 'ring-2 ring-purple-600 bg-purple-50/20' : 'focus-within:ring-2 focus-within:ring-[#e47911]'
        }`}>
          <select 
            value={selectedCategory} 
            onChange={(e) => onSelectCategory(e.target.value)}
            className="h-full bg-[#f3f3f3] hover:bg-[#dadada] text-[#0f1111] text-xs px-2.5 border-r border-[#cdcdcd] outline-none cursor-pointer hidden md:block max-w-[150px] truncate font-medium"
          >
            <option value="">All Departments</option>
            {categories.map(c => (
              <option key={c.category_id} value={c.category_id}>{c.name}</option>
            ))}
          </select>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={isSemanticMode ? "✨ Describe intent (e.g. 'fast GPU for deep learning', 'quiet studio sound')..." : "Search Amazon Hardware, Nodes, GPUs, Storage, ASINs..."}
            className="flex-1 h-full px-3 text-[#0f1111] text-sm outline-none placeholder:text-gray-500 font-medium"
          />

          {/* AI Semantic Toggle Button */}
          {onToggleSemanticMode && (
            <button
              type="button"
              onClick={onToggleSemanticMode}
              className={`h-full px-2.5 flex items-center gap-1.5 text-xs font-bold transition border-l border-gray-200 cursor-pointer ${
                isSemanticMode
                  ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                  : 'bg-gray-100 text-purple-700 hover:bg-purple-50'
              }`}
              title="Toggle AI Semantic Vector Search (pgvector cosine similarity)"
            >
              <i className={`fa-solid fa-brain ${isSemanticMode ? 'animate-pulse text-amber-300' : 'text-purple-600'}`}></i>
              <span className="hidden sm:inline">AI Semantic</span>
            </button>
          )}

          {/* Semantic Inspector Button */}
          {onOpenSemanticInspector && (
            <button
              type="button"
              onClick={onOpenSemanticInspector}
              className="h-full px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border-l border-purple-200 text-xs hidden lg:flex items-center justify-center cursor-pointer transition"
              title="Inspect 16-Dimensional Vectors & Cosine Math"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-sm text-purple-600"></i>
            </button>
          )}

          <button 
            type="button"
            className="h-full px-5 bg-[#febd69] hover:bg-[#f3a847] text-[#131921] transition flex items-center justify-center cursor-pointer shrink-0"
            title="Search"
          >
            <i className="fa-solid fa-magnifying-glass text-lg"></i>
          </button>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-1 md:gap-2">

          {/* Academic DBMS Lab Button (Admin Only) */}
          {(user?.role === 'ADMIN' && onOpenAcademicLab) && (
            <button
              onClick={onOpenAcademicLab}
              className="amazon-nav-item flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-amber-500/15 border border-amber-500/50 rounded px-2.5 py-1.5 hover:bg-amber-500/25 transition active:scale-95 cursor-pointer"
              title="Open Academic DBMS Command Center & Viva Evaluation Lab (Admin Only)"
            >
              <i className="fa-solid fa-shield-halved text-base text-amber-400"></i>
              <span className="hidden xl:inline text-[11px]">Admin Console</span>
            </button>
          )}

          {/* Warehouse Console Button (Manager Only) */}
          {(user?.role === 'WAREHOUSE_MANAGER' && onOpenRestock) && (
            <button
              onClick={onOpenRestock}
              className="amazon-nav-item flex items-center gap-1.5 text-xs text-emerald-300 font-bold bg-emerald-500/15 border border-emerald-500/50 rounded px-2.5 py-1.5 hover:bg-emerald-500/25 transition active:scale-95 cursor-pointer"
              title="Open Warehouse Hubs & Restock (Manager Only)"
            >
              <i className="fa-solid fa-warehouse text-base text-emerald-400"></i>
              <span className="hidden xl:inline text-[11px]">Warehouse Hubs</span>
            </button>
          )}

          {/* 3-Mode Theme Selector (Light / Dark / Forest) */}
          <div className="flex items-center bg-black/40 border border-slate-700/60 rounded-lg p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => onSelectTheme('light')}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition ${
                theme === 'light'
                  ? 'bg-[#ffd814] text-[#0f1111] shadow-sm font-bold scale-[1.02]'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Switch to Light Theme"
            >
              <i className="fa-solid fa-sun text-xs text-amber-500"></i>
              <span className="hidden xl:inline text-[11px]">Light</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTheme('dark')}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition ${
                theme === 'dark'
                  ? 'bg-sky-500 text-white shadow-sm font-bold scale-[1.02]'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Switch to OLED Dark Theme"
            >
              <i className="fa-solid fa-moon text-xs text-sky-200"></i>
              <span className="hidden xl:inline text-[11px]">Dark</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTheme('forest')}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition ${
                theme === 'forest'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-black scale-[1.02]'
                  : 'text-gray-400 hover:text-emerald-300'
              }`}
              title="Switch to Forest Theme"
            >
              <i className="fa-solid fa-tree text-xs text-emerald-400"></i>
              <span className="hidden xl:inline text-[11px]">Forest</span>
            </button>
          </div>

          {/* Account & Lists */}
          {user ? (
            <div className="amazon-nav-item group relative">
              <span className="text-[11px] text-gray-300 leading-tight">Hello, {user.name.split(' ')[0]}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  Account & Lists <i className="fa-solid fa-caret-down text-[10px]"></i>
                </span>
                <span className={`text-[10px] uppercase font-mono px-1 py-0.5 rounded font-bold ml-1 ${
                  user.role === 'ADMIN' ? 'bg-amber-500 text-slate-950' : user.role === 'WAREHOUSE_MANAGER' ? 'bg-emerald-600 text-white' : 'bg-sky-600 text-white'
                }`}>
                  {user.role === 'ADMIN' ? 'ADMIN' : user.role === 'WAREHOUSE_MANAGER' ? 'MGR' : 'USER'}
                </span>
              </div>
              {/* Dropdown Menu on hover */}
              <div className="absolute top-full right-0 w-60 bg-white text-[#0f1111] shadow-2xl border border-gray-200 rounded-b-lg p-3 hidden group-hover:block z-50 animate-fadeIn">
                <div className="text-xs pb-2 border-b border-gray-200">
                  <div className="font-bold text-sm truncate">{user.name}</div>
                  <div className="text-gray-500 truncate text-[11px]">{user.email}</div>
                  <div className="text-emerald-700 font-semibold text-[11px] mt-0.5">Role: {user.role}</div>
                </div>
                <div className="py-2 space-y-2 text-xs">
                  <div onClick={onOpenOrders} className="hover:text-[#e47911] hover:underline cursor-pointer flex items-center justify-between">
                    <span>{user.role === 'ADMIN' ? '👑 Master Orders Ledger' : user.role === 'WAREHOUSE_MANAGER' ? '🏢 Fulfillment & Orders' : '🛍️ Your Orders & Tracking'}</span>
                    <i className="fa-solid fa-angle-right text-[10px] text-gray-400"></i>
                  </div>
                  {user.role === 'CUSTOMER' && (
                    <div onClick={onOpenWishlist} className="hover:text-[#e47911] hover:underline cursor-pointer flex items-center justify-between">
                      <span>Your Wishlist ({wishlistCount})</span>
                      <i className="fa-solid fa-heart text-[10px] text-rose-500"></i>
                    </div>
                  )}
                  {onOpenAddressModal && (
                    <div onClick={onOpenAddressModal} className="hover:text-[#e47911] hover:underline cursor-pointer flex items-center justify-between">
                      <span>Delivery Addresses (3 Saved)</span>
                      <i className="fa-solid fa-location-dot text-[10px] text-amber-500"></i>
                    </div>
                  )}
                  {(user.role === 'ADMIN' || user.role === 'WAREHOUSE_MANAGER') && onOpenAddProduct && (
                    <div onClick={onOpenAddProduct} className="hover:text-[#e47911] hover:underline cursor-pointer text-amber-600 font-bold flex items-center justify-between">
                      <span>+ Add New Product</span>
                      <i className="fa-solid fa-plus text-[10px]"></i>
                    </div>
                  )}
                  {(user.role === 'ADMIN' || user.role === 'WAREHOUSE_MANAGER') && onOpenRestock && (
                    <div onClick={onOpenRestock} className="hover:text-[#e47911] hover:underline cursor-pointer text-emerald-700 font-semibold flex items-center justify-between">
                      <span>Warehouse Hubs & Restock</span>
                      <i className="fa-solid fa-warehouse text-[10px]"></i>
                    </div>
                  )}
                  {user.role === 'ADMIN' && onOpenAcademicLab && (
                    <div onClick={onOpenAcademicLab} className="hover:text-[#e47911] hover:underline cursor-pointer text-amber-700 font-semibold flex items-center justify-between">
                      <span>Academic DBMS Lab & SQL</span>
                      <i className="fa-solid fa-graduation-cap text-[10px]"></i>
                    </div>
                  )}
                  <a href="./docs/" target="_blank" rel="noreferrer" className="flex items-center justify-between hover:text-[#e47911] hover:underline pt-1 border-t border-gray-100">
                    <span className="flex items-center gap-1.5"><i className="fa-solid fa-book text-cyan-600"></i> Academic Docs Hub</span>
                    <span className="text-[10px] text-gray-400 font-mono">./docs</span>
                  </a>
                  <a href="./docs/swagger.html" target="_blank" rel="noreferrer" className="flex items-center justify-between hover:text-[#e47911] hover:underline">
                    <span className="flex items-center gap-1.5"><i className="fa-solid fa-code text-[#007185]"></i> Interactive Swagger API</span>
                    <span className="text-[10px] text-amber-500 font-mono font-bold">OpenAPI</span>
                  </a>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <button 
                    onClick={onLogout}
                    className="w-full text-center py-1.5 bg-[#f0f2f2] hover:bg-[#e3e6e6] border border-[#d5d9d9] rounded text-xs font-bold cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div onClick={onOpenAuth} className="amazon-nav-item">
              <span className="text-[11px] text-gray-300 leading-tight">Hello, Sign in</span>
              <span className="text-xs font-bold text-white flex items-center gap-1">
                Account & Lists <i className="fa-solid fa-caret-down text-[10px]"></i>
              </span>
            </div>
          )}

          {/* Orders */}
          <div 
            onClick={onOpenOrders} 
            className="amazon-nav-item hidden sm:flex cursor-pointer"
            title={user?.role === 'ADMIN' ? 'Open Master Orders Ledger' : user?.role === 'WAREHOUSE_MANAGER' ? 'Open Dispatch & Orders' : 'View Your Orders'}
          >
            <span className="text-[11px] text-gray-300 leading-tight">
              {user?.role === 'ADMIN' ? 'Master' : user?.role === 'WAREHOUSE_MANAGER' ? 'Dispatch' : 'Returns'}
            </span>
            <span className="text-xs font-bold text-white">& Orders</span>
          </div>

          {/* Wishlist Header Icon */}
          <div 
            onClick={onOpenWishlist} 
            className="amazon-nav-item relative flex items-center gap-1"
            title="Your Wishlist"
          >
            <div className="relative">
              <i className="fa-solid fa-heart text-xl text-rose-500 hover:scale-110 transition-transform"></i>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white font-black text-[10px] rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center ring-1 ring-[#131921]">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-white hidden md:inline ml-1">Wishlist</span>
          </div>

          {/* Cart Icon & Count */}
          <div 
            onClick={onOpenCart} 
            className="amazon-nav-item relative flex items-center gap-1.5 cursor-pointer"
            title="Shopping Cart"
          >
            <div className="relative flex items-center">
              <i className="fa-solid fa-cart-shopping text-2xl text-[#febd69]"></i>
              <span className="absolute -top-1.5 left-3 text-[#f08804] font-black text-sm text-center min-w-[18px]">
                {cartCount}
              </span>
            </div>
            <span className="text-xs font-bold text-white hidden md:inline mt-2">Cart</span>
          </div>

        </div>

      </div>
    </header>
  );
};
