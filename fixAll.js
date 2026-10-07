/**
 * fixAll.js — Complete fix for app.js (handles CRLF line endings)
 */
const fs = require('fs');

// Read and normalize line endings to LF
let c = fs.readFileSync('public/app.js', 'utf8').replace(/\r\n/g, '\n');
console.log('Lines after CRLF fix:', c.split('\n').length);

// ── 1. Fix corrupted i18n string values ───────────────────────────────────
const i18nFixes = [
  [/nav_fert_guide:\s*"[^"]*"/,       'nav_fert_guide: "Fertilizer Guide"'],
  [/nav_disease_tool:\s*"[^"]*"/,     'nav_disease_tool: "Disease Analysis"'],
  [/fert_title:\s*"[^"]*"/,           'fert_title: "Fertilizer Recommendation"'],
  [/disease_title:\s*"[^"]*"/,        'disease_title: "Crop Disease Analysis (AI)"'],
  [/f_portal_dashboard:\s*"[^"]*"/,   'f_portal_dashboard: "Farmer Dashboard"'],
  [/alert_storm_now:\s*"[^"]*"/,      'alert_storm_now: "STORM NOW!"'],
  [/alert_heavy_rain:\s*"[^"]*"/,     'alert_heavy_rain: "Heavy Rain Coming"'],
  [/hero_title:\s*"[^"]*"/,           "hero_title: \"The Future of <span class='text-primary-light'>Farming</span> is Here\""],
];
i18nFixes.forEach(([p, r]) => { c = c.replace(p, r); });
console.log('Fixed i18n strings');

// ── 2. Remove Tamil i18n block ─────────────────────────────────────────────
const taStart = c.indexOf('  ta: {');
const taEnd   = c.indexOf('\n};', taStart);
if (taStart > -1 && taEnd > -1) {
  c = c.substring(0, taStart) + '\n};\n' + c.substring(taEnd + 3);
  console.log('Removed Tamil i18n block');
}

// ── 3. Simplify t() ───────────────────────────────────────────────────────
c = c.replace(
  /function t\(key\) \{[\s\S]*?\n\}/m,
  'function t(key) {\n  return (i18n.en && i18n.en[key]) || key;\n}'
);

// ── 4. Remove toggleLanguage ───────────────────────────────────────────────
c = c.replace(/function toggleLanguage\(\) \{[\s\S]*?\n\}\n/m, '');
c = c.replace(/localStorage\.getItem\("agroLang"\) \|\| "en"/g, '"en"');
c = c.replace(/localStorage\.getItem\('agroLang'\) \|\| 'en'/g, '"en"');
c = c.replace(/localStorage\.setItem\("agroLang"[^)]*\);/g, '');
c = c.replace(/lang === 'ta' \? 'ta-IN' : 'en-US'/g, "'en-US'");
console.log('Removed Tamil language support');

// ── 5. Add navigateTo + fix logout ────────────────────────────────────────
c = c.replace(
  /function logout\(\) \{\n  localStorage\.removeItem\("agroUser"\);\n  window\.location\.href = "home\.html";\n\}/,
  `function logout() {
  localStorage.removeItem("agroUser");
  navigateTo("home.html");
}

function navigateTo(url) {
  document.body.style.opacity = '0';
  document.body.style.transform = 'translateY(-8px)';
  document.body.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  setTimeout(() => { window.location.href = url; }, 250);
}`
);
console.log('Added navigateTo, navigateTo exists:', c.includes('function navigateTo'));

// ── 6. Fix window.location.href redirects ─────────────────────────────────
c = c.replace(/window\.location\.href = "farmer\.html";/g,  'navigateTo("farmer.html");');
c = c.replace(/window\.location\.href = "index\.html";/g,   'navigateTo("index.html");');
c = c.replace(/window\.location\.href = "buyer-orders\.html";/g, 'navigateTo("buyer-orders.html");');
c = c.replace(/window\.location\.href = "cart\.html";/g,    'navigateTo("cart.html");');
c = c.replace(/window\.location\.href = "login\.html\?role=buyer";/g, 'navigateTo("login.html?role=buyer");');
c = c.replace(/window\.location\.href = "login\.html\?role=farmer";/g, 'navigateTo("login.html?role=farmer");');
c = c.replace(/window\.location\.href = "login\.html";/g,   'navigateTo("login.html?role=buyer");');

// ── 7. Fix login redirect at top ──────────────────────────────────────────
c = c.replace(
  /if \(user\.role === "farmer"\) \{\n\s*window\.location\.href = "farmer\.html";\n\s*\} else \{\n\s*window\.location\.href = "index\.html";\n\s*\}/,
  'window.location.replace(user.role === "farmer" ? "farmer.html" : "index.html");'
);

