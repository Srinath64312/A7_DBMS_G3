/**
 * Frontend Interactive Controller for NexCommerce Platform
 * Course: 25CS1302E - DBS-DBD (KL University)
 */

const API_BASE = "";

// State
let currentRole = "CUSTOMER";
let currentToken = "";
let currentUserId = "usr_cust_01";
let currentUserName = "Abhinay Sai";
let isRegisterMode = false;
let catalogProducts = [];
let categories = [];
let warehouses = [];
let cart = [];
let activeModalProduct = null;
let activeCategoryFilter = "";
let currentTheme = localStorage.getItem("nexcommerce_theme") || "dark";
let selectedPaymentMethod = "UPI";
let currentReviewRating = 0;
let activeOrderForPayment = null;

// Pre-seeded role credentials
const DEMO_USERS = {
    CUSTOMER: { email: "abhinay@klh.edu.in", password: "Customer@123", name: "Abhinay Sai" },
    WAREHOUSE_MANAGER: { email: "manager@commerce.kluniversity.in", password: "Manager@123", name: "Manager Poli Naidu" },
    ADMIN: { email: "admin@commerce.kluniversity.in", password: "Admin@123", name: "Admin Srinath" }
};

// =========================================================================
// Initialization
// =========================================================================
document.addEventListener("DOMContentLoaded", async () => {
    initTheme();
    await loginRole("CUSTOMER");
    await fetchDbStatus();
    await loadCategories();
    await loadWarehouses();
    await loadCatalog();
    initSimCart();
});

// Theme Management (Light / Dark)
function initTheme() {
    applyTheme(currentTheme);
}

function toggleTheme() {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("nexcommerce_theme", currentTheme);
    applyTheme(currentTheme);
}

function applyTheme(theme) {
    const icon = document.getElementById("themeToggleIcon");
    const text = document.getElementById("themeToggleText");
    if (theme === "light") {
        document.body.classList.add("light-theme");
        if (icon) icon.className = "fa-solid fa-sun text-amber-500";
        if (text) text.innerText = "Light";
    } else {
        document.body.classList.remove("light-theme");
        if (icon) icon.className = "fa-solid fa-moon text-[#febd69]";
        if (text) text.innerText = "Dark";
    }
}

// Switch active UI Tab
function switchTab(tabId) {
    document.querySelectorAll(".tab-view").forEach(el => el.classList.add("hidden"));
    document.querySelectorAll(".sub-nav-item").forEach(el => el.classList.remove("active", "text-[#febd69]", "font-bold"));

    const targetView = document.getElementById(`view-${tabId}`);
    const targetSubTab = document.getElementById(`subtab-${tabId}`);
    if (targetView) {
        targetView.classList.remove("hidden");
    }
    if (targetSubTab) {
        targetSubTab.classList.add("active", "text-[#febd69]", "font-bold");
    }

    if (tabId === "warehouses") loadInventoryTable();
    if (tabId === "intelligence") loadIntelligence();
    if (tabId === "db-inspector") loadAuditLogs();
    if (tabId === "my-account") loadUserAddresses();
}

// =========================================================================
// Privacy Policy & Terms Modals
// =========================================================================
function openPrivacyModal() {
    document.getElementById("privacyModal").classList.remove("hidden");
}

function closePrivacyModal() {
    document.getElementById("privacyModal").classList.add("hidden");
}

function openTermsModal() {
    document.getElementById("termsModal").classList.remove("hidden");
}

function closeTermsModal() {
    document.getElementById("termsModal").classList.add("hidden");
}

// =========================================================================
// Authentication & Role Portal
// =========================================================================
function openAuthModal() {
    document.getElementById("authModal").classList.remove("hidden");
    document.getElementById("authErrorMsg").classList.add("hidden");
}

function closeAuthModal() {
    document.getElementById("authModal").classList.add("hidden");
}

function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    const title = document.getElementById("authModalTitle");
    const nameGrp = document.getElementById("registerNameGroup");
    const roleGrp = document.getElementById("registerRoleGroup");
    const submitBtn = document.getElementById("authSubmitBtn");
    const prompt = document.getElementById("authTogglePrompt");
    const toggleBtn = document.getElementById("authToggleBtn");

    if (isRegisterMode) {
        title.innerText = "Create New Account";
        nameGrp.classList.remove("hidden");
        roleGrp.classList.remove("hidden");
        submitBtn.innerText = "Register Account";
        prompt.innerText = "Already have an account?";
        toggleBtn.innerText = "Sign In";
    } else {
        title.innerText = "Sign In to Platform";
        nameGrp.classList.add("hidden");
        roleGrp.classList.add("hidden");
        submitBtn.innerText = "Sign In with JWT";
        prompt.innerText = "Need an account?";
        toggleBtn.innerText = "Create Account";
    }
}

