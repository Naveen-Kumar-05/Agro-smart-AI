const fs = require("fs");
let c = fs.readFileSync("public/app.js","utf8").replace(/\r\n/g,"\n");

// 1. Add farmer location auto-fill before addBtn handler
c = c.replace(
  'if (document.getElementById("addBtn")) {\n      document.getElementById("addBtn").addEventListener("click", async () => {',
  '// Auto-fill location from user profile\n    const locInput = document.getElementById("location");\n    if (locInput && user.location && !locInput.value) locInput.value = user.location;\n\n    if (document.getElementById("addBtn")) {\n      document.getElementById("addBtn").addEventListener("click", async () => {'
);

// 2. Fix addProduct to re-fill location after submit
c = c.replace(
  'document.getElementById("location").value = "";\n\n        loadFarmerProducts();',
  '// Re-fill location from profile\n        if (locInput && user.location) locInput.value = user.location;\n\n        loadFarmerProducts();\n        showToast("Product listed successfully!", "AgroSmart");'
);

// 3. Add page transitions to DOMContentLoaded
c = c.replace(
  '  // Reservoir logic',
  '  // Smooth page transitions for internal links\n  document.addEventListener("click", (e) => {\n    const link = e.target.closest("a[href]");\n    if (!link) return;\n    const href = link.getAttribute("href");\n    if (!href || href.startsWith("#") || href.startsWith("javascript") || href.startsWith("http") || link.target === "_blank") return;\n    e.preventDefault();\n    navigateTo(href);\n  });\n\n  // Reservoir logic'
);

// 4. Remove broken langToggle listener from DOMContentLoaded
c = c.replace(
  '  // Attach listener to any langToggle button found\n  const toggleBtn = document.getElementById("langToggle");\n  if (toggleBtn) {\n    toggleBtn.addEventListener("click", toggleLanguage);\n  }\n\n  ',
  '  '
);

// 5. Replace editProduct prompt() with inline modal
c = c.replace(
  `async function editProduct(id) {
  const res = await fetch("/products");
  const products = await res.json();
  const p = products.find(x => x.id === id);
  if (!p) return;

  const newPrice = prompt("New Price", p.price);
  const newQty = prompt("New Qty (kg)", p.qty);
  const newLoc = prompt("New Location", p.location);

  await fetch("/updateProduct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, price: newPrice, qty: newQty, location: newLoc })
  });

  loadFarmerProducts();
}`,
  `async function editProduct(id) {
  const res = await fetch("/products");
  const products = await res.json();
  const p = products.find(x => x.id === id);
  if (!p) return;

  const existing = document.getElementById("editProductModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "editProductModal";
  modal.innerHTML = \`
    <div class="modal fade" id="editProductModalInner" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius:18px;border:none;">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Edit Listing</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body pt-2">
            <div class="mb-3">
              <label class="form-label">Price (Rs./kg)</label>
              <input id="editPrice" type="number" class="form-control" value="\${p.price}">
            </div>
            <div class="mb-3">
              <label class="form-label">Quantity (kg)</label>
              <input id="editQty" type="number" class="form-control" value="\${p.qty}">
            </div>
            <div class="mb-3">
              <label class="form-label">Location (District)</label>
              <input id="editLoc" class="form-control" value="\${p.location}">
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
            <button id="saveEditBtn" class="btn btn-success fw-bold px-4">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  \`;
  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(document.getElementById("editProductModalInner"));
  bsModal.show();

  document.getElementById("saveEditBtn").onclick = async () => {
    const newPrice = document.getElementById("editPrice").value.trim();
    const newQty   = document.getElementById("editQty").value.trim();
    const newLoc   = document.getElementById("editLoc").value.trim();
    if (!newPrice || !newQty || !newLoc) { showToast("Fill all fields", "Error"); return; }
    await fetch("/updateProduct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, price: newPrice, qty: newQty, location: newLoc })
    });
    bsModal.hide();
    showToast("Listing updated!", "AgroSmart");
    loadFarmerProducts();
  };
}`
);

// 6. Replace deleteProduct confirm() with inline modal
c = c.replace(
  `async function deleteProduct(id) {
  const lang = "en";
  if (!confirm(i18n[lang]?.confirm_delete || "Delete product?")) return;
  await fetch("/deleteProduct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  loadFarmerProducts();
}`,
  `async function deleteProduct(id) {
  const existing = document.getElementById("deleteConfirmModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "deleteConfirmModal";
  modal.innerHTML = \`
    <div class="modal fade" id="deleteConfirmModalInner" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content text-center p-4" style="border-radius:18px;border:none;">
          <div style="font-size:2.5rem;margin-bottom:.75rem;">🗑️</div>
          <h6 class="fw-bold mb-2">Delete this listing?</h6>
          <p class="text-muted small mb-4">This action cannot be undone.</p>
          <div class="d-flex gap-2">
            <button class="btn btn-light flex-fill" data-bs-dismiss="modal">Cancel</button>
            <button id="confirmDeleteBtn" class="btn btn-danger flex-fill fw-bold">Delete</button>
          </div>
        </div>
      </div>
    </div>
  \`;
  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(document.getElementById("deleteConfirmModalInner"));
  bsModal.show();

  document.getElementById("confirmDeleteBtn").onclick = async () => {
    await fetch("/deleteProduct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    bsModal.hide();
    showToast("Listing deleted", "AgroSmart");
    loadFarmerProducts();
  };
}`
);