// ── 8. Remove data-i18n from dynamic HTML templates ───────────────────────
// These cause applyTranslations() to overwrite content with corrupted strings
const dataI18nToRemove = [
  'data-i18n="crop_${p.name.toLowerCase()}"',
  'data-i18n="label_fresh"',
  'data-i18n="label_qty"',
  'data-i18n="label_farmer"',
  'data-i18n="label_predict_suggested"',
  'data-i18n="btn_buy_now"',
  'data-i18n="btn_accept"',
  'data-i18n="btn_reject"',
  'data-i18n="btn_edit"',
  'data-i18n="btn_delete"',
  'data-i18n="label_buyer"',
  'data-i18n="label_contact"',
  'data-i18n="label_status"',
  'data-i18n="label_product"',
  'data-i18n="label_price"',
  'data-i18n="label_total"',
  'data-i18n="no_listings"',
  'data-i18n="no_orders"',
  'data-i18n="no_buyer_orders"',
];
dataI18nToRemove.forEach(attr => {
  c = c.replace(new RegExp(' ' + attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
});
console.log('Removed data-i18n from dynamic HTML');

// ── 9. Fix getCropEmoji ───────────────────────────────────────────────────
c = c.replace(
  /function getCropEmoji\(name\) \{[\s\S]*?\n\}/m,
  `function getCropEmoji(name) {
  const map = {
    rice:"🌾", wheat:"🌾", maize:"🌽", corn:"🌽", sugarcane:"🎋",
    cotton:"🌿", tomato:"🍅", potato:"🥔", onion:"🧅", chili:"🌶",
    groundnut:"🥜", millet:"🌾", banana:"🍌", mango:"🥭",
    fruits:"🍎", vegetables:"🥗", carrot:"🥕", cabbage:"🥬",
    garlic:"🧄", ginger:"🌿", brinjal:"🍆", cucumber:"🥒",
    papaya:"🍈", grapes:"🍇", cauliflower:"🥦", drumstick:"🌿",
    "ladies finger":"🌿", "bitter gourd":"🌿"
  };
  return map[(name||"").toLowerCase()] || "📦";
}`
);
console.log('Fixed getCropEmoji, clean:', c.includes('const map = {'));

// ── 10. Fix weather icon function ─────────────────────────────────────────
c = c.replace(
  /\/\/ Weather icon mapping\nfunction getWeatherIcon\(code, isDay = true\) \{[\s\S]*?\n\}/m,
  `// Weather icon mapping
function getWeatherIcon(code) {
  const icons = {
    0:"☀️", 1:"🌤️", 2:"⛅", 3:"☁️",
    45:"🌫️", 48:"🌫️",
    51:"🌦️", 53:"🌦️", 55:"🌧️",
    61:"🌧️", 63:"🌧️", 65:"🌧️",
    71:"🌨️", 73:"🌨️", 75:"❄️", 77:"🌨️",
    80:"🌦️", 81:"🌧️", 82:"⛈️",
    85:"🌨️", 86:"❄️",
    95:"⛈️", 96:"⛈️", 99:"⛈️"
  };
  return icons[code] || "🌤️";
}`
);
console.log('Fixed getWeatherIcon, clean:', c.includes('0:"☀️"'));

// ── 11. Fix crop alert icons ───────────────────────────────────────────────
c = c.replace(/icon: "[^"]*", title: i18n\[lang\]\?\.alert_heat_title/g, 'icon: "🌡️", title: i18n[lang]?.alert_heat_title');
c = c.replace(/icon: "[^"]*", title: i18n\[lang\]\?\.alert_cold_title/g, 'icon: "❄️", title: i18n[lang]?.alert_cold_title');
c = c.replace(/icon: "[^"]*", title: i18n\[lang\]\?\.alert_rain_title/g, 'icon: "🌧️", title: i18n[lang]?.alert_rain_title');
c = c.replace(/icon: "[^"]*", title: i18n\[lang\]\?\.alert_wind_title/g, 'icon: "💨", title: i18n[lang]?.alert_wind_title');
c = c.replace(/icon: "[^"]*", title: i18n\[lang\]\?\.alert_pest_title/g, 'icon: "🐛", title: i18n[lang]?.alert_pest_title');

// ── 12. Fix updateCartUI ──────────────────────────────────────────────────
c = c.replace(
  /function updateCartUI\(\) \{[\s\S]*?\n\}/m,
  `function updateCartUI() {
  const cart = getCartItems();
  const counts = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("#cartBadge").forEach(badge => {
    badge.textContent = counts;
    badge.style.display = counts > 0 ? 'block' : 'none';
  });
  const sb = document.getElementById("sidebarCartCount");
  if (sb) { sb.textContent = counts; sb.style.display = counts > 0 ? 'inline' : 'none'; }
}`
);

// ── 13. Fix searchProducts ────────────────────────────────────────────────
c = c.replace(
  /function searchProducts\(\) \{[\s\S]*?\n\}/m,
  `function searchProducts() {
  const box = document.getElementById("searchBox");
  if (!box || !window.allProducts) return;
  const s = box.value.toLowerCase().trim();
  if (!s) { renderProducts(window.allProducts); return; }
  const filtered = window.allProducts.filter(p =>
    p.name.toLowerCase().includes(s) ||
    (p.location && p.location.toLowerCase().includes(s))
  );
  renderProducts(filtered);
}`
);

// ── 14. Fix farmer portal guard ───────────────────────────────────────────
// The original has: if (!user) { redirect } else { setup }
// We need to make sure the else block is properly structured
c = c.replace(
  /if \(!user \|\| user\.role !== "farmer"\) \{\n\s*alert[^;]+;\n\s*window\.location\.href = "login\.html\?role=farmer";\n\s*\} else \{/,
  `if (!user || user.role !== "farmer") {
    alert(i18n["en"]?.alert_login_farmer || "Please login as a farmer to access this page.");
    navigateTo("login.html?role=farmer");
  } else {`
);

// ── 15. Fix marketHomePageMarker guard ────────────────────────────────────
if (!c.includes('marketHomePageMarker')) {
  c = c.replace(
    '/* ---------- FARMER PORTAL ---------- */',
    `if (document.getElementById("marketHomePageMarker")) {
  const user = getCurrentUser();
  if (!user || user.role !== "buyer") navigateTo("login.html?role=buyer");
}

/* ---------- FARMER PORTAL ---------- */`
  );
}

// ── 16. Add page transition link handler ──────────────────────────────────
if (!c.includes('Smooth page transitions')) {
  c = c.replace(
    '  // Reservoir logic',
    `  // Smooth page transitions for internal links
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("javascript") || href.startsWith("http") || link.target === "_blank") return;
    e.preventDefault();
    navigateTo(href);
  });

  // Reservoir logic`
  );
}

// ── 17. Fix district-based product filtering ──────────────────────────────
// Replace the old renderProducts filtering with district-first approach
c = c.replace(
  /\/\/ FUTURE_MARKETPLACE: buyer location filtering\n\s*if \(user && user\.role === "buyer" && user\.location\) \{\n\s*valid = valid\.filter\(p => p\.location && p\.location\.toLowerCase\(\) === user\.location\.toLowerCase\(\)\);\n\s*\}/,
  `// District-based: show local products first, then others
  if (user && user.role === "buyer" && user.location) {
    const userDistrict = user.location.trim().toLowerCase();
    const local  = valid.filter(p => p.location && p.location.trim().toLowerCase() === userDistrict);
    const others = valid.filter(p => !p.location || p.location.trim().toLowerCase() !== userDistrict);
    valid = [...local, ...others];
  }`
);

// ── 18. Fix farmer location auto-fill ─────────────────────────────────────
if (!c.includes('Auto-fill location from user profile')) {
  c = c.replace(
    '    if (document.getElementById("addBtn")) {',
    `    // Auto-fill location from user profile
    const locInput = document.getElementById("location");
    if (locInput && user.location && !locInput.value) locInput.value = user.location;

    if (document.getElementById("addBtn")) {`
  );
}

// ── Save ──────────────────────────────────────────────────────────────────
fs.writeFileSync('public/app.js', c, 'utf8');
console.log('\nFinal state:');
console.log('  Lines:', c.split('\n').length);
console.log('  Tamil removed:', !c.includes('  ta: {'));
console.log('  navigateTo:', c.includes('function navigateTo'));
console.log('  getCropEmoji clean:', c.includes('const map = {'));
console.log('  getWeatherIcon clean:', c.includes('0:"☀️"'));
console.log('  data-i18n label_fresh removed:', !c.includes('data-i18n="label_fresh"'));
console.log('  data-i18n crop_ removed:', !c.includes('data-i18n="crop_${p'));

const bad = c.split('\n').filter(l => l.includes('\uFFFD') || /\u00C3[\u0080-\u00BF]/.test(l));
console.log('  Corrupted lines:', bad.length);
