/* Global adapter for the existing single-file POS interface.
 * Database permissions and stock integrity live in Supabase, not in this file. */
(() => {
  const config = window.POS_CONFIG;
  if (!config?.supabaseUrl || !config?.supabasePublishableKey || !window.supabase) {
    alert('Konfigurasi Supabase tidak tersedia.');
    return;
  }
  const client = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey);
  window.posClient = client;
  let profile = null;
  let initialized = false;

  const managementRoles = new Set(['owner', 'admin', 'manager']);
  const money = value => Number(value || 0);
  const toSen = value => Math.round((Number(value) + Number.EPSILON) * 100);
  const fromSen = value => value / 100;
  const roleLabels = {
    owner: 'Pemilik', admin: 'Admin', manager: 'Pengurus', cashier: 'Juruwang', auditor: 'Juruaudit'
  };
  const showError = error => alert(`Tidak dapat sambung ke pangkalan data: ${error.message || error}`);

  function productComparator(left, right) {
    const leftCategory = CATEGORIES.findIndex(category => category.id === left.category);
    const rightCategory = CATEGORIES.findIndex(category => category.id === right.category);
    const categoryOrder = (leftCategory < 0 ? 999 : leftCategory) - (rightCategory < 0 ? 999 : rightCategory);
    return categoryOrder || left.category.localeCompare(right.category, 'ms-MY', { sensitivity: 'base' }) || left.name.localeCompare(right.name, 'ms-MY', { sensitivity: 'base' });
  }

  function applyRoleInterface() {
    const role = profile?.role || 'cashier';
    const isManagement = managementRoles.has(role);
    const isOwnerOrAdmin = role === 'owner' || role === 'admin';
    const isAuditor = role === 'auditor';
    const badge = document.getElementById('adminBadge');
    const guestBadge = document.getElementById('guestBadge');
    badge.textContent = roleLabels[role] || role;
    badge.classList.remove('hidden');
    guestBadge.classList.add('hidden');
    document.getElementById('btnAddProduct').classList.toggle('hidden', !isManagement);
    document.getElementById('btnSettings').classList.toggle('hidden', role !== 'owner');
    document.querySelectorAll('[onclick="showImportModal()"]').forEach(el => el.classList.toggle('hidden', !isOwnerOrAdmin));
    document.querySelectorAll('[onclick="showSuppliers()"]').forEach(el => el.classList.toggle('hidden', !isManagement));
    document.querySelectorAll('[onclick="showStockHistory()"]').forEach(el => el.classList.toggle('hidden', !isManagement && !isAuditor));
    document.querySelectorAll('[onclick="showAddCustomItem()"]').forEach(el => el.classList.toggle('hidden', isAuditor));
    document.getElementById('completeBtn').classList.toggle('hidden', isAuditor);
    document.getElementById('paymentMethod').closest('div').classList.toggle('hidden', isAuditor);
    document.getElementById('amountPaid').closest('div').parentElement.classList.toggle('hidden', isAuditor);
    document.getElementById('transactionNote').closest('div').classList.toggle('hidden', isAuditor);
    //document.getElementById('productGrid').classList.toggle('pointer-events-none', isAuditor);
    // Add styling to disable only the cards:
    if (isAuditor) {
      document.getElementById('productGrid').classList.add('auditor-mode');
    } else {
      document.getElementById('productGrid').classList.remove('auditor-mode');
    }
  }
  
  // Work entirely in sen. JavaScript decimal arithmetic made RM 1.20 appear
  // less than an internally represented RM 1.2000000000000002.
  window.getCartTotal = function () {
    return fromSen(appState.cart.reduce((totalSen, item) => {
      const price = item.temp ? item.tempData?.price : appState.products.find(product => product.id === item.productId)?.price;
      return totalSen + toSen(price || 0) * item.quantity;
    }, 0));
  };
  window.getPaidAmount = function () {
    const raw = document.getElementById('amountPaid').value.replace(/[^0-9.]/g, '');
    return fromSen(toSen(raw || 0));
  };
  window.updatePaymentUI = function () {
    const totalSen = toSen(getCartTotal());
    const paidSen = toSen(getPaidAmount());
    const balanceSen = paidSen - totalSen;
    const balanceEl = document.getElementById('balanceDisplay');
    const warningEl = document.getElementById('balanceWarning');
    const button = document.getElementById('completeBtn');
    if (paidSen > 0 && balanceSen >= 0) {
      balanceEl.textContent = `RM ${fromSen(balanceSen).toFixed(2)}`;
      balanceEl.className = 'text-lg font-bold text-primary-600 balance';
      warningEl.classList.add('hidden'); button.disabled = false;
    } else if (paidSen > 0) {
      balanceEl.textContent = `- RM ${fromSen(-balanceSen).toFixed(2)}`;
      balanceEl.className = 'text-lg font-bold text-red-500 balance';
      warningEl.classList.remove('hidden'); button.disabled = true;
    } else {
      balanceEl.textContent = 'RM 0.00';
      balanceEl.className = 'text-lg font-bold text-gray-400 balance';
      warningEl.classList.add('hidden'); button.disabled = true;
    }
    if (!appState.cart.length || profile?.role === 'auditor') button.disabled = true;
  };

  window.renderProducts = function () {
    const container = document.getElementById('productGrid');
    let filtered = [...appState.products];
    if (appState.currentCategory !== 'all') filtered = filtered.filter(product => product.category === appState.currentCategory);
    if (appState.searchQuery) filtered = filtered.filter(product => product.name.toLowerCase().includes(appState.searchQuery) || product.code?.toLowerCase().includes(appState.searchQuery));
    if (appState.lowStockOnly) filtered = filtered.filter(product => product.stock <= product.minStock);
    filtered.sort(productComparator);
    document.getElementById('productCount').textContent = filtered.length;
    const categoryName = CATEGORIES.find(category => category.id === appState.currentCategory)?.name || 'Semua Produk';
    document.getElementById('categoryTitle').textContent = categoryName + (appState.lowStockOnly ? ' (Stok Rendah)' : '');
    if (!filtered.length) {
      container.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-gray-400"><i data-lucide="package-x" class="w-10 h-10 mb-1 opacity-30"></i><p class="text-xs">Tiada produk dijumpai</p></div>';
    } else if (appState.viewMode === 'grid' && appState.currentCategory === 'all' && !appState.searchQuery && !appState.lowStockOnly) {
      const groups = new Map();
      filtered.forEach(product => groups.set(product.category, [...(groups.get(product.category) || []), product]));
      container.innerHTML = [...groups.entries()].map(([category, products]) =>
        `<section class="mb-4"><h3 class="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">${category}</h3><div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">${products.map(renderProductCard).join('')}</div></section>`
      ).join('');
    } else {
      container.innerHTML = appState.viewMode === 'grid'
        ? `<div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">${filtered.map(renderProductCard).join('')}</div>`
        : `<div class="space-y-1.5">${filtered.map(renderProductListItem).join('')}</div>`;
    }
    lucide.createIcons(); updateLowStockBadge();
  };

  async function loadRemoteData() {
    const [catalog, suppliers, sales, movements, settings] = await Promise.all([
      client.from('products').select('id,legacy_id,product_code,name,unit_price,stock_on_hand,minimum_stock,active,category:categories(name),supplier_id').eq('active', true).order('name'),
      client.from('suppliers').select('id,legacy_id,name,phone,email,address').eq('active', true).order('name'),
      client.from('sales').select('id,receipt_number,created_at,total,payments(method,amount,cash_received,change_given,status),sale_items(product_id,product_name_snapshot,unit_price,quantity,line_total)').order('created_at', { ascending: false }).limit(500),
      client.from('stock_movements').select('id,product_id,kind,quantity_delta,quantity_before,quantity_after,reason,created_at').order('created_at', { ascending: false }).limit(500),
      client.from('store_settings').select('state,business_date').single()
    ]);
    for (const result of [catalog, suppliers, sales, movements, settings]) if (result.error) throw result.error;
    appState.products = catalog.data.map(p => ({
      id: p.id, legacyId: p.legacy_id, name: p.name, price: money(p.unit_price),
      category: p.category?.name || 'Lain-lain', code: p.product_code || '',
      stock: p.stock_on_hand, minStock: p.minimum_stock, supplierId: p.supplier_id
    }));
    appState.suppliers = suppliers.data;
    appState.transactions = sales.data.map(s => ({
      id: s.id, receiptNumber: s.receipt_number, timestamp: s.created_at, total: money(s.total),
      paid: money(s.payments?.[0]?.cash_received ?? s.payments?.[0]?.amount),
      balance: money(s.payments?.[0]?.change_given),
      paymentMethod: s.payments?.[0]?.method,
      items: (s.sale_items || []).map(i => ({ productId: i.product_id, name: i.product_name_snapshot, price: money(i.unit_price), quantity: i.quantity, total: money(i.line_total) }))
    }));
    appState.stockHistory = movements.data.map(m => ({
      id: m.id, productId: m.product_id, type: m.kind, quantity: m.quantity_delta,
      previousStock: m.quantity_before, newStock: m.quantity_after, note: m.reason || '', timestamp: m.created_at
    }));
    appState.storeState = settings.data.state;
  }

  async function renderRemoteData() {
    await loadRemoteData();
    populateSupplierDropdowns(); renderCategories(); renderProducts(); renderCart();
    updateStats(); updatePaymentUI(); updateLowStockBadge(); lucide.createIcons();
    updateStoreButton();
  }

  function updateStoreButton() {
    const button = document.getElementById('storeStateBtn');
    if (!button) return;
    if (!managementRoles.has(profile?.role)) { button.classList.add('hidden'); return; }
    button.classList.remove('hidden');
    const open = appState.storeState === 'open';
    button.textContent = open ? '● KEDAI BUKA' : '○ KEDAI TUTUP';
    button.className = `px-2 py-1 rounded text-[10px] ${open ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-red-700 hover:bg-red-600'}`;
  }

  window.init = async function initOnlinePos() {
    if (initialized) return;
    initialized = true;
    try {
      await renderRemoteData();
      updateDate();
      setInterval(updateDate, 60000);
      document.addEventListener('keydown', handleKeydown);
      document.addEventListener('click', hideContextMenu);
      document.getElementById('searchInput').addEventListener('input', e => { appState.searchQuery = e.target.value.toLowerCase(); renderProducts(); });
      document.getElementById('amountPaid').addEventListener('input', onPaymentInput);
      client.channel('pos-catalog-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => renderRemoteData().catch(showError))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, () => renderRemoteData().catch(showError))
        .subscribe();
    } catch (error) {
      initialized = false;
      showError(error);
    }
  };

  window.checkLogin = async function () {
    const { data: { session } } = await client.auth.getSession();
    if (!session) return;
    const { data, error } = await client.from('profiles').select('id,display_name,role,active').eq('id', session.user.id).single();
    if (error || !data?.active) { await client.auth.signOut(); return; }
    profile = data;
    appState.isAdmin = managementRoles.has(profile.role);
    showMainApp();
    applyRoleInterface();
  };

  window.doLogin = async function () {
    const email = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) return alert('Masukkan e-mel dan kata laluan.');
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return alert('E-mel atau kata laluan tidak sah.');
    const response = await client.from('profiles').select('id,display_name,role,active').eq('id', data.user.id).single();
    if (response.error || !response.data?.active) { await client.auth.signOut(); return alert('Akaun ini belum diberi akses POS.'); }
    profile = response.data;
    appState.isAdmin = managementRoles.has(profile.role);
    showMainApp();
    applyRoleInterface();
  };

  window.doLogout = async function () { await client.auth.signOut(); location.reload(); };
  window.loginAsGuest = () => alert('Setiap pengguna perlu menggunakan akaun sendiri untuk rekod audit.');
  window.loadData = () => {};
  window.saveData = () => {};

  window.completeTransaction = async function () {
    if (!appState.cart.length) return;
    if (appState.storeState !== 'open') return alert('Kedai ditutup. Jualan baharu tidak dibenarkan.');
    if (profile?.role === 'auditor') return alert('Juruaudit hanya boleh melihat rekod.');
    const totalSen = toSen(getCartTotal());
    const paidSen = toSen(getPaidAmount());
    const method = document.getElementById('paymentMethod').value;
    if (method === 'cash' && paidSen < totalSen) return alert('Amaun tunai tidak mencukupi.');
    if (method !== 'cash' && paidSen !== totalSen) return alert('Untuk Kad atau DuitNow, masukkan jumlah tepat RM ' + fromSen(totalSen).toFixed(2) + '.');
    const button = document.getElementById('completeBtn'); button.disabled = true;
    const { data, error } = await client.rpc('complete_sale', {
      p_items: appState.cart.map(item => item.temp
        ? { name: item.tempData.name, unit_price: fromSen(toSen(item.tempData.price)), quantity: item.quantity }
        : { product_id: item.productId, quantity: item.quantity }),
      p_method: method,
      p_cash_received: method === 'cash' ? fromSen(paidSen) : null,
      p_external_reference: null
    });
    if (error) { button.disabled = false; return alert(error.message); }
    appState.cart = [];
    document.getElementById('transactionNote').value = '';
    document.getElementById('amountPaid').value = '0.00';
    await renderRemoteData();
    alert(`Transaksi berjaya direkodkan. Resit: ${data}`);
  };

  window.addCustomItem = function () {
    const name = document.getElementById('customItemName').value.trim();
    const priceSen = toSen(document.getElementById('customItemPrice').value);
    const quantity = Number.parseInt(document.getElementById('customItemQty').value, 10);
    if (!name) return alert('Sila masukkan nama item.');
    if (!Number.isInteger(quantity) || quantity < 1 || priceSen < 0) return alert('Sila masukkan harga dan kuantiti yang sah.');
    appState.cart.push({
      productId: `manual-${crypto.randomUUID()}`,
      quantity,
      temp: true,
      tempData: { name, price: fromSen(priceSen) }
    });
    renderCart(); closeModal('customItemModal');
  };

  window.confirmRestock = async function () {
    const productId = document.getElementById('restockProductId').value;
    const qty = Number.parseInt(document.getElementById('restockQty').value, 10);
    const note = document.getElementById('restockNote').value.trim();
    const supplierId = document.getElementById('restockSupplier').value || null;
    if (!Number.isInteger(qty) || qty <= 0 || !note) return alert('Masukkan kuantiti dan sebab/restock note.');
    const { error } = await client.rpc('adjust_stock', { p_product_id: productId, p_quantity_delta: qty, p_reason: note });
    if (error) return alert(error.message);
    if (supplierId) await client.from('products').update({ supplier_id: supplierId }).eq('id', productId);
    closeModal('restockModal'); await renderRemoteData();
  };

  async function categoryIdFor(name) {
    const write = await client.from('categories').upsert({ name }, { onConflict: 'name' }).select('id').single();
    if (write.error) throw write.error;
    return write.data.id;
  }

  window.saveProduct = async function () {
    const id = document.getElementById('editProductId').value;
    const name = document.getElementById('productName').value.trim();
    const price = Number.parseFloat(document.getElementById('productPrice').value);
    const categoryName = document.getElementById('productCategory').value;
    const productCode = document.getElementById('productCode').value.trim() || null;
    const stock = Number.parseInt(document.getElementById('productStock').value, 10) || 0;
    const minimumStock = Number.parseInt(document.getElementById('productMinStock').value, 10) || 0;
    const supplierId = document.getElementById('productSupplier').value || null;
    const stockReason = document.getElementById('productStockReason').value.trim();
    if (!name || !Number.isFinite(price) || price < 0) return alert('Sila isi nama dan harga produk dengan betul.');
    try {
      const categoryId = await categoryIdFor(categoryName);
      const fields = { name, unit_price: price, category_id: categoryId, product_code: productCode, minimum_stock: minimumStock, supplier_id: supplierId };
      if (id) {
        const old = appState.products.find(product => product.id === id);
        const write = await client.from('products').update(fields).eq('id', id);
        if (write.error) throw write.error;
        const delta = stock - Number(old?.stock || 0);
        if (delta) {
          if (!stockReason) return alert('Sebab pelarasan stok diperlukan. Butiran produk telah disimpan; masukkan sebab dan simpan semula untuk stok.');
          const adjustment = await client.rpc('adjust_stock', { p_product_id: id, p_quantity_delta: delta, p_reason: stockReason });
          if (adjustment.error) throw adjustment.error;
        }
      } else {
        const inserted = await client.from('products').insert({ ...fields, stock_on_hand: 0 }).select('id').single();
        if (inserted.error) throw inserted.error;
        if (stock) {
          const adjustment = await client.rpc('adjust_stock', { p_product_id: inserted.data.id, p_quantity_delta: stock, p_reason: stockReason || 'Stok awal produk baharu' });
          if (adjustment.error) throw adjustment.error;
        }
      }
      closeModal('productModal'); await renderRemoteData();
    } catch (error) { showError(error); }
  };

  window.deleteProductFromMenu = async function () {
    hideContextMenu();
    const product = appState.products.find(item => item.id === appState.contextProductId);
    if (!product || !confirm(`Nyahaktif produk "${product.name}"? Rekod jualan lama akan dikekalkan.`)) return;
    const { error } = await client.from('products').update({ active: false }).eq('id', product.id);
    if (error) return showError(error);
    appState.cart = appState.cart.filter(item => item.productId !== product.id);
    await renderRemoteData();
  };

  window.saveSupplier = async function () {
    const id = document.getElementById('editSupplierId').value;
    const fields = {
      name: document.getElementById('supplierName').value.trim(),
      phone: document.getElementById('supplierPhone').value.trim() || null,
      email: document.getElementById('supplierEmail').value.trim() || null,
      address: document.getElementById('supplierAddress').value.trim() || null
    };
    if (!fields.name) return alert('Nama pembekal diperlukan.');
    const result = id ? await client.from('suppliers').update(fields).eq('id', id) : await client.from('suppliers').insert(fields);
    if (result.error) return showError(result.error);
    closeModal('addSupplierModal'); await renderRemoteData();
  };

  window.toggleStoreState = async function () {
    const next = appState.storeState === 'open' ? 'closed' : 'open';
    if (!confirm(next === 'open' ? 'Buka kedai untuk jualan?' : 'Tutup kedai dan hentikan jualan baharu?')) return;
    const { error } = await client.rpc('set_store_state', { p_state: next });
    if (error) return alert(error.message);
    await renderRemoteData();
  };

  window.exportDatabase = function () {
    const data = { products: appState.products, transactions: appState.transactions, suppliers: appState.suppliers, stockHistory: appState.stockHistory, exportDate: new Date().toISOString(), version: 'online-export-1.0' };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `pos-online-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url);
  };

  window.handleImport = function (event) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const payload = JSON.parse(e.target.result);
        if (!confirm(`Import ${payload.products?.length || 0} produk ke pangkalan data pusat? Data sedia ada tidak akan ditindih.`)) return;
        const { data, error } = await client.rpc('import_legacy_v2_backup', { p_payload: payload });
        if (error) throw error;
        closeModal('importModal'); await renderRemoteData(); alert(`Import selesai: ${data.products_added} produk baharu.`);
      } catch (error) { alert(error.message || 'Fail import tidak sah.'); }
    };
    reader.readAsText(file);
  };
})();
