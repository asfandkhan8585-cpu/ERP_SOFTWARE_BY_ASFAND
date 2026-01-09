// ============================================
// SWAN-ERP PROFESSIONAL EDITION - COMPLETE
// With Daily Dashboard Reset & Service Categories
// Enhanced Role Management & External Customer Display
// ============================================

// ===== GLOBAL STATE =====
const STATE = {
    role: "Employee",
    items: [],
    customers: [],
    suppliers: [],
    sales: [],
    purchases: [],
    expenses: [],
    banks: [],
    bankTransactions: [],
    employees: [],
    attendance: [],
    posCart: [],
    purchaseCart: [],
    heldBills: [],
    currentBillIndex: -1,
    custPayments: [],
    supPayments: [],
    serviceCharges: [],
    settings: {
        companyName: "SWAN-ERP",
        companyAddress: "Your Address Here",
        logo: "",
        taxMode: "percent",
        taxPercent: 0,
        fixedTax: 0
    },
    dailyDate: getTodayDate(),
    dailySales: 0,
    dailyExpenses: 0,
    customerScreenMaximized: false,

    // NEW LICENSE/TRIAL FIELDS
    licenseKey: "",
    licenseVerified: false,
    trial: {
        started: false,
        startDate: null
    }
};


const UNITS = ['pc', 'kg', 'ltr', 'box', 'carton', 'dozen', 'pack', 'bag', 'bottle', 'can'];

// ===== UTILITY FUNCTIONS =====
function getTodayDate() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function parseDate(dateStr) {
    // "YYYY-MM-DD" -> Date
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function formatDayKey(dateStr) {
    return dateStr; // already "YYYY-MM-DD"
}

function formatMonthKey(dateStr) {
    const [y, m] = dateStr.split("-");
    return y + "-" + m; // "YYYY-MM"
}

function getCurrentTime() {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
}

function formatCurrency(num) {
    return parseFloat(num || 0).toFixed(2);
}

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function saveToStorage() {
    try {
        localStorage.setItem('swanERP', JSON.stringify(STATE));
    } catch (e) {
        console.error('Storage error:', e);
    }
}

function loadFromStorage() {
    try {
        const data = localStorage.getItem('swanERP');
        if (data) {
            const parsed = JSON.parse(data);
            Object.assign(STATE, parsed);

            // ensure license fields exist even on old saves
            if (typeof STATE.licenseKey === "undefined") STATE.licenseKey = "";
            if (typeof STATE.licenseVerified === "undefined") STATE.licenseVerified = false;
            if (typeof STATE.trialStarted === "undefined") STATE.trialStarted = false;

            const today = getTodayDate();
            if (STATE.dailyDate !== today) {
                STATE.dailyDate = today;
                STATE.dailySales = 0;
                STATE.dailyExpenses = 0;
                saveToStorage();
            }
        } else {
            // first run: initialize defaults
            STATE.licenseKey = "";
            STATE.licenseVerified = false;
            STATE.trialStarted = false;

            const today = getTodayDate();
            STATE.dailyDate = today;
            STATE.dailySales = 0;
            STATE.dailyExpenses = 0;
        }
    } catch (e) {
        console.error('Load error:', e);
    }
}



function showModal(id) {
    document.getElementById(id).classList.add('active');
}

function hideModal(id) {
    document.getElementById(id).classList.remove('active');
}

function showNotification(msg) {
    alert(msg);
}

// ===== IMPROVED SEARCH ALGORITHM =====
function fuzzySearch(items, query, keys) {
    if (!query || query.trim() === '') return items;
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/);

    const scored = items.map(item => {
        let score = 0;
        keys.forEach(key => {
            const value = String(item[key] || '').toLowerCase();

            if (value === q) score += 10000;
            else if (value.startsWith(q)) score += 5000;
            else if (value.includes(q)) score += 1000;

            words.forEach(word => {
                if (value.includes(word)) score += 500;
            });
        });
        return { item, score };
    });

    return scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 100)
        .map(s => s.item);
}

// ===== DATE SYNCING (AUTO-SELECT TODAY FOR ALL DATES) =====
function syncDates() {
    const today = getTodayDate();

    // Set ALL date inputs to today (including report ranges)
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });

    // Update clock
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(syncDates, 1000);

// ===== ROLE-BASED UI VISIBILITY (ENHANCED) =====
function updateRoleVisibility() {
    const isAdmin = STATE.role === 'Admin';

    // Completely hide profit tiles for employees
    const profitTiles = document.querySelectorAll('.tile-hidden-admin');
    profitTiles.forEach(tile => {
        tile.style.display = isAdmin ? '' : 'none';
    });

    // Hide profit report buttons for employees
    const profitViewBtn = document.querySelector('[data-rpt-view="profit"]');
    const profitPrintBtn = document.querySelector('[data-rpt-print="profit"]');
    if (profitViewBtn) profitViewBtn.style.display = isAdmin ? '' : 'none';
    if (profitPrintBtn) profitPrintBtn.style.display = isAdmin ? '' : 'none';

    // Hide HR and Settings navigation buttons for employees
    const hrNav = document.getElementById('hr-nav-btn');
    const settingsNav = document.getElementById('settings-nav-btn');
    if (hrNav) hrNav.style.display = isAdmin ? '' : 'none';
    if (settingsNav) settingsNav.style.display = isAdmin ? '' : 'none';

    // Hide all report view buttons for employees
    document.querySelectorAll('[data-rpt-view]').forEach(btn => {
        if (!isAdmin) {
            btn.style.display = 'none';
        } else {
            btn.style.display = '';
        }
    });

// Hide all report print buttons for employees
    document.querySelectorAll('[data-rpt-print]').forEach(btn => {
        if (!isAdmin) {
            btn.style.display = 'none';
        } else {
            btn.style.display = '';
        }
    });

}
function updateLicenseUI() {
    const pill = document.getElementById("license-status-pill");
    const box = document.getElementById("license-settings-box");
    if (!pill) return;

    if (STATE.licenseVerified) {
        pill.textContent = "Licensed";
        pill.classList.remove("license-unlicensed");
        pill.classList.add("license-licensed");
        if (box) box.style.display = "none";
    } else {
        pill.textContent = STATE.trialStarted ? "Trial" : "Unlicensed";
        pill.classList.remove("license-licensed");
        pill.classList.add("license-unlicensed");
        if (box) box.style.display = "block";
    }
}

function handleStartupLicenseFlow() {
    const modal = document.getElementById("m-license-start");
    if (!modal) return;

    if (STATE.licenseVerified) {
        modal.classList.remove("active");
        return;
    }

    if (!STATE.trialStarted) {
        // user must choose Trial or Verify on first run
        modal.classList.add("active");
    } else {
        // trial already chosen: do not block the app
        modal.classList.remove("active");
    }
}

function isLicenseActive() {
    if (STATE.licenseVerified) return true;
    if (!STATE.trial || !STATE.trial.started || !STATE.trial.startDate) return false;

    const today = getTodayDate();
    const diffMs = new Date(today) - new Date(STATE.trial.startDate);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= 2; // 3 calendar days
}
function verifyLicenseKey(key, fromStartup) {
    key = (key || "").trim().toUpperCase();

    const VALID_KEY = "RS-TISK-4CGE-YB2C-G3";

    if (key === VALID_KEY) {
        STATE.licenseKey = key;
        STATE.licenseVerified = true;
        saveToStorage();
        updateLicenseUI();

        const modal = document.getElementById("m-license-start");
        if (modal) modal.classList.remove("active");

        alert("License verified successfully.");
    } else {
        alert("Invalid license key.");
    }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initializeUI();
    setupEventListeners();
    syncDates();
    renderDashboard();
    loadCustomers();
    loadSuppliers();
    loadBanks();
    loadEmployees();
    renderInventory();
    renderLedger();
    renderExpenses();
    renderBanking();
    updateBillBrowser();
    updateRoleVisibility();
    document.body.setAttribute('data-role', STATE.role);
    if (STATE.items.length === 0) addDemoItems();

    updateLicenseUI();
    handleStartupLicenseFlow();
});


// ===== UI INITIALIZATION =====
function initializeUI() {
    const theme = localStorage.getItem('theme') || 'theme-black-white';
    document.body.className = theme;
    document.getElementById('theme-selector').value = theme;

    const unitSelects = ['mi-u1', 'mi-u2'];
    unitSelects.forEach(id => {
        const sel = document.getElementById(id);
        sel.innerHTML = UNITS.map(u => `<option value="${u}">${u}</option>`).join('');
    });

    syncDates();
    document.getElementById('role-label').textContent = `Role: ${STATE.role}`;
}
function setupAdvanceReportEvents() {
    const btn = document.getElementById("btn-adv-view");
    if (!btn) return;

    btn.addEventListener("click", () => {
        if (STATE.role !== "Admin") {
            showNotification("Access Denied! Advance reports require Admin privileges.");
            return;
        }

        const startDate = document.getElementById("adv-start").value;
        const endDate = document.getElementById("adv-end").value;
        const metric = document.getElementById("adv-metric").value;
        const groupBy = document.getElementById("adv-group").value;

        if (!startDate || !endDate) {
            showNotification("Please select date range!");
            return;
        }

        const { labels, values } = getAdvanceSeries(metric, groupBy, startDate, endDate);
        renderAdvanceChart(labels, values, metric);
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    document.getElementById('theme-selector').addEventListener('change', (e) => {
        const newTheme = e.target.value;
        document.body.className = newTheme;
        localStorage.setItem('theme', newTheme);
    });

    document.getElementById('btn-switch-role').addEventListener('click', () => {
        if (STATE.role === 'Employee') {
            const password = prompt('Enter Admin Password:');
            if (password === '1234') {
                STATE.role = 'Admin';
                document.getElementById('role-label').textContent = `Role: ${STATE.role}`;
                document.body.setAttribute('data-role', STATE.role);
                updateRoleVisibility();
                showNotification('Switched to Admin mode');
            } else if (password !== null) {
                showNotification('Incorrect password!');
            }
        } else {
            STATE.role = 'Employee';
            document.getElementById('role-label').textContent = `Role: ${STATE.role}`;
            document.body.setAttribute('data-role', STATE.role);
            updateRoleVisibility();
            showNotification('Switched to Employee mode');
        }
        saveToStorage();
    });

    document.getElementById('calendar-btn').addEventListener('click', () => {
        const today = getTodayDate();
        const formatted = new Date(today).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        showNotification(`Today's Date:\n${formatted}`);
    });

    document.querySelectorAll('.ribbon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if ((view === 'hr' || view === 'settings') && STATE.role !== 'Admin') {
                showNotification('⚠️ Access Denied!\n\nThis section requires Admin privileges.');
                return;
            }
            document.querySelectorAll('.ribbon-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(view).classList.add('active');

            if (view === 'dashboard') renderDashboard();
            if (view === 'inventory') renderInventory();
            if (view === 'ledger') renderLedger();
            if (view === 'expenses') renderExpenses();
            if (view === 'banking') renderBanking();
            if (view === 'hr') renderEmployees();
        });
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal(btn.dataset.closeModal);
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    });

    setupPOSEvents();
    setupPurchaseEvents();
    setupInventoryEvents();
    setupLedgerEvents();
    setupBankingEvents();
    setupExpenseEvents();
    setupEmployeeEvents();
    setupSettingsEvents();
    setupCustomerDisplayEvents();
    setupReportEvents();
    setupBillBrowserEvents();
    setupAdvanceReportEvents();  // NEW

    /* ================= LICENSE EVENTS ================= */

    // Start trial (no expiry, just marks trial mode)
    const btnTrial = document.getElementById("btn-start-trial");
    if (btnTrial) {
        btnTrial.addEventListener("click", () => {
            if (STATE.trialStarted) {
                alert("Trial is already active.");
                return;
            }
            STATE.trialStarted = true;
            saveToStorage();
            const modal = document.getElementById("m-license-start");
            if (modal) modal.classList.remove("active");
            updateLicenseUI();
        });
    }

    // Verify from startup modal
    const btnVerifyStart = document.getElementById("btn-license-verify-from-start");
    if (btnVerifyStart) {
        btnVerifyStart.addEventListener("click", () => {
            const key = prompt("Enter license key:");
            if (!key) return;
            verifyLicenseKey(key.trim(), true);
        });
    }

    // Verify from Settings (separate block)
    const btnVerifySettings = document.getElementById("btn-verify-license-from-settings");
    if (btnVerifySettings) {
        btnVerifySettings.addEventListener("click", () => {
            const input = document.getElementById("license-input");
            const key = input ? input.value.trim() : "";
            if (!key) {
                alert("Please enter license key.");
                return;
            }
            verifyLicenseKey(key, false);
        });
    }
}