async function quickLoginRole(role) {
    const user = DEMO_USERS[role];
    document.getElementById("authEmailInput").value = user.email;
    document.getElementById("authPasswordInput").value = user.password;
    if (isRegisterMode) toggleAuthMode();
    await loginRole(role);
    closeAuthModal();
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("authEmailInput").value;
    const password = document.getElementById("authPasswordInput").value;
    const errorMsg = document.getElementById("authErrorMsg");
    errorMsg.classList.add("hidden");

    try {
        if (isRegisterMode) {
            const name = document.getElementById("authNameInput").value;
            const role = document.getElementById("authRoleInput").value;
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();
            if (res.ok) {
                currentToken = data.token;
                currentUserId = data.user_id;
                currentUserName = data.name;
                currentRole = data.role;
                updateUserHeaderUI();
                closeAuthModal();
                logSim(`[SUCCESS] New user registered and authenticated: ${data.name} (${data.role})`, "success");
            } else {
                errorMsg.innerText = data.error || "Registration failed.";
                errorMsg.classList.remove("hidden");
            }
        } else {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                currentToken = data.token;
                currentUserId = data.user_id;
                currentUserName = data.name;
                currentRole = data.role;
                updateUserHeaderUI();
                closeAuthModal();
                logSim(`[SUCCESS] Authenticated as: ${data.name} [Role: ${data.role}]`, "success");
            } else {
                errorMsg.innerText = data.error || "Invalid email or password.";
                errorMsg.classList.remove("hidden");
            }
        }
    } catch (err) {
        errorMsg.innerText = err.message;
        errorMsg.classList.remove("hidden");
    }
}

async function loginRole(role) {
    try {
        const user = DEMO_USERS[role];
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, password: user.password })
        });
        const data = await res.json();
        if (res.ok) {
            currentToken = data.token;
            currentUserId = data.user_id;
            currentUserName = data.name;
            currentRole = data.role;
            updateUserHeaderUI();
        }
    } catch (e) {
        console.error("Auth error:", e);
    }
}

function updateUserHeaderUI() {
    const greetingEl = document.getElementById("headerGreeting");
    const nameEl = document.getElementById("headerUserName");
    const adminBtn = document.getElementById("adminAddProductBtn");

    if (greetingEl) greetingEl.innerText = `Hello, ${currentUserName.split(' ')[0]}`;
    if (nameEl) nameEl.innerText = `${currentRole} Account`;

    if (adminBtn) {
        if (currentRole === "ADMIN") adminBtn.classList.remove("hidden");
        else adminBtn.classList.add("hidden");
    }
}

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${currentToken}`
    };
}

// =========================================================================
// Health & DB Status
// =========================================================================
async function fetchDbStatus() {
    try {
        const res = await fetch(`${API_BASE}/api/status/databases`);
        const data = await res.json();
        const pgText = document.getElementById("pgStatusText");
        if (pgText && data.relational_db) {
            pgText.innerText = "PostgreSQL (klhdb)";
        }
    } catch (e) {
        console.error("DB Status check:", e);
    }
}

// =========================================================================
// Categories & Warehouses
// =========================================================================
async function loadCategories() {
    try {
        const res = await fetch(`${API_BASE}/api/categories`);
        categories = await res.json();
        const headerCatSelect = document.getElementById("headerCategorySelect");
        const newProdCat = document.getElementById("newProdCategory");
        
        if (headerCatSelect) {
            headerCatSelect.innerHTML = `<option value="">All Categories</option>` +
                categories.map(c => `<option value="${c.category_id}">${c.name}</option>`).join("");
        }
        if (newProdCat) {
            newProdCat.innerHTML = categories.map(c => `<option value="${c.category_id}">${c.name}</option>`).join("");
        }
    } catch (e) {
        console.error("Categories fetch:", e);
    }
}

async function loadWarehouses() {
    try {
        const res = await fetch(`${API_BASE}/api/warehouses`);
        warehouses = await res.json();
        const filterSelect = document.getElementById("warehouseFilterSelect");
        const restockSelect = document.getElementById("restockWarehouseSelect");
        if (filterSelect) {
            filterSelect.innerHTML = `<option value="">All Warehouses</option>` +
                warehouses.map(w => `<option value="${w.warehouse_id}">${w.name} (${w.code})</option>`).join("");
        }
        if (restockSelect) {
            restockSelect.innerHTML = warehouses.map(w => `<option value="${w.warehouse_id}">${w.name}</option>`).join("");
        }
    } catch (e) {
        console.error("Warehouses fetch:", e);
    }
}

// =========================================================================
// 01. Catalog & Product Cards
// =========================================================================
let searchDebounceTimer;
function debounceSearch() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(loadCatalog, 250);
}

function applyHeaderCategory(catId) {
    activeCategoryFilter = catId;
    loadCatalog();
}

function filterByCategory(catId) {
    activeCategoryFilter = catId;
    document.querySelectorAll(".cat-btn").forEach(p => p.classList.remove("active", "bg-[#febd69]", "text-slate-950", "font-bold"));
    event.target.classList.add("active", "bg-[#febd69]", "text-slate-950", "font-bold");
    loadCatalog();
}

async function loadCatalog() {
    const search = document.getElementById("mainSearchInput")?.value || "";
    let url = `${API_BASE}/api/products?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (activeCategoryFilter) url += `category_id=${encodeURIComponent(activeCategoryFilter)}&`;

    try {
        const res = await fetch(url);
        catalogProducts = await res.json();
        renderProductGrid(catalogProducts);
    } catch (e) {
        console.error("Load catalog:", e);
    }
}

