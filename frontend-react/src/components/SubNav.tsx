import React from 'react';
import { User, Category } from '../types';

interface SubNavProps {
  user: User | null;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  onOpenTestRunner: () => void;
  onOpenRestock: () => void;
}

export const SubNav: React.FC<SubNavProps> = ({
  user,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenTestRunner,
  onOpenRestock
}) => {
  const isStaff = user && (user.role === 'ADMIN' || user.role === 'WAREHOUSE_MANAGER');

  return (
    <nav className="bg-[#232f3e] text-white text-xs select-none shadow-sm">
      <div className="max-w-[1700px] mx-auto flex items-center gap-1 px-4 overflow-x-auto whitespace-nowrap py-1">
        
        {/* All / Clear Filter */}
        <button
          onClick={() => onSelectCategory('')}
          className={`amazon-nav-item flex items-center gap-1.5 py-1 px-2.5 font-bold ${
            selectedCategory === '' ? 'border-white bg-[#37475a]' : ''
          }`}
        >
          <i className="fa-solid fa-bars text-sm"></i>
          <span>All Departments</span>
        </button>

        {/* Dynamic Categories */}
        {categories.slice(0, 5).map(cat => (
          <button
            key={cat.category_id}
            onClick={() => onSelectCategory(cat.category_id)}
            className={`amazon-nav-item py-1 px-2 ${
              selectedCategory === cat.category_id ? 'border-white bg-[#37475a] font-bold' : 'text-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}

        <div className="h-4 w-[1px] bg-slate-600 mx-1 hidden md:block"></div>

        {/* System & Test Suite Buttons */}
        <button
          onClick={onOpenTestRunner}
          className="amazon-nav-item py-1 px-2.5 text-amber-300 font-semibold flex items-center gap-1 hover:text-white"
        >
          <i className="fa-solid fa-vial-circle-check text-xs"></i>
          <span>Live Test Runner (TC01-TC14)</span>
        </button>

        {isStaff && (
          <button
            onClick={onOpenRestock}
            className="amazon-nav-item py-1 px-2.5 text-emerald-400 font-semibold flex items-center gap-1 hover:text-white"
          >
            <i className="fa-solid fa-boxes-stacked text-xs"></i>
            <span>Inventory Restock</span>
          </button>
        )}

        <a
          href="/docs"
          target="_blank"
          rel="noreferrer"
          className="amazon-nav-item py-1 px-2 text-cyan-300 flex items-center gap-1 hover:text-white"
        >
          <i className="fa-solid fa-code text-xs"></i>
          <span>OpenAPI / Swagger</span>
        </a>

        {/* Architecture Badges */}
        <div className="ml-auto hidden xl:flex items-center gap-2 text-[10px] text-gray-300">
          <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            PostgreSQL (ACID)
          </span>
          <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            MongoDB (Catalog)
          </span>
          <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Redis (Locks & Cache)
          </span>
        </div>

      </div>
    </nav>
  );
};