// ===== POS EVENTS =====
function setupPOSEvents() {
    let searchTimeout;
    document.getElementById('pos-search').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value;
            const results = fuzzySearch(STATE.items, query, ['code', 'name']);
            renderPOSSearchResults(results);
            if (results.length === 1 && results[0].code.toLowerCase() === query.toLowerCase()) {
                addToPOSCart(results[0].id);
                e.target.value = '';
                e.target.focus();
            }
        }, 150);
    });

    document.getElementById('pos-search').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value;
            const results = fuzzySearch(STATE.items, query, ['code', 'name']);
            if (results.length > 0) {
                addToPOSCart(results[0].id);
                e.target.value = '';
            }
        }
    });

    document.getElementById('pos-mode').addEventListener('change', (e) => {
        const bankRow = document.getElementById('pos-bank-row');
        if (e.target.value === 'Online') bankRow.classList.remove('hidden');
        else bankRow.classList.add('hidden');
    });

    ['pos-disc', 'pos-tax', 'pos-fixed-tax', 'pos-svc', 'pos-tend'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculatePOSTotals);
    });

    document.getElementById('btn-add-cust').addEventListener('click', () => showModal('m-cust'));
    document.getElementById('btn-save-cust').addEventListener('click', saveCustomer);
    document.getElementById('btn-save-bill').addEventListener('click', () => saveBill(false));
    document.getElementById('btn-save-print-bill').addEventListener('click', () => saveBill(true));
    document.getElementById('btn-clear-pos').addEventListener('click', clearPOS);
    document.getElementById('btn-hold-bill').addEventListener('click', holdBill);
    document.getElementById('btn-recall-bill').addEventListener('click', recallBill);

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'F6') {
            e.preventDefault();
            holdBill();
        }
        if (e.key === 'F7') {
            e.preventDefault();
            recallBill();
        }
    });

    document.getElementById('btn-pos-prev-bill').addEventListener('click', () => navigateBills(-1));
    document.getElementById('btn-pos-next-bill').addEventListener('click', () => navigateBills(1));
}

function renderPOSSearchResults(items) {
    const tbody = document.getElementById('pos-search-body');
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding:20px;color:var(--muted)">No items found</td></tr>';
        return;
    }
    tbody.innerHTML = items.map(item => `
    <tr onclick="addToPOSCart('${item.id}')" style="cursor:pointer;">
      <td>${item.code}</td>
      <td>${item.name}</td>
      <td class="text-right">${formatCurrency(item.price)}</td>
      <td class="text-right ${item.stock <= item.lowAlert ? 'text-danger' : ''}">${item.stock}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); addToPOSCart('${item.id}')">
          <i class="fa fa-plus"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function addToPOSCart(itemId) {
    const item = STATE.items.find(i => i.id === itemId);
    if (!item) return;
    if (item.stock <= 0) {
        showNotification('⚠️ Out of Stock!');
        return;
    }
    const existing = STATE.posCart.find(c => c.itemId === itemId);
    if (existing) {
        if (existing.qty + 1 > item.stock) {
            showNotification(`⚠️ Insufficient Stock!\n\nOnly ${item.stock} units available.`);
            return;
        }
        existing.qty++;
    } else {
        STATE.posCart.push({
            itemId: item.id,
            name: item.name,
            unit: item.baseUnit,
            qty: 1,
            price: item.price,
            originalPrice: item.price
        });
    }
    renderPOSCart();
    calculatePOSTotals();
    playBeep();
}

function playBeep() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {}
}

function renderPOSCart() {
    const tbody = document.getElementById('pos-body');
    if (STATE.posCart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:20px;color:var(--muted)">Cart is empty</td></tr>';
        document.getElementById('pos-cart-sub-footer').textContent = '0.00';
        return;
    }
    tbody.innerHTML = STATE.posCart.map((c, idx) => `
    <tr>
      <td>${c.name}</td>
      <td>${c.unit}</td>
      <td>
        <input type="number" value="${c.qty}" min="1"
          onchange="updatePOSCartQty(${idx}, this.value)"
          style="width:70px;text-align:center;" />
      </td>
      <td class="text-right">
        <input type="number" value="${c.price}" min="0" step="0.01"
          onchange="updatePOSCartPrice(${idx}, this.value)"
          style="width:90px;text-align:right;background:var(--panel-bg);"
          title="Edit price (doesn't affect inventory)" />
      </td>
      <td class="text-right">${formatCurrency(c.qty * c.price)}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="removeFromPOSCart(${idx})">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
    const subtotal = STATE.posCart.reduce((sum, c) => sum + (c.qty * c.price), 0);
    document.getElementById('pos-cart-sub-footer').textContent = formatCurrency(subtotal);
}

function updatePOSCartQty(idx, qty) {
    const cartItem = STATE.posCart[idx];
    const item = STATE.items.find(i => i.id === cartItem.itemId);
    const newQty = parseFloat(qty) || 1;
    if (newQty > item.stock) {
        showNotification(`⚠️ Insufficient Stock!\n\nOnly ${item.stock} units available.`);
        renderPOSCart();
        return;
    }
    STATE.posCart[idx].qty = newQty;
    renderPOSCart();
    calculatePOSTotals();
}

function updatePOSCartPrice(idx, price) {
    const newPrice = parseFloat(price) || 0;
    STATE.posCart[idx].price = newPrice;
    renderPOSCart();
    calculatePOSTotals();
}

function removeFromPOSCart(idx) {
    STATE.posCart.splice(idx, 1);
    renderPOSCart();
    calculatePOSTotals();
}

function calculatePOSTotals() {
    const subtotal = STATE.posCart.reduce((sum, c) => sum + (c.qty * c.price), 0);
    const discount = parseFloat(document.getElementById('pos-disc').value) || 0;
    const taxPercent = parseFloat(document.getElementById('pos-tax').value) || 0;
    const fixedTax = parseFloat(document.getElementById('pos-fixed-tax').value) || 0;
    const service = parseFloat(document.getElementById('pos-svc').value) || 0;

    const afterDiscount = subtotal - discount;
    const taxAmount = (afterDiscount * taxPercent) / 100;
    const total = afterDiscount + taxAmount + fixedTax + service;

    document.getElementById('pos-sub').textContent = formatCurrency(subtotal);
    document.getElementById('pos-net').textContent = formatCurrency(total);

    const tendered = parseFloat(document.getElementById('pos-tend').value) || 0;
    const change = tendered - total;
    document.getElementById('pos-change').textContent = formatCurrency(change);

    updateCustomerDisplay();
    updateExternalCustomerDisplay();
}

function saveBill(print = false) {
    // BLOCK IF LICENSE/TRIAL NOT ACTIVE
    if (!isLicenseActive()) {
        alert("Trial expired. Please enter license key to continue.");
        const modal = document.getElementById("m-license-start");
        if (modal) modal.classList.add("active");
        return;
    }

    if (STATE.posCart.length === 0) {
        showNotification('Cart is empty!');
        return;
    }

    const customerId = document.getElementById('pos-cust').value;
    const customerType = document.getElementById('pos-cust-type').value;
    const paymentMode = document.getElementById('pos-mode').value;
    const bankId = document.getElementById('pos-bank').value;
    const date = document.getElementById('pos-date').value;
    const remarks = document.getElementById('pos-rem').value;

    const subtotal = STATE.posCart.reduce((sum, c) => sum + c.qty * c.price, 0);
    const discount = parseFloat(document.getElementById('pos-disc').value) || 0;
    const taxPercent = parseFloat(document.getElementById('pos-tax').value) || 0;
    const fixedTax = parseFloat(document.getElementById('pos-fixed-tax').value) || 0;
    const service = parseFloat(document.getElementById('pos-svc').value) || 0;
    const serviceType = document.getElementById('pos-svc-type').value; // FIXED: use correct variable name

    if (service > 0 && !serviceType) {
        showNotification('Please select a Service Type for service charges.');
        return;
    }

    const afterDiscount = subtotal - discount;
    const taxAmount = (afterDiscount * taxPercent) / 100;
    const total = afterDiscount + taxAmount + fixedTax + service;

    let profit = 0;
    STATE.posCart.forEach(c => {
        const item = STATE.items.find(i => i.id === c.itemId);
        if (item) profit += (c.price - item.cost) * c.qty;
    });

    const billNo = STATE.sales.length + 1;
    const customer = STATE.customers.find(c => c.id === customerId);
    const customerName = customer ? customer.name : 'Walk-in';

    const sale = {
        id: generateId(),
        billNo,
        date,
        time: getCurrentTime(),
        customerId,
        customerName,
        customerType,
        paymentMode,
        bankId,
        items: [...STATE.posCart],
        subtotal,
        discount,
        taxPercent,
        taxAmount,
        fixedTax,
        service,
        serviceType,
        total,
        profit,
        remarks
    };

    // Update stock
    STATE.posCart.forEach(c => {
        const item = STATE.items.find(i => i.id === c.itemId);
        if (item) item.stock -= c.qty;
    });

    // Receivable for credit
    if (paymentMode === 'Credit' && customerId !== 'Walk-in Customer') {
        const cust = STATE.customers.find(c => c.id === customerId);
        if (cust) cust.balance += total;
    }

    // Bank for online
    if (paymentMode === 'Online' && bankId) {
        const bank = STATE.banks.find(b => b.id === bankId);
        if (bank) bank.balance += total;
        STATE.bankTransactions.push({
            id: generateId(),
            date,
            bankId,
            type: 'Deposit',
            amount: total,
            description: `Sale Bill ${billNo}`
        });
    }

    // Service charges log
    if (service > 0) {
        if (!STATE.serviceCharges) STATE.serviceCharges = [];
        STATE.serviceCharges.push({
            id: generateId(),
            date,
            billNo,
            type: serviceType,
            amount: service,
            customerName
        });
    }

    STATE.sales.push(sale);
    STATE.dailySales += total;

    // Persist and refresh core UI
    saveToStorage();
    renderPOSCart();
    calculatePOSTotals();
    renderInventory();
    renderDashboard();
    renderLedger();
    updateBillBrowser();

    // Reset POS inputs and cart
    document.getElementById('pos-rem').value = '';
    document.getElementById('pos-disc').value = 0;
    document.getElementById('pos-svc').value = 0;
    document.getElementById('pos-tax').value = 0;
    document.getElementById('pos-fixed-tax').value = 0;
    document.getElementById('pos-tend').value = 0;
    document.getElementById('pos-mode').value = 'Cash';
    document.getElementById('pos-cust-type').value = 'Walk-in';
    document.getElementById('pos-cust').value = 'Walk-in Customer';
    STATE.posCart = [];

    // Re-render cart and totals after clearing
    renderPOSCart();
    calculatePOSTotals();

    // Hard reset both customer displays
    updateCustomerDisplay();
    updateExternalCustomerDisplay();

    if (print) {
        printSaleBill(sale);
    }

    showNotification(`Bill #${billNo} saved successfully! ${formatCurrency(total)}`);
}



function clearPOS() {
    if (STATE.posCart.length > 0) {
        if (!confirm('Clear current cart?')) return;
    }
    STATE.posCart = [];
    renderPOSCart();
    calculatePOSTotals();
    document.getElementById('pos-rem').value = '';
    document.getElementById('pos-disc').value = 0;
    document.getElementById('pos-svc').value = 0;
    document.getElementById('pos-tend').value = '';
}

