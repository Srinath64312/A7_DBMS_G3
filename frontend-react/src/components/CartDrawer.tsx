import React from 'react';
import { CartItem } from '../types';
import { getProductImage } from '../utils/images';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cart,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-[#d5d9d9] dark:border-slate-800 h-full flex flex-col shadow-2xl text-[#0f1111] dark:text-slate-100">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-cart-shopping text-amber-500 text-lg"></i>
            <h3 className="font-bold text-base">Shopping Cart</h3>
            <span className="text-xs text-gray-500">({totalCount} items)</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black dark:hover:text-white p-1 text-lg"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Free delivery badge */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 px-4 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 border-b border-emerald-200 dark:border-emerald-900">
          <i className="fa-solid fa-circle-check text-emerald-600"></i>
          <span>Your order qualifies for <strong>FREE Delivery</strong> via Prime Logistics.</span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3 text-gray-500">
              <i className="fa-solid fa-cart-arrow-down text-5xl text-gray-300 dark:text-slate-700"></i>
              <p className="font-bold text-sm">Your Amazon Cart is empty</p>
              <p className="text-xs">Browse the catalog to add servers, GPUs, and network hardware.</p>
            </div>
          ) : (
            cart.map(item => {
              const img = getProductImage({
                product_id: item.product_id,
                name: item.name,
                image_url: item.image_url
              });

              return (
                <div
                  key={item.product_id}
                  className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  <img
                    src={img}
                    alt={item.name}
                    className="w-16 h-16 object-contain bg-white dark:bg-slate-900 rounded p-1 shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-bold truncate">{item.name}</h4>
                    <div className="text-[#b12704] dark:text-rose-400 font-bold">${item.price.toFixed(2)}</div>
                    <div className="text-[10px] text-gray-500 truncate">
                      Fulfillment: {item.warehouse_name || 'Hyderabad Hub'}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900">
                        <button
                          onClick={() => onUpdateQty(item.product_id, Math.max(1, item.quantity - 1))}
                          className="px-2 py-0.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQty(item.product_id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product_id)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-3">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Subtotal ({totalCount} items):</span>
              <span className="text-[#b12704] dark:text-rose-400 text-base">${totalAmount.toFixed(2)}</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="a-button a-button-primary w-full py-2.5 text-xs font-bold shadow-md"
            >
              <i className="fa-solid fa-lock mr-1"></i> Proceed to Checkout ({totalCount} items)
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
