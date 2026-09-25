import React, { useEffect, useState } from 'react';
import { Order, User } from '../types';

interface OrdersModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

export const OrdersModal: React.FC<OrdersModalProps> = ({
  isOpen,
  user,
  onClose
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    setIsLoading(true);
    const token = user.token || user.access_token || '';

    const localOrders = JSON.parse(localStorage.getItem('nex_orders') || '[]');

    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json')) ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        } else {
          setOrders(localOrders);
        }
      })
      .catch(err => {
        console.warn('Orders fetch fallback:', err);
        setOrders(localOrders);
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-[#d5d9d9] dark:border-slate-800 rounded-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 text-[#0f1111] dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-box text-[#febd69] text-xl"></i>
            <h3 className="text-base sm:text-lg font-bold">Your Orders & Logistics</h3>
            <span className="text-xs text-gray-500">({orders.length} orders)</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black dark:hover:text-white text-lg p-1"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Orders list */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <i className="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
            <p className="text-xs">Loading order ledger from PostgreSQL...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 space-y-2 text-gray-500">
            <i className="fa-solid fa-receipt text-4xl text-gray-300 dark:text-slate-700"></i>
            <p className="font-semibold text-sm">No orders found.</p>
            <p className="text-xs">Your fulfilled purchases and ACID ledger entries will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const statusColor = 
                order.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                order.status === 'DELIVERED' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                'bg-amber-100 text-amber-800 border-amber-300';

              return (
                <div
                  key={order.order_id}
                  className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 text-xs">
                    <div>
                      <span className="text-gray-500">Order placed: </span>
                      <span className="font-bold">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Order ID: </span>
                      <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{order.order_id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total: </span>
                      <span className="font-bold text-[#b12704] dark:text-rose-400">${order.total_amount.toFixed(2)}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${statusColor}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Tracking Timeline Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1">
                      <span className={order.status ? 'text-emerald-600' : ''}>Ordered</span>
                      <span className={['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-emerald-600' : ''}>Confirmed</span>
                      <span className={['SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-emerald-600' : ''}>Shipped</span>
                      <span className={order.status === 'DELIVERED' ? 'text-emerald-600' : ''}>Delivered</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
                      <div className={`h-full bg-emerald-500 transition-all ${
                        order.status === 'DELIVERED' ? 'w-full' :
                        order.status === 'SHIPPED' ? 'w-3/4' :
                        order.status === 'CONFIRMED' ? 'w-1/2' : 'w-1/4'
                      }`}></div>
                    </div>
                  </div>

                  {/* Delivery address */}
                  <div className="text-[11px] text-gray-500">
                    <i className="fa-solid fa-location-dot mr-1 text-[#febd69]"></i>
                    Shipping to: <span className="font-medium text-gray-700 dark:text-gray-300">{order.shipping_address}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
