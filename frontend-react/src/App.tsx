import { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Product, Category, Warehouse, WishlistItem, CartItem } from './types';
import { Header } from './components/Header';
import { SubNav } from './components/SubNav';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { WishlistModal } from './components/WishlistModal';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { CartDrawer } from './components/CartDrawer';
import { OrdersModal } from './components/OrdersModal';
import { TestRunnerModal } from './components/TestRunnerModal';
import { RestockModal } from './components/RestockModal';
import { AuthModal } from './components/AuthModal';
import { AcademicCommandCenter } from './components/AcademicCommandCenter';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Footer } from './components/Footer';

export function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('nexcommerce_theme') === 'dark';
  });

  // User Auth state
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('nex_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    // Default demo user
    return {
      user_id: 'usr_cust_01',
      name: 'Abhinay Sai',
      email: 'abhinay@klh.edu.in',
      role: 'CUSTOMER',
      token: sessionStorage.getItem('nex_token') || ''
    };
  });

  // Domain Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('default');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Cart & Wishlist State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('nex_cart') || '[]');
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('nex_wishlist') || '[]');
    } catch {
      return [];
    }
  });

  // Modals state
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAcademicLabOpen, setIsAcademicLabOpen] = useState(false);
  const [academicLabDefaultTab, setAcademicLabDefaultTab] = useState<'sql_workbench' | 'lab_questions' | 'schema_erd' | 'acid_lab' | 'telemetry' | 'viva_guide'>('sql_workbench');

  const openAcademicLab = useCallback((tab: 'sql_workbench' | 'lab_questions' | 'schema_erd' | 'acid_lab' | 'telemetry' | 'viva_guide' = 'sql_workbench') => {
    setAcademicLabDefaultTab(tab);
    setIsAcademicLabOpen(true);
  }, []);

  // Payment Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentItems, setPaymentItems] = useState<CartItem[]>([]);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Theme effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('nexcommerce_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('nexcommerce_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('nex_cart', JSON.stringify(cart));
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    localStorage.setItem('nex_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Fetch initial catalog data
  const fetchData = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const [prodsRes, catsRes, whsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/warehouses')
      ]);

      if (prodsRes.ok) {
        const pData = await prodsRes.json();
        setProducts(Array.isArray(pData) ? pData : []);
      }
      if (catsRes.ok) {
        const cData = await catsRes.json();
        setCategories(Array.isArray(cData) ? cData : []);
      }
      if (whsRes.ok) {
        const wData = await whsRes.json();
        setWarehouses(Array.isArray(wData) ? wData : []);
      }
    } catch (e) {
      console.error('Data fetch error:', e);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Ensure active JWT token exists for default user session
    const existingToken = sessionStorage.getItem('nex_token');
    if (!existingToken) {
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'abhinay@klh.edu.in', password: 'Customer@123' })
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            sessionStorage.setItem('nex_token', data.token);
            sessionStorage.setItem('nex_user', JSON.stringify(data));
            setUser(data);
          }
        })
        .catch(console.warn);
    }
  }, [fetchData]);

  // Sync Wishlist with Backend
  const syncWishlist = useCallback(async () => {
    if (!user || !user.token) return;
    try {
      const res = await fetch('/api/wishlist', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const items = await res.json();
        const mapped: WishlistItem[] = items.map((i: any) => ({
          wishlist_id: i.wishlist_id,
          product_id: i.product_id,
          name: i.product?.name || i.product_id,
          price: i.product?.price || 0,
          image_url: i.product?.image_url,
          sku: i.product?.sku
        }));
        setWishlist(mapped);
      }
    } catch (err) {
      console.warn('Backend wishlist sync:', err);
    }
  }, [user]);

  useEffect(() => {
    syncWishlist();
  }, [syncWishlist]);

  // Wishlist Toggle Handler
  const handleToggleWishlist = async (prod: Product) => {
    const exists = wishlist.some(w => w.product_id === prod.product_id);
    if (exists) {
      setWishlist(prev => prev.filter(w => w.product_id !== prod.product_id));
      addToast(`Removed "${prod.name}" from your Wishlist`, 'info');
      if (user?.token) {
        fetch(`/api/wishlist/${prod.product_id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user.token}` }
        }).catch(console.warn);
      }
    } else {
      const newItem: WishlistItem = {
        product_id: prod.product_id,
        name: prod.name,
        price: prod.price,
        image_url: prod.image_url,
        sku: prod.sku
      };
      setWishlist(prev => [...prev, newItem]);
      addToast(`Added "${prod.name}" to your Wishlist`, 'success');
      if (user?.token) {
        fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ product_id: prod.product_id })
        }).catch(console.warn);
      }
    }
  };

  const handleClearWishlist = async () => {
    setWishlist([]);
    addToast('Wishlist cleared', 'info');
    if (user?.token) {
      fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      }).catch(console.warn);
    }
  };

  // Cart Handlers
  const handleAddToCart = (product: Product, warehouseId?: string, quantity: number = 1) => {
    const wid = warehouseId || 'wh_hyd_01';
    const wh = warehouses.find(w => w.warehouse_id === wid);

    setCart(prev => {
      const idx = prev.findIndex(item => item.product_id === product.product_id && item.warehouse_id === wid);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      } else {
        return [...prev, {
          product_id: product.product_id,
          name: product.name,
          price: product.price,
          warehouse_id: wid,
          warehouse_name: wh?.name || 'Hyderabad Central Hub',
          quantity,
          image_url: product.image_url
        }];
      }
    });

    addToast(`Added "${product.name}" to cart`, 'success');
  };

  const handleUpdateCartQty = (productId: string, qty: number) => {
    setCart(prev => prev.map(item => item.product_id === productId ? { ...item, quantity: qty } : item));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
    addToast('Item removed from cart', 'info');
  };

  // Immediate "Buy Now" handler (triggers payment gateway directly)
  const handleBuyNow = (product: Product, warehouseId?: string, quantity: number = 1) => {
    const wid = warehouseId || 'wh_hyd_01';
    const wh = warehouses.find(w => w.warehouse_id === wid);
    const item: CartItem = {
      product_id: product.product_id,
      name: product.name,
      price: product.price,
      warehouse_id: wid,
      warehouse_name: wh?.name || 'Hyderabad Central Hub',
      quantity,
      image_url: product.image_url
    };
    setPaymentItems([item]);
    setIsPaymentOpen(true);
  };

  // Checkout from Cart
  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    setPaymentItems(cart);
    setIsPaymentOpen(true);
  };

  // Payment Success Callback
  const handlePaymentSuccess = () => {
    setCart([]);
    addToast('ACID Transaction Confirmed! Order committed to ledger.', 'success');
    fetchData(); // Refresh product stock counts
  };

  // Auth Handlers
  const handleLoginSuccess = (authUser: User) => {
    const token = authUser.token || authUser.access_token || '';
    const userData: User = {
      user_id: authUser.user_id,
      name: authUser.name,
      email: authUser.email,
      role: authUser.role,
      token
    };
    setUser(userData);
    sessionStorage.setItem('nex_user', JSON.stringify(userData));
    sessionStorage.setItem('nex_token', token);
    addToast(`Welcome back, ${userData.name}! (${userData.role})`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.clear();
    setCart([]);
    addToast('Signed out of NexCommerce', 'info');
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory && p.category_id !== selectedCategory) return false;
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesDesc) return false;
      }
      // In stock filter
      if (inStockOnly && (p.total_stock ?? 1) === 0) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, selectedCategory, searchQuery, inStockOnly, sortBy]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Amazon Header */}
      <Header
        user={user}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenAcademicLab={() => openAcademicLab('sql_workbench')}
      />

      {/* Amazon SubNav */}
      <SubNav
        user={user}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenTestRunner={() => setIsTestRunnerOpen(true)}
        onOpenRestock={() => setIsRestockOpen(true)}
        onOpenAcademicLab={openAcademicLab}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 py-4">
        {/* Amazon Hero Banner */}
        <HeroBanner onSelectCategory={setSelectedCategory} />

        {/* Filter and Storefront Toolbar */}
        <div className="bg-white dark:bg-slate-900 border border-[#d5d9d9] dark:border-slate-800 rounded-md p-3 mb-5 flex flex-wrap items-center justify-between gap-3 shadow-sm text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-700 dark:text-gray-300">
              Showing <span className="text-[#0f1111] dark:text-white font-extrabold">{filteredProducts.length}</span> results
              {selectedCategory && ` in ${categories.find(c => c.category_id === selectedCategory)?.name || selectedCategory}`}
            </span>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="text-xs text-[#007185] dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Clear filter <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* In stock toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-[#e47911] focus:ring-0 cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-medium cursor-pointer"
              >
                <option value="default">Featured</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="name">Product Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 space-y-3 animate-pulse">
                <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center space-y-3">
            <i className="fa-solid fa-magnifying-glass text-4xl text-gray-300 dark:text-slate-700"></i>
            <h3 className="font-bold text-base">No hardware products match your criteria</h3>
            <p className="text-xs text-gray-500">Try clearing filters or searching with different keywords.</p>
            <button
              onClick={() => { setSelectedCategory(''); setSearchQuery(''); setInStockOnly(false); }}
              className="a-button a-button-primary px-4 py-1.5 text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(prod => (
              <ProductCard
                key={prod.product_id}
                product={prod}
                inWishlist={wishlist.some(w => w.product_id === prod.product_id)}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={(p) => handleAddToCart(p)}
                onBuyNow={(p) => handleBuyNow(p)}
                onViewDetails={(p) => setActiveModalProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <ProductDetailModal
        product={activeModalProduct}
        warehouses={warehouses}
        user={user}
        inWishlist={activeModalProduct ? wishlist.some(w => w.product_id === activeModalProduct.product_id) : false}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onClose={() => setActiveModalProduct(null)}
        onSelectProduct={(p) => setActiveModalProduct(p)}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        wishlist={wishlist}
        onClose={() => setIsWishlistOpen(false)}
        onRemoveItem={(prodId) => {
          setWishlist(prev => prev.filter(w => w.product_id !== prodId));
          addToast('Item removed from wishlist', 'info');
          if (user?.token) {
            fetch(`/api/wishlist/${prodId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${user.token}` }
            }).catch(console.warn);
          }
        }}
        onClearAll={handleClearWishlist}
        onAddToCart={(item) => {
          const prod = products.find(p => p.product_id === item.product_id) || {
            product_id: item.product_id,
            name: item.name,
            price: item.price,
            sku: item.sku || '',
            category_id: 'cat_comp_01',
            description: ''
          };
          handleAddToCart(prod);
        }}
        onBuyNow={(item) => {
          const prod = products.find(p => p.product_id === item.product_id) || {
            product_id: item.product_id,
            name: item.name,
            price: item.price,
            sku: item.sku || '',
            category_id: 'cat_comp_01',
            description: ''
          };
          handleBuyNow(prod);
          setIsWishlistOpen(false);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <PaymentGatewayModal
        isOpen={isPaymentOpen}
        items={paymentItems}
        user={user}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <OrdersModal
        isOpen={isOrdersOpen}
        user={user}
        onClose={() => setIsOrdersOpen(false)}
      />

      <TestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />

      <RestockModal
        isOpen={isRestockOpen}
        products={products}
        warehouses={warehouses}
        user={user}
        onClose={() => setIsRestockOpen(false)}
        onRestockSuccess={() => {
          fetchData();
          addToast('Inventory restocked successfully', 'success');
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AcademicCommandCenter
        isOpen={isAcademicLabOpen}
        onClose={() => setIsAcademicLabOpen(false)}
        defaultTab={academicLabDefaultTab}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;