function renderProductGrid(products) {
    const grid = document.getElementById("productGrid");
    if (!grid) return;

    if (!products.length) {
        grid.innerHTML = `<div class="col-span-full py-16 text-center text-slate-500 text-xs">No products found matching the query.</div>`;
        return;
    }

    grid.innerHTML = products.map(p => {
        const img = p.image_url || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60";
        return `
        <div class="product-card flex flex-col justify-between p-3.5 space-y-3">
            <!-- Product Technical Image -->
            <div class="relative bg-[#0f1111] rounded overflow-hidden h-40 flex items-center justify-center p-2 cursor-pointer border border-[#232f3e]" onclick="viewProductDetails('${p.product_id}')">
                <img src="${img}" alt="${p.name}" class="object-cover h-full w-full rounded">
                <span class="absolute top-2 right-2 bg-[#131921]/90 text-cyan-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-slate-700">
                    ${p.sku}
                </span>
            </div>

            <!-- Title & Specifications -->
            <div class="space-y-1 flex-1 cursor-pointer" onclick="viewProductDetails('${p.product_id}')">
                <span class="text-[10px] font-bold text-[#febd69] uppercase tracking-wider block">${p.category_name || 'Hardware'}</span>
                <h3 class="font-bold text-xs text-white hover:text-[#febd69] transition line-clamp-2 leading-snug">${p.name}</h3>
                <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed pt-0.5">${p.description || 'Enterprise hardware component.'}</p>
                
                <!-- Dynamic Tags from MongoDB -->
                <div class="flex flex-wrap gap-1 pt-1">
                    ${(p.tags || []).slice(0, 3).map(t => `<span class="text-[9px] bg-[#232f3e] text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-700">#${t}</span>`).join("")}
                </div>
            </div>

            <!-- Price & Actions -->
            <div class="border-t border-slate-800 pt-2.5 space-y-2">
                <div class="flex justify-between items-baseline">
                    <span class="text-base font-bold text-white leading-none">$${p.price.toFixed(2)}</span>
                    <span class="text-[10px] text-emerald-400 font-medium">In Stock</span>
                </div>

                <div class="grid grid-cols-2 gap-2 pt-0.5">
                    <button onclick="viewProductDetails('${p.product_id}')" class="bg-[#232f3e] hover:bg-[#37475a] text-slate-200 text-xs font-semibold py-1.5 rounded transition flex items-center justify-center gap-1 border border-slate-700">
                        <i class="fa-solid fa-file-lines text-cyan-400"></i> Specs
                    </button>
                    <button onclick="quickAddToCart('${p.product_id}')" class="bg-[#febd69] hover:bg-amber-400 text-slate-950 text-xs font-bold py-1.5 rounded transition flex items-center justify-center gap-1">
                        <i class="fa-solid fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join("");
}

async function viewProductDetails(productId) {
    try {
        const res = await fetch(`${API_BASE}/api/products/${productId}`);
        const p = await res.json();
        activeModalProduct = p;

        document.getElementById("modalCategoryBadge").innerText = p.category_name || "Hardware";
        document.getElementById("modalProductName").innerText = p.name;
        document.getElementById("modalProductSku").innerText = `SKU: ${p.sku} | Source: PostgreSQL (Core) & MongoDB (Attributes)`;
        document.getElementById("modalProductDesc").innerText = p.description;
        document.getElementById("modalProductPrice").innerText = `$${p.price.toFixed(2)}`;

        // MongoDB attributes grid
        const attrsGrid = document.getElementById("modalAttributesGrid");
        const attrs = p.attributes || {};
        if (Object.keys(attrs).length > 0) {
            attrsGrid.innerHTML = Object.entries(attrs).map(([k, v]) => `
                <div class="bg-[#131921] p-2 rounded border border-slate-700">
                    <span class="text-[9px] text-slate-400 block uppercase font-mono">${k.replace(/_/g, ' ')}</span>
                    <span class="text-xs text-slate-200 font-semibold">${v}</span>
                </div>
            `).join("");
        } else {
            attrsGrid.innerHTML = `<span class="text-slate-500 text-xs col-span-3">No schema-free attributes defined.</span>`;
        }

        // Fetch pgvector Recommendations
        const recRes = await fetch(`${API_BASE}/api/products/${productId}/recommendations`);
        const recs = await recRes.json();
        const recsList = document.getElementById("modalRecsList");
        if (recs.length) {
            recsList.innerHTML = recs.map(r => `
                <div class="bg-[#232f3e] p-2 rounded border border-slate-700 flex justify-between items-center hover:border-[#febd69] transition cursor-pointer" onclick="viewProductDetails('${r.product_id}')">
                    <div>
                        <span class="text-xs font-semibold text-white block truncate max-w-[170px]">${r.name}</span>
                        <span class="text-[10px] text-cyan-300 font-mono">Similarity Index: ${(r.similarity_score * 100).toFixed(0)}%</span>
                    </div>
                    <span class="text-xs font-bold text-[#febd69]">$${r.price.toFixed(2)}</span>
                </div>
            `).join("");
        } else {
            recsList.innerHTML = `<span class="text-slate-500 text-xs col-span-2">No vector similarity matches recorded.</span>`;
        }

        document.getElementById("productDetailModal").classList.remove("hidden");
    } catch (e) {
        console.error("Product details error:", e);
    }
}

function closeProductModal() {
    document.getElementById("productDetailModal").classList.add("hidden");
}

function addModalProductToCart() {
    if (activeModalProduct) {
        quickAddToCart(activeModalProduct.product_id);
        closeProductModal();
    }
}

// Admin Add Product (TC02)
function openNewProductModal() {
    document.getElementById("newProductModal").classList.remove("hidden");
}

function closeNewProductModal() {
    document.getElementById("newProductModal").classList.add("hidden");
}

async function submitNewProduct() {
    const name = document.getElementById("newProdName").value;
    const sku = document.getElementById("newProdSku").value;
    const price = parseFloat(document.getElementById("newProdPrice").value);
    const category_id = document.getElementById("newProdCategory").value;
    const desc = document.getElementById("newProdDesc").value;
    const tagsStr = document.getElementById("newProdTags").value;
    const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()) : [];

    if (!name || !sku || isNaN(price)) {
        alert("Name, SKU, and valid Price are required.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/products`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                name, sku, price, category_id, description: desc, tags,
                attributes: { "created_via": "Admin Console", "tier": "Enterprise" }
            })
        });

        if (res.ok) {
            closeNewProductModal();
            loadCatalog();
            logSim(`[SUCCESS] Admin created product "${name}" (TC02 Verified).`, "success");
        } else {
            const err = await res.json();
            alert(`Error: ${err.error || 'Failed to create product'}`);
        }
    } catch (e) {
        console.error("New product error:", e);
    }
}

