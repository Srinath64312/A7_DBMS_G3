import { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Product, Category, Warehouse, WishlistItem, CartItem, Role, Address } from './types';
import { Header } from './components/Header';
import { SubNav } from './components/SubNav';
import { Sidebar } from './components/Sidebar';
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
import { AddressModal } from './components/AddressModal';
import { AddProductModal } from './components/AddProductModal';
import { SemanticSearchModal } from './components/SemanticSearchModal';
import { AcademicCommandCenter } from './components/AcademicCommandCenter';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Footer } from './components/Footer';
import { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES, FALLBACK_WAREHOUSES } from './utils/fallbackData';
import { performSemanticSearch } from './utils/semanticSearch';

// 3 Default saved delivery addresses for university campus, faculty residence, and tech park
export const DEFAULT_ADDRESSES: Address[] = [
  {
    id: 'addr_campus_01',
    label: 'Campus Hostel (Block A)',
    fullName: 'Abhinay Sai',
    street: 'Room 304, Boys Hostel Block-A, KL University Campus, Aziz Nagar',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500075',
    phone: '+91 98480 12345',
    isDefault: true
  },
  {
    id: 'addr_faculty_02',
    label: 'Faculty Residence / Staff Quarters',
    fullName: 'Srinath (Admin)',
    street: 'Quarter Q-12, Staff Enclave, KL University Off-Campus, Aziz Nagar',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500075',
    phone: '+91 98480 54321',
    isDefault: false
  },
  {
    id: 'addr_lab_03',
    label: 'Aziz Nagar R&D Tech Lab',
    fullName: 'Poli Naidu (Lab Manager)',
    street: 'Distributed Systems & Cloud Computing Lab, CSE Dept, 3rd Floor',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500075',
    phone: '+91 98480 99887',
    isDefault: false
  }
];