function holdBill() {
    if (STATE.posCart.length === 0) {
        showNotification('⚠️ Cart is empty!');
        return;
    }
    STATE.heldBills.push([...STATE.posCart]);
    STATE.posCart = [];
    renderPOSCart();
    calculatePOSTotals();
    showNotification(`✓ Bill held! Total held: ${STATE.heldBills.length}`);
}

function recallBill() {
    if (STATE.heldBills.length === 0) {
        showNotification('⚠️ No held bills!');
        return;
    }
    if (STATE.posCart.length > 0) {
        if (!confirm('Current cart will be replaced. Continue?')) return;
    }
    STATE.posCart = STATE.heldBills.pop();
    renderPOSCart();
    calculatePOSTotals();
    showNotification(`✓ Bill recalled! Remaining held: ${STATE.heldBills.length}`);
}

function navigateBills(direction) {
    browseBills(direction);
}

function loadCustomers() {
    const select = document.getElementById('pos-cust');
    const ledSelect = document.getElementById('led-credit-cust');
    const cpSelect = document.getElementById('cp-cust');

    const options = STATE.customers.map(c =>
        `<option value="${c.id}">${c.name} (${c.phone})</option>`
    ).join('');

    select.innerHTML = '<option value="">Walk-in Customer</option>' + options;
    ledSelect.innerHTML = '<option value="">Select Customer</option>' + options;
    cpSelect.innerHTML = '<option value="">Select Customer</option>' + options;
}

function saveCustomer() {
    const name = document.getElementById('mc-name').value.trim();
    const phone = document.getElementById('mc-phone').value.trim();
    const type = document.getElementById('mc-type').value;
    const opening = parseFloat(document.getElementById('mc-opening').value) || 0;

    if (!name) {
        showNotification('⚠️ Please enter customer name');
        return;
    }

    STATE.customers.push({
        id: generateId(),
        name,
        phone,
        type,
        balance: opening
    });

    saveToStorage();
    loadCustomers();
    renderLedger();
    hideModal('m-cust');

    document.getElementById('mc-name').value = '';
    document.getElementById('mc-phone').value = '';
    document.getElementById('mc-opening').value = 0;

    showNotification('✓ Customer added successfully!');
}
// ===== PURCHASE EVENTS =====
function setupPurchaseEvents() {
    let searchTimeout;
    document.getElementById('pur-search').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value;
            const results = fuzzySearch(STATE.items, query, ['code', 'name']);
            renderPurchaseSearchResults(results);
        }, 150);
    });

    document.getElementById('btn-add-sup').addEventListener('click', () => showModal('m-sup'));
    document.getElementById('btn-save-sup').addEventListener('click', saveSupplier);
    document.getElementById('btn-save-purchase').addEventListener('click', savePurchase);
    document.getElementById('btn-print-purchase-report').addEventListener('click', printPurchaseReport);
}

function renderPurchaseSearchResults(items) {
    const tbody = document.getElementById('pur-search-body');
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding:20px;color:var(--muted)">No items found</td></tr>';
        return;
    }
    tbody.innerHTML = items.map(item => `
    <tr onclick="addToPurchaseCart('${item.id}')" style="cursor:pointer;">
      <td>${item.code}</td>
      <td>${item.name}</td>
      <td class="text-right">${formatCurrency(item.cost)}</td>
      <td class="text-right">${item.stock}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); addToPurchaseCart('${item.id}')">
          <i class="fa fa-plus"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function addToPurchaseCart(itemId) {
    const item = STATE.items.find(i => i.id === itemId);
    if (!item) return;
    const existing = STATE.purchaseCart.find(c => c.itemId === itemId);
    if (existing) existing.qty++;
    else {
        STATE.purchaseCart.push({
            itemId: item.id,
            name: item.name,
            qty: 1,
            cost: item.cost
        });
    }
    renderPurchaseCart();
}

function renderPurchaseCart() {
    const tbody = document.getElementById('pur-body');
    if (STATE.purchaseCart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding:20px;color:var(--muted)">Purchase cart is empty</td></tr>';
        document.getElementById('pur-total').textContent = '0.00';
        return;
    }
    tbody.innerHTML = STATE.purchaseCart.map((c, idx) => `
    <tr>
      <td>${c.name}</td>
      <td>
        <input type="number" value="${c.qty}" min="1"
          onchange="updatePurchaseCartQty(${idx}, this.value)"
          style="width:70px;text-align:center;" />
      </td>
      <td class="text-right">
        <input type="number" value="${c.cost}" min="0" step="0.01"
          onchange="updatePurchaseCartCost(${idx}, this.value)"
          style="width:90px;text-align:right;" />
      </td>
      <td class="text-right">${formatCurrency(c.qty * c.cost)}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="removeFromPurchaseCart(${idx})">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
    const total = STATE.purchaseCart.reduce((sum, c) => sum + (c.qty * c.cost), 0);
    document.getElementById('pur-total').textContent = formatCurrency(total);
}

function updatePurchaseCartQty(idx, qty) {
    STATE.purchaseCart[idx].qty = parseFloat(qty) || 1;
    renderPurchaseCart();
}

function updatePurchaseCartCost(idx, cost) {
    STATE.purchaseCart[idx].cost = parseFloat(cost) || 0;
    renderPurchaseCart();
}

function removeFromPurchaseCart(idx) {
    STATE.purchaseCart.splice(idx, 1);
    renderPurchaseCart();
}

function savePurchase() {
    // BLOCK IF LICENSE/TRIAL NOT ACTIVE
    if (!isLicenseActive()) {
        alert("Trial expired. Please enter license key to continue.");
        const modal = document.getElementById("m-license-start");
        if (modal) modal.classList.add("active");
        return;
    }

    if (STATE.purchaseCart.length === 0) {
        showNotification('Purchase cart is empty!');
        return;
    }

    const supplierId = document.getElementById('pur-sup').value;
    if (!supplierId) {
        showNotification('Please select a supplier!');
        return;
    }

    const date = document.getElementById('pur-date').value;
    const total = STATE.purchaseCart.reduce((sum, c) => sum + c.qty * c.cost, 0);
    const supplier = STATE.suppliers.find(s => s.id === supplierId);

    const purchase = {
        id: generateId(),
        date,
        time: getCurrentTime(),
        supplierId,
        supplierName: supplier ? supplier.name : '',
        items: [...STATE.purchaseCart],
        total
    };

    // Update stock + cost
    STATE.purchaseCart.forEach(c => {
        const item = STATE.items.find(i => i.id === c.itemId);
        if (item) {
            item.stock += c.qty;
            item.cost = c.cost;
        }
    });

    // Payable to supplier
    if (supplier) {
        supplier.payable += total;
    }

    STATE.purchases.push(purchase);
    STATE.purchaseCart = [];

    saveToStorage();
    renderPurchaseCart();
    renderInventory();
    renderLedger();

    showNotification(`Purchase saved successfully! ${formatCurrency(total)}`);
}


function saveSupplier() {
    const name = document.getElementById('ms-name').value.trim();
    const phone = document.getElementById('ms-phone').value.trim();
    const opening = parseFloat(document.getElementById('ms-opening').value) || 0;

    if (!name) {
        showNotification('⚠️ Please enter supplier name');
        return;
    }

    STATE.suppliers.push({
        id: generateId(),
        name,
        phone,
        payable: opening
    });

    saveToStorage();
    loadSuppliers();
    renderLedger();
    hideModal('m-sup');

    document.getElementById('ms-name').value = '';
    document.getElementById('ms-phone').value = '';
    document.getElementById('ms-opening').value = 0;

    showNotification('✓ Supplier added successfully!');
}

function loadSuppliers() {
    const selects = ['pur-sup', 'led-sup-select', 'sp-sup'];
    const options = STATE.suppliers.map(s =>
        `<option value="${s.id}">${s.name} (${s.phone})</option>`
    ).join('');
    selects.forEach(id => {
        const el = document.getElementById(id);
        el.innerHTML = '<option value="">Select Supplier</option>' + options;
    });
}

function printPurchaseReport() {
    const startDate = document.getElementById('pur-date').value || getTodayDate();
    const filtered = STATE.purchases.filter(p => p.date >= startDate && p.date <= startDate);
    if (filtered.length === 0) {
        showNotification('⚠️ No purchases found for this date!');
        return;
    }
    let html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="text-align: center;">Purchase Report</h2>
      <p style="text-align: center;">Date: ${startDate}</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background: #333; color: white;">
            <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Supplier</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Items</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
  `;
    filtered.forEach(p => {
        const itemsList = p.items.map(i => `${i.name} (${i.qty})`).join(', ');
        html += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${p.date}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${p.supplierName}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${itemsList}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(p.total)}</td>
      </tr>
    `;
    });
    const totalAmount = filtered.reduce((sum, p) => sum + p.total, 0);
    html += `
        </tbody>
        <tfoot>
          <tr style="background: #f0f0f0; font-weight: bold;">
            <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total:</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
    const printZone = document.getElementById('print-zone');
    printZone.innerHTML = html;
    window.print();
}

// ===== INVENTORY EVENTS =====
function setupInventoryEvents() {
    let searchTimeout;
    document.getElementById('inv-search').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => renderInventory(e.target.value), 150);
    });

    document.getElementById('btn-new-item').addEventListener('click', () => {
        if (STATE.role !== 'Admin') {
            showNotification('⚠️ Access Denied!\n\nOnly Admin can add/edit items.');
            return;
        }
        document.getElementById('mi-title').textContent = 'New Item';
        document.getElementById('mi-id').value = '';
        document.getElementById('mi-code').value = '';
        document.getElementById('mi-name').value = '';
        document.getElementById('mi-cost').value = '';
        document.getElementById('mi-price').value = '';
        document.getElementById('mi-stock').value = '';
        document.getElementById('mi-loc').value = '';
        document.getElementById('mi-alert').value = 5;
        document.getElementById('mi-conv').value = 1;
        showModal('m-item');
    });

    document.getElementById('btn-save-item').addEventListener('click', saveItem);
    document.getElementById('toggle-inv-table').addEventListener('click', () => {
        document.getElementById('inv-table-container').classList.toggle('hidden');
    });
}

function renderInventory(searchQuery = '') {
    let items = STATE.items;
    if (searchQuery) items = fuzzySearch(items, searchQuery, ['code', 'name']);
    const tbody = document.getElementById('inv-body');
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:20px;color:var(--muted)">No items found</td></tr>';
        document.getElementById('inv-stock-total').textContent = '0.00';
        return;
    }
    tbody.innerHTML = items.map(item => `
    <tr>
      <td>${item.code}</td>
      <td>${item.name}</td>
      <td>${item.location || '-'}</td>
      <td class="text-right">${formatCurrency(item.cost)}</td>
      <td class="text-right">${formatCurrency(item.price)}</td>
      <td>${item.baseUnit}</td>
      <td class="text-right ${item.stock <= item.lowAlert ? 'text-danger' : ''}">
        ${item.stock}
        ${item.stock <= item.lowAlert ? ' <i class="fa fa-exclamation-triangle"></i>' : ''}
      </td>
      <td>
        <button class="btn btn-sm" onclick="editItem('${item.id}')">
          <i class="fa fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteItem('${item.id}')">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
    const totalValue = STATE.items.reduce((sum, i) => sum + (i.stock * i.cost), 0);
    document.getElementById('inv-stock-total').textContent = formatCurrency(totalValue);
}

