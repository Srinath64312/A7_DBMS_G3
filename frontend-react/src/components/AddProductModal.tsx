import React, { useState } from 'react';
import { Product, Category, Warehouse, User } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  warehouses: Warehouse[];
  user: User | null;
  onProductCreated: (newProduct: Product) => void;
}

// Preset hardware image shortcuts for quick creation
const PRESET_HARDWARE_IMAGES = [
  { label: 'Enterprise Server', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80' },
  { label: 'NVIDIA GPU', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80' },
  { label: 'Pro Studio Audio', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' },
  { label: 'IoT & Single-Board', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80' },
  { label: 'NVMe Storage', url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80' },
  { label: 'Curved Display', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80' }
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  categories,
  warehouses,
  user,
  onProductCreated
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState(`SKU-HW-${Math.floor(1000 + Math.random() * 9000)}`);
  const [categoryId, setCategoryId] = useState(categories[0]?.category_id || 'cat_comp_01');
  const [price, setPrice] = useState('299.99');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_HARDWARE_IMAGES[0].url);
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.warehouse_id || 'wh_hyd_01');
  const [initialStock, setInitialStock] = useState('50');
  const [tags, setTags] = useState('hardware, high-performance, enterprise');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateSku = () => {
    const catCode = categoryId.replace('cat_', '').substring(0, 3).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setSku(`SKU-${catCode}-${rand}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim() || !price) {
      setErrorMsg('Please provide product name, SKU, and price.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const priceNum = parseFloat(price);
    const stockNum = parseInt(initialStock) || 25;
    const catObj = categories.find(c => c.category_id === categoryId);

    const generatedId = `prod_custom_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`;

    const newProd: Product = {
      product_id: generatedId,
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category_id: categoryId,
      category_name: catObj?.name || 'General Hardware',
      price: priceNum,
      description: description.trim() || `${name.trim()} - High-performance enterprise hardware component designed for distributed computing platforms.`,
      image_url: imageUrl.trim() || PRESET_HARDWARE_IMAGES[0].url,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      total_stock: stockNum,
      warehouse_stock: {
        [warehouseId]: stockNum
      }
    };

    // Try sending to live backend API if available
    try {
      const token = user?.token || user?.access_token || sessionStorage.getItem('nex_token') || '';
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProd.name,
          category_id: newProd.category_id,
          sku: newProd.sku,
          price: newProd.price,
          description: newProd.description,
          image_url: newProd.image_url,
          tags: newProd.tags,
          initial_stock: stockNum,
          warehouse_id: warehouseId
        })
      });

      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const createdFromBackend = await res.json();
        onProductCreated({
          ...newProd,
          product_id: createdFromBackend.product_id || newProd.product_id
        });
        onClose();
        return;
      }
    } catch (_err) {
      // Backend unavailable or running statically on GitHub Pages
    }

    // Client-side fallback for GitHub Pages / static hosting:
    onProductCreated(newProd);
    onClose();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-[#d5d9d9] dark:border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-[#0f1111] dark:text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-sm">
              <i className="fa-solid fa-plus"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">Add New Product to Store Catalog</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  CATALOG ADMIN
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Publish a new hardware product with pricing, SKU, and regional warehouse allocation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-lg flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
              Product Title / Hardware Name: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AMD Ryzen Threadripper PRO 7995WX 96-Core"
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-xs"
            />
          </div>

          {/* Category & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                Department / Category: <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-xs"
              >
                {categories.map(c => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                SKU Identifier: <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="flex-1 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-xs font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="Generate unique random SKU"
                >
                  <i className="fa-solid fa-arrows-rotate text-amber-500"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Price, Initial Stock & Warehouse */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                Price (USD $): <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.99"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                Initial Stock Units:
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
                Assigned Warehouse:
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-xs"
              >
                {warehouses.map(w => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>
                    {w.name} ({w.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Image URL & Quick Presets */}
          <div>
            <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
              Product Image URL:
            </label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-xs font-mono"
            />
            {/* Quick preset selector */}
            <div className="mt-2">
              <span className="text-[11px] text-gray-400 block mb-1">Or choose a preset hardware image:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_HARDWARE_IMAGES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    className={`px-2 py-1 rounded text-[11px] border transition cursor-pointer ${
                      imageUrl === p.url
                        ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold'
                        : 'border-slate-300 dark:border-slate-700 text-gray-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
              Technical Description & Hardware Specs:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed specifications, core count, memory bandwidth, interface, and compatibility..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-xs"
            ></textarea>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-bold mb-1 text-gray-700 dark:text-gray-300">
              Search Tags (comma-separated):
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. server, cloud, pcie5, ddr5"
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="a-button a-button-subtle px-4 py-2 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="a-button a-button-primary px-6 py-2 font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Publishing Product...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>Publish to Store Catalog</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
