import React from 'react';
import { WishlistItem } from '../types';
import { getProductImage } from '../utils/images';

interface WishlistModalProps {
  isOpen: boolean;
  wishlist: WishlistItem[];
  onClose: () => void;
  onRemoveItem: (productId: string) => void;
  onClearAll: () => void;
  onAddToCart: (item: WishlistItem) => void;
  onBuyNow: (item: WishlistItem) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  wishlist,
  onClose,
  onRemoveItem,
  onClearAll,
  onAddToCart,
  onBuyNow,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-[#d5d9d9] dark:border-slate-800 rounded-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 text-[#0f1111] dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-heart text-rose-500 text-lg"></i>
            <h3 className="text-base sm:text-lg font-bold">Your Wishlist & Saved Items</h3>
            <span className="text-xs text-gray-500">({wishlist.length} items)</span>
          </div>
          <div className="flex items-center gap-2">
            {wishlist.length > 0 && (
              <button
                onClick={onClearAll}
                className="a-button a-button-subtle text-xs py-1 px-3 text-rose-600 hover:text-rose-700 dark:bg-slate-800 dark:border-slate-700"
              >
                <i className="fa-solid fa-trash-can"></i> Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black dark:hover:text-white text-lg p-1"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Wishlist Items List */}
        <div className="space-y-3">
          {wishlist.length === 0 ? (
            <div className="text-center py-12 space-y-3 text-gray-500">
              <i className="fa-regular fa-heart text-5xl text-gray-300 dark:text-slate-700"></i>
              <p className="font-semibold text-sm">Your Wishlist is currently empty.</p>
              <p className="text-xs max-w-md mx-auto">
                Explore our enterprise compute and cloud hardware catalog and click the heart icon on any card to save items for later.
              </p>
            </div>
          ) : (
            wishlist.map(item => {
              const img = getProductImage({
                product_id: item.product_id,
                name: item.name,
                image_url: item.image_url || (item.product?.image_url)
              });

              return (
                <div
                  key={item.product_id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={img}
                      alt={item.name}
                      className="w-16 h-16 object-contain bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 p-1 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold truncate">{item.name}</h4>
                      <div className="text-xs font-bold text-[#b12704] dark:text-rose-400 mt-0.5">
                        ${Number(item.price || 0).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-slate-400 font-mono">
                        ID: {item.product_id}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onAddToCart(item)}
                      className="a-button a-button-primary text-xs py-1 px-3"
                    >
                      <i className="fa-solid fa-cart-shopping"></i> Add to Cart
                    </button>
                    <button
                      onClick={() => onBuyNow(item)}
                      className="a-button a-button-secondary text-xs py-1 px-3 font-semibold"
                    >
                      <i className="fa-solid fa-bolt"></i> Buy Now
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.product_id)}
                      className="text-rose-500 hover:text-rose-700 p-1.5 transition ml-1"
                      title="Remove from wishlist"
                    >
                      <i className="fa-solid fa-trash-can text-sm"></i>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