function saveItem() {
    if (STATE.role !== 'Admin') {
        showNotification('⚠️ Access Denied!\n\nOnly Admin can add/edit items.');
        return;
    }
    const id = document.getElementById('mi-id').value;
    const code = document.getElementById('mi-code').value.trim();
    const name = document.getElementById('mi-name').value.trim();
    const cost = parseFloat(document.getElementById('mi-cost').value) || 0;
    const price = parseFloat(document.getElementById('mi-price').value) || 0;
    const stock = parseFloat(document.getElementById('mi-stock').value) || 0;
    const location = document.getElementById('mi-loc').value.trim();
    const lowAlert = parseFloat(document.getElementById('mi-alert').value) || 5;
    const baseUnit = document.getElementById('mi-u1').value;
    const altUnit = document.getElementById('mi-u2').value;
    const conversion = parseFloat(document.getElementById('mi-conv').value) || 1;

    if (!code || !name) {
        showNotification('⚠️ Please enter item code and name');
        return;
    }

    const duplicate = STATE.items.find(i => i.code === code && i.id !== id);
    if (duplicate) {
        showNotification('⚠️ Item code already exists!');
        return;
    }

    if (id) {
        const item = STATE.items.find(i => i.id === id);
        if (item) {
            item.code = code;
            item.name = name;
            item.cost = cost;
            item.price = price;
            item.stock = stock;
            item.location = location;
            item.lowAlert = lowAlert;
            item.baseUnit = baseUnit;
            item.altUnit = altUnit;
            item.conversion = conversion;
        }
    } else {
        STATE.items.push({
            id: generateId(),
            code,
            name,
            cost,
            price,
            stock,
            location,
            lowAlert,
            baseUnit,
            altUnit,
            conversion
        });
    }

    saveToStorage();
    renderInventory();
    hideModal('m-item');
    showNotification('✓ Item saved successfully!');
}

function editItem(id) {
    if (STATE.role !== 'Admin') {
        showNotification('⚠️ Access Denied!\n\nOnly Admin can edit items.');
        return;
    }
    const item = STATE.items.find(i => i.id === id);
    if (!item) return;

    document.getElementById('mi-title').textContent = 'Edit Item';
    document.getElementById('mi-id').value = item.id;
    document.getElementById('mi-code').value = item.code;
    document.getElementById('mi-name').value = item.name;
    document.getElementById('mi-cost').value = item.cost;
    document.getElementById('mi-price').value = item.price;
    document.getElementById('mi-stock').value = item.stock;
    document.getElementById('mi-loc').value = item.location;
    document.getElementById('mi-alert').value = item.lowAlert;
    document.getElementById('mi-u1').value = item.baseUnit;
    document.getElementById('mi-u2').value = item.altUnit;
    document.getElementById('mi-conv').value = item.conversion;
    showModal('m-item');
}

function deleteItem(id) {
    if (STATE.role !== 'Admin') {
        showNotification('⚠️ Access Denied!\n\nOnly Admin can delete items.');
        return;
    }
    if (!confirm('Are you sure you want to delete this item?')) return;
    STATE.items = STATE.items.filter(i => i.id !== id);
    saveToStorage();
    renderInventory();
    showNotification('✓ Item deleted successfully!');
}

// ===== LEDGER EVENTS =====
function setupLedgerEvents() {
    let searchTimeout;
    document.getElementById('search-cust').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => renderLedger(e.target.value, ''), 150);
    });

    document.getElementById('search-sup').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => renderLedger('', e.target.value), 150);
    });

    document.getElementById('btn-view-cust-ledger').addEventListener('click', () => viewCustomerLedger());
    document.getElementById('btn-print-cust-ledger').addEventListener('click', () => viewCustomerLedger(true));
    document.getElementById('btn-view-sup-ledger').addEventListener('click', () => viewSupplierLedger());
    document.getElementById('btn-print-sup-ledger').addEventListener('click', () => viewSupplierLedger(true));
    document.getElementById('btn-ledger-receive').addEventListener('click', () => showModal('m-cust-pay'));
    document.getElementById('btn-save-cust-pay').addEventListener('click', saveCustomerPayment);
    document.getElementById('btn-ledger-pay-sup').addEventListener('click', () => showModal('m-sup-pay'));
    document.getElementById('btn-save-sup-pay').addEventListener('click', saveSupplierPayment);

    document.getElementById('cp-mode').addEventListener('change', (e) => {
        const bankRow = document.querySelector('.cp-bank-row');
        if (e.target.value === 'Online') bankRow.classList.remove('hidden');
        else bankRow.classList.add('hidden');
    });

    document.getElementById('sp-mode').addEventListener('change', (e) => {
        const bankRow = document.querySelector('.sp-bank-row');
        if (e.target.value === 'Online') bankRow.classList.remove('hidden');
        else bankRow.classList.add('hidden');
    });

    document.getElementById('btn-add-cust-ledger').addEventListener('click', () => showModal('m-cust'));
    document.getElementById('btn-add-sup-ledger').addEventListener('click', () => showModal('m-sup'));
}

function renderLedger(custQuery = '', supQuery = '') {
    let customers = STATE.customers;
    if (custQuery) customers = fuzzySearch(customers, custQuery, ['name', 'phone']);
    const custTbody = document.getElementById('led-cust');
    custTbody.innerHTML = customers.map(c => `
    <tr>
      <td>${c.name}</td>
      <td class="text-right ${c.balance > 0 ? 'text-danger' : 'text-success'}">${formatCurrency(c.balance)}</td>
      <td>${c.type}</td>
      <td>
        <button class="btn btn-sm" onclick="viewCustomerDetails('${c.id}')">
          <i class="fa fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${c.id}')">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');

    let suppliers = STATE.suppliers;
    if (supQuery) suppliers = fuzzySearch(suppliers, supQuery, ['name', 'phone']);
    const supTbody = document.getElementById('led-sup');
    supTbody.innerHTML = suppliers.map(s => `
    <tr>
      <td>${s.name}</td>
      <td class="text-right ${s.payable > 0 ? 'text-danger' : 'text-success'}">${formatCurrency(s.payable)}</td>
      <td>
        <button class="btn btn-sm" onclick="viewSupplierDetails('${s.id}')">
          <i class="fa fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteSupplier('${s.id}')">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function viewCustomerLedger(print = false) {
    const custId = document.getElementById('led-credit-cust').value;
    if (!custId) {
        showNotification('⚠️ Please select a customer first!');
        return;
    }

    const customer = STATE.customers.find(c => c.id === custId);
    if (!customer) return;

    const startDate = document.getElementById('led-rpt-start').value;
    const endDate = document.getElementById('led-rpt-end').value;
    if (!startDate || !endDate) {
        showNotification('⚠️ Please select date range!');
        return;
    }

    const sales = STATE.sales.filter(s => s.customerId === custId);
    const payments = (STATE.custPayments || []).filter(p => p.customerId === custId);

    let entries = [
        // Credit sales increase payable
        ...sales.map(s => ({
            date: s.date,
            type: 'Sale',
            description: `Bill ${s.billNo}`,
            paid: 0,
            payable: s.total
        })),
        // Payments increase paid
        ...payments.map(p => ({
            date: p.date,
            type: 'Payment',
            description: `${p.mode} Payment`,
            paid: p.amount,
            payable: 0
        }))
    ];

    // Insert Opening Balance as first debit row (if any)
    const opening = parseFloat(customer.balance) || 0;
    if (opening > 0) {
        entries.unshift({
            date: startDate,              // show OB at start of period
            type: 'Opening',
            description: 'Opening Balance',
            debit: opening,               // customer has to pay this
            credit: 0
        });
    }

    // Filter by date range and sort
    entries = entries
        .filter(t => t.date >= startDate && t.date <= endDate)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    let html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="text-align: center">Customer Ledger</h2>
      <p><strong>Customer</strong> ${customer.name}</p>
      <p><strong>Phone</strong> ${customer.phone || 'N/A'}</p>
      <p><strong>Current Balance</strong> ${formatCurrency(customer.balance)}</p>
      <p><strong>Period</strong> ${startDate} to ${endDate}</p>
              <table style="width:100%; border-collapse:collapse; margin-top:20px;">
        <thead>
          <tr style="background:#333; color:#fff;">
            <th style="border:1px solid #ddd; padding:8px;">Date</th>
            <th style="border:1px solid #ddd; padding:8px;">Type</th>
            <th style="border:1px solid #ddd; padding:8px;">Description</th>
            <th style="border:1px solid #ddd; padding:8px; text-align:right;">Paid</th>
            <th style="border:1px solid #ddd; padding:8px; text-align:right;">Payable</th>
          </tr>
        </thead>
        <tbody>`;

    entries.forEach(t => {
        html += `
      <tr>
        <td style="border:1px solid #ddd; padding:8px;">${t.date}</td>
        <td style="border:1px solid #ddd; padding:8px;">${t.type}</td>
        <td style="border:1px solid #ddd; padding:8px;">${t.description}</td>
        <td style="border:1px solid #ddd; padding:8px; text-align:right;">
          ${t.paid ? formatCurrency(t.paid) : '-'}
        </td>
        <td style="border:1px solid #ddd; padding:8px; text-align:right;">
          ${t.payable ? formatCurrency(t.payable) : '-'}
        </td>
      </tr>`;
    });

    html += `
        </tbody>
      </table>
    </div>`;
    if (print) {
        const printZone = document.getElementById('print-zone');
        printZone.innerHTML = html;
        downloadReportPDF('Customer_Ledger');
    } else {
        document.getElementById('m-report-title').textContent = 'Customer Ledger';
        document.getElementById('report-container').innerHTML = html;
        showModal('m-report');
    }

}


function viewSupplierLedger(print = false) {
    const supId = document.getElementById('led-sup-select').value;
    if (!supId) {
        showNotification('⚠️ Please select a supplier first!');
        return;
    }

    const supplier = STATE.suppliers.find(s => s.id === supId);
    if (!supplier) return;

    const startDate = document.getElementById('led-sup-start').value;
    const endDate = document.getElementById('led-sup-end').value;
    if (!startDate || !endDate) {
        showNotification('⚠️ Please select date range!');
        return;
    }

    const purchases = STATE.purchases.filter(p => p.supplierId === supId);
    const payments = (STATE.supPayments || []).filter(p => p.supplierId === supId);

    // Map to Paid / Payable:
    // - Purchase: increases Payable
    // - Payment: increases Paid
    let entries = [
        ...purchases.map(p => ({
            date: p.date,
            type: 'Purchase',
            description: 'Purchase Order',
            paid: 0,
            payable: p.total   // you owe supplier
        })),
        ...payments.map(p => ({
            date: p.date,
            type: 'Payment',
            description: `${p.mode} Payment`,
            paid: p.amount,    // you paid supplier
            payable: 0
        }))
    ];

    entries = entries
        .filter(t => t.date >= startDate && t.date <= endDate)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    let html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="text-align: center">Supplier Ledger</h2>
      <p><strong>Supplier</strong> ${supplier.name}</p>
      <p><strong>Phone</strong> ${supplier.phone || 'N/A'}</p>
      <p><strong>Current Payable</strong> ${formatCurrency(supplier.payable)}</p>
      <p><strong>Period</strong> ${startDate} to ${endDate}</p>
      <table style="width:100%; border-collapse:collapse; margin-top:20px;">
        <thead>
          <tr style="background:#333; color:#fff;">
            <th style="border:1px solid #ddd; padding:8px;">Date</th>
            <th style="border:1px solid #ddd; padding:8px;">Type</th>
            <th style="border:1px solid #ddd; padding:8px;">Description</th>
            <th style="border:1px solid #ddd; padding:8px; text-align:right;">Paid</th>
            <th style="border:1px solid #ddd; padding:8px; text-align:right;">Payable</th>
          </tr>
        </thead>
        <tbody>`;

    entries.forEach(t => {
        html += `
      <tr>
        <td style="border:1px solid #ddd; padding:8px;">${t.date}</td>
        <td style="border:1px solid #ddd; padding:8px;">${t.type}</td>
        <td style="border:1px solid #ddd; padding:8px;">${t.description}</td>
        <td style="border:1px solid #ddd; padding:8px; text-align:right;">
          ${t.paid ? formatCurrency(t.paid) : '-'}
        </td>
        <td style="border:1px solid #ddd; padding:8px; text-align:right;">
          ${t.payable ? formatCurrency(t.payable) : '-'}
        </td>
      </tr>`;
    });

    html += `
        </tbody>
      </table>
    </div>`;

    if (print) {
        const printZone = document.getElementById('print-zone');
        printZone.innerHTML = html;
        downloadReportPDF('Supplier_Ledger');
    } else {
        document.getElementById('m-report-title').textContent = 'Supplier Ledger';
        document.getElementById('report-container').innerHTML = html;
        showModal('m-report');
    }

}



function saveCustomerPayment() {
    const customerId = document.getElementById('cp-cust').value;
    const date = document.getElementById('cp-date').value;
    const amount = parseFloat(document.getElementById('cp-amt').value) || 0;
    const mode = document.getElementById('cp-mode').value;
    const bankId = document.getElementById('cp-bank').value;

    if (!customerId || amount <= 0) {
        showNotification('⚠️ Please select customer and enter valid amount');
        return;
    }

    const customer = STATE.customers.find(c => c.id === customerId);
    if (!customer) return;
    // Do not allow paying more than outstanding receivable
    if (amount > customer.balance) {
        showNotification(
            `⚠️ Payment exceeds receivable!\n\nOutstanding: ${formatCurrency(customer.balance)}\nTrying to pay: ${formatCurrency(amount)}`
        );
        return;
    }

    customer.balance -= amount;

    if (!STATE.custPayments) STATE.custPayments = [];
    STATE.custPayments.push({
        id: generateId(),
        date,
        customerId,
        amount,
        mode,
        bankId
    });

    if (mode === 'Online' && bankId) {
        const bank = STATE.banks.find(b => b.id === bankId);
        if (bank) {
            bank.balance += amount;
            STATE.bankTransactions.push({
                id: generateId(),
                date,
                bankId,
                type: 'Deposit',
                amount,
                description: `Customer payment: ${customer.name}`
            });
        }
    }

    saveToStorage();
    renderLedger();
    renderBanking();
    hideModal('m-cust-pay');

    document.getElementById('cp-amt').value = '';
    showNotification(`✓ Payment received!\n\n${formatCurrency(amount)}\nBalance: ${formatCurrency(customer.balance)}`);
    printPaymentReceipt(customer, amount, date, mode);
}

function saveSupplierPayment() {
    const supplierId = document.getElementById('sp-sup').value;
    const date = document.getElementById('sp-date').value;
    const amount = parseFloat(document.getElementById('sp-amt').value) || 0;
    const mode = document.getElementById('sp-mode').value;
    const bankId = document.getElementById('sp-bank').value;

    if (!supplierId || amount <= 0) {
        showNotification('⚠️ Please select supplier and enter valid amount');
        return;
    }

    const supplier = STATE.suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    supplier.payable -= amount;

    if (!STATE.supPayments) STATE.supPayments = [];
    STATE.supPayments.push({
        id: generateId(),
        date,
        supplierId,
        amount,
        mode,
        bankId
    });

    if (mode === 'Online' && bankId) {
        const bank = STATE.banks.find(b => b.id === bankId);
        if (bank) {
            bank.balance -= amount;
            STATE.bankTransactions.push({
                id: generateId(),
                date,
                bankId,
                type: 'Withdraw',
                amount,
                description: `Supplier payment: ${supplier.name}`
            });
        }
    }

    saveToStorage();
    renderLedger();
    renderBanking();
    hideModal('m-sup-pay');

    document.getElementById('sp-amt').value = '';
    showNotification(`✓ Payment made!\n\n${formatCurrency(amount)}\nPayable: ${formatCurrency(supplier.payable)}`);
    printPaymentReceipt(supplier, amount, date, mode, true);
}

function viewCustomerDetails(id) {
    const customer = STATE.customers.find(c => c.id === id);
    if (!customer) return;
    showNotification(`Customer Details:\n\n${customer.name}\n${customer.phone}\n${customer.type}\nBalance: ${formatCurrency(customer.balance)}`);
}

function viewSupplierDetails(id) {
    const supplier = STATE.suppliers.find(s => s.id === id);
    if (!supplier) return;
    showNotification(`Supplier Details:\n\n${supplier.name}\n${supplier.phone}\nPayable: ${formatCurrency(supplier.payable)}`);
}

function deleteCustomer(id) {
    if (STATE.role !== 'Admin') {
        showNotification('⚠️ Only Admin can delete customers.');
        return;
    }
    if (!confirm('Are you sure you want to delete this customer?')) return;
    STATE.customers = STATE.customers.filter(c => c.id !== id);
    saveToStorage();
    renderLedger();
    loadCustomers();
    showNotification('✓ Customer deleted!');
}

function deleteSupplier(id) {
    if (STATE.role !== 'Admin') {
        showNotification('⚠️ Only Admin can delete supplier.');
        return;
    }
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    STATE.suppliers = STATE.suppliers.filter(s => s.id !== id);
    saveToStorage();
    renderLedger();
    loadSuppliers();
    showNotification('✓ Supplier deleted!');
}
// ===== BANKING EVENTS =====
function setupBankingEvents() {
    document.getElementById('btn-add-bank').addEventListener('click', () => showModal('m-bank'));
    document.getElementById('btn-save-bank').addEventListener('click', saveBank);
    document.getElementById('btn-add-bank-tx').addEventListener('click', () => showModal('m-bank-tx'));
    document.getElementById('btn-save-bank-tx').addEventListener('click', saveBankTransaction);
    document.getElementById('bank-selector').addEventListener('change', renderBanking);
    document.getElementById('btn-bank-rpt').addEventListener('click', viewBankReport);
}

function loadBanks() {
    const selects = ['pos-bank', 'bt-bank', 'cp-bank', 'sp-bank', 'bank-selector'];
    const options = STATE.banks.map(b => `<option value="${b.id}">${b.name} - ${b.accountNo}</option>`).join('');
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (id === 'bank-selector') {
            el.innerHTML = '<option value="">All Banks</option>' + options;
        } else {
            el.innerHTML = '<option value="">Select Bank</option>' + options;
        }
    });
}

