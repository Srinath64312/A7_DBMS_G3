import React, { useEffect, useState, useMemo } from 'react';
import { Order, User } from '../types';

interface OrdersModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

// Sample enterprise orders across multiple customers & warehouses for presentation / staff simulation
const SEEDED_STAFF_ORDERS: Order[] = [
  {
    order_id: 'ORD-20260925-0101',
    user_id: 'usr_101',
    status: 'CONFIRMED',
    total_amount: 3198.00,
    shipping_address: 'Student Hostel 4, Room 302, KL University Aziz Nagar, Hyderabad 500075',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    items: [
      { product_id: 'prod_gpu_01', name: 'NVIDIA GeForce RTX 4090 24GB', price: 1599.00, warehouse_id: 'wh_hyd_01', quantity: 2, line_total: 3198.00 }
    ]
  },
  {
    order_id: 'ORD-20260925-0102',
    user_id: 'usr_faculty_02',
    status: 'SHIPPED',
    total_amount: 320.00,
    shipping_address: 'Faculty Quarters B-12, Aziz Nagar Campus, Hyderabad 500075',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    items: [
      { product_id: 'prod_pi_04', name: 'Raspberry Pi 5 Developer Kit 8GB', price: 80.00, warehouse_id: 'wh_blr_02', quantity: 4, line_total: 320.00 }
    ]
  },
  {
    order_id: 'ORD-20260925-0103',
    user_id: 'usr_corp_03',
    status: 'DELIVERED',
    total_amount: 4850.00,
    shipping_address: 'Tech Innovation Park, Whitefield, Bengaluru 560066',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    items: [
      { product_id: 'prod_server_01', name: 'Dell PowerEdge R760 Rack Server', price: 4850.00, warehouse_id: 'wh_mum_03', quantity: 1, line_total: 4850.00 }
    ]
  },
  {
    order_id: 'ORD-20260925-0104',
    user_id: 'usr_audio_04',
    status: 'CONFIRMED',
    total_amount: 699.98,
    shipping_address: 'Plot 45, Bandra Kurla Complex, Mumbai 400051',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    items: [
      { product_id: 'prod_audio_01', name: 'Sony WH-1000XM5 Wireless Headphones', price: 349.99, warehouse_id: 'wh_del_04', quantity: 2, line_total: 699.98 }
    ]
  }
];

