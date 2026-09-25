import React from 'react';
import { User, Category } from '../types';

interface SubNavProps {
  user: User | null;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  onOpenTestRunner: () => void;
  onOpenRestock: () => void;
  onOpenAcademicLab: (tab?: 'sql_workbench' | 'lab_questions' | 'schema_erd' | 'acid_lab' | 'telemetry' | 'viva_guide') => void;
  theme?: 'light' | 'dark' | 'forest';
  onOpenSidebar?: () => void;
}

export const SubNav: React.FC<SubNavProps> = ({
  user,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenRestock,
  onOpenAcademicLab,
  theme = 'light',
  onOpenSidebar
}) => {
  const role = user?.role || 'CUSTOMER';
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'WAREHOUSE_MANAGER';
  const isStaff = isAdmin || isManager;

  return (
    <nav className={`${
      theme === 'forest' 
        ? 'bg-[#081d14] border-b border-emerald-950/90' 
        : theme === 'dark' 
          ? 'bg-[#0f172a] border-b border-slate-800/90' 
          : 'bg-[#232f3e]'
    } text-white text-xs select-none shadow-sm transition-colors duration-250`}>
      <div className="max-w-[1750px] mx-auto flex items-center justify-between px-4 py-1 gap-2">
        
        {/* Left Side: All Departments & Product Categories */}
        <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
          {/* All Departments / Open RBAC Sidebar */}
          <button
            onClick={onOpenSidebar || (() => onSelectCategory(''))}
            className="amazon-nav-item flex items-center gap-1.5 py-1 px-2.5 font-bold hover:border-white cursor-pointer shrink-0"
            title="Open Role-Based Menu (Customer / Staff / Admin)"
          >
            <i className="fa-solid fa-bars text-sm text-[#febd69]"></i>
            <span>All Departments</span>
          </button>

          {/* Clean Department Categories */}
          {categories.map(cat => (
            <button
              key={cat.category_id}
              onClick={() => onSelectCategory(cat.category_id)}
              className={`amazon-nav-item py-1 px-2.5 text-xs transition shrink-0 ${
                selectedCategory === cat.category_id 
                  ? 'border-white bg-[#37475a] font-bold text-white' 
                  : 'text-gray-200 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Right Side: Role-Aware Context Bar */}
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <button
              onClick={() => onOpenAcademicLab && onOpenAcademicLab('sql_workbench')}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 text-amber-300 font-bold px-2.5 py-1 rounded text-[11px] transition shadow-sm active:scale-95"
              title="Open Academic DBMS Command Center (Admin Only)"
            >
              <i className="fa-solid fa-shield-halved text-amber-400"></i>
              <span>Admin Console</span>
            </button>
          )}

          {isManager && (
            <button
              onClick={onOpenRestock}
              className="hidden sm:flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-bold px-2.5 py-1 rounded text-[11px] transition shadow-sm active:scale-95"
              title="Open Warehouse Hubs & Restock (Manager Only)"
            >
              <i className="fa-solid fa-warehouse text-emerald-400"></i>
              <span>Warehouse Hubs</span>
            </button>
          )}

          {/* Delivery Campus Badge for Customers */}
          {!isStaff && (
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-gray-300 font-medium px-2 py-0.5 rounded bg-black/20 border border-white/5">
              <i className="fa-solid fa-location-dot text-amber-400 text-xs"></i>
              <span>KL University Aziz Nagar Campus</span>
              <span className="text-[10px] text-emerald-400 font-bold ml-1">• Free Express Delivery</span>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};
