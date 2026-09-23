import React, { useState } from 'react';
import { Product, Warehouse, User } from '../types';

interface RestockModalProps {
  isOpen: boolean;
  products: Product[];
  warehouses: Warehouse[];
  user: User | null;
  onClose: () => void;
  onRestockSuccess: () => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  products,
  warehouses,
  user,
  onClose,
  onRestockSuccess
}) => {
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.product_id || '');
  const [selectedWarehouse, setSelectedWarehouse] = useState(warehouses[0]?.warehouse_id || 'wh_hyd_01');
  const [delta, setDelta] = useState(50);
  const [note, setNote] = useState('Routine Regional Warehouse Restock');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/inventory', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token || user.access_token || ''}`
        },
        body: JSON.stringify({
          product_id: selectedProduct || products[0]?.product_id,
          warehouse_id: selectedWarehouse || 'wh_hyd_01',
          delta: Number(delta),
          note
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update stock.');
      }

      setMessage({ text: `Successfully added ${delta} units to stock!`, type: 'success' });
      onRestockSuccess();
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1200);
    } catch (err: any) {
      setMessage({ text: err.message || 'Restock failed.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-[#d5d9d9] dark:border-slate-800 rounded-lg max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 text-[#0f1111] dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-boxes-stacked text-[#febd69] text-xl"></i>
            <h3 className="text-base font-bold">Restock Regional Warehouse</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black dark:hover:text-white text-lg p-1"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {message && (
          <div
            className={`p-2.5 rounded text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-rose-50 text-rose-800 border border-rose-300'
            }`}
          >
            <i className={`fa-solid ${message.type === 'success' ? 'fa-check' : 'fa-triangle-exclamation'}`}></i>
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleRestock} className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Target Product:</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
            >
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>
                  {p.name} (${p.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Warehouse Facility:</label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
            >
              {warehouses.map(w => (
                <option key={w.warehouse_id} value={w.warehouse_id}>
                  {w.name} ({w.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Units to Add:</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Audit Log Note:</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="a-button a-button-primary w-full py-2 text-xs font-bold"
            >
              {isSubmitting ? 'Updating Inventory...' : 'Commit Stock Restock'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