export function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark' | 'forest'>((): 'light' | 'dark' | 'forest' => {
    const stored = localStorage.getItem('nexcommerce_theme') as 'light' | 'dark' | 'forest' | null;
    return stored ?? 'light';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isSemanticModalOpen, setIsSemanticModalOpen] = useState(false);
  const [isSemanticMode, setIsSemanticMode] = useState<boolean>(() => {
    return localStorage.getItem('nex_semantic_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('nex_semantic_mode', isSemanticMode ? 'true' : 'false');
  }, [isSemanticMode]);

  // Delivery Addresses State (3 default saved locations)
  const [addresses, setAddresses] = useState<Address[]>(() => {
    try {
      const saved = localStorage.getItem('nex_addresses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_ADDRESSES;
  });

  const [activeAddressId, setActiveAddressId] = useState<string>(() => {
    return localStorage.getItem('nex_active_address_id') || 'addr_campus_01';
  });

  useEffect(() => {
    localStorage.setItem('nex_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('nex_active_address_id', activeAddressId);
  }, [activeAddressId]);

  const activeAddress = useMemo(() => {
    return addresses.find(a => a.id === activeAddressId) || addresses[0] || null;
  }, [addresses, activeAddressId]);

  const openAcademicLab = useCallback((tab: 'sql_workbench' | 'lab_questions' | 'schema_erd' | 'acid_lab' | 'telemetry' | 'viva_guide' = 'sql_workbench') => {
    setAcademicLabDefaultTab(tab);
    setIsAcademicLabOpen(true);
  }, []);

  // Quick Role Switcher for demonstration & viva defense
  const handleSwitchRole = (newRole: Role) => {
    let targetUser: User;
    if (newRole === 'ADMIN') {
      targetUser = {
        user_id: 'usr_admin_01',
        name: 'Admin Srinath',
        email: 'admin@commerce.kluniversity.in',
        role: 'ADMIN',
        token: user?.token || sessionStorage.getItem('nex_token') || ''
      };
    } else if (newRole === 'WAREHOUSE_MANAGER') {
      targetUser = {
        user_id: 'usr_mgr_01',
        name: 'Manager Poli Naidu',
        email: 'manager@commerce.kluniversity.in',
        role: 'WAREHOUSE_MANAGER',
        token: user?.token || sessionStorage.getItem('nex_token') || ''
      };
    } else {
      targetUser = {
        user_id: 'usr_cust_01',
        name: 'Abhinay Sai',
        email: 'abhinay@klh.edu.in',
        role: 'CUSTOMER',
        token: user?.token || sessionStorage.getItem('nex_token') || ''
      };
    }
    setUser(targetUser);
    sessionStorage.setItem('nex_user', JSON.stringify(targetUser));
    addToast(`Switched active session view to ${newRole} mode`, 'success');
  };

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
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove('light', 'dark', 'forest');
    body.classList.remove('light', 'dark', 'forest');

    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else if (theme === 'forest') {
      root.classList.add('dark', 'forest');
      body.classList.add('dark', 'forest');
    } else {
      root.classList.add('light');
      body.classList.add('light');
    }
    localStorage.setItem('nexcommerce_theme', theme);
  }, [theme]);

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
      const [prodsRes, catsRes, whsRes] = await Promise.allSettled([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/warehouses')
      ]);

      // Retrieve custom products added via the website
      const customProducts: Product[] = (() => {
        try {
          return JSON.parse(localStorage.getItem('nex_custom_products') || '[]');
        } catch {
          return [];
        }
      })();

      if (prodsRes.status === 'fulfilled' && prodsRes.value.ok && prodsRes.value.headers.get('content-type')?.includes('application/json')) {
        const pData = await prodsRes.value.json().catch(() => null);
        const base = Array.isArray(pData) && pData.length > 0 ? pData : FALLBACK_PRODUCTS;
        const merged = [...customProducts, ...base.filter((b: Product) => !customProducts.some(c => c.product_id === b.product_id))];
        setProducts(merged);
      } else {
        const merged = [...customProducts, ...FALLBACK_PRODUCTS.filter(b => !customProducts.some(c => c.product_id === b.product_id))];
        setProducts(merged);
      }

      if (catsRes.status === 'fulfilled' && catsRes.value.ok && catsRes.value.headers.get('content-type')?.includes('application/json')) {
        const cData = await catsRes.value.json().catch(() => null);
        setCategories(Array.isArray(cData) && cData.length > 0 ? cData : FALLBACK_CATEGORIES);
      } else {
        setCategories(FALLBACK_CATEGORIES);
      }

      if (whsRes.status === 'fulfilled' && whsRes.value.ok && whsRes.value.headers.get('content-type')?.includes('application/json')) {
        const wData = await whsRes.value.json().catch(() => null);
        setWarehouses(Array.isArray(wData) && wData.length > 0 ? wData : FALLBACK_WAREHOUSES);
      } else {
        setWarehouses(FALLBACK_WAREHOUSES);
      }
    } catch (e) {
      console.warn('Backend unavailable, using static catalog datasets (GitHub Pages fallback):', e);
      setProducts(FALLBACK_PRODUCTS);
      setCategories(FALLBACK_CATEGORIES);
      setWarehouses(FALLBACK_WAREHOUSES);
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
        .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json')) ? res.json() : null)
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

  // Delivery Address Handlers
  const handleSelectAddress = (id: string) => {
    setActiveAddressId(id);
    const selected = addresses.find(a => a.id === id);
    if (selected) {
      addToast(`Delivery destination set to: ${selected.label}`, 'info');
    }
  };

  const handleAddAddress = (newAddr: Address) => {
    setAddresses(prev => [newAddr, ...prev]);
    setActiveAddressId(newAddr.id);
    addToast(`Saved new delivery address: ${newAddr.label}`, 'success');
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    if (activeAddressId === id) {
      const remaining = addresses.filter(a => a.id !== id);
      if (remaining.length > 0) {
        setActiveAddressId(remaining[0].id);
      }
    }
    addToast('Address removed', 'info');
  };

  // Product Created Handler (persists in localStorage + state)
  const handleProductCreated = (newProd: Product) => {
    setProducts(prev => [newProd, ...prev]);
    try {
      const existing: Product[] = JSON.parse(localStorage.getItem('nex_custom_products') || '[]');
      localStorage.setItem('nex_custom_products', JSON.stringify([newProd, ...existing.filter(p => p.product_id !== newProd.product_id)]));
    } catch (e) {
      console.warn('Could not persist product to local storage:', e);
    }
    addToast(`"${newProd.name}" added to catalog successfully!`, 'success');
  };

  // Filtered Products
  // Filtered & Semantically Ranked Products
  const filteredProducts = useMemo(() => {
    let result = products;

    // Category filter
    if (selectedCategory) {
      result = result.filter(p => p.category_id === selectedCategory);
    }

    // In stock filter
    if (inStockOnly) {
      result = result.filter(p => (p.total_stock ?? 1) > 0);
    }

    // Search filter: AI Semantic Vector Mode vs Traditional Lexical Keyword Match
    if (searchQuery.trim()) {
      if (isSemanticMode) {
        // AI Dense Vector Search (pgvector cosine similarity + hybrid lexical overlap)
        const semanticResults = performSemanticSearch(result, searchQuery, 0.35);
        return semanticResults.map(r => r.product);
      } else {
        const q = searchQuery.toLowerCase();
        result = result.filter(p => {
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesSku = p.sku.toLowerCase().includes(q);
          const matchesDesc = p.description.toLowerCase().includes(q);
          return matchesName || matchesSku || matchesDesc;
        });
      }
    }

    // Normal Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, selectedCategory, searchQuery, inStockOnly, isSemanticMode, sortBy]);

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
        theme={theme}
        onSelectTheme={setTheme}
        onOpenAcademicLab={() => openAcademicLab('sql_workbench')}
        onOpenRestock={() => setIsRestockOpen(true)}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenAddressModal={() => setIsAddressModalOpen(true)}
        activeAddress={activeAddress}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
        isSemanticMode={isSemanticMode}
        onToggleSemanticMode={() => {
          const next = !isSemanticMode;
          setIsSemanticMode(next);
          addToast(next ? 'AI Semantic Search Active (pgvector cosine similarity)' : 'Switched to Standard Keyword Search', 'info');
        }}
        onOpenSemanticInspector={() => setIsSemanticModalOpen(true)}
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
        theme={theme}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 py-4">
        {/* Amazon Hero Banner */}
        <HeroBanner onSelectCategory={setSelectedCategory} />

        {/* Filter and Storefront Toolbar */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3 mb-5 flex flex-wrap items-center justify-between gap-3 shadow-sm text-xs transition-colors">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[var(--text-muted)]">
              Showing <span className="text-[var(--text-main)] font-extrabold">{filteredProducts.length}</span> results
              {selectedCategory && ` in ${categories.find(c => c.category_id === selectedCategory)?.name || selectedCategory}`}
            </span>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="text-xs text-[var(--color-link)] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                Clear filter <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Direct Add Product Button */}
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow-sm transition cursor-pointer text-xs"
              title="Add a new product directly to the website catalog"
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span>Add Product</span>
            </button>

            {/* AI Semantic Vector Search Toggle */}
            <button
              onClick={() => {
                const next = !isSemanticMode;
                setIsSemanticMode(next);
                addToast(next ? 'AI Semantic Search Active (pgvector cosine similarity)' : 'Switched to Standard Keyword Search', 'info');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-xs transition cursor-pointer ${
                isSemanticMode
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                  : 'bg-[var(--bg-card-subtle)] text-purple-600 dark:text-purple-400 border-[var(--border-subtle)] hover:border-purple-400'
              }`}
              title="Toggle AI Semantic Vector Search (pgvector cosine similarity)"
            >
              <i className={`fa-solid fa-brain ${isSemanticMode ? 'animate-pulse' : ''}`}></i>
              <span>{isSemanticMode ? 'AI Semantic: ON' : 'AI Semantic: OFF'}</span>
            </button>

            {/* Vector Math & Embeddings Inspector */}
            <button
              onClick={() => setIsSemanticModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hover:border-purple-400 text-[var(--text-muted)] hover:text-purple-400 text-xs font-semibold cursor-pointer transition"
              title="Open 16-Dimensional Vector & Cosine Math Inspector"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-purple-500"></i>
              <span className="hidden sm:inline">Vector Inspector</span>
            </button>

            {/* In stock toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[var(--text-main)]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-[#e47911] focus:ring-0 cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] text-[var(--text-main)] outline-none font-medium cursor-pointer"
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
        addresses={addresses}
        activeAddressId={activeAddressId}
        onOpenAddressModal={() => setIsAddressModalOpen(true)}
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

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={addresses}
        activeAddressId={activeAddressId}
        onSelectAddress={handleSelectAddress}
        onAddAddress={handleAddAddress}
        onDeleteAddress={handleDeleteAddress}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        categories={categories}
        warehouses={warehouses}
        user={user}
        onProductCreated={handleProductCreated}
      />

      <SemanticSearchModal
        isOpen={isSemanticModalOpen}
        onClose={() => setIsSemanticModalOpen(false)}
        products={products}
        onSelectProduct={(p) => setActiveModalProduct(p)}
        onApplyQueryToStorefront={(q) => {
          setSearchQuery(q);
          setIsSemanticMode(true);
        }}
      />

      {/* RBAC Flyout Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAcademicLab={openAcademicLab}
        onOpenTestRunner={() => setIsTestRunnerOpen(true)}
        onOpenRestock={() => setIsRestockOpen(true)}
        onSwitchRole={handleSwitchRole}
        theme={theme}
        onOpenAddressModal={() => setIsAddressModalOpen(true)}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;