// 7. Replace orderPrompt prompt() with inline qty stepper
const oldOrderPrompt = `  const p = (window.allProducts || []).find(x => x.id === id);
  if (!p) return;

  const pNameTranslated = i18n[lang][\`crop_\${p.name.toLowerCase()}\`] || p.name;
  const qty = prompt(\`\${i18n[lang]?.prompt_qty || "Order quantity for "}\${pNameTranslated} (kg)\`, "1");
  if (!qty || isNaN(qty) || qty <= 0) return;

  const totalAmount = (parseFloat(p.price) * parseFloat(qty)).toFixed(2);

  // Set up modal content
  const summaryEl = document.getElementById("paymentOrderSummary");
  const amountEl = document.getElementById("payAmount");
  if (summaryEl && amountEl) {
    summaryEl.innerHTML = \`
      <div class="d-flex justify-content-between mb-2">
        <span class="text-muted" data-i18n="label_product">\${i18n[lang]?.label_product || "Product"}</span>
        <span class="fw-bold">\${escapeHtml(pNameTranslated)}</span>
      </div>
      <div class="d-flex justify-content-between mb-2">
        <span class="text-muted" data-i18n="label_qty">\${i18n[lang]?.label_qty || "Quantity"}</span>
        <span class="fw-bold">\${qty} kg</span>
      </div>
      <div class="d-flex justify-content-between mb-2">
        <span class="text-muted" data-i18n="label_price">\${i18n[lang]?.label_price || "Price"}</span>
        <span class="fw-bold">Rs.\${p.price}/kg</span>
      </div>
      <hr>
      <div class="d-flex justify-content-between">
        <span class="fw-bold" data-i18n="label_total">\${i18n[lang]?.label_total || "Total Amount"}</span>
        <span class="fw-bold text-success fs-5">Rs.\${totalAmount}</span>
      </div>
    \`;
    amountEl.textContent = \`Rs.\${totalAmount}\`;
  }`;

const newOrderPrompt = `  const p = (window.allProducts || []).find(x => x.id === id);
  if (!p) return;

  const pName = p.name;
  const maxQty = parseFloat(p.qty);

  // Set up modal with qty stepper
  const summaryEl = document.getElementById("paymentOrderSummary");
  const amountEl  = document.getElementById("payAmount");

  if (summaryEl) {
    let currentQty = 1;
    const updateDisplay = () => {
      const total = (currentQty * parseFloat(p.price)).toFixed(2);
      document.getElementById("qtyDisplay").textContent = currentQty;
      document.getElementById("orderTotalDisplay").textContent = "Rs." + total;
      if (amountEl) amountEl.textContent = "Rs." + total;
    };

    summaryEl.innerHTML = \`
      <div class="d-flex justify-content-between mb-2">
        <span class="text-muted">Product</span>
        <span class="fw-bold">\${escapeHtml(pName)}</span>
      </div>
      <div class="d-flex justify-content-between mb-2">
        <span class="text-muted">Available</span>
        <span class="fw-bold">\${escapeHtml(String(p.qty))} kg</span>
      </div>
      <div class="d-flex justify-content-between mb-2">
        <span class="text-muted">Price</span>
        <span class="fw-bold">Rs.\${p.price}/kg</span>
      </div>
      <div class="mb-3 mt-3">
        <label class="form-label fw-bold">Quantity (kg)</label>
        <div class="d-flex align-items-center gap-3">
          <div class="qty-control">
            <div class="qty-btn" id="qtyMinus">-</div>
            <span id="qtyDisplay" class="fw-bold px-2" style="min-width:40px;text-align:center;">1</span>
            <div class="qty-btn" id="qtyPlus">+</div>
          </div>
          <span class="text-muted small">Max: \${escapeHtml(String(p.qty))} kg</span>
        </div>
      </div>
      <hr>
      <div class="d-flex justify-content-between">
        <span class="fw-bold">Total Amount</span>
        <span id="orderTotalDisplay" class="fw-bold text-success fs-5">Rs.\${p.price}</span>
      </div>
    \`;
    if (amountEl) amountEl.textContent = "Rs." + p.price;

    document.getElementById("qtyMinus").onclick = () => { if (currentQty > 1) { currentQty--; updateDisplay(); } };
    document.getElementById("qtyPlus").onclick  = () => { if (currentQty < maxQty) { currentQty++; updateDisplay(); } };
    window._orderQtyGetter = () => currentQty;
  }`;

if (c.includes(oldOrderPrompt)) {
  c = c.replace(oldOrderPrompt, newOrderPrompt);
  console.log("Fixed orderPrompt qty stepper");
} else {
  console.log("orderPrompt pattern not found - skipping");
}

// 8. Fix confirmBtn.onclick to use _orderQtyGetter
c = c.replace(
  'confirmBtn.onclick = async () => {\n    const cardNumber = document.getElementById("payCardNumber").value.trim();',
  'confirmBtn.onclick = async () => {\n    const qty = window._orderQtyGetter ? window._orderQtyGetter() : 1;\n    const totalAmount = (parseFloat(p.price) * parseFloat(qty)).toFixed(2);\n    const cardNumber = document.getElementById("payCardNumber").value.trim();'
);

// Remove old totalAmount variable if it exists before modal show
c = c.replace(
  '\n  const totalAmount = (parseFloat(p.price) * parseFloat(qty)).toFixed(2);\n\n  // Set up modal content',
  '\n  // Set up modal content'
);

fs.writeFileSync("public/app.js", c, "utf8");
console.log("Done. Lines:", c.split("\n").length);