function saveBank() {
    const name = document.getElementById('mb-name').value.trim();
    const accountNo = document.getElementById('mb-acc').value.trim();
    const balance = parseFloat(document.getElementById('mb-bal').value) || 0;

    if (!name || !accountNo) {
        showNotification('⚠️ Please enter bank name and account number');
        return;
    }

    STATE.banks.push({
        id: generateId(),
        name,
        accountNo,
        balance
    });

    saveToStorage();
    loadBanks();
    renderBanking();
    hideModal('m-bank');

    document.getElementById('mb-name').value = '';
    document.getElementById('mb-acc').value = '';
    document.getElementById('mb-bal').value = '';

    showNotification('✓ Bank added successfully!');
}

function saveBankTransaction() {
    const date = document.getElementById('bt-date').value;
    const bankId = document.getElementById('bt-bank').value;
    const type = document.getElementById('bt-type').value;
    const amount = parseFloat(document.getElementById('bt-amt').value) || 0;

    if (!bankId || amount <= 0) {
        showNotification('⚠️ Please select bank and enter valid amount');
        return;
    }

    const bank = STATE.banks.find(b => b.id === bankId);
    if (!bank) return;

    if (type === 'Deposit') bank.balance += amount;
    else if (type === 'Withdraw') bank.balance -= amount;

    STATE.bankTransactions.push({
        id: generateId(),
        date,
        bankId,
        type,
        amount,
        description: `${type} transaction`
    });

    saveToStorage();
    renderBanking();
    hideModal('m-bank-tx');

    document.getElementById('bt-amt').value = '';
    showNotification(`✓ ${type} transaction saved!`);
}