// =========================================================================
// 02. Shopping Cart & ACID Checkout Simulator
// =========================================================================
function quickAddToCart(productId) {
    const prod = catalogProducts.find(p => p.product_id === productId);
    if (!prod) return;

    const existing = cart.find(item => item.product_id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            product_id: prod.product_id,
            name: prod.name,
            price: prod.price,
            warehouse_id: "wh_hyd_01",
            warehouse_name: "Hyderabad Central Hub",
            quantity: 1
        });
    }
    updateCartUI();
    logSim(`[INFO] Added "${prod.name}" (qty: 1) to cart.`);
}

function initSimCart() {
    if (!cart.length) {
        cart.push({
            product_id: "prod_lap_01",
            name: "UltraBook Pro 16 AI Workstation",
            price: 1499.99,
            warehouse_id: "wh_hyd_01",
            warehouse_name: "Hyderabad Central Hub",
            quantity: 1
        });
    }
    updateCartUI();
}

function updateCartUI() {
    const countBadge = document.getElementById("cartCountBadge");
    if (countBadge) countBadge.innerText = cart.reduce((sum, i) => sum + i.quantity, 0);

    const simCartContainer = document.getElementById("simCartItems");
    const subtotalEl = document.getElementById("simCartSubtotal");
    if (!simCartContainer) return;

    if (!cart.length) {
        simCartContainer.innerHTML = `<p class="text-slate-500 text-xs py-6 text-center">Cart is empty. Add products from the catalog.</p>`;
        if (subtotalEl) subtotalEl.innerText = "$0.00";
        return;
    }

    let subtotal = 0;
    simCartContainer.innerHTML = cart.map((item, idx) => {
        subtotal += item.price * item.quantity;
        return `
            <div class="bg-[#232f3e] p-2.5 rounded border border-slate-700 text-xs space-y-1.5">
                <div class="flex justify-between items-start">
                    <span class="font-semibold text-white truncate max-w-[170px]">${item.name}</span>
                    <button onclick="removeCartItem(${idx})" class="text-rose-400 hover:text-rose-300 text-[11px]"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="flex justify-between items-center text-slate-400">
                    <span>Fulfillment Hub:</span>
                    <select onchange="updateCartWarehouse(${idx}, this.value)" class="bg-[#131921] border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-[#febd69] font-bold">
                        <option value="wh_hyd_01" ${item.warehouse_id === 'wh_hyd_01' ? 'selected' : ''}>Hyderabad Hub</option>
                        <option value="wh_blr_01" ${item.warehouse_id === 'wh_blr_01' ? 'selected' : ''}>Bangalore Hub</option>
                        <option value="wh_mum_01" ${item.warehouse_id === 'wh_mum_01' ? 'selected' : ''}>Mumbai Hub</option>
                        <option value="wh_del_01" ${item.warehouse_id === 'wh_del_01' ? 'selected' : ''}>Delhi Hub</option>
                    </select>
                </div>
                <div class="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-700/60">
                    <div class="flex items-center gap-1">
                        <button onclick="changeCartQty(${idx}, -1)" class="bg-[#131921] text-white px-1.5 py-0.5 rounded hover:bg-slate-700">-</button>
                        <span class="text-white font-bold px-1">${item.quantity}</span>
                        <button onclick="changeCartQty(${idx}, 1)" class="bg-[#131921] text-white px-1.5 py-0.5 rounded hover:bg-slate-700">+</button>
                    </div>
                    <span class="font-bold text-[#febd69] text-xs">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            </div>
        `;
    }).join("");

    if (subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
}

function updateCartWarehouse(idx, wid) {
    if (cart[idx]) cart[idx].warehouse_id = wid;
}

function changeCartQty(idx, delta) {
    if (cart[idx]) {
        cart[idx].quantity += delta;
        if (cart[idx].quantity <= 0) cart.splice(idx, 1);
        updateCartUI();
    }
}

function removeCartItem(idx) {
    cart.splice(idx, 1);
    updateCartUI();
}

function clearCart() {
    cart = [];
    updateCartUI();
}

function openCartModal() {
    switchTab("checkout-sim");
}

// Log utility for live console
function logSim(msg, type = "info") {
    const consoleEl = document.getElementById("simLogConsole");
    if (!consoleEl) return;
    const time = new Date().toLocaleTimeString();
    let color = "text-slate-300";
    if (type === "success") color = "text-emerald-400 font-bold";
    if (type === "error") color = "text-rose-400 font-bold";
    if (type === "warning") color = "text-amber-400";
    if (type === "lock") color = "text-cyan-400 font-bold";

    const logItem = document.createElement("p");
    logItem.className = `${color} leading-relaxed`;
    logItem.innerHTML = `<span class="text-slate-500 font-mono">[${time}]</span> ${msg}`;
    consoleEl.appendChild(logItem);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

function clearSimLogs() {
    const consoleEl = document.getElementById("simLogConsole");
    if (consoleEl) consoleEl.innerHTML = `<p class="text-slate-500">// Transaction logs cleared.</p>`;
}

// Execute ACID Order Placement
async function applyCoupon() {
    const code = document.getElementById("couponInput").value;
    if (!code) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    try {
        const res = await fetch(`${API_BASE}/api/coupons/validate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, order_amount: subtotal })
        });
        const data = await res.json();
        if (res.ok) {
            logSim(`[SUCCESS] Coupon applied! Discount: $${data.discount_amount}. New Total: $${data.final_amount}`, "success");
            document.getElementById("simCartSubtotal").innerText = `$${data.final_amount.toFixed(2)}`;
        } else {
            alert(`Coupon Error: ${data.error}`);
        }
    } catch (e) {
        console.error("Coupon error:", e);
    }
}

async function executeAcidCheckout(shouldFail) {
    if (!cart.length) {
        logSim("[WARN] Cart is empty. Add products before executing checkout.", "warning");
        return;
    }

    const stateEl = document.getElementById("simTxnState");
    stateEl.innerText = "TRANSACTION IN PROGRESS...";
    stateEl.className = "font-bold text-[#febd69] font-mono";

    logSim("[START] Initializing Distributed ACID Transaction...", "lock");
    logSim(`Step 1: User [${currentUserId}] (${currentUserName}) requests checkout.`);

    const itemsPayload = cart.map(item => ({
        product_id: item.product_id,
        warehouse_id: item.warehouse_id,
        quantity: shouldFail ? 99999 : item.quantity
    }));

    const couponCode = document.getElementById("couponInput")?.value || "";

    if (shouldFail) {
        logSim("[INJECTION] Requesting 99,999 units to trigger stockout and demonstrate ACID Rollback.", "warning");
    }

    try {
        logSim("[LOCK] Acquiring stock reservation locks (Redis 10-minute TTL)...", "lock");
        logSim("Step 2: PostgreSQL executing BEGIN TRANSACTION with SELECT FOR UPDATE row locks.");

        const res = await fetch(`${API_BASE}/api/orders`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                items: itemsPayload,
                coupon_code: couponCode,
                shipping_address: "Campus Deliveries, Aziz Nagar, Hyderabad 500075"
            })
        });

        const data = await res.json();

        if (res.ok) {
            logSim(`Step 3: Stock verified and decremented from warehouse inventory.`);
            logSim(`Step 4: Order inserted into PostgreSQL orders table [ID: ${data.order_id}] as PENDING.`);
            logSim(`Step 5: Immutable audit record committed to inventory_transactions.`);
            logSim(`Step 6: Cache reservation locks released.`);
            logSim(`[SUCCESS] ACID Order Committed. Total: $${data.total_amount.toFixed(2)}`, "success");

            stateEl.innerText = "PENDING PAYMENT";
            stateEl.className = "font-bold text-cyan-400 font-mono";

            activeOrderForPayment = data;
            openPaymentModal();
            clearCart();
            loadInventoryTable();
            loadAuditLogs();
        } else {
            logSim(`[ABORT] Transaction Aborted: ${data.error}`, "error");
            logSim(`[ROLLBACK] ACID Rollback Executed: All row locks released, zero state changes written.`, "warning");

            stateEl.innerText = "ROLLED BACK (CLEAN)";
            stateEl.className = "font-bold text-rose-400 font-mono";
        }
    } catch (e) {
        logSim(`[ERROR] Server Error: ${e.message}`, "error");
        stateEl.innerText = "FAILED";
        stateEl.className = "font-bold text-rose-400 font-mono";
    }
}

// Order History Modal
async function openOrdersModal() {
    const modal = document.getElementById("ordersModal");
    const container = document.getElementById("ordersListContainer");
    modal.classList.remove("hidden");
    container.innerHTML = `<p class="text-slate-500">Loading order history...</p>`;

    try {
        const res = await fetch(`${API_BASE}/api/orders`, { headers: getAuthHeaders() });
        const orders = await res.json();

        if (!orders.length) {
            container.innerHTML = `<p class="text-slate-500 text-center py-6">No orders recorded for this account.</p>`;
            return;
        }

        container.innerHTML = orders.map(o => `
            <div class="bg-[#232f3e] p-3 rounded border border-slate-700 space-y-1.5">
                <div class="flex justify-between items-center">
                    <span class="font-mono text-[#febd69] font-bold">${o.order_id}</span>
                    <span class="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">${o.status}</span>
                </div>
                <div class="flex justify-between text-slate-400 text-xs">
                    <span>${new Date(o.created_at).toLocaleString()}</span>
                    <span class="font-bold text-white text-xs">$${o.total_amount.toFixed(2)}</span>
                </div>
                <p class="text-[11px] text-slate-400">Destination: ${o.shipping_address || 'Aziz Nagar, Hyderabad'}</p>
            </div>
        `).join("");
    } catch (e) {
        console.error("Orders fetch error:", e);
    }
}

function closeOrdersModal() {
    document.getElementById("ordersModal").classList.add("hidden");
}

// =========================================================================
// 03. Multi-Warehouse Inventory Management
// =========================================================================
async function loadInventoryTable() {
    const wid = document.getElementById("warehouseFilterSelect")?.value || "";
    let url = `${API_BASE}/api/inventory`;
    if (wid) url += `?warehouse_id=${wid}`;

    try {
        const res = await fetch(url);
        const inv = await res.json();
        const tbody = document.getElementById("inventoryTableBody");
        if (!tbody) return;

        if (!inv.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-slate-500">No inventory records found.</td></tr>`;
            return;
        }

        tbody.innerHTML = inv.map(i => {
            const isLow = i.available_qty <= i.low_stock_threshold;
            return `
                <tr class="hover:bg-[#232f3e]/50">
                    <td class="p-3">
                        <span class="font-bold text-white block">${i.product_name}</span>
                        <span class="text-slate-400 font-mono text-[10px]">${i.sku}</span>
                    </td>
                    <td class="p-3">
                        <span class="text-slate-200 font-medium block">${i.warehouse_name}</span>
                        <span class="text-slate-400 text-[10px]">${i.warehouse_location}</span>
                    </td>
                    <td class="p-3 text-center font-bold text-white">${i.quantity}</td>
                    <td class="p-3 text-center text-[#febd69] font-medium font-mono">${i.reserved_qty}</td>
                    <td class="p-3 text-center font-bold ${isLow ? 'text-rose-400' : 'text-emerald-400'}">${i.available_qty}</td>
                    <td class="p-3">
                        ${isLow 
                            ? `<span class="bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded text-[10px] font-bold">LOW STOCK</span>`
                            : `<span class="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">OPTIMAL</span>`
                        }
                    </td>
                    <td class="p-3 text-right">
                        <button onclick="quickRestockItem('${i.product_id}', '${i.warehouse_id}')" class="bg-[#232f3e] hover:bg-[#37475a] text-slate-200 text-[11px] font-semibold px-2.5 py-1 rounded transition border border-slate-700">
                            <i class="fa-solid fa-boxes-stacked mr-1 text-[#febd69]"></i> Restock
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    } catch (e) {
        console.error("Inventory fetch error:", e);
    }
}

function openRestockModal() {
    const prodSelect = document.getElementById("restockProductSelect");
    if (prodSelect) {
        prodSelect.innerHTML = catalogProducts.map(p => `<option value="${p.product_id}">${p.name} (${p.sku})</option>`).join("");
    }
    document.getElementById("restockModal").classList.remove("hidden");
}

function closeRestockModal() {
    document.getElementById("restockModal").classList.add("hidden");
}

async function submitRestock() {
    const pid = document.getElementById("restockProductSelect").value;
    const wid = document.getElementById("restockWarehouseSelect").value;
    const delta = document.getElementById("restockQtyInput").value;

    try {
        const res = await fetch(`${API_BASE}/api/inventory`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ product_id: pid, warehouse_id: wid, delta: parseInt(delta), note: "Manual Restock (Admin/Manager)" })
        });
        if (res.ok) {
            closeRestockModal();
            loadInventoryTable();
            loadAuditLogs();
        } else {
            alert("Restock failed. Ensure you are signed in as ADMIN or WAREHOUSE_MANAGER.");
        }
    } catch (e) {
        console.error("Restock error:", e);
    }
}

function quickRestockItem(productId, warehouseId) {
    openRestockModal();
    document.getElementById("restockProductSelect").value = productId;
    document.getElementById("restockWarehouseSelect").value = warehouseId;
}

// =========================================================================
// 04. Demand Velocity Engine
// =========================================================================
async function loadIntelligence() {
    try {
        const res = await fetch(`${API_BASE}/api/intelligence/forecast`);
        const data = await res.json();

        document.getElementById("intelTotalProds").innerText = data.summary.total_products_tracked;
        document.getElementById("intelTotalValuation").innerText = `$${data.summary.total_inventory_valuation.toLocaleString()}`;
        document.getElementById("intelCriticalAlerts").innerText = data.summary.critical_stock_alerts;

        const tbody = document.getElementById("intelTableBody");
        if (!tbody) return;

        tbody.innerHTML = data.intelligence_report.map(r => `
            <tr class="hover:bg-[#232f3e]/50">
                <td class="p-3">
                    <span class="font-bold text-white block">${r.product_name}</span>
                    <span class="text-slate-400 font-mono text-[10px]">${r.sku} | $${r.price.toFixed(2)}</span>
                </td>
                <td class="p-3 text-center font-bold text-white">${r.available_stock}</td>
                <td class="p-3 text-center text-slate-300 font-medium">${r.units_sold} units</td>
                <td class="p-3 text-center text-[#febd69] font-mono font-bold">${r.daily_velocity} / day</td>
                <td class="p-3 text-center font-bold ${r.days_remaining < 10 ? 'text-rose-400' : 'text-emerald-400'}">${r.days_remaining > 365 ? '365+' : r.days_remaining} d</td>
                <td class="p-3 text-center">
                    ${r.recommended_restock > 0 
                        ? `<span class="text-[#febd69] font-bold bg-[#131921] px-2 py-0.5 rounded border border-[#febd69]/40">+${r.recommended_restock} units</span>`
                        : `<span class="text-slate-500">0</span>`
                    }
                </td>
                <td class="p-3">
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        r.status === 'CRITICAL_OUT_OF_STOCK' || r.status === 'LOW_STOCK_WARNING'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }">${r.status.replace(/_/g, ' ')}</span>
                </td>
            </tr>
        `).join("");
    } catch (e) {
        console.error("Intelligence error:", e);
    }
}

// =========================================================================
// 05. Database & Audit Inspector
// =========================================================================
async function loadAuditLogs() {
    try {
        const res = await fetch(`${API_BASE}/api/inventory/audit`);
        const logs = await res.json();
        const tbody = document.getElementById("auditTableBody");
        if (!tbody) return;

        if (!logs.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-slate-500">No transaction logs recorded.</td></tr>`;
            return;
        }

        tbody.innerHTML = logs.map(l => `
            <tr class="hover:bg-[#232f3e]/50 text-[11px]">
                <td class="p-2.5 text-slate-400 font-mono">${l.txn_id}</td>
                <td class="p-2.5 text-slate-400">${new Date(l.created_at).toLocaleTimeString()}</td>
                <td class="p-2.5 font-medium text-white">${l.product_name}</td>
                <td class="p-2.5 text-slate-300">${l.warehouse_name}</td>
                <td class="p-2.5">
                    <span class="px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        l.txn_type === 'RESTOCK' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        l.txn_type === 'SALE_DEDUCTION' ? 'bg-[#232f3e] text-blue-300 border border-blue-800' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                    }">${l.txn_type}</span>
                </td>
                <td class="p-2.5 text-center font-bold ${l.delta > 0 ? 'text-emerald-400' : 'text-rose-400'}">${l.delta > 0 ? '+' : ''}${l.delta}</td>
                <td class="p-2.5 text-slate-400">${l.note || l.performed_by}</td>
            </tr>
        `).join("");
    } catch (e) {
        console.error("Audit log error:", e);
    }
}

// =========================================================================
// 06. Live Test Suite Execution (TC01 - TC10)
// =========================================================================
async function runTestSuite() {
    const btn = document.getElementById("runTestBtn");
    const banner = document.getElementById("testSummaryBanner");
    const tbody = document.getElementById("testTableBody");

    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Running TC01-TC10...`;

    try {
        const res = await fetch(`${API_BASE}/api/tests/run`, { method: "POST" });
        const data = await res.json();

        banner.classList.remove("hidden");
        banner.innerHTML = `
            <div class="flex items-center gap-2.5">
                <span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                <span class="font-bold text-white text-xs">Test Execution Completed: ${data.passed_tests} / ${data.total_tests} Tests Passed</span>
            </div>
            <span class="bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded font-bold border border-emerald-800 text-xs">${data.success_rate} Passed</span>
        `;

        tbody.innerHTML = data.results.map(tc => `
            <tr class="hover:bg-[#232f3e]/50">
                <td class="p-3 font-bold font-mono text-[#febd69]">${tc.test_case_id}</td>
                <td class="p-3 font-semibold text-white">${tc.title}</td>
                <td class="p-3 text-slate-400 text-xs">${tc.description}</td>
                <td class="p-3 text-center">
                    ${tc.status === 'PASSED'
                        ? `<span class="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]"><i class="fa-solid fa-circle-check mr-1"></i> PASSED</span>`
                        : `<span class="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-bold text-[10px]"><i class="fa-solid fa-circle-xmark mr-1"></i> FAILED</span>`
                    }
                </td>
            </tr>
        `).join("");

    } catch (e) {
        console.error("Test runner error:", e);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-play"></i> Run All 10 Test Cases`;
    }
}

// =========================================================================
// Address Management Functions
// =========================================================================
function openAddressModal() {
    document.getElementById("addressModal").classList.remove("hidden");
}

function closeAddressModal() {
    document.getElementById("addressModal").classList.add("hidden");
}

async function submitAddress() {
    const data = {
        address_line1: document.getElementById("addrLine1").value,
        city: document.getElementById("addrCity").value,
        state: document.getElementById("addrState").value,
        zip: document.getElementById("addrZip").value,
        country: document.getElementById("addrCountry").value,
        is_default: document.getElementById("addrDefault").checked
    };

    if (!data.address_line1 || !data.city || !data.state || !data.zip) {
        alert("Please fill in all required address fields.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/addresses`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeAddressModal();
            loadUserAddresses();
            logSim("[SUCCESS] New shipping address added to profile.", "success");
        } else {
            const err = await res.json();
            alert(`Error: ${err.error}`);
        }
    } catch (e) {
        console.error("Address submission error:", e);
    }
}

async function loadUserAddresses() {
    try {
        const res = await fetch(`${API_BASE}/api/addresses`, { headers: getAuthHeaders() });
        const addresses = await res.json();
        const listContainer = document.getElementById("userAddressesList");
        if (!listContainer) return;

        if (!addresses.length) {
            listContainer.innerHTML = `<p class="col-span-full text-center text-slate-500 py-6">No saved addresses found.</p>`;
            return;
        }

        listContainer.innerHTML = addresses.map(a => `
            <div class="bg-[#232f3e] p-4 rounded border ${a.is_default ? 'border-[#febd69]' : 'border-slate-700'} transition hover:border-slate-500">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-xs font-bold text-white">${a.is_default ? '🏠 Default' : '📍 Shipping Address'}</span>
                    <button onclick="deleteAddress('${a.address_id}')" class="text-rose-400 hover:text-rose-300"><i class="fa-solid fa-trash text-[10px]"></i></button>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">${a.address_line1}<br>${a.city}, ${a.state} ${a.zip}<br>${a.country}</p>
            </div>
        `).join("");
    } catch (e) {
        console.error("Fetch addresses error:", e);
    }
}

async function deleteAddress(addressId) {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
        const res = await fetch(`${API_BASE}/api/addresses/${addressId}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });
        if (res.ok) {
            loadUserAddresses();
            logSim("[INFO] Address deleted from profile.", "info");
        }
    } catch (e) {
        console.error("Delete address error:", e);
    }
}

// =========================================================================
// Payment & Shipping Logistics Functions
// =========================================================================
function openPaymentModal() {
    if (!activeOrderForPayment) return;
    document.getElementById("paymentAmount").innerText = `$${activeOrderForPayment.total_amount.toFixed(2)}`;
    document.getElementById("paymentModal").classList.remove("hidden");
}

function closePaymentModal() {
    document.getElementById("paymentModal").classList.add("hidden");
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    document.querySelectorAll(".payment-method-card").forEach(card => card.classList.remove("selected"));
    document.getElementById(`pay-${method}`).classList.add("selected");
}

async function submitPayment() {
    if (!activeOrderForPayment) return;
    const txnId = document.getElementById("paymentTxnId").value;

    try {
        const res = await fetch(`${API_BASE}/api/payments/process`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                payment_id: activeOrderForPayment.payment_id,
                method: selectedPaymentMethod,
                transaction_id: txnId
            })
        });
        const data = await res.json();
        if (res.ok) {
            alert(`Payment Successful! Order ${activeOrderForPayment.order_id} is now CONFIRMED.`);
            closePaymentModal();
            activeOrderForPayment = null;
            logSim(`[SUCCESS] Payment Processed. Order status updated to CONFIRMED.`, "success");
        } else {
            alert(`Payment Failed: ${data.error}`);
        }
    } catch (e) {
        console.error("Payment error:", e);
    }
}

function openShippingModal(orderId) {
    document.getElementById("shippingModal").classList.remove("hidden");
    loadShippingTrack(orderId);
}

function closeShippingModal() {
    document.getElementById("shippingModal").classList.add("hidden");
}

async function loadShippingTrack(orderId) {
    try {
        const res = await fetch(`${API_BASE}/api/shipping/${orderId}`);
        const data = await res.json();
        const content = document.getElementById("shippingTrackContent");
        if (!content) return;

        if (!res.ok) {
            content.innerHTML = `<p class="text-rose-400 text-center">Shipping details not yet available for this order.</p>`;
            return;
        }

        const status = data.shipping_status;
        const steps = ['PREPARING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
        const currentIndex = steps.indexOf(status);

        content.innerHTML = `
            <div class="bg-[#232f3e] p-4 rounded border border-slate-700 flex justify-between items-center mb-4">
                <div>
                    <span class="text-slate-400 text-[10px] block uppercase">Carrier</span>
                    <span class="text-white font-bold text-xs">${data.carrier}</span>
                </div>
                <div class="text-right">
                    <span class="text-slate-400 text-[10px] block uppercase">Tracking #</span>
                    <span class="text-[#febd69] font-mono text-xs">${data.tracking_number}</span>
                </div>
            </div>
            <div class="shipping-timeline">
                ${steps.map((s, i) => `
                    <div class="shipping-step ${i < currentIndex ? 'completed' : (i === currentIndex ? 'active' : '')}">
                        <div class="step-icon h-8 w-8 rounded-full bg-[#131921] border-2 border-slate-700 flex items-center justify-center mx-auto text-xs">
                            ${i < currentIndex ? '<i class="fa-solid fa-check text-emerald-400"></i>' : (i === currentIndex ? '<i class="fa-solid fa-truck text-amber-400"></i>' : i+1)}
                        </div>
                        <span class="text-[10px] font-medium text-slate-300 block mt-1">${s.replace('_', ' ')}</span>
                    </div>
                `).join("")}
            </div>
            <div class="text-center mt-6">
                <span class="text-slate-400 text-xs">Estimated Delivery:</span>
                <span class="text-white font-bold text-xs ml-1">${data.estimated_delivery ? new Date(data.estimated_delivery).toLocaleDateString() : 'TBD'}</span>
            </div>
        `;
    } catch (e) {
        console.error("Shipping track error:", e);
    }
}

// =========================================================================
// Product Review Functions (MongoDB integration)
// =========================================================================
function openReviewModal(productId) {
    activeModalProduct = null; // Reuse for review context or set a specific state
    document.getElementById("reviewModal").classList.remove("hidden");
    document.getElementById("reviewProductId").value = productId;
    setReviewRating(0);
}

function closeReviewModal() {
    document.getElementById("reviewModal").classList.add("hidden");
}

function setReviewRating(rating) {
    currentReviewRating = rating;
    document.querySelectorAll(".star-rating i").forEach((star, i) => {
        if (i < rating) {
            star.className = "fa-solid fa-star text-amber-400";
        } else {
            star.className = "fa-regular fa-star text-slate-400";
        }
    });
}

async function submitReview() {
    const productId = document.getElementById("reviewProductId").value;
    const comment = document.getElementById("reviewComment").value;

    if (currentReviewRating === 0) {
        alert("Please select a star rating.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/reviews`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                product_id: productId,
                rating: currentReviewRating,
                comment: comment
            })
        });
        if (res.ok) {
            alert("Review submitted successfully!");
            closeReviewModal();
            logSim(`[SUCCESS] Review posted for product ${productId}.`, "success");
        } else {
            const err = await res.json();
            alert(`Error: ${err.error}`);
        }
    } catch (e) {
        console.error("Review submission error:", e);
    }
}