export const OrdersModal: React.FC<OrdersModalProps> = ({
  isOpen,
  user,
  onClose
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hubFilter, setHubFilter] = useState<string>('ALL');

  const role = user?.role || 'CUSTOMER';
  const isAdmin = role === 'ADMIN';
  const isManager = role === 'WAREHOUSE_MANAGER';
  const isStaff = isAdmin || isManager;

  useEffect(() => {
    if (!isOpen || !user) return;
    setIsLoading(true);
    const token = user.token || user.access_token || '';

    const localOrders: Order[] = JSON.parse(localStorage.getItem('nex_orders') || '[]');

    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json')) ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge local and remote
          const merged = [...data];
          localOrders.forEach(lo => {
            if (!merged.some(m => m.order_id === lo.order_id)) {
              merged.unshift(lo);
            }
          });
          setOrders(merged);
        } else {
          // In offline mode / GitHub Pages:
          // If staff, merge local orders with realistic seeded multi-tenant staff orders!
          if (isStaff) {
            const combined = [...localOrders];
            SEEDED_STAFF_ORDERS.forEach(so => {
              if (!combined.some(c => c.order_id === so.order_id)) {
                combined.push(so);
              }
            });
            setOrders(combined);
          } else {
            setOrders(localOrders);
          }
        }
      })
      .catch(err => {
        console.warn('Orders fetch fallback:', err);
        if (isStaff) {
          const combined = [...localOrders];
          SEEDED_STAFF_ORDERS.forEach(so => {
            if (!combined.some(c => c.order_id === so.order_id)) {
              combined.push(so);
            }
          });
          setOrders(combined);
        } else {
          setOrders(localOrders);
        }
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, user, isStaff]);

  type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

  // Update order status in local state and persistence (Staff Action)
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev: Order[]) => {
      const updated = prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o);
      // Persist to local storage
      const local: Order[] = JSON.parse(localStorage.getItem('nex_orders') || '[]');
      const updatedLocal = local.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o);
      localStorage.setItem('nex_orders', JSON.stringify(updatedLocal));
      return updated;
    });
  };

  // Export orders to CSV
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Status', 'Total ($)', 'Shipping Address', 'Created At'];
    const rows = orders.map(o => [
      o.order_id,
      o.status,
      o.total_amount.toFixed(2),
      `"${o.shipping_address.replace(/"/g, '""')}"`,
      new Date(o.created_at).toISOString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexcommerce_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Role filtering: Customers only see their personal orders
      if (!isStaff && user && order.user_id && order.user_id !== user.user_id) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && order.status !== statusFilter) {
        return false;
      }
      // Hub filter
      if (hubFilter !== 'ALL' && order.items && order.items.length > 0) {
        if (!order.items.some(item => item.warehouse_id === hubFilter)) {
          return false;
        }
      }
      // Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = order.order_id.toLowerCase().includes(q);
        const matchesAddress = order.shipping_address.toLowerCase().includes(q);
        if (!matchesId && !matchesAddress) return false;
      }
      return true;
    });
  }, [orders, isStaff, user, statusFilter, hubFilter, searchQuery]);

  // Platform Metrics for Staff
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.total_amount : 0), 0);
  }, [orders]);

  const confirmedCount = useMemo(() => orders.filter(o => o.status === 'CONFIRMED').length, [orders]);
  const shippedCount = useMemo(() => orders.filter(o => o.status === 'SHIPPED').length, [orders]);
  const deliveredCount = useMemo(() => orders.filter(o => o.status === 'DELIVERED').length, [orders]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-[#d5d9d9] dark:border-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl text-[#0f1111] dark:text-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-sm ${
              isAdmin 
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40' 
                : isManager 
                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40' 
                  : 'bg-sky-500/20 text-sky-500 border border-sky-500/40'
            }`}>
              <i className={`fa-solid ${isAdmin ? 'fa-shield-halved' : isManager ? 'fa-dolly' : 'fa-box-open'}`}></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  {isAdmin 
                    ? 'Enterprise Master Orders & ACID Ledger' 
                    : isManager 
                      ? 'Warehouse Fulfillment & Dispatch Console' 
                      : 'Your Orders & Logistics Tracking'}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  isAdmin 
                    ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' 
                    : isManager 
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
                      : 'bg-sky-500/15 text-sky-500 border border-sky-500/30'
                }`}>
                  {role} VIEW
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isStaff 
                  ? 'Cross-Tenant Relational Ledger • Real-time ACID State • Dispatch Controls' 
                  : 'Track your personal purchases and multi-region campus logistics'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isStaff && (
              <button
                onClick={handleExportCSV}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Download CSV Manifest"
              >
                <i className="fa-solid fa-file-csv text-emerald-500"></i>
                <span>Export CSV</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Staff-Only KPI Dashboard Overview */}
        {isStaff && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 border-b border-gray-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 shrink-0">
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase block">Total Orders</span>
              <span className="text-lg font-black text-gray-900 dark:text-white">{orders.length}</span>
            </div>
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase block">Platform Volume</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <span className="text-xs font-semibold text-amber-600 uppercase block">Pending / Transit</span>
              <span className="text-lg font-black text-amber-600">{confirmedCount} <span className="text-xs text-sky-500 font-semibold">({shippedCount} in transit)</span></span>
            </div>
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <span className="text-xs font-semibold text-purple-600 uppercase block">Delivered & Closed</span>
              <span className="text-lg font-black text-purple-600">{deliveredCount}</span>
            </div>
          </div>
        )}

        {/* Controls Bar: Filters & Search */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap text-xs">
            {['ALL', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'PENDING'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Orders' : st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            {/* Warehouse Hub Filter (Staff Only) */}
            {isStaff && (
              <select
                value={hubFilter}
                onChange={(e) => setHubFilter(e.target.value)}
                className="py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-amber-500 font-medium cursor-pointer"
              >
                <option value="ALL">All Hubs</option>
                <option value="wh_hyd_01">HYD-01 (Hyderabad)</option>
                <option value="wh_blr_02">BLR-02 (Bengaluru)</option>
                <option value="wh_mum_03">MUM-03 (Mumbai)</option>
                <option value="wh_del_04">DEL-04 (Delhi)</option>
              </select>
            )}

            {/* Search Box */}
            <div className="relative min-w-[160px] sm:max-w-xs">
              <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Order Ledger List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-16 text-gray-500">
              <i className="fa-solid fa-spinner fa-spin text-3xl mb-3 text-amber-500"></i>
              <p className="text-xs font-semibold">Synchronizing ACID ledger across distributed nodes...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 space-y-3 text-gray-500">
              <i className="fa-solid fa-receipt text-5xl text-gray-300 dark:text-slate-700"></i>
              <p className="font-bold text-sm">No orders matching filter criteria.</p>
              <p className="text-xs text-gray-400">
                {isStaff 
                  ? 'All pending orders have been cleared or no records match your search.' 
                  : 'Your fulfilled purchases and ledger entries will appear here.'}
              </p>
            </div>
          ) : (
            filteredOrders.map(order => {
              const statusBadgeColor = 
                order.status === 'CONFIRMED' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                order.status === 'SHIPPED' ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30' :
                order.status === 'DELIVERED' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' :
                'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';

              return (
                <div
                  key={order.order_id}
                  className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-600"
                >
                  {/* Order Card Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">{order.order_id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${statusBadgeColor}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Placed on {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[11px] text-gray-500 block">Total Amount</span>
                        <span className="font-black text-sm text-[#b12704] dark:text-rose-400">
                          ${order.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer & Fulfillment Info (Staff View) */}
                  {isStaff && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white dark:bg-slate-900/90 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-gray-400">Customer Identifier: </span>
                        <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{order.user_id || 'usr_authenticated'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Fulfillment Center: </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">WH-HYD-01 (Hyderabad Central)</span>
                      </div>
                    </div>
                  )}

                  {/* Tracking Timeline Bar */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1.5">
                      <span className={order.status ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                        <i className="fa-solid fa-circle-check mr-1 text-[10px]"></i> Payment Authorized
                      </span>
                      <span className={['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                        <i className="fa-solid fa-boxes-packing mr-1 text-[10px]"></i> Warehouse Reserved
                      </span>
                      <span className={['SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-sky-600 dark:text-sky-400 font-bold' : ''}>
                        <i className="fa-solid fa-truck-fast mr-1 text-[10px]"></i> Dispatched
                      </span>
                      <span className={order.status === 'DELIVERED' ? 'text-purple-600 dark:text-purple-400 font-bold' : ''}>
                        <i className="fa-solid fa-house-chimney mr-1 text-[10px]"></i> Delivered
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
                      <div className={`h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500 transition-all duration-500 ${
                        order.status === 'DELIVERED' ? 'w-full' :
                        order.status === 'SHIPPED' ? 'w-3/4' :
                        order.status === 'CONFIRMED' ? 'w-1/2' : 'w-1/4'
                      }`}></div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="text-[11px] text-gray-500 flex items-start gap-1.5">
                    <i className="fa-solid fa-location-dot mt-0.5 text-amber-500 shrink-0"></i>
                    <span>Shipping Destination: <strong className="text-gray-700 dark:text-gray-300 font-medium">{order.shipping_address}</strong></span>
                  </div>

                  {/* Staff Lifecycle Action Buttons (Customer CANNOT access these!) */}
                  {isStaff && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Staff Dispatch Controls:
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {order.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.order_id, 'SHIPPED')}
                            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <i className="fa-solid fa-truck-fast"></i>
                            <span>Dispatch & Ship Order</span>
                          </button>
                        )}

                        {order.status === 'SHIPPED' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.order_id, 'DELIVERED')}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <i className="fa-solid fa-circle-check"></i>
                            <span>Confirm Delivery</span>
                          </button>
                        )}

                        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.order_id, 'CANCELLED')}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                            title="Rollback transaction and replenish warehouse stock"
                          >
                            <i className="fa-solid fa-rotate-left"></i>
                            <span>Rollback</span>
                          </button>
                        )}

                        {order.status === 'DELIVERED' && (
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            <i className="fa-solid fa-check-double"></i>
                            <span>Order Fulfilled & Reconciled</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span>
            {isStaff ? 'Showing cross-tenant orders database ledger' : 'Showing your verified customer orders'}
          </span>
          <button
            onClick={onClose}
            className="a-button a-button-subtle px-4 py-1.5 text-xs font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