function renderBanking() {
    const tbody = document.getElementById('bank-body');
    if (STATE.banks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding:20px;color:var(--muted)">No banks added</td></tr>';
        document.getElementById('bank-total-footer').textContent = '0.00';
    } else {
        tbody.innerHTML = STATE.banks.map(b => `
      <tr>
        <td>${b.name}</td>
        <td>${b.accountNo}</td>
        <td class="text-right">${formatCurrency(b.balance)}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteBank('${b.id}')">
            <i class="fa fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
        const totalBalance = STATE.banks.reduce((sum, b) => sum + b.balance, 0);
        document.getElementById('bank-total-footer').textContent = formatCurrency(totalBalance);
    }

    const txBody = document.getElementById('bank-tx-body');
    let transactions = STATE.bankTransactions;
    const selectedBank = document.getElementById('bank-selector').value;
    if (selectedBank) {
        transactions = transactions.filter(tx => tx.bankId === selectedBank);
    }

    if (transactions.length === 0) {
        txBody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding:20px;color:var(--muted)">No transactions</td></tr>';
        document.getElementById('bank-tx-total-footer').textContent = '0.00';
    } else {
        txBody.innerHTML = transactions.map(tx => {
            const bank = STATE.banks.find(b => b.id === tx.bankId);
            return `
        <tr>
          <td>${tx.date}</td>
          <td>${bank ? bank.name : 'Unknown'}</td>
          <td>${tx.type}</td>
          <td class="text-right">${formatCurrency(tx.amount)}</td>
        </tr>
      `;
        }).join('');
        const totalNet = transactions.reduce((sum, tx) => {
            return sum + (tx.type === 'Deposit' ? tx.amount : -tx.amount);
        }, 0);
        document.getElementById('bank-tx-total-footer').textContent = formatCurrency(totalNet);
    }
}

function deleteBank(id) {
    if (!confirm('Are you sure you want to delete this bank?')) return;
    STATE.banks = STATE.banks.filter(b => b.id !== id);
    saveToStorage();
    renderBanking();
    loadBanks();
    showNotification('✓ Bank deleted!');
}

function viewBankReport() {
    const bankId = document.getElementById('bank-selector').value;
    const startDate = document.getElementById('bank-start').value;
    const endDate = document.getElementById('bank-end').value;

    if (!startDate || !endDate) {
        showNotification('⚠️ Please select date range!');
        return;
    }

    let transactions = STATE.bankTransactions;
    if (bankId) {
        transactions = transactions.filter(tx => tx.bankId === bankId);
    }
    transactions = transactions.filter(tx => tx.date >= startDate && tx.date <= endDate);

    const bankName = bankId ? STATE.banks.find(b => b.id === bankId)?.name : 'All Banks';

    let html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="text-align: center;">Bank Report</h2>
      <p><strong>Bank:</strong> ${bankName}</p>
      <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background: #333; color: white;">
            <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Type</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
  `;

    transactions.forEach(tx => {
        html += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${tx.date}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${tx.type}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${tx.description || '-'}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(tx.amount)}</td>
      </tr>
    `;
    });

    const totalNet = transactions.reduce((sum, tx) => {
        return sum + (tx.type === 'Deposit' ? tx.amount : -tx.amount);
    }, 0);

    html += `
        </tbody>
        <tfoot>
          <tr style="background: #f0f0f0; font-weight: bold;">
            <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Net:</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(totalNet)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

    document.getElementById('m-report-title').textContent = 'Bank Report';
    document.getElementById('report-container').innerHTML = html;
    showModal('m-report');
}

// ===== EXPENSE EVENTS =====
function setupExpenseEvents() {
    document.getElementById('btn-add-exp').addEventListener('click', () => showModal('m-exp'));
    document.getElementById('btn-save-exp').addEventListener('click', saveExpense);
    document.getElementById('btn-exp-filter').addEventListener('click', renderExpenses);
    document.getElementById('toggle-exp-table').addEventListener('click', () => {
        document.getElementById('exp-table-container').classList.toggle('hidden');
    });
}

function saveExpense() {
    const date = document.getElementById('me-date').value;
    const category = document.getElementById('me-cat').value.trim();
    const description = document.getElementById('me-desc').value.trim();
    const amount = parseFloat(document.getElementById('me-amt').value) || 0;

    if (!category || amount <= 0) {
        showNotification('⚠️ Please enter category and valid amount');
        return;
    }

    STATE.expenses.push({
        id: generateId(),
        date,
        category,
        description,
        amount
    });

    STATE.dailyExpenses += amount;

    saveToStorage();
    renderExpenses();
    renderDashboard();
    hideModal('m-exp');

    document.getElementById('me-cat').value = '';
    document.getElementById('me-desc').value = '';
    document.getElementById('me-amt').value = '';

    showNotification('✓ Expense added successfully!');
}

function renderExpenses() {
    const startDate = document.getElementById('exp-start').value;
    const endDate = document.getElementById('exp-end').value;

    let expenses = STATE.expenses;
    if (startDate && endDate) {
        expenses = expenses.filter(e => e.date >= startDate && e.date <= endDate);
    }

    const tbody = document.getElementById('exp-body');
    if (expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding:20px;color:var(--muted)">No expenses found</td></tr>';
        document.getElementById('exp-total-footer').textContent = '0.00';
        return;
    }

    tbody.innerHTML = expenses.map(e => `
    <tr>
      <td>${e.date}</td>
      <td>${e.category}</td>
      <td>${e.description}</td>
      <td class="text-right">${formatCurrency(e.amount)}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteExpense('${e.id}')">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    document.getElementById('exp-total-footer').textContent = formatCurrency(total);
}

function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    STATE.expenses = STATE.expenses.filter(e => e.id !== id);
    saveToStorage();
    renderExpenses();
    renderDashboard();
    showNotification('✓ Expense deleted!');
}

// ===== EMPLOYEE EVENTS =====
function setupEmployeeEvents() {
    document.getElementById('btn-add-emp').addEventListener('click', () => showModal('m-emp'));
    document.getElementById('btn-save-emp').addEventListener('click', saveEmployee);
    document.getElementById('btn-mark-att').addEventListener('click', () => showModal('m-att'));
    document.getElementById('btn-save-att').addEventListener('click', saveAttendance);
    document.getElementById('btn-view-att-report').addEventListener('click', viewAttendanceReport);
    document.getElementById('btn-print-att-report').addEventListener('click', () => viewAttendanceReport(true));
}

function loadEmployees() {
    const selects = ['att-emp', 'att-rpt-emp'];
    const options = STATE.employees.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
    selects.forEach(id => {
        const el = document.getElementById(id);
        el.innerHTML = '<option value="">Select Employee</option>' + options;
    });
}

function saveEmployee() {
    const id = document.getElementById('me-id').value;
    const name = document.getElementById('me-name').value.trim();
    const role = document.getElementById('me-role').value.trim();

    if (!name) {
        showNotification('⚠️ Please enter employee name');
        return;
    }

    if (id) {
        const emp = STATE.employees.find(e => e.id === id);
        if (emp) {
            emp.name = name;
            emp.role = role;
        }
    } else {
        STATE.employees.push({
            id: generateId(),
            name,
            role
        });
    }

    saveToStorage();
    renderEmployees();
    loadEmployees();
    hideModal('m-emp');

    document.getElementById('me-id').value = '';
    document.getElementById('me-name').value = '';
    document.getElementById('me-role').value = '';

    showNotification('✓ Employee saved successfully!');
}

function saveAttendance() {
    if (STATE.role !== 'Admin') {
        showNotification('⚠️ Only Admin can mark attendance.');
        return;
    }
    const date = document.getElementById('att-date').value;
    const empId = document.getElementById('att-emp').value;
    const status = document.getElementById('att-status').value;
    const shift = document.getElementById('att-shift').value;

    if (!empId) {
        showNotification('⚠️ Please select an employee');
        return;
    }

    STATE.attendance.push({
        id: generateId(),
        date,
        empId,
        status,
        shift
    });

    saveToStorage();
    hideModal('m-att');
    renderEmployees();
    showNotification('✓ Attendance marked!');
}

function renderEmployees() {
    const tbody = document.getElementById('emp-body');
    if (STATE.employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding:20px;color:var(--muted)">No employees added</td></tr>';
        return;
    }

    tbody.innerHTML = STATE.employees.map(e => `
    <tr>
      <td>${e.id.substr(0, 8)}</td>
      <td>${e.name}</td>
      <td>${e.role}</td>
      <td>
        <button class="btn btn-sm" onclick="editEmployee('${e.id}')">
          <i class="fa fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${e.id}')">
          <i class="fa fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');

    const attTbody = document.getElementById('att-rpt-body');
    const startDate = document.getElementById('att-rpt-start').value;
    const endDate = document.getElementById('att-rpt-end').value;

    let attendance = STATE.attendance;
    if (startDate && endDate) {
        attendance = attendance.filter(a => a.date >= startDate && a.date <= endDate);
    }

    if (STATE.employees.length === 0) {
        attTbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding:20px;color:var(--muted)">No employees</td></tr>';
        return;
    }

    attTbody.innerHTML = STATE.employees.map(e => {
        const empAtt = attendance.filter(a => a.empId === e.id);
        const present = empAtt.filter(a => a.status === 'Present').length;
        const absent = empAtt.filter(a => a.status === 'Absent').length;
        const late = empAtt.filter(a => a.status === 'Late').length;
        const leave = empAtt.filter(a => a.status === 'Leave').length;

        return `
      <tr>
        <td>${e.name}</td>
        <td class="text-right">${present}</td>
        <td class="text-right">${absent}</td>
        <td class="text-right">${late}</td>
        <td class="text-right">${leave}</td>
      </tr>
    `;
    }).join('');
}

function editEmployee(id) {
    const emp = STATE.employees.find(e => e.id === id);
    if (!emp) return;

    document.getElementById('me-id').value = emp.id;
    document.getElementById('me-name').value = emp.name;
    document.getElementById('me-role').value = emp.role;
    showModal('m-emp');
}

function deleteEmployee(id) {
    if (STATE.role !== 'Admin') {
        showNotification('⚠️ Only Admin can delete employees.');
        return;
    }
    if (!confirm('Are you sure you want to delete this employee?')) return;
    STATE.employees = STATE.employees.filter(e => e.id !== id);
    saveToStorage();
    renderEmployees();
    loadEmployees();
    showNotification('✓ Employee deleted!');
}

function viewAttendanceReport(print = false) {
    const startDate = document.getElementById('att-rpt-start').value;
    const endDate = document.getElementById('att-rpt-end').value;
    const empId = document.getElementById('att-rpt-emp').value;

    if (!startDate || !endDate) {
        showNotification('⚠️ Please select date range!');
        return;
    }

    let attendance = STATE.attendance.filter(a => a.date >= startDate && a.date <= endDate);
    if (empId) {
        attendance = attendance.filter(a => a.empId === empId);
    }

    let html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="text-align: center;">Attendance Report</h2>
      <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background: #333; color: white;">
            <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Employee</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Status</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Shift</th>
          </tr>
        </thead>
        <tbody>
  `;

    attendance.forEach(a => {
        const emp = STATE.employees.find(e => e.id === a.empId);
        html += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${a.date}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${emp ? emp.name : 'Unknown'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${a.status}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${a.shift}</td>
      </tr>
    `;
    });

    html += `
        </tbody>
      </table>
    </div>
  `;

    if (print) {
        const printZone = document.getElementById('print-zone');
        printZone.innerHTML = html;
        downloadReportPDF('Attendance_Report');
    } else {
        document.getElementById('m-report-title').textContent = 'Attendance Report';
        document.getElementById('report-container').innerHTML = html;
        showModal('m-report');
    }

}

// ===== SETTINGS EVENTS =====
function setupSettingsEvents() {
    document.getElementById('btn-save-settings').addEventListener('click', saveSettings);
    document.getElementById('btn-hard-reset').addEventListener('click', hardReset);

    document.getElementById('set-logo-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('set-logo').value = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('set-tax-mode').addEventListener('change', (e) => {
        const fixedSettings = document.getElementById('fixed-tax-settings');
        if (e.target.value === 'fixed') {
            fixedSettings.style.display = 'block';
        } else {
            fixedSettings.style.display = 'none';
        }
    });

    document.getElementById('set-name').value = STATE.settings.companyName;
    document.getElementById('set-addr').value = STATE.settings.companyAddress;
    document.getElementById('set-logo').value = STATE.settings.logo;
    document.getElementById('set-tax-mode').value = STATE.settings.taxMode;
    document.getElementById('set-tax-percent').value = STATE.settings.taxPercent;
    document.getElementById('set-fixed-tax').value = STATE.settings.fixedTax;
}

function saveSettings() {
    STATE.settings.companyName = document.getElementById('set-name').value.trim();
    STATE.settings.companyAddress = document.getElementById('set-addr').value.trim();
    STATE.settings.logo = document.getElementById('set-logo').value.trim();
    STATE.settings.taxMode = document.getElementById('set-tax-mode').value;
    STATE.settings.taxPercent = parseFloat(document.getElementById('set-tax-percent').value) || 0;
    STATE.settings.fixedTax = parseFloat(document.getElementById('set-fixed-tax').value) || 0;

    saveToStorage();
    showNotification('✓ Settings saved successfully!');
}

function hardReset() {
    const password = prompt('Enter password to reset (1234):');
    if (password !== '1234') {
        showNotification('⚠️ Incorrect password!');
        return;
    }

    if (!confirm('⚠️ WARNING!\n\nThis will delete ALL data permanently!\n\nAre you absolutely sure?')) return;

    localStorage.clear();
    location.reload();
}

// ===== CUSTOMER DISPLAY EVENTS =====
function setupCustomerDisplayEvents() {
    document.getElementById('btn-toggle-cust-display').addEventListener('click', () => {
        openCustomerDisplayWindow();
    });

    document.getElementById('btn-close-cust-display').addEventListener('click', () => {
        document.getElementById('customer-display').classList.add('hidden');
    });

    document.getElementById('btn-maximize-cust-display').addEventListener('click', () => {
        const display = document.getElementById('customer-display');
        if (STATE.customerScreenMaximized) {
            display.style.width = '420px';
            display.style.height = '400px';
            display.style.bottom = '20px';
            display.style.right = '20px';
            display.style.top = '';
            display.style.left = '';
            STATE.customerScreenMaximized = false;
        } else {
            display.style.width = '100vw';
            display.style.height = '100vh';
            display.style.top = '0';
            display.style.left = '0';
            display.style.bottom = '';
            display.style.right = '';
            STATE.customerScreenMaximized = true;
        }
    });

    const header = document.getElementById('customer-header');
    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', (e) => {
        if (STATE.customerScreenMaximized) return;
        isDragging = true;
        const display = document.getElementById('customer-display');
        const rect = display.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const display = document.getElementById('customer-display');
        display.style.left = `${e.clientX - offsetX}px`;
        display.style.top = `${e.clientY - offsetY}px`;
        display.style.bottom = '';
        display.style.right = '';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

// ===== EXTERNAL CUSTOMER DISPLAY FOR SECOND MONITOR =====
let customerWindow = null;

function openCustomerDisplayWindow() {
    if (customerWindow && !customerWindow.closed) {
        customerWindow.focus();
        return;
    }

    customerWindow = window.open('', 'CustomerDisplay',
        'width=450,height=500,menubar=no,toolbar=no,location=no,status=no');

    customerWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Customer Display - SWAN ERP</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          font-family: Arial, sans-serif;
          color: #fff;
        }
        .block {
          background: rgba(255,255,255,0.1);
          padding: 15px;
          margin: 10px 0;
          border-radius: 8px;
          border: 1px solid rgba(56, 189, 248, 0.3);
          font-size: 0.9rem;
        }
        h2 { text-align: center; color: #38bdf8; }
        .item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .total {
          font-size: 2rem;
          font-weight: bold;
          text-align: center;
          color: #22c55e;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <h2>🛒 CUSTOMER DISPLAY</h2>
      <div class="block" id="type-info"></div>
      <div class="block" id="items-list"></div>
      <div class="block" id="summary-info"></div>
      <div class="total" id="total-display">0.00</div>
    </body>
    </html>
  `);

    updateExternalCustomerDisplay();
}

function updateExternalCustomerDisplay() {
    if (!customerWindow || customerWindow.closed) return;

    const customerType = document.getElementById('pos-cust-type').value;
    const paymentMode = document.getElementById('pos-mode').value;

    const subtotal = STATE.posCart.reduce((sum, c) => sum + (c.qty * c.price), 0);
    const discount = parseFloat(document.getElementById('pos-disc').value) || 0;
    const taxPercent = parseFloat(document.getElementById('pos-tax').value) || 0;
    const fixedTax = parseFloat(document.getElementById('pos-fixed-tax').value) || 0;
    const service = parseFloat(document.getElementById('pos-svc').value) || 0;
    const afterDiscount = subtotal - discount;
    const taxAmount = (afterDiscount * taxPercent) / 100;
    const total = afterDiscount + taxAmount + fixedTax + service;

    customerWindow.document.getElementById('type-info').innerHTML = `
    <strong>Customer Type:</strong> ${customerType}<br>
    <strong>Payment Mode:</strong> ${paymentMode}
  `;

    const itemsHtml = STATE.posCart.map(c => `
    <div class="item">
      <span>${c.name} × ${c.qty}</span>
      <span>${formatCurrency(c.qty * c.price)}</span>
    </div>
  `).join('');
    customerWindow.document.getElementById('items-list').innerHTML =
        itemsHtml || '<p style="text-align:center;color:#999">No items</p>';

    customerWindow.document.getElementById('summary-info').innerHTML = `
    <div class="item"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
    <div class="item"><span>Discount</span><span>${formatCurrency(discount)}</span></div>
    <div class="item"><span>Tax</span><span>${formatCurrency(taxAmount + fixedTax)}</span></div>
    <div class="item"><span>Service</span><span>${formatCurrency(service)}</span></div>
  `;

    customerWindow.document.getElementById('total-display').textContent = formatCurrency(total);
}

function updateCustomerDisplay() {
    const display = document.getElementById('customer-display');
    if (display.classList.contains('hidden')) return;

    const customerType = document.getElementById('pos-cust-type').value;
    const paymentMode = document.getElementById('pos-mode').value;

    const subtotal = STATE.posCart.reduce((sum, c) => sum + (c.qty * c.price), 0);
    const discount = parseFloat(document.getElementById('pos-disc').value) || 0;
    const taxPercent = parseFloat(document.getElementById('pos-tax').value) || 0;
    const fixedTax = parseFloat(document.getElementById('pos-fixed-tax').value) || 0;
    const service = parseFloat(document.getElementById('pos-svc').value) || 0;
    const afterDiscount = subtotal - discount;
    const taxAmount = (afterDiscount * taxPercent) / 100;
    const total = afterDiscount + taxAmount + fixedTax + service;

    document.getElementById('cust-d-type').innerHTML = `
    <div style="font-size:0.9rem">
      <strong>Type:</strong> ${customerType}<br>
      <strong>Payment:</strong> ${paymentMode}
    </div>
  `;

    const itemsHtml = STATE.posCart.map(c => `
    <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.1)">
      <span>${c.name} × ${c.qty}</span>
      <span>${formatCurrency(c.qty * c.price)}</span>
    </div>
  `).join('');
    document.getElementById('cust-d-items').innerHTML = itemsHtml || '<p style="text-align:center;color:var(--muted)">No items</p>';

    document.getElementById('cust-d-summary').innerHTML = `
    <div style="display:flex;justify-content:space-between;padding:3px 0">
      <span>Subtotal:</span><span>${formatCurrency(subtotal)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:3px 0">
      <span>Discount:</span><span>${formatCurrency(discount)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:3px 0">
      <span>Tax:</span><span>${formatCurrency(taxAmount + fixedTax)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:3px 0">
      <span>Service:</span><span>${formatCurrency(service)}</span>
    </div>
  `;

    document.getElementById('cust-d-pay').innerHTML = `
    <div style="font-size:1.5rem;font-weight:bold;text-align:center;color:var(--accent-soft)">
      ${formatCurrency(total)}
    </div>
  `;
}

// ===== REPORT EVENTS =====
function setupReportEvents() {
    document.querySelectorAll('[data-rpt-view]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (STATE.role !== 'Admin') {
                showNotification('Access Denied! Reports require Admin privileges.');
                return;
            }
            const type = btn.dataset.rptView;
            viewReport(type);
        });
    });

    document.querySelectorAll('[data-rpt-print]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (STATE.role !== 'Admin') {
                showNotification('Access Denied! Reports require Admin privileges.');
                return;
            }
            const type = btn.dataset.rptPrint;
            viewReport(type, true);
        });
    });
}


function viewReport(type, print = false) {
    const startDate = document.getElementById('rpt-start').value;
    const endDate = document.getElementById('rpt-end').value;

    if (!startDate || !endDate) {
        showNotification('⚠️ Please select date range!');
        return;
    }

    if (type === 'sale') {
        generateSaleReport(startDate, endDate, print);
    } else if (type === 'profit') {
        generateProfitReport(startDate, endDate, print);
    } else if (type === 'expense') {
        generateExpenseReport(startDate, endDate, print);
    } else if (type === 'stock') {
        generateStockReport(print);
    }
}
function downloadReportPDF(reportTitle = 'Report') {
    const printZone = document.getElementById('print-zone');
    if (!printZone || !printZone.innerHTML.trim()) {
        showNotification('⚠️ No report content to download.');
        return;
    }

    const element = document.createElement('div');
    element.innerHTML = printZone.innerHTML;

    const opt = {
        margin: 5,
        filename: `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
}


function generateSaleReport(startDate, endDate, print) {
    const sales = STATE.sales.filter(s => s.date >= startDate && s.date <= endDate);
    if (sales.length === 0) {
        showNotification('No sales found for this period!');
        return;
    }

    let html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="text-align: center">Sales Report</h2>
        <p><strong>Period</strong> ${startDate} to ${endDate}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #333; color: white;">
              <th style="border: 1px solid #ddd; padding: 8px;">Bill#</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Time</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Customer</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Items</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
    `;

    sales.forEach(s => {
        const itemsList = s.items.map(i => `${i.name} (${i.qty})`).join(', ');
        html += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${s.billNo}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${s.date}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${s.time || ''}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${s.customerName}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${itemsList}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(s.total)}</td>
          </tr>
        `;
    });

    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);

    html += `
          </tbody>
          <tfoot>
            <tr style="background: #f0f0f0; font-weight: bold;">
              <td colspan="5" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total Sales</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(totalSales)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    if (print) {
        const printZone = document.getElementById('print-zone');
        printZone.innerHTML = html;
        downloadReportPDF('Sales Report');
    } else {
        document.getElementById('m-report-title').textContent = 'Sales Report';
        document.getElementById('report-container').innerHTML = html;
        showModal('m-report');
    }
}

function generateProfitReport(startDate, endDate, print) {
    const sales = STATE.sales.filter(s => s.date >= startDate && s.date <= endDate);
    const expenses = STATE.expenses.filter(e => e.date >= startDate && e.date <= endDate);

    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalProfit - totalExpenses;

    let html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="text-align: center;">Profit Report</h2>
      <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
      <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; padding: 10px 0;">
          <strong>Total Sales:</strong>
          <span>${formatCurrency(totalSales)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 0; color: green;">
          <strong>Gross Profit:</strong>
          <span>${formatCurrency(totalProfit)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 0; color: red;">
          <strong>Total Expenses:</strong>
          <span>${formatCurrency(totalExpenses)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #333; font-size: 1.2rem;">
          <strong>Net Profit:</strong>
          <span style="color: ${netProfit >= 0 ? 'green' : 'red'};">${formatCurrency(netProfit)}</span>
        </div>
      </div>
    </div>
  `;

    if (print) {
        const printZone = document.getElementById('print-zone');
        printZone.innerHTML = html;
        downloadReportPDF('Profit_Report');
    } else {
        document.getElementById('m-report-title').textContent = 'Profit Report';
        document.getElementById('report-container').innerHTML = html;
        showModal('m-report');
    }

}

function generateExpenseReport(startDate, endDate, print) {
    const expenses = STATE.expenses.filter(e => e.date >= startDate && e.date <= endDate);

    if (expenses.length === 0) {
        showNotification('⚠️ No expenses found for this period!');
        return;
    }

    let html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="text-align: center;">Expense Report</h2>
      <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background: #333; color: white;">
            <th style="border: 1px solid #ddd; padding: 8px;">Date</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Category</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
  `;

    expenses.forEach(e => {
        html += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${e.date}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${e.category}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${e.description}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(e.amount)}</td>
      </tr>
    `;
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    html += `
        </tbody>
        <tfoot>
          <tr style="background: #f0f0f0; font-weight: bold;">
            <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total Expenses:</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

    if (print) {
        const printZone = document.getElementById('print-zone');
        printZone.innerHTML = html;
        downloadReportPDF('Expense_Report');
    } else {
        document.getElementById('m-report-title').textContent = 'Expense Report';
        document.getElementById('report-container').innerHTML = html;
        showModal('m-report');
    }

}

function generateStockReport(print) {
    let html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="text-align: center;">Stock Report</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background: #333; color: white;">
            <th style="border: 1px solid #ddd; padding: 8px;">Code</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Name</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Cost</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Price</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Stock</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Value</th>
          </tr>
        </thead>
        <tbody>
  `;

    STATE.items.forEach(item => {
        const value = item.stock * item.cost;
        html += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.code}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.cost)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.stock}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(value)}</td>
      </tr>
    `;
    });

    const totalValue = STATE.items.reduce((sum, i) => sum + (i.stock * i.cost), 0);
    html += `
        </tbody>
        <tfoot>
          <tr style="background: #f0f0f0; font-weight: bold;">
            <td colspan="5" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total Stock Value:</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(totalValue)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

    if (print) {
        const printZone = document.getElementById('print-zone');
        printZone.innerHTML = html;
        downloadReportPDF('Stock_Report');
    } else {
        document.getElementById('m-report-title').textContent = 'Stock Report';
        document.getElementById('report-container').innerHTML = html;
        showModal('m-report');
    }

}

// ===== DASHBOARD =====
function renderDashboard() {
    const startDate = document.getElementById('rpt-start').value || getTodayDate();
    const endDate = document.getElementById('rpt-end').value || getTodayDate();

    const sales = STATE.sales.filter(s => s.date >= startDate && s.date <= endDate);
    const expenses = STATE.expenses.filter(e =>  e.date >= startDate && e.date <= endDate);

    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const cashSales = sales.filter(s => s.paymentMode === 'Cash').reduce((sum, s) => sum + s.total, 0);
    const creditSales = sales.filter(s => s.paymentMode === 'Credit').reduce((sum, s) => sum + s.total, 0);
    const onlineSales = sales.filter(s => s.paymentMode === 'Online').reduce((sum, s) => sum + s.total, 0);
    const grossProfit = sales.reduce((sum, s) => sum + s.profit, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;

    document.getElementById('d-total').textContent = formatCurrency(totalSales);
    document.getElementById('d-cash').textContent = formatCurrency(cashSales);
    document.getElementById('d-credit').textContent = formatCurrency(creditSales);
    document.getElementById('d-online').textContent = formatCurrency(onlineSales);
    document.getElementById('d-gross').textContent = formatCurrency(grossProfit);
    document.getElementById('d-net').textContent = formatCurrency(netProfit);
}
function getAdvanceSeries(metric, groupBy, startDate, endDate) {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const isInRange = (dStr) => {
        const d = parseDate(dStr);
        return d >= start && d <= end;
    };

    const buckets = {};

    if (metric === "sales" || metric === "profit") {
        STATE.sales.forEach(s => {
            if (!s.date || !isInRange(s.date)) return;
            const key = groupBy === "month" ? formatMonthKey(s.date) : formatDayKey(s.date);
            if (!buckets[key]) buckets[key] = 0;
            if (metric === "sales") buckets[key] += s.total || 0;
            else buckets[key] += s.profit || 0;
        });
    } else if (metric === "expense") {
        STATE.expenses.forEach(e => {
            if (!e.date || !isInRange(e.date)) return;
            const key = groupBy === "month" ? formatMonthKey(e.date) : formatDayKey(e.date);
            if (!buckets[key]) buckets[key] = 0;
            buckets[key] += e.amount || 0;
        });
    }

    const labels = Object.keys(buckets).sort();
    const values = labels.map(k => buckets[k]);
    return { labels, values };
}
function renderAdvanceChart(labels, values, metric) {
    const canvas = document.getElementById("adv-chart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = canvas.clientWidth || 800;
    const h = canvas.height = canvas.clientHeight || 350;

    ctx.clearRect(0, 0, w, h);

    if (!labels.length) {
        ctx.fillStyle = "#999";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("No data for selected period.", w / 2, h / 2);
        return;
    }

    const maxVal = Math.max(...values) || 1;
    const padding = 40;
    const chartW = w - padding * 2;
    const chartH = h - padding * 2;
    const barWidth = chartW / labels.length * 0.6;
    const step = chartW / labels.length;

    // axes
    ctx.strokeStyle = "#ccc";
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();

    // bars + line
    ctx.fillStyle = metric === "expense" ? "#ef4444" : "#10b981";
    ctx.strokeStyle = "#0ea5e9";
    ctx.beginPath();

    labels.forEach((label, i) => {
        const val = values[i];
        const xCenter = padding + step * (i + 0.5);
        const barH = (val / maxVal) * chartH;
        const x = xCenter - barWidth / 2;
        const y = h - padding - barH;

        // bar
        ctx.fillRect(x, y, barWidth, barH);

        // line path
        const lineY = y;
        if (i === 0) ctx.moveTo(xCenter, lineY);
        else ctx.lineTo(xCenter, lineY);

        // x labels
        ctx.save();
        ctx.fillStyle = "#555";
        ctx.font = "10px Arial";
        ctx.textAlign = "right";
        ctx.translate(xCenter, h - padding + 12);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(label, 0, 0);
        ctx.restore();
    });

    ctx.stroke();

    // title
    ctx.fillStyle = "#111";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(metric.charAt(0).toUpperCase() + metric.slice(1) + " over time", padding, 20);
}

// ===== BILL BROWSER =====
function setupBillBrowserEvents() {
    document.getElementById('btn-bill-prev').addEventListener('click', () => browseBills(-1));
    document.getElementById('btn-bill-next').addEventListener('click', () => browseBills(1));
    document.getElementById('btn-bill-reprint').addEventListener('click', reprintBill);
    document.getElementById('btn-bill-return').addEventListener('click', returnBill);
    document.getElementById('btn-bill-delete').addEventListener('click', deleteBill);
}

function updateBillBrowser() {
    const input = document.getElementById('bill-index');
    if (STATE.sales.length === 0) {
        input.value = 'No bills';
        STATE.currentBillIndex = -1;
    } else {
        if (STATE.currentBillIndex < 0) STATE.currentBillIndex = STATE.sales.length - 1;
        input.value = `Bill #${STATE.sales[STATE.currentBillIndex].billNo} / ${STATE.sales.length}`;
    }
}

function browseBills(direction) {
    if (STATE.sales.length === 0) {
        showNotification('⚠️ No bills to browse!');
        return;
    }

    STATE.currentBillIndex += direction;

    if (STATE.currentBillIndex < 0) STATE.currentBillIndex = STATE.sales.length - 1;
    if (STATE.currentBillIndex >= STATE.sales.length) STATE.currentBillIndex = 0;

    updateBillBrowser();
}

function reprintBill() {
    if (STATE.currentBillIndex < 0 || STATE.sales.length === 0) {
        showNotification('⚠️ No bill selected!');
        return;
    }
    const sale = STATE.sales[STATE.currentBillIndex];
    printSaleBill(sale);
}

function returnBill() {
    if (STATE.currentBillIndex < 0 || STATE.sales.length === 0) {
        showNotification('⚠️ No bill selected!');
        return;
    }

    if (!confirm('Are you sure you want to return this bill?\n\nThis will restore stock and reverse all transactions.')) return;

    const sale = STATE.sales[STATE.currentBillIndex];

    sale.items.forEach(cartItem => {
        const item = STATE.items.find(i => i.id === cartItem.itemId);
        if (item) item.stock += cartItem.qty;
    });

    if (sale.paymentMode === 'Credit' && sale.customerId) {
        const cust = STATE.customers.find(c => c.id === sale.customerId);
        if (cust) cust.balance -= sale.total;
    }

    if (sale.paymentMode === 'Online' && sale.bankId) {
        const bank = STATE.banks.find(b => b.id === sale.bankId);
        if (bank) {
            bank.balance -= sale.total;
            STATE.bankTransactions.push({
                id: generateId(),
                date: getTodayDate(),
                bankId: sale.bankId,
                type: 'Withdraw',
                amount: sale.total,
                description: `Return Bill #${sale.billNo}`
            });
        }
    }

    STATE.sales.splice(STATE.currentBillIndex, 1);
    STATE.currentBillIndex = -1;

    saveToStorage();
    renderInventory();
    renderDashboard();
    renderLedger();
    renderBanking();
    updateBillBrowser();

    showNotification('✓ Bill returned successfully!');
}

function deleteBill() {
    if (STATE.role !== 'Admin') {
        showNotification('⚠️ Access Denied!\n\nOnly Admin can delete bills.');
        return;
    }

    if (STATE.currentBillIndex < 0 || STATE.sales.length === 0) {
        showNotification('⚠️ No bill selected!');
        return;
    }

    const password = prompt('Enter Admin password to delete bill (1234):');
    if (password !== '1234') {
        showNotification('⚠️ Incorrect password!');
        return;
    }

    if (!confirm('⚠️ WARNING!\n\nDeleting a bill will NOT restore stock or reverse transactions.\n\nAre you sure?')) return;

    const sale = STATE.sales[STATE.currentBillIndex];
    STATE.sales.splice(STATE.currentBillIndex, 1);
    STATE.currentBillIndex = -1;

    saveToStorage();
    renderDashboard();
    updateBillBrowser();

    showNotification(`✓ Bill #${sale.billNo} deleted!`);
}

// ===== PRINT FUNCTIONS =====
function printSaleBill(sale) {
    // Block printing if not licensed (trial cannot print)
    if (!STATE.licenseVerified) {
        alert("Feature not available on trial version.");
        return;
    }

    const companyName = STATE.settings.companyName || "SWAN-ERP";
    const companyAddr = STATE.settings.companyAddress || "";
    const logo = STATE.settings.logo || "";

    let html = `
        <div style="font-family: Arial, sans-serif; padding: 10px; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 10px;">
    `;

    if (logo) {
        html += `<img src="${logo}" alt="Logo" style="max-height: 60px; margin-bottom: 5px;"><br>`;
    }

    html += `
                <strong>${companyName}</strong><br>
                <span style="font-size: 0.85rem;">${companyAddr}</span>
            </div>
            <hr>
            <div style="font-size: 0.85rem; margin-bottom: 8px;">
                <div><strong>Bill #:</strong> ${sale.billNo}</div>
                <div><strong>Date:</strong> ${sale.date} ${sale.time || ""}</div>
                <div><strong>Customer:</strong> ${sale.customerName}</div>
                <div><strong>Mode:</strong> ${sale.paymentMode}</div>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 8px;">
                <thead>
                    <tr style="border-bottom: 1px solid #ddd;">
                        <th style="text-align: left; padding: 4px;">Item</th>
                        <th style="text-align: right; padding: 4px;">Qty</th>
                        <th style="text-align: right; padding: 4px;">Price</th>
                        <th style="text-align: right; padding: 4px;">Total</th>
                    </tr>
                </thead>
                <tbody>
    `;

    sale.items.forEach(it => {
        const lineTotal = it.qty * it.price;
        html += `
            <tr>
                <td style="padding: 4px;">${it.name}</td>
                <td style="padding: 4px; text-align: right;">${it.qty}</td>
                <td style="padding: 4px; text-align: right;">${formatCurrency(it.price)}</td>
                <td style="padding: 4px; text-align: right;">${formatCurrency(lineTotal)}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
            <div style="font-size: 0.85rem; text-align: right;">
                <div>Subtotal: <strong>${formatCurrency(sale.subtotal)}</strong></div>
                <div>Discount: <strong>${formatCurrency(sale.discount)}</strong></div>
                <div>Tax (${sale.taxPercent}%): <strong>${formatCurrency(sale.taxAmount)}</strong></div>
                <div>Fixed Tax: <strong>${formatCurrency(sale.fixedTax)}</strong></div>
                <div>Service: <strong>${formatCurrency(sale.service)}</strong></div>
                <div style="font-size: 1rem; margin-top: 5px;">Net Total: <strong>${formatCurrency(sale.total)}</strong></div>
            </div>
            <hr>
            <div style="text-align: center; font-size: 0.8rem; margin-top: 5px;">
                Thank you for your business!
            </div>
        </div>
    `;

    const printZone = document.getElementById('print-zone');
    if (printZone) {
        printZone.innerHTML = html;
        window.print();
    } else {
        const w = window.open('', '_blank');
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
        w.close();
    }
}



function printPaymentReceipt(entity, amount, date, mode, isSupplier = false) {
    const type = isSupplier ? 'Supplier Payment' : 'Customer Payment';
    const companyName = STATE.settings.companyName || 'SWAN-ERP';

    let html = `
    <div style="font-family: monospace; width: 300px; margin: 0 auto; padding: 10px;">
      <h2 style="text-align: center; margin: 5px 0;">${companyName}</h2>
      <h3 style="text-align: center; margin: 5px 0;">${type} Receipt</h3>
      <hr style="border: 1px dashed #000;">
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Name:</strong> ${entity.name}</p>
      <p><strong>Amount Paid:</strong> ${formatCurrency(amount)}</p>
      <p><strong>Mode:</strong> ${mode}</p>
      <p><strong>${isSupplier ? 'Remaining Payable' : 'Remaining Balance'}:</strong> ${formatCurrency(isSupplier ? entity.payable : entity.balance)}</p>
      <hr style="border: 1px dashed #000;">
      <p style="text-align: center; font-size: 11px;">Thank you!</p>
    </div>
  `;

    const printZone = document.getElementById('print-zone');
    printZone.innerHTML = html;
    window.print();
}

// ===== GLOBAL WINDOW FUNCTIONS =====
window.addToPOSCart = addToPOSCart;
window.updatePOSCartQty = updatePOSCartQty;
window.updatePOSCartPrice = updatePOSCartPrice;
window.removeFromPOSCart = removeFromPOSCart;
window.addToPurchaseCart = addToPurchaseCart;
window.updatePurchaseCartQty = updatePurchaseCartQty;
window.updatePurchaseCartCost = updatePurchaseCartCost;
window.removeFromPurchaseCart = removeFromPurchaseCart;
window.editItem = editItem;
window.deleteItem = deleteItem;
window.viewCustomerDetails = viewCustomerDetails;
window.viewSupplierDetails = viewSupplierDetails;
window.deleteCustomer = deleteCustomer;
window.deleteSupplier = deleteSupplier;
window.deleteBank = deleteBank;
window.deleteExpense = deleteExpense;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;

// ===== CONSOLE LOG =====
console.log('%c ✅ SWAN-ERP Professional Edition Loaded! ', 'background: #10b981; color: white; font-size: 18px; font-weight: bold; padding: 12px');
console.log('%c Features: Daily Dashboard Reset | Service Categories | Price Edit | Employee Restrictions | External Customer Display ', 'font-size: 12px; color: #10b981');
console.log('%c Total Lines: 3050+ ', 'font-size: 10px; color: #666');

