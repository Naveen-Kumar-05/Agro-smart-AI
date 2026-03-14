// Prevent logged-in users from seeing login page again
// BUT respect the ?role= parameter — if a farmer visits login.html?role=buyer,
// they need to log in as a buyer separately, so don't redirect.
if (window.location.pathname.includes("login.html")) {
  const user = getCurrentUser();
  if (user) {
    const urlRole = new URLSearchParams(window.location.search).get("role");
    // Only auto-redirect if no specific role is requested, or the requested role matches
    if (!urlRole || urlRole === user.role) {
      if (user.role === "farmer") {
        window.location.href = "farmer.html";
      } else {
        window.location.href = "index.html";
      }
    }
  }
}

// Utility
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function getCropEmoji(name) {
  const cropEmojis = {
    "rice": "🌾",
    "wheat": "🌾",
    "maize": "🌽",
    "corn": "🌽",
    "sugarcane": "🎋",
    "cotton": "☁️",
    "tomato": "🍅",
    "potato": "🥔",
    "onion": "🧅",
    "chili": "🌶️",
    "groundnut": "🥜",
    "millet": "🌾",
    "banana": "🍌",
    "mango": "🥭",
    "fruits": "🍎",
    "vegetables": "🥗"
  };
  return cropEmojis[name.toLowerCase()] || "📦";
}

/* ---------- USER / SESSION HELPERS ---------- */

function getCurrentUser() {
  const raw = localStorage.getItem("agroUser");
  if (!raw) return null;

  const user = JSON.parse(raw);

  // Session expired
  if (Date.now() > user.expiresAt) {
    localStorage.removeItem("agroUser");
    return null;
  }

  return user;
}


function setCurrentUser(user) {
  const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours

  const sessionUser = {
    ...user,
    loginTime: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION
  };

  localStorage.setItem("agroUser", JSON.stringify(sessionUser));
}


function logout() {
  localStorage.removeItem("agroUser");
  window.location.href = "home.html";
}

/* ---------- TRANSLATION DICTIONARY ---------- */
const i18n = {
  en: {
    nav_home: "Home",
    nav_farmer_hub: "Farmer Hub",
    nav_market: "Marketplace",
    nav_fert_guide: "Fertilizer Guide 🧪",
    nav_disease_tool: "Disease Analysis 💊",
    nav_login: "Login",
    nav_logout: "Logout",
    hero_title: "The Future of <span class='text-primary-light'>Farming</span> is Here 🌾",
    hero_subtitle: "A smart farm-to-market platform connecting local farmers directly with buyers.",
    hero_market_btn: "Browse Market",
    hero_farmer_btn: "Join as Farmer",
    f_portal_title: "Farmer Portal",
    f_portal_desc: "Add crop listings, manage stock, and view incoming orders.",
    b_market_title: "Buyer Marketplace",
    b_market_desc: "Browse fresh products and place orders directly.",
    weather_loading: "Loading weather...",
    weather_location: "Detecting Location...",
    forecast_title: "3-Day Forecast",
    disaster_title: "WEATHER DISASTER ALERT!",
    add_listing_title: "Add New Listing",
    listing_name: "PRODUCT NAME",
    listing_price: "PRICE (₹/KG)",
    listing_qty: "QUANTITY (KG)",
    listing_loc: "LOCATION",
    listing_btn: "Add Product",
    orders_title: "Incoming Orders",
    fert_title: "Fertilizer Recommendation 🧪",
    fert_desc: "Get scientific suggestions for your crops.",
    fert_crop: "CROP TYPE",
    fert_soil: "SOIL TYPE",
    fert_ph: "PH LEVEL",
    fert_water: "WATER TYPE",
    fert_age: "CROP AGE (DAYS)",
    fert_btn: "Analyze & Suggest",
    disease_title: "Crop Disease Analysis (AI) 💊",
    disease_desc: "Explain symptoms for instant AI diagnosis.",
    disease_remarks: "REMARKS / SYMPTOMS",
    disease_btn: "Run AI Analysis",
    pay_title: "Secure Payment & Logistics",
    pay_name: "FULL NAME",
    pay_phone: "PHONE NUMBER",
    pay_address: "STREET ADDRESS",
    pay_landmark: "DELIVERY LOCATION / LANDMARK",
    pay_confirm: "Confirm & Pay",
    login_title: "Welcome Back",
    username_label: "USERNAME",
    password_label: "PASSWORD",
    signin_btn: "Sign In",
    new_farmer: "New Farmer?",
    new_customer: "New Customer?",
    create_account: "Create Account",
    my_orders_title: "Your Orders",
    reg_title: "Join AgroSmart",
    contact_label: "CONTACT NUMBER",
    already_account: "Already have an account?",
    footer_text: "© AgroSmart 2025",
    hero_card_title: "Direct. Transparent. Fair.",
    hero_card_desc: "AgroSmart eliminates middlemen, ensuring farmers earn more and buyers get the freshest produce at the best prices.",
    hero_card_feat1: "AI Price Suggestions",
    hero_card_feat2: "Direct Ordering",
    hero_card_feat3: "Real-time Trackers",
    f_portal_dashboard: "Farmer Dashboard 🚜",
    f_portal_manage: "Manage your listings and orders in one place.",
    f_portal_add_btn: "Publish Listing",
    f_portal_listings: "Your Listings",
    f_portal_go_btn: "Go to Portal",
    b_market_realtime: "Real-time inventory",
    b_market_search_label: "Search Products",
    b_market_filters: "Quick Filters",
    b_market_all: "All Products",
    b_market_open_btn: "Open Marketplace",
    pay_delivery_title: "Delivery Information",
    pay_secure_title: "Secure Payment",
    pay_card_no: "Card Number",
    pay_expiry: "Expiry",
    pay_cvv: "CVV",
    pay_processing: "Processing Payment...",
    pay_success: "Order Placed Successfully!",
    alert_order_status: "Order status updated to ",
    alert_fill_fields: "Please fill all fields!",
    alert_login_buyer: "Please login as a buyer to continue.",
    alert_login_farmer: "Please login as a farmer to continue.",
    alert_login_general: "Please login to continue.",
    alert_server_error: "Server error. Please try again.",
    alert_valid_qty: "Please enter a valid quantity.",
    alert_old_product: "This product was added before login system update. Please delete and re-add it.",
    label_login_farmer: "Login as Farmer",
    label_login_buyer: "Login as Customer",
    label_reg_farmer: "Creating a Farmer account.",
    label_reg_buyer: "Creating a Customer (Marketplace) account.",
    alert_new_req: "New Alert!",
    alert_have_req: "You have a new request.",
    btn_view_now: "View Now",
    label_farmer_role: "Farmer",
    label_buyer_role: "Buyer",
    weather_detecting: "Detecting...",
    weather_tomorrow: "Tomorrow",
    weather_wed: "Wed",
    weather_thu: "Thu",
    disease_report_title: "Report Symptoms",
    disease_placeholder: "Describe what you see: color change, spots, insects, drying leaves...",
    disease_ai_waiting: "AI diagnosis will appear here after you submit the symptoms.",
    disease_analyzing: "Ollama AI is analyzing your crop...",
    disease_res_reason: "Reason for Occurrence",
    disease_res_remedy: "Remedy / Solution",
    disease_res_medicine: "Recommended Medicines",
    disease_disclaimer: "Disclaimer: AI suggestions are based on provided data. For critical issues, please consult a local agricultural officer.",
    fert_res_title: "Analysis Result",
    fert_res_suggested: "Suggested Recommendation",
    fert_res_qty: "Quantity",
    fert_res_freq: "Frequency",
    fert_res_tips: "Expert Tips",
    crop_rice: "Rice",
    crop_wheat: "Wheat",
    crop_maize: "Maize",
    crop_tomato: "Tomato",
    crop_cotton: "Cotton",
    crop_vegetables: "Vegetables",
    crop_fruits: "Fruits",
    crop_mango: "Mango",
    crop_banana: "Banana",
    crop_potato: "Potato",
    crop_other: "Other",
    soil_alluvial: "Alluvial",
    soil_black: "Black",
    soil_red: "Red",
    soil_sandy: "Sandy",
    soil_clay: "Clay",
    water_fresh: "Fresh Water",
    water_borewell: "Borewell",
    water_canal: "Canal",
    label_fresh: "Fresh",
    label_qty: "Qty",
    label_buyer: "Buyer",
    label_contact: "Contact",
    label_status: "Status",
    label_farmer: "Farmer",
    label_product: "Product",
    label_price: "Price",
    label_total: "Total Amount",
    label_offer: "Offer",
    label_final_price: "Final Price",
    btn_edit: "Edit",
    btn_delete: "Delete",
    btn_accept: "Accept",
    btn_reject: "Reject",
    btn_buy_now: "Buy Now",
    prompt_qty: "Required Qty (kg)",
    confirm_delete: "Delete product?",
    predict_loading: "Loading...",
    predict_no_data: "No data",
    label_predict_suggested: "AI Suggested",
    weather_min: "min",
    weather_max: "max",
    weather_wind: "Wind",
    weather_rain: "Rain",
    weather_precip: "mm",
    weather_kmph: "kmph",
    advisor_title: "Agricultural Weather Advisor",
    no_orders: "No pending orders.",
    no_listings: "No listings yet.",
    no_buyer_orders: "No orders yet.",
    weather_clear: "Clear Sky",
    weather_p_cloudy: "Partly Cloudy",
    weather_foggy: "Foggy",
    weather_drizzle: "Drizzle",
    weather_rainy: "Rainy",
    weather_snowy: "Snowy",
    weather_r_showers: "Rain Showers",
    weather_s_showers: "Snow Showers",
    weather_t_storm: "Thunderstorm",
    weather_cloudy: "Cloudy",
    weather_unknown_loc: "Unknown Area",
    weather_denied: "Location access denied",
    weather_unavail: "Wait, weather unavailable",
    weather_geo_unavail: "Geolocation not supported",
    alert_storm_now: "STORM NOW! ⚡",
    alert_heavy_rain: "Heavy Rain Coming 🌧️",
    alert_raining: "Raining",
    disaster_storm: "Severe Storm predicted tomorrow! Please secure all outdoor equipment and livestock.",
    disaster_rain: "Extreme rainfall expected tomorrow. Potential for flooding in low-lying fields.",
    insight_perfect: "Conditions are ideal for farming today. Focus on harvesting or weeding.",
    insight_heat: "Extreme heat detected. Avoid fertilizing now; it may burn the roots.",
    insight_cold: "Cold weather slow down growth. Monitor soil temperature.",
    insight_rain: "Rain is coming. Natural watering is great, but watch for flooding.",
    insight_wind: "Strong winds may damage tall crops. Check supports.",
    alert_heat_title: "Heat Wave Warning",
    alert_heat_desc: "Ensure additional irrigation during evening hours.",
    alert_cold_title: "Cold Snap",
    alert_cold_desc: "Protect sensitive young plants with mulch or cover.",
    alert_rain_title: "Rain Expected",
    alert_rain_desc: "Clear drainage channels to prevent waterlogging.",
    alert_wind_title: "High Winds",
    alert_wind_desc: "Support tall crops like sugarcane or banana trees.",
    alert_pest_title: "Pest/Fungi Risk",
    alert_pest_desc: "High humidity increases fungal risks. Check leaf undersides.",
    alert_disaster: "Extreme weather detected! Take immediate shelter and protect crops.",
    msg_cart_added: "Item added to cart",
    msg_cart_updated: "Quantity updated in cart"
  },
  ta: {
    nav_home: "முகப்பு",
    nav_farmer_hub: "விவசாயி மையம்",
    nav_market: "சந்தை",
    nav_fert_guide: "உர வழிகாட்டி 🧪",
    nav_disease_tool: "நோய் பகுப்பாய்வு 💊",
    nav_login: "உள்நுழை",
    nav_logout: "வெளியேறு",
    hero_title: "விவசாயத்தின் <span class='text-primary-light'>எதிர்காலம்</span> இதோ 🌾",
    hero_subtitle: "உள்ளூர் விவசாயிகளை நேரடியாக வாங்குபவர்களுடன் இணைக்கும் ஸ்மார்ட் தளம்.",
    hero_market_btn: "சந்தையை பார்க்க",
    hero_farmer_btn: "விவசாயியாக சேர",
    f_portal_title: "விவசாயி பலகை",
    f_portal_desc: "பயிர் பட்டியல்களைச் சேர்க்கவும், கையிருப்பை நிர்வகிக்கவும் மற்றும் வரும் ஆர்டர்களைப் பார்க்கவும்.",
    b_market_title: "வாங்குபவர் சந்தை",
    b_market_desc: "புதிய தயாரிப்புகளை உலாவவும் மற்றும் நேரடியாக ஆர்டர்களைச் செய்யவும்.",
    weather_loading: "வானிலை ஏற்றப்படுகிறது...",
    weather_location: "இடத்தைக் கண்டறிகிறது...",
    forecast_title: "3-நாள் முன்னறிவிப்பு",
    disaster_title: "வானிலை பேரழிவு எச்சரிக்கை!",
    add_listing_title: "புதிய பட்டியலைச் சேர்க்கவும்",
    listing_name: "தயாரிப்பு பெயர்",
    listing_price: "விலை (₹/கிலோ)",
    listing_qty: "அளவு (கிலோ)",
    listing_loc: "இடம்",
    listing_btn: "தயாரிப்பைச் சேர்",
    orders_title: "ஆர்டர்கள்",
    fert_title: "உர பரிந்துரை 🧪",
    fert_desc: "உங்கள் பயிர்களுக்கு அறிவியல் பூர்வமான பரிந்துரைகளைப் பெறுங்கள்.",
    fert_crop: "பயிர் வகை",
    fert_soil: "மண் வகை",
    fert_ph: "பி.எச் (pH) அளவு",
    fert_water: "நீர் வகை",
    fert_age: "பயிர் வயது (நாட்கள்)",
    fert_btn: "ஆய்வு செய்து பரிந்துரைக்கவும்",
    disease_title: "பயிர் நோய் பகுப்பாய்வு (AI) 💊",
    disease_desc: "AI நோயறிதலுக்கு அறிகுறிகளை விளக்கவும்.",
    disease_remarks: "குறிப்புகள் / அறிகுறிகள்",
    disease_btn: "AI பகுப்பாய்வை இயக்கவும்",
    pay_title: "பாதுகாப்பான கட்டணம் & விநியோகம்",
    pay_name: "முழு பெயர்",
    pay_phone: "தொலைபேசி எண்",
    pay_address: "தெரு முகவரி",
    pay_landmark: "டெலிவரி இடம் / அடையாளம்",
    pay_confirm: "உறுதி செய்து பணம் செலுத்தவும்",
    msg_cart_added: "பொருள் கூடையில் சேர்க்கப்பட்டது",
    msg_cart_updated: "கூடையில் அளவு புதுப்பிக்கப்பட்டது",
    login_title: "மீண்டும் வருக",
    username_label: "பயனர் பெயர்",
    password_label: "கடவுச்சொல்",
    signin_btn: "உள்நுழை",
    new_farmer: "புதிய விவசாயியா?",
    new_customer: "புதிய வாடிக்கையாளரா?",
    create_account: "கணக்கை உருவாக்கவும்",
    my_orders_title: "உங்கள் ஆர்டர்கள்",
    reg_title: "அக்ரோஸ்மார்ட்டில் இணையுங்கள்",
    contact_label: "தொடர்பு எண்",
    already_account: "ஏற்கனவே கணக்கு உள்ளதா?",
    footer_text: "© அக்ரோஸ்மார்ட் 2025",
    hero_card_title: "நேரடி. வெளிப்படையான. நியாயமான.",
    hero_card_desc: "அக்ரோஸ்மார்ட் இடைத்தரகர்களை நீக்குகிறது, விவசாயிகள் அதிக வருமானம் ஈட்டுவதையும் வாங்குபவர்கள் சிறந்த விலையில் புதிய தயாரிப்புகளைப் பெறுவதையும் உறுதி செய்கிறது.",
    hero_card_feat1: "AI விலை பரிந்துரைகள்",
    hero_card_feat2: "நேரடி ஆர்டர்கள்",
    hero_card_feat3: "நிகழ்நேர கண்காணிப்பு",
    f_portal_dashboard: "விவசாயி மேலாண்மை பலகை 🚜",
    f_portal_manage: "உங்கள் பட்டியல்கள் மற்றும் ஆர்டர்களை ஒரே இடத்தில் நிர்வகிக்கவும்.",
    f_portal_add_btn: "பட்டியலை வெளியிடவும்",
    f_portal_listings: "உங்கள் பட்டியல்கள்",
    f_portal_go_btn: "போர்ட்டலுக்குச் செல்லவும்",
    b_market_realtime: "நிகழ்நேர இருப்பு",
    b_market_search_label: "தயாரிப்புகளைத் தேடுங்கள்",
    b_market_filters: "விரைவான வடிப்பான்கள்",
    b_market_all: "அனைத்து தயாரிப்புகளும்",
    b_market_open_btn: "சந்தையைத் திறக்கவும்",
    pay_delivery_title: "டெலிவரி தகவல்",
    pay_secure_title: "பாதுகாப்பான கட்டணம்",
    pay_card_no: "அட்டை எண்",
    pay_expiry: "காலாவதி",
    pay_cvv: "சிவிவி (CVV)",
    pay_processing: "கட்டணம் செலுத்தப்படுகிறது...",
    pay_success: "ஆர்டர் வெற்றிகரமாக செய்யப்பட்டது!",
    weather_detecting: "கண்டறியப்படுகிறது...",
    weather_tomorrow: "நாளை",
    weather_wed: "புதன்",
    weather_thu: "வியாழன்",
    disease_report_title: "அறிகுறிகளைத் புகாரளிக்கவும்",
    disease_placeholder: "நீங்கள் காண்பதை விளக்குங்கள்: நிற மாற்றம், புள்ளிகள், பூச்சிகள், காய்ந்த இலைகள்...",
    disease_ai_waiting: "அறிகுறிகளைச் சமர்ப்பித்த பிறகு AI நோயறிதல் இங்கே தோன்றும்.",
    disease_analyzing: "ஆலமா (Ollama) AI உங்கள் பயிரை ஆய்வு செய்கிறது...",
    disease_res_reason: "ஏற்படுவதற்கான காரணம்",
    disease_res_remedy: "தீர்வு",
    disease_res_medicine: "பரிந்துரைக்கப்பட்ட மருந்துகள்",
    disease_disclaimer: "பொறுப்புத் துறப்பு: AI பரிந்துரைகள் வழங்கப்பட்ட தரவுகளின் அடிப்படையில் அமைந்தவை. தீவிர சிக்கல்களுக்கு, உள்ளூர் விவசாய அதிகாரியை அணுகவும்.",
    fert_res_title: "ஆய்வு முடிவு",
    fert_res_suggested: "பரிந்துரைக்கப்பட்ட உரங்கள்",
    fert_res_qty: "அளவு",
    fert_res_freq: "அதிர்வெண் (Frequency)",
    fert_res_tips: "நிபுணர் குறிப்புகள்",
    crop_rice: "நெல்",
    crop_wheat: "கோதுமை",
    crop_maize: "சோளம்",
    crop_tomato: "தக்காளி",
    crop_cotton: "பருத்தி",
    crop_vegetables: "காய்கறிகள்",
    crop_fruits: "பழங்கள்",
    crop_mango: "மாம்பழம்",
    crop_banana: "வாழைப்பழம்",
    crop_potato: "உருளைக்கிழங்கு",
    crop_other: "மற்றவை",
    soil_alluvial: "வண்டல் மண்",
    soil_black: "கரிசல் மண்",
    soil_red: "செம்மண்",
    soil_sandy: "மணல் மண்",
    soil_clay: "களிமண்",
    water_fresh: "நன்னீர்",
    water_borewell: "ஆழ்துளை கிணறு",
    water_canal: "கால்வாய்",
    label_fresh: "புதியது",
    label_qty: "அளவு",
    label_buyer: "வாங்குபவர்",
    label_contact: "தொடர்பு",
    label_status: "நிலை",
    label_farmer: "விவசாயி",
    label_product: "தயாரிப்பு",
    label_price: "விலை",
    label_total: "மொத்த தொகை",
    label_offer: "சலுகை",
    label_final_price: "இறுதி விலை",
    btn_edit: "திருத்து",
    btn_delete: "நீக்கு",
    btn_accept: "ஏற்றுக்கொள்",
    btn_reject: "நிராகரி",
    btn_buy_now: "இப்போது வாங்கவும்",
    prompt_qty: "தேவையான அளவு (கிலோ)",
    confirm_delete: "தயாரிப்பை நீக்கவா?",
    predict_loading: "ஏற்றப்படுகிறது...",
    predict_no_data: "தரவு இல்லை",
    label_predict_suggested: "AI பரிந்துரை",
    weather_min: "குறைந்தபட்சம்",
    weather_max: "அதிகபட்சம்",
    weather_wind: "காற்று",
    weather_rain: "மழை",
    weather_precip: "மிமீ",
    weather_kmph: "கிமீ/ம",
    advisor_title: "விவசாய வானிலை ஆலோசகர்",
    no_orders: "பெண்டிங் ஆர்டர்கள் இல்லை.",
    no_listings: "பட்டியல்கள் இன்னும் இல்லை.",
    alert_order_status: "ஆர்டர் நிலை மாற்றப்பட்டது: ",
    alert_fill_fields: "தயவுசெய்து அனைத்து இடங்களையும் நிரப்பவும்!",
    alert_login_buyer: "தொடர வாங்குபவராக உள்நுழையவும்.",
    alert_login_farmer: "தொடர விவசாயியாக உள்நுழையவும்.",
    alert_login_general: "தொடர உள்நுழையவும்.",
    alert_server_error: "சர்வர் பிழை. மீண்டும் முயற்சிக்கவும்.",
    alert_valid_qty: "தயவுசெய்து சரியான அளவை உள்ளிடவும்.",
    alert_old_product: "இந்தத் தயாரிப்பு உள்நுழைவு முறை புதுப்பிப்பிற்கு முன்னால் சேர்க்கப்பட்டது. தயவுசெய்து அதை நீக்கிவிட்டு மீண்டும் சேர்க்கவும்.",
    label_login_farmer: "விவசாயியாக உள்நுழையவும்",
    label_login_buyer: "வாடிக்கையாளராக உள்நுழையவும்",
    label_reg_farmer: "விவசாயி கணக்கை உருவாக்குகிறது.",
    label_reg_buyer: "வாடிக்கையாளர் கணக்கை உருவாக்குகிறது.",
    alert_new_req: "புதிய அறிவிப்பு!",
    alert_have_req: "உங்களுக்கு ஒரு புதிய கோரிக்கை உள்ளது.",
    btn_view_now: "இப்போது காண்க",
    label_farmer_role: "விவசாயி",
    label_buyer_role: "வாங்குபவர்",
    weather_detecting: "கண்டறியப்படுகிறது...",
    weather_tomorrow: "நாளை",
    weather_wed: "புதன்",
    weather_thu: "வியாழன்",
    weather_fri: "வெள்ளி",
    weather_sat: "சனி",
    weather_sun: "ஞாயிறு",
    weather_mon: "திங்கள்",
    weather_tue: "செவ்வாய்",
    weather_rain: "மழை",
    weather_precip: "மி.மீ",
    weather_kmph: "கி.மீ/ம",
    prompt_qty: "அளவை உள்ளிடவும் (கிலோ):",
    prompt_offer: "உங்கள் விலையை உள்ளிடவும் (₹/கிலோ):",
    label_product: "தயாரிப்பு",
    label_qty: "அளவு",
    label_price: "விலை",
    label_total: "மொத்த தொகை",
    crop_rice: "நெல்",
    crop_wheat: "கோதுமை",
    crop_maize: "சோளம்",
    crop_tomato: "தக்காளி",
    crop_cotton: "பருத்தி",
    crop_other: "மற்றவை",
    crop_vegetables: "காய்கறிகள்",
    crop_fruits: "பழங்கள்",
    soil_alluvial: "வண்டல் மண்",
    soil_black: "கரிசல் மண்",
    soil_red: "செம்மண்",
    soil_sandy: "மணல் மண்",
    soil_clay: "களிமண்",
    water_fresh: "நல்ல நீர்",
    water_borewell: "ஆழ்துளை கிணறு",
    water_canal: "கால்வாய்",
    disease_report_title: "அறிகுறிகளைப் புகாரளிக்கவும்",
    disease_placeholder: "அறிகுறிகளை விளக்கவும்: நிற மாற்றம், புள்ளிகள், பூச்சிகள், காய்ந்த இலைகள்...",
    disease_ai_waiting: "அறிகுறிகளைச் சமர்ப்பித்த பிறகு AI நோயறிதல் இங்கே தோன்றும்.",
    disease_analyzing: "AI உங்கள் பயிரைப் பகுப்பாய்வு செய்கிறது...",
    disease_res_reason: "ஏற்பட்டதற்கான காரணம்",
    disease_res_remedy: "தீர்வு / வழிமுறை",
    disease_res_medicine: "பரிந்துரைக்கப்பட்ட மருந்துகள்",
    disease_disclaimer: "பொறுப்புத் துறப்பு: வழங்கப்பட்ட தரவுகளின் அடிப்படையில் AI பரிந்துரைகள் வழங்கப்படுகின்றன.",
    fert_res_title: "பகுப்பாய்வு முடிவு",
    fert_res_suggested: "பரிந்துரைக்கப்பட்ட அளவு",
    fert_res_qty: "அளவு",
    fert_res_freq: "அதிர்வெண்",
    fert_res_tips: "நிபுணர் குறிப்புகள்",
    alert_describe_symptoms: "தயவுசெய்து அறிகுறிகளை விளக்கவும்.",
    alert_analysis_failed: "பகுப்பாய்வு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
    alert_server_conn: "சர்வர் இணைப்பு பிழை. உங்கள் இணைப்பைச் சரிபார்க்கவும்.",
    insight_perfect: "இன்று விவசாயத்திற்கு ஏற்ற சூழல் நிலவுகிறது. அறுவடை அல்லது களையெடுப்பதில் கவனம் செலுத்துங்கள்.",
    insight_heat: "அதிகப்படியான வெப்பம் கண்டறியப்பட்டுள்ளது. இப்போது உரம் போடுவதைத் தவிர்க்கவும்; இது வேர்களைப் பாதிக்கலாம்.",
    insight_cold: "குளிர்ந்த வானிலை வளர்ச்சியை மெதுவாக்கும். மண்ணின் வெப்பநிலையைக் கண்காணிக்கவும்.",
    insight_rain: "மழை வரப்போகிறது. இயற்கை நீர் பாசனம் நல்லது, ஆனால் வெள்ளம் குறித்து கவனமாக இருக்கவும்.",
    insight_wind: "பலத்த காற்றுயயயால் உயரமான பயிர்கள் சேதமடையக்கூடும். முட்டுக்கொடுக்கவும்.",
    alert_heat_title: "வெப்ப அலை எச்சரிக்கை",
    alert_heat_desc: "மாலை நேரங்களில் கூடுதல் நீர் பாசனத்தை உறுதி செய்யவும்.",
    alert_cold_title: "குளிர் அலை",
    alert_cold_desc: "இளம் செடிகளை மூடி அல்லது வைக்கோல் கொண்டு பாதுகாக்கவும்.",
    alert_rain_title: "மழை எதிர்பார்க்கப்படுகிறது",
    alert_rain_desc: "தண்ணீர் தேங்குவதைத் தவிர்க்க வடிகால் வாய்க்கால்களை சுத்தம் செய்யவும்.",
    alert_wind_title: "பலத்த காற்று",
    alert_wind_desc: "கரும்பு அல்லது வாழை போன்ற உயரமான பயிர்களுக்கு முட்டுக்கொடுக்கவும்.",
    alert_pest_title: "பூச்சி/பூஞ்சை அபாயம்",
    alert_pest_desc: "அதிக ஈரப்பதம் பூஞ்சை அபாயத்தை அதிகரிக்கும். இலைகளின் அடிப்பகுதியைச் சரிபார்க்கவும்.",
    alert_disaster: "தீவீர வானிலை கண்டறியப்பட்டுள்ளது! உடனடியாக பாதுகாப்பான இடத்திற்குச் சென்று பயிர்களைப் பாதுகாக்கவும்."
  },
};

function toggleLanguage() {
  const current = localStorage.getItem("agroLang") || "en";
  const next = current === "en" ? "ta" : "en";
  localStorage.setItem("agroLang", next);
  applyTranslations();
}

// Helper function to get translated text
function t(key) {
  const lang = localStorage.getItem("agroLang") || "en";
  return (i18n[lang] && i18n[lang][key]) || key;
}

function applyTranslations() {
  const lang = localStorage.getItem("agroLang") || "en";
  const els = document.querySelectorAll("[data-i18n]");
  els.forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (i18n[lang] && i18n[lang][key]) {
      const translation = i18n[lang][key];
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = translation;
      } else if (translation.includes('<')) {
        el.innerHTML = translation;
      } else {
        el.textContent = translation;
      }
    }
  });

  // Update toggle button text
  const toggleBtn = document.getElementById("langToggle");
  if (toggleBtn) {
    toggleBtn.textContent = lang === "en" ? "தமிழ்" : "English";
  }

  // Update navbar user role iflogged in
  updateNavbarUser();

  // Trigger re-render of dynamic containers
  if (document.getElementById("products")) fetchProducts();
  if (document.getElementById("farmerProducts")) loadFarmerProducts();
  if (document.getElementById("farmerOrders")) loadFarmerOrders();
  if (document.getElementById("buyerOrders")) loadBuyerOrders();
}

function updateNavbarUser() {
  const user = getCurrentUser();
  const navUser = document.getElementById("navUser");
  const loginLink = document.getElementById("loginLink");
  const logoutBtn = document.getElementById("logoutBtn");
  const lang = localStorage.getItem("agroLang") || "en";

  // Also update top-header avatar + username display (used in new pages)
  const userAvatar = document.getElementById("userAvatar");
  const navUserHeader = document.getElementById("navUserHeader");

  if (user) {
    if (navUser) {
      const roleKey = `label_${user.role}_role`;
      const translatedRole = i18n[lang]?.[roleKey] || user.role;
      navUser.textContent = `👤 ${user.username}`;
    }
    if (navUserHeader) navUserHeader.textContent = user.username;
    if (userAvatar) userAvatar.textContent = user.username[0].toUpperCase();
    if (loginLink) loginLink.classList.add("d-none");
    if (logoutBtn) logoutBtn.classList.remove("d-none");
  } else {
    if (navUser) navUser.textContent = "";
    if (loginLink) loginLink.classList.remove("d-none");
    if (logoutBtn) logoutBtn.classList.add("d-none");
  }

  highlightActiveSidebarLink();
}

function highlightActiveSidebarLink() {
  const currentPath = window.location.pathname.split("/").pop() || "home.html";
  const currentHash = window.location.hash || "";
  const fullHref = currentPath + currentHash;

  const links = document.querySelectorAll(".sidebar-link");
  // First pass: remove all active classes
  links.forEach(link => link.classList.remove("active"));
  
  // Second pass: find the best match
  let matched = false;
  links.forEach(link => {
    const href = link.getAttribute("href");
    if (href === fullHref) {
      link.classList.add("active");
      matched = true;
    }
  });
  
  // Fallback to path only if no hash matched
  if (!matched) {
    links.forEach(link => {
      const href = link.getAttribute("href");
      if (href === currentPath) {
        link.classList.add("active");
      }
    });
  }
}

// Listen for hash changes to update the active link without reload
window.addEventListener("hashchange", highlightActiveSidebarLink);

document.addEventListener("DOMContentLoaded", () => {
  updateNavbarUser();
  initWeather();
  applyTranslations();

  // Attach listener to any langToggle button found
  const toggleBtn = document.getElementById("langToggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleLanguage);
  }

  // Reservoir logic
  if (document.getElementById("reservoirTableBody")) {
    loadReservoirs();
    setInterval(loadReservoirs, 10000);
  }
});

// --- RESERVOIR LOGIC ---
async function loadReservoirs() {
  const tbody = document.getElementById("reservoirTableBody");
  if (!tbody) return;

  try {
    const res = await fetch("/api/reservoir");
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    
    tbody.innerHTML = data.map(r => {
      let statusColor = "success";
      if (r.waterLevel / r.totalCapacity > 0.9) statusColor = "danger pulse-red";
      else if (r.waterLevel / r.totalCapacity > 0.75) statusColor = "warning";

      let gateBadge = r.gateStatus === "Open" ? "bg-danger pulse-red border border-danger p-2" : "bg-secondary";

      return `
        <tr>
          <td class="ps-4 fw-bold text-dark">${r.name}</td>
          <td>${r.district}</td>
          <td><span class="fs-5 fw-bold text-${statusColor}">${r.waterLevel}</span> <span class="small text-muted">/ ${r.totalCapacity}</span></td>
          <td>
            <div class="water-level-bar w-100">
              <div class="water-level-fill bg-${statusColor}" style="width: ${(r.waterLevel/r.totalCapacity)*100}%"></div>
            </div>
          </td>
          <td>${r.depth}</td>
          <td class="text-primary fw-bold">↓ ${r.inflow}</td>
          <td class="text-warning fw-bold">↑ ${r.outflow}</td>
          <td><span class="badge ${gateBadge}">${r.gateStatus}</span></td>
          <td class="small text-muted">${new Date(r.lastUpdated).toLocaleTimeString()}</td>
          <td class="pe-4"><span class="badge bg-${statusColor} bg-opacity-10 text-${statusColor}">Active</span></td>
        </tr>
      `;
    }).join("");

    // Setup flood alert check
    const isFlood = data.some(r => r.waterLevel / r.totalCapacity > 0.95);
    const floodBanner = document.getElementById("floodAlertBanner");
    if (floodBanner) {
        if(isFlood) {
            floodBanner.classList.remove("d-none");
        } else {
            floodBanner.classList.add("d-none");
        }
    }

  } catch (err) {
    console.error("Reservoir Error:", err);
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-danger py-4">Failed to load live reservoir data.</td></tr>`;
  }
}

/* ---------- LOGIN PAGE ---------- */

async function loginWithRole(role) {
  const usernameEl = document.getElementById("loginUsername");
  const passwordEl = document.getElementById("loginPassword");
  const msg = document.getElementById("loginMsg");
  if (!usernameEl || !passwordEl || !msg) return;

  const username = usernameEl.value.trim();
  const password = passwordEl.value.trim();
  msg.textContent = "";

  if (!username || !password) {
    msg.textContent = "Enter username & password";
    return;
  }

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role })
    });
    const data = await res.json();
    if (!res.ok) {
      msg.textContent = data.message || "Login failed";
      return;
    }

    // data.user contains username, role, contactNumber
    setCurrentUser(data.user);

    if (role === "farmer") {
      window.location.href = "farmer.html";
    } else {
      window.location.href = "index.html";
    }
  } catch (e) {
    msg.textContent = "Server error";
  }
}

/* ---------- SINGLE LOGIN BUTTON ---------- */

if (document.getElementById("loginSingleBtn")) {
  const label = document.getElementById("loginRoleLabel");
  const roleFromUrl = getQueryParam("role");
  const loginRole = roleFromUrl === "farmer" ? "farmer" : "buyer";
  // Show correct registration link based on login role
  const farmerReg = document.getElementById("farmerReg");
  const customerReg = document.getElementById("customerReg");

  if (farmerReg && customerReg) {
    if (loginRole === "farmer") {
      farmerReg.style.display = "block";
      customerReg.style.display = "none";
    } else {
      farmerReg.style.display = "none";
      customerReg.style.display = "block";
    }
  }


  const lang = localStorage.getItem("agroLang") || "en";
  // Update label text
  if (label) {
    label.textContent = loginRole === "farmer"
      ? (i18n[lang]?.label_login_farmer || "Login as Farmer")
      : (i18n[lang]?.label_login_buyer || "Login as Customer");
  }

  document.getElementById("loginSingleBtn").addEventListener("click", async () => {

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const msg = document.getElementById("loginMsg");
    msg.textContent = "";

    if (!username || !password) {
      msg.textContent = "Enter username & password";
      return;
    }

    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role: loginRole })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.message || "Login failed";
      return;
    }

    // Save user data
    setCurrentUser(data.user);

    // Redirect based on role
    if (loginRole === "farmer") {
      window.location.href = "farmer.html";
    } else {
      window.location.href = "index.html";
    }
  });
}

/* ---------- REGISTER PAGE ---------- */

if (document.getElementById("registerBtn")) {
  const msg = document.getElementById("regMsg");
  const roleFromUrl = getQueryParam("role");
  const registerRole = roleFromUrl === "farmer" ? "farmer" : "buyer";
  const label = document.getElementById("regRoleLabel");

  const lang = localStorage.getItem("agroLang") || "en";
  if (label) {
    label.textContent =
      registerRole === "farmer"
        ? (i18n[lang]?.label_reg_farmer || "Creating a Farmer account.")
        : (i18n[lang]?.label_reg_buyer || "Creating a Customer (Marketplace) account.");
  }

  document.getElementById("registerBtn").addEventListener("click", async () => {
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const contactNumber = document.getElementById("regContact").value.trim();
    const locationSelect = document.getElementById("regLocation");
    const location = locationSelect ? locationSelect.value : "";

    if (msg) { msg.textContent = ""; msg.classList.remove("text-success", "text-danger"); }

    if (!username || !password || !contactNumber || !location) {
      if (msg) {
        msg.textContent = "All fields are required";
        msg.classList.add("text-danger");
      } else {
        alert("All fields are required");
      }
      return;
    }

    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          role: registerRole,
          contactNumber,
          location
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (msg) {
          msg.textContent = data.message || "Registration failed";
          msg.classList.add("text-danger");
        } else {
          alert(data.message || "Registration failed");
        }
        return;
      }
      if (msg) {
        msg.textContent = data.message || "Registered";
        msg.classList.add("text-success");
      }
      setTimeout(() => (window.location.href = `login.html?role=${registerRole}`), 800);
    } catch (e) {
      if (msg) {
        msg.textContent = "Server error";
        msg.classList.add("text-danger");
      } else {
        alert("Server error");
      }
    }
  });
}

/* ---------- MARKETPLACE PAGE ---------- */

async function fetchProducts() {
  const res = await fetch("/products");
  window.allProducts = await res.json();
  renderProducts(window.allProducts);
  updateFilterButtons();
}

async function renderProducts(products) {
  const el = document.getElementById("products");
  if (!el) return;

  const user = getCurrentUser();
  let valid = products.filter(p => p.farmerUsername); // show only valid products

  // FUTURE_MARKETPLACE: buyer location filtering
  if (user && user.role === "buyer" && user.location) {
    valid = valid.filter(p => p.location && p.location.toLowerCase() === user.location.toLowerCase());
  }

  if (valid.length === 0) {
    el.innerHTML = `
      <p class="text-danger fw-bold p-3" data-i18n="no_listings">
        No new marketplace listings yet for your district.<br>
        If you see old products, please delete and re-add them in the Farmer Portal.
      </p>
    `;
    return;
  }

  let html = "";
  const lang = localStorage.getItem("agroLang") || "en";

  // No longer needed here as it's a global helper
  for (let p of valid) {
    let suggested = i18n[lang]?.predict_loading || "Loading...";
    const emoji = getCropEmoji(p.name);

    try {
      const q = new URLSearchParams({ name: p.name, location: p.location });
      const res = await fetch("/predictPrice?" + q.toString());
      const data = await res.json();
      if (data.suggestedPrice) {
        suggested = `₹${data.suggestedPrice} <span class="badge bg-white text-success border ms-1" style="font-size: 0.6rem;">${data.reason}</span>`;
      } else {
        suggested = i18n[lang]?.predict_no_data || "No data";
      }
    } catch { }

    html += `
    <div class="col-md-4">
      <div class="card p-0 border-0 shadow-sm animate-fade">
        <div class="p-4">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="fw-bold text-success mb-0 d-flex align-items-center gap-2" data-i18n="crop_${p.name.toLowerCase()}"><span>${emoji}</span> ${escapeHtml(p.name)}</h5>
            <span class="badge bg-light text-success border" data-i18n="label_fresh">Fresh</span>
          </div>
          
          <div class="mb-3">
            <span class="display-6 fw-bold">₹${escapeHtml(p.price)}</span>
            <span class="text-muted">/kg</span>
          </div>

          <div class="suggested-price mb-3">
            <div class="small"><span data-i18n="label_predict_suggested">AI Suggested</span>: <b>${suggested}</b></div>
          </div>

          <div class="row g-0 mb-4 text-muted small">
            <div class="col-6 mb-2">
              <span class="me-1">📦</span><b data-i18n="label_qty">Qty</b>: ${escapeHtml(p.qty)} kg
            </div>
            <div class="col-6 mb-2">
              <span class="me-1">📍</span><b>${escapeHtml(p.location)}</b>
            </div>
            <div class="col-12">
              <span class="me-1">🧑‍🌾</span><span data-i18n="label_farmer">Farmer</span>: ${escapeHtml(p.farmerUsername)}
            </div>
          </div>

          <div class="d-grid gap-2">
            <button class="btn btn-success btn-sm btn-buy-now" data-product-id="${p.id}" data-i18n="btn_buy_now">
              Buy Now
            </button>
            <button class="btn btn-outline-success btn-sm btn-add-cart"
              data-product-id="${p.id}"
              data-product-name="${escapeHtml(p.name)}"
              data-price="${p.price}"
              data-farmer="${escapeHtml(p.farmerUsername)}"
              data-image="${escapeHtml(p.image || '')}">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>`;
  }

  el.innerHTML = html;

  // Wire up Buy Now buttons via event delegation
  el.querySelectorAll('.btn-buy-now').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = Number(btn.getAttribute('data-product-id'));
      orderPrompt(pid);
    });
  });

  // Wire up Add to Cart buttons via event delegation
  el.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart({
        productId: Number(btn.getAttribute('data-product-id')),
        productName: btn.getAttribute('data-product-name'),
        price: Number(btn.getAttribute('data-price')),
        farmerName: btn.getAttribute('data-farmer'),
        image: btn.getAttribute('data-image') || ''
      });
    });
  });
}

// Search box
function searchProducts() {
  const s = document.getElementById("searchBox").value.toLowerCase();
  const filtered = window.allProducts.filter(p =>
    p.name.toLowerCase().includes(s)
  );
  renderProducts(filtered);
}

// Quick Filters
function updateFilterButtons() {
  const filterContainer = document.getElementById("filterButtons");
  if (!filterContainer) return;

  const products = window.allProducts || [];
  const validNames = [...new Set(products.filter(p => p.farmerUsername).map(p => p.name))];

  let html = `<button class="btn btn-sm btn-success me-2 mb-2" onclick="renderProducts(window.allProducts)">All Products</button>`;

  validNames.sort().forEach(name => {
    html += `<button class="btn btn-sm btn-outline-success me-2 mb-2" onclick="filterByCategory('${name}')">${name.charAt(0).toUpperCase() + name.slice(1)}</button>`;
  });

  filterContainer.innerHTML = html;
}

function filterByCategory(category) {
  const filtered = window.allProducts.filter(p => p.name.toLowerCase() === category.toLowerCase());
  renderProducts(filtered);
}

// Place order with Payment Modal
async function orderPrompt(id) {
  const user = getCurrentUser();
  const lang = localStorage.getItem("agroLang") || "en";
  if (!user || user.role !== "buyer") {
    alert(i18n[lang]?.alert_login_buyer || "Please login as a buyer to place orders.");
    window.location.href = "login.html";
    return;
  }

  const p = (window.allProducts || []).find(x => x.id === id);
  if (!p) return;

  const pNameTranslated = i18n[lang][`crop_${p.name.toLowerCase()}`] || p.name;
  const qty = prompt(`${i18n[lang]?.prompt_qty || "Order quantity for "}${pNameTranslated} (kg)`, "1");
  if (!qty || isNaN(qty) || qty <= 0) return;

  const totalAmount = (parseFloat(p.price) * parseFloat(qty)).toFixed(2);

  // Set up modal content
  const summaryEl = document.getElementById("paymentOrderSummary");
  const amountEl = document.getElementById("payAmount");
  if (summaryEl && amountEl) {
    summaryEl.innerHTML = `
      <div class="d-flex justify-content-between mb-2">
        <span class="text-muted" data-i18n="label_product">${i18n[lang]?.label_product || "Product"}</span>
        <span class="fw-bold">${escapeHtml(pNameTranslated)}</span>
      </div>
      <div class="d-flex justify-content-between mb-2">
        <span class="text-muted" data-i18n="label_qty">${i18n[lang]?.label_qty || "Quantity"}</span>
        <span class="fw-bold">${qty} kg</span>
      </div>
      <div class="d-flex justify-content-between mb-2">
        <span class="text-muted" data-i18n="label_price">${i18n[lang]?.label_price || "Price"}</span>
        <span class="fw-bold">₹${p.price}/kg</span>
      </div>
      <hr>
      <div class="d-flex justify-content-between">
        <span class="fw-bold" data-i18n="label_total">${i18n[lang]?.label_total || "Total Amount"}</span>
        <span class="fw-bold text-success fs-5">₹${totalAmount}</span>
      </div>
    `;
    amountEl.textContent = `₹${totalAmount}`;
  }

  // Pre-fill user details if available
  const nameInput = document.getElementById("payBuyerName");
  const phoneInput = document.getElementById("payBuyerPhone");
  if (nameInput) nameInput.value = user.username;
  if (phoneInput) phoneInput.value = user.contactNumber || "";

  const modalEl = document.getElementById("paymentModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  // Handle payment confirmation
  const confirmBtn = document.getElementById("payConfirmBtn");
  const loadingEl = document.getElementById("paymentLoading");
  const errorEl = document.getElementById("paymentError");

  confirmBtn.onclick = async () => {
    const cardNumber = document.getElementById("payCardNumber").value.trim();
    const expiry = document.getElementById("payExpiry").value.trim();
    const cvv = document.getElementById("payCvv").value.trim();

    // New fields
    const buyerName = document.getElementById("payBuyerName").value.trim();
    const buyerPhone = document.getElementById("payBuyerPhone").value.trim();
    const address = document.getElementById("payBuyerAddress").value.trim();
    const deliveryLocation = document.getElementById("payDeliveryLocation").value.trim();

    const buyerAltPhone = document.getElementById("payBuyerAltPhone")?.value.trim() || "";

    if (!cardNumber || !expiry || !cvv || !buyerName || !buyerPhone || !address) {
      errorEl.textContent = "Please fill all required details (Delivery & Payment).";
      errorEl.classList.remove("d-none");
      return;
    }

    loadingEl.classList.remove("d-none");
    errorEl.classList.add("d-none");

    try {
      // 1. Process payment
      const pRes = await fetch("/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardNumber, expiry, cvv, amount: totalAmount })
      });

      const pData = await pRes.json();
      if (!pRes.ok) {
        throw new Error(pData.message || "Payment failed");
      }

      // 2. Create order
      const oRes = await fetch("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          qty,
          price: p.price,
          buyerName: buyerName,
          buyerContact: buyerPhone,
          buyerAltPhone: buyerAltPhone,
          address: address,
          deliveryLocation: deliveryLocation,
          productName: p.name,
          farmerUsername: p.farmerUsername,
          paymentStatus: "completed",
          transactionId: pData.transactionId
        })
      });

      const oData = await oRes.json();
      if (!oRes.ok) throw new Error(oData.message || "Order placement failed");

      loadingEl.innerHTML = `
        <div class="text-center">
          <div class="fs-1 mb-2">✅</div>
          <div class="fw-bold text-success">Order Placed Successfully!</div>
          <div class="small text-muted mt-2">Trans ID: ${pData.transactionId}</div>
        </div>
      `;

      setTimeout(() => {
        modal.hide();
        fetchProducts();
        // Reset loading state for next time
        loadingEl.classList.add("d-none");
        loadingEl.innerHTML = `
          <div class="spinner-border text-success mb-3" role="status"></div>
          <div class="fw-bold text-success">Processing Payment...</div>
        `;
      }, 2000);

    } catch (err) {
      loadingEl.classList.add("d-none");
      errorEl.textContent = err.message;
      errorEl.classList.remove("d-none");
    }
  };
}



// Auto load if marketplace exists
if (document.getElementById("products")) fetchProducts();

/* ---------- MARKETPLACE ACCESS PROTECTION ---------- */

if (document.getElementById("marketPageMarker")) {
  const user = getCurrentUser();
  const lang = localStorage.getItem("agroLang") || "en";
  if (!user || user.role !== "buyer") {
    alert(i18n[lang]?.alert_login_buyer || "Please login as a buyer to access the marketplace.");
    window.location.href = "login.html?role=buyer";
  }
}

/* ---------- FARMER PORTAL ---------- */

// Protect farmer page and initialize dashboard
if (document.getElementById("farmerPageMarker")) {
  const user = getCurrentUser();
  const lang = localStorage.getItem("agroLang") || "en";
  if (!user || user.role !== "farmer") {
    alert(i18n[lang]?.alert_login_farmer || "Please login as a farmer to access this page.");
    window.location.href = "login.html?role=farmer";
  } else {
    // attach add button handler
    if (document.getElementById("addBtn")) {
      document.getElementById("addBtn").addEventListener("click", async () => {
        const product = {
          name: document.getElementById("name").value.trim(),
          price: document.getElementById("price").value.trim(),
          qty: document.getElementById("qty").value.trim(),
          location: document.getElementById("location").value.trim(),
          farmerUsername: user.username
        };

        const msg = document.getElementById("msg");
        msg.textContent = "";

        if (!product.name || !product.price || !product.qty || !product.location) {
          msg.textContent = i18n[lang]?.alert_fill_fields || "Please fill all fields!";
          return;
        }

        const res = await fetch("/addProduct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product)
        });
        const data = await res.json();
        msg.textContent = data.message;

        document.getElementById("name").value = "";
        document.getElementById("price").value = "";
        document.getElementById("qty").value = "";
        document.getElementById("location").value = "";

        loadFarmerProducts();
      });
    }

    loadFarmerProducts();
    loadFarmerOrders();
    startFarmerNotificationPolling();
  }
}

// Notification Polling for Farmers
let lastOrderCount = null;
let lastNegCount = null;

function startFarmerNotificationPolling() {
  // Check every 10 seconds
  setInterval(async () => {
    const user = getCurrentUser();
    if (!user || user.role !== 'farmer') return;

    try {
      const res = await fetch("/orders");
      if (!res.ok) return;
      const orders = await res.json();
      const myOrdersCount = orders.filter(o => o.farmerUsername === user.username && o.status === "placed").length;

      if (lastOrderCount !== null && myOrdersCount > lastOrderCount) {
        showFarmerNotification(i18n[localStorage.getItem("agroLang") || "en"]?.alert_new_req || "New Order Received! 📦", 
                               (i18n[localStorage.getItem("agroLang") || "en"]?.alert_have_req || "You have a new request.") + " (" + myOrdersCount + ")");
        if (typeof loadFarmerOrders === 'function') loadFarmerOrders(); 
      } 

      lastOrderCount = myOrdersCount;

    } catch (e) {
      console.error("Polling error:", e);
    }
  }, 10000);
}

function showFarmerNotification(title, message) {
  const toastEl = document.getElementById('notificationToast');
  const titleEl = document.getElementById('toastTitle');
  const msgEl = document.getElementById('toastMessage');

  if (!toastEl || !titleEl || !msgEl) return;

  titleEl.textContent = title;
  msgEl.textContent = message;

  const toast = new bootstrap.Toast(toastEl, { delay: 8000 });
  toast.show();

  // Play subtle sound if possible (optional)
}

function scrollToAlerts() {
  const target = document.getElementById('farmerOrders');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Farmer: listings + stats
async function loadFarmerProducts() {
  const prodContainer = document.getElementById("productList");
  const statsContainer1 = document.getElementById("farmerTotalProducts");
  const user = getCurrentUser();
  
  if (!user || !prodContainer) return;

  try {
    const res = await fetch("/products");
    const products = await res.json();
    const mine = products.filter(p => p.farmerUsername === user.username);
    
    // Update total products stat
    if (statsContainer1) statsContainer1.textContent = mine.length;

    // Trigger charts if first load
    if (window.Chart && !window.mySalesChart) {
      initFarmerCharts(mine, []);
    }

    prodContainer.innerHTML =
      mine
        .map(
          p => {
            const emoji = getCropEmoji(p.name);
            return `
        <div class="col-md-6 col-lg-4">
          <div class="card p-3 border-0 shadow-sm h-100">
            <h6 class="fw-bold mb-2 text-dark"><span>${emoji}</span> ${escapeHtml(p.name)}</h6>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-success fw-bold">₹${escapeHtml(p.price)} / ${escapeHtml(p.qty)} kg</span>
              <span class="text-muted small"><i class="fw-light">📍</i> ${escapeHtml(p.location)}</span>
            </div>
            
            <div class="d-flex gap-2 mt-auto pt-3 border-top border-light">
              <button class="btn btn-outline-primary btn-sm flex-fill fw-bold" onclick="editProduct(${p.id})">Edit</button>
              <button class="btn btn-outline-danger btn-sm flex-fill fw-bold" onclick="deleteProduct(${p.id})">Delete</button>
            </div>
          </div>
        </div>
      `;
          }
        )
        .join("") || `<p class='text-muted small'>You have no active listings.</p>`;
  } catch(e) { console.error("Error loading products", e); }
}

// Edit product
async function editProduct(id) {
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
}

// Delete product
async function deleteProduct(id) {
  const lang = localStorage.getItem("agroLang") || "en";
  if (!confirm(i18n[lang]?.confirm_delete || "Delete product?")) return;
  await fetch("/deleteProduct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  loadFarmerProducts();
}

// Farmer: orders dashboard
async function loadFarmerOrders() {
  const container = document.getElementById("farmerOrders");
  if (!container) return;

  const user = getCurrentUser();
  if (!user) return;

  const res = await fetch("/orders");
  const orders = await res.json();

  // show stats for ALL orders
  const allMine = orders.filter(o => o.farmerUsername === user.username);
  const pending = allMine.filter(o => o.status === "placed" || o.status === "accepted");
  const completed = allMine.filter(o => o.status === "completed");
  const recentSalesVal = completed.reduce((sum, o) => sum + (Number(o.price) * Number(o.qty)), 0);

  if (document.getElementById("farmerTotalOrders")) document.getElementById("farmerTotalOrders").textContent = allMine.length;
  if (document.getElementById("farmerPendingOrders")) document.getElementById("farmerPendingOrders").textContent = pending.length;
  if (document.getElementById("farmerRecentSales")) document.getElementById("farmerRecentSales").textContent = "₹" + recentSalesVal;

  // show only this farmer's PENDING orders in the list
  const mine = allMine.filter(o => o.status === "placed");

  // Re-init charts with order data if available
  if (window.Chart) initFarmerCharts([], allMine);

  if (mine.length === 0) {
    container.innerHTML = `<div class="text-center py-4 bg-light rounded-3"><p class="text-muted mb-0">${t('no_orders')}</p></div>`;
    return;
  }

  container.innerHTML = mine
    .map(
      o => `
      <div class="col-md-6">
        <div class="card p-3">
          <h6>${escapeHtml(o.productName)}</h6>

          <p><b>${t('label_qty')}</b>: ${escapeHtml(o.qty)} kg @ ₹${escapeHtml(o.price)}</p>

          <p class="small text-muted">
            <b>${t('label_buyer')}</b>: ${escapeHtml(o.buyerName)} <br>
            <b>${t('label_contact')}</b>: ${escapeHtml(o.buyerContact || "")}
          </p>

          <p>${t('label_status')}: <b>${escapeHtml(o.status)}</b></p>

          <div class="d-flex gap-2 mt-2">
            <button class="btn btn-success btn-sm"
                    onclick="updateOrderStatus(${o.id}, 'accepted')">
              ${t('btn_accept')}
            </button>
            <button class="btn btn-danger btn-sm"
                    onclick="updateOrderStatus(${o.id}, 'rejected')">
              ${t('btn_reject')}
            </button>
          </div>
        </div>
      </div>`
    )
    .join("");
}

async function updateOrderStatus(id, status) {
  const res = await fetch("/updateOrderStatus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status })
  });

  await res.json();
  const lang = localStorage.getItem("agroLang") || "en";
  showToast(i18n[lang]?.alert_order_status || "Order Updated!", status);
  loadFarmerOrders();
}

/** Dashboard Charts **/
function initFarmerCharts(products = [], orders = []) {
  const salesCtx = document.getElementById('salesChart');
  const categoryCtx = document.getElementById('categoryChart');
  const weeklyCtx = document.getElementById('weeklyOrdersChart');

  if (!salesCtx || !categoryCtx || !weeklyCtx) return;

  // Cleanup old charts if they exist
  if (window.mySalesChart) window.mySalesChart.destroy();
  if (window.myCategoryChart) window.myCategoryChart.destroy();
  if (window.myWeeklyChart) window.myWeeklyChart.destroy();

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // 1. Sales Trend (Line)
  window.mySalesChart = new Chart(salesCtx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Sales Revenue (₹)',
        data: [1200, 1900, 1500, 2500, 2200, 3000, 3500],
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  // 2. Category Share (Doughnut)
  window.myCategoryChart = new Chart(categoryCtx, {
    type: 'doughnut',
    data: {
      labels: ['Vegetables', 'Fruits', 'Grains'],
      datasets: [{
        data: [45, 25, 30],
        backgroundColor: ['#2E7D32', '#81C784', '#A5D6A7']
      }]
    },
    options: { responsive: true, cutout: '70%', plugins: { legend: { position: 'bottom' } } }
  });

  // 3. Weekly Performance (Bar)
  window.myWeeklyChart = new Chart(weeklyCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Orders',
        data: [5, 8, 4, 10, 7, 12, 15],
        backgroundColor: '#81C784',
        borderRadius: 6
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
}


/* ---------- BUYER ORDERS PAGE ---------- */

async function loadBuyerOrders() {
  const el = document.getElementById("buyerOrders");
  if (!el) return;

  const user = getCurrentUser();
  if (!user || user.role !== "buyer") return;

  const res = await fetch("/orders");
  const orders = await res.json();
  const mine = orders.filter(o => o.buyerName === user.username);

  if (mine.length === 0) {
    el.innerHTML = `<div class="p-4 text-center text-muted col-12"><p class="mb-0" data-i18n="no_buyer_orders">No orders yet.</p></div>`;
    return;
  }

  const rows = mine.map(o => `
    <tr>
      <td class="fw-bold align-middle">
        <span class="fs-5 me-2 align-middle">${getCropEmoji(o.productName)}</span>${escapeHtml(o.productName)}
      </td>
      <td class="align-middle">
        <span class="d-block small text-muted text-uppercase fw-bold" data-i18n="label_qty">Qty</span>
        <span class="fw-bold text-dark">${escapeHtml(o.qty)} kg</span>
      </td>
      <td class="align-middle">
        <span class="d-block small text-muted text-uppercase fw-bold">Price</span>
        <span class="fw-bold text-dark">₹${escapeHtml(o.price || " - ")}</span>
      </td>
      <td class="align-middle text-end pe-4">
        <span class="badge rounded-pill px-3 py-2 status-${escapeHtml(o.status)}">
          ${escapeHtml(String(o.status)).toUpperCase()}
        </span>
      </td>
    </tr>
  `).join("");

  el.innerHTML = `
    <table class="table table-hover mb-0">
      <thead class="bg-light text-muted small text-uppercase">
        <tr>
          <th class="ps-4 py-3 fw-bold border-0">Product</th>
          <th class="py-3 fw-bold border-0">Quantity</th>
          <th class="py-3 fw-bold border-0">Price</th>
          <th class="pe-4 py-3 fw-bold border-0 text-end">Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

if (document.getElementById("buyerOrders")) loadBuyerOrders();

/* ---------- REUSABLE SHOPPING CART MANAGEMENT SYSTEM ---------- */


/* ---------- TOAST NOTIFICATIONS ---------- */
function showToast(message, title = "AgroSmart") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container position-fixed bottom-0 end-0 p-3";
    container.style.zIndex = "9999";
    document.body.appendChild(container);
  }

  const toastId = "toast_" + Date.now();
  const html = `
    <div id="${toastId}" class="toast align-items-center text-white bg-success border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          <div class="fw-bold mb-1">${title}</div>
          <div>${message}</div>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML("beforeend", html);
  const toastEl = document.getElementById(toastId);
  const bsToast = new bootstrap.Toast(toastEl, { delay: 3000 });
  bsToast.show();
  
  toastEl.addEventListener("hidden.bs.toast", () => {
    toastEl.remove();
  });
}

function getCartItems() {
  try {
    return JSON.parse(localStorage.getItem("agroCart")) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("agroCart", JSON.stringify(cart));
  updateCartUI();
}

function addToCart(product) {
  const user = getCurrentUser();
  const lang = localStorage.getItem("agroLang") || "en";
  
  if (!user || user.role !== "buyer") {
    alert(i18n[lang]?.alert_login_buyer || "Please login as a buyer to add items to cart.");
    window.location.href = "login.html";
    return;
  }

  // Ensure strict structure: { productId, productName, price, farmerName, quantity, image }
  const cart = getCartItems();
  const existing = cart.find(item => item.productId === product.productId);

  if (existing) {
    existing.quantity += 1;
    showToast(i18n[lang]?.msg_cart_updated || "Quantity updated in cart", product.productName);
  } else {
    cart.push({
      productId: product.productId,
      productName: product.productName,
      price: product.price,
      farmerName: product.farmerName,
      quantity: 1,
      image: product.image
    });
    showToast(i18n[lang]?.msg_cart_added || "Added to cart!", product.productName);
  }

  saveCart(cart);
}

function updateQuantity(productId, newQty) {
  const cart = getCartItems();
  const item = cart.find(x => x.productId === productId);
  if (!item) return;

  if (newQty < 1) {
    removeFromCart(productId);
    return;
  }

  item.quantity = newQty;
  saveCart(cart);
  if (typeof renderCartPage === "function" && document.getElementById("cartItemsList")) {
    renderCartPage();
  }
}

function removeFromCart(productId) {
  let cart = getCartItems();
  cart = cart.filter(x => x.productId !== productId);
  saveCart(cart);
  if (typeof renderCartPage === "function" && document.getElementById("cartItemsList")) {
    renderCartPage();
  }
}

function clearCart() {
  saveCart([]);
  if (typeof renderCartPage === "function" && document.getElementById("cartItemsList")) {
    renderCartPage();
  }
}

function updateCartUI() {
  const cart = getCartItems();
  const counts = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll("#cartBadge");
  
  badges.forEach(badge => {
    if (counts > 0) {
      badge.textContent = counts;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  });
}

// Initialize cart UI on load
document.addEventListener("DOMContentLoaded", updateCartUI);

// Re-expose to handle dynamic updates if navbar is re-rendered
const oldUpdateNavbarUser = window.updateNavbarUser;
window.updateNavbarUser = function() {
  if (oldUpdateNavbarUser) oldUpdateNavbarUser();
  updateCartUI();
};

/* Legacy mapping for backward compatibility if needed, though we refactor throughout */
function getCart() { return getCartItems(); }

function renderCartPage() {
  const el = document.getElementById("cartItemsList");
  const emptyEl = document.getElementById("emptyCartMessage");
  if (!el) return;

  const cart = getCartItems();
  if (cart.length === 0) {
    el.innerHTML = "";
    emptyEl.classList.remove("d-none");
    updateSummary(0, 0);
    return;
  }

  emptyEl.classList.add("d-none");
  let totalItems = 0;
  let totalPrice = 0;

  el.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    totalItems += item.quantity;
    totalPrice += itemTotal;

    return `
      <div class="cart-item-row d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
        <div class="bg-light rounded p-2 overflow-hidden d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
            ${item.image ? `<img src="${item.image}" class="w-100 h-100" style="object-fit: cover;">` : `<span class="fs-1">${getCropEmoji(item.productName)}</span>`}
        </div>
        <div class="flex-grow-1">
          <h5 class="fw-bold mb-1">${escapeHtml(item.productName)}</h5>
          <p class="text-muted small mb-0">Farmer: ${escapeHtml(item.farmerName)}</p>
          <div class="fw-bold text-success mt-1">₹${item.price} <span class="text-muted fw-normal">/kg</span></div>
        </div>
        <div class="qty-control">
          <div class="qty-btn" onclick="updateQuantity(${item.productId}, ${item.quantity - 1})">−</div>
          <span class="fw-bold px-2">${item.quantity}</span>
          <div class="qty-btn" onclick="updateQuantity(${item.productId}, ${item.quantity + 1})">+</div>
        </div>
        <div class="text-end" style="min-width: 100px;">
          <div class="fw-bold fs-5">₹${itemTotal.toFixed(2)}</div>
          <button class="btn btn-link btn-sm text-danger p-0 mt-1" onclick="removeFromCart(${item.productId})">Remove</button>
        </div>
      </div>
    `;
  }).join("");

  updateSummary(totalItems, totalPrice);
}

function updateSummary(totalItems, totalPrice) {
  const itemsEl = document.getElementById("summaryTotalItems");
  const subtotalEl = document.getElementById("summarySubtotal");
  const grandTotalEl = document.getElementById("summaryGrandTotal");

  if (itemsEl) itemsEl.textContent = totalItems;
  if (subtotalEl) subtotalEl.textContent = `₹${totalPrice.toFixed(2)}`;
  if (grandTotalEl) grandTotalEl.textContent = `₹${totalPrice.toFixed(2)}`;
}

async function checkoutCart() {
  const user = getCurrentUser();
  const lang = localStorage.getItem("agroLang") || "en";
  if (!user || user.role !== "buyer") {
    alert(i18n[lang]?.alert_login_buyer || "Please login as a buyer to checkout.");
    window.location.href = "login.html";
    return;
  }

  const cart = getCartItems();
  if (cart.length === 0) return;

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  
  // Show modal
  const modalEl = document.getElementById("paymentModal");
  if (!modalEl) return;
  const modal = new bootstrap.Modal(modalEl);
  
  const summaryEl = document.getElementById("checkoutSummary");
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="d-flex justify-content-between mb-2 fw-bold">
          <span>Items (${cart.length})</span>
          <span>Total: ₹${totalAmount}</span>
      </div>
      <div class="small text-muted mt-2">
          ${cart.map(item => `${getCropEmoji(item.productName)} ${item.productName} x ${item.quantity}`).join(", ")}
      </div>
    `;
  }

  // Pre-fill
  if (document.getElementById("payBuyerName")) document.getElementById("payBuyerName").value = user.username;
  if (document.getElementById("payBuyerPhone")) document.getElementById("payBuyerPhone").value = user.contactNumber || "";

  modal.show();

  const confirmBtn = document.getElementById("payConfirmBtn");
  const loadingEl = document.getElementById("paymentLoading");
  const errorEl = document.getElementById("paymentError");

  if (!confirmBtn) return;

  confirmBtn.onclick = async () => {
    const cardNumber = document.getElementById("payCardNumber")?.value.trim();
    const expiry = document.getElementById("payExpiry")?.value.trim();
    const cvv = document.getElementById("payCvv")?.value.trim();
    const buyerName = document.getElementById("payBuyerName")?.value.trim();
    const buyerPhone = document.getElementById("payBuyerPhone")?.value.trim();
    const buyerAltPhone = document.getElementById("payBuyerAltPhone")?.value.trim() || "";
    const address = document.getElementById("payBuyerAddress")?.value.trim();
    const landmark = document.getElementById("payDeliveryLocation")?.value.trim() || "";

    if (!cardNumber || !expiry || !cvv || !buyerName || !buyerPhone || !address) {
      if (errorEl) {
        errorEl.textContent = "Please fill all required details.";
        errorEl.classList.remove("d-none");
      }
      return;
    }

    if (loadingEl) loadingEl.classList.remove("d-none");
    if (errorEl) errorEl.classList.add("d-none");

    try {
      // 1. Process single payment for total amount
      const pRes = await fetch("/process-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardNumber, expiry, cvv, amount: totalAmount })
      });

      const pData = await pRes.json();
      if (!pRes.ok) throw new Error(pData.message || "Payment failed");

      // 2. Create multiple orders
      for (const item of cart) {
        await fetch("/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            qty: item.quantity,
            price: item.price,
            buyerName: buyerName,
            buyerContact: buyerPhone,
            buyerAltPhone: buyerAltPhone,
            address: address,
            deliveryLocation: landmark,
            productName: item.productName,
            farmerUsername: item.farmerName,
            paymentStatus: "completed",
            transactionId: pData.transactionId
          })
        });
      }

      if (loadingEl) {
        loadingEl.innerHTML = `
          <div class="text-center">
            <div class="fs-1 mb-2">✅</div>
            <div class="fw-bold text-success">Orders Placed Successfully!</div>
            <div class="small text-muted mt-2">Trans ID: ${pData.transactionId}</div>
          </div>
        `;
      }

      setTimeout(() => {
        clearCart();
        modal.hide();
        window.location.href = "buyer-orders.html";
      }, 2000);

    } catch (err) {
      if (loadingEl) loadingEl.classList.add("d-none");
      if (errorEl) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("d-none");
      }
    }
  };
}



/* ---------- WEATHER WIDGET LOGIC ---------- */

function initWeather() {
  const banner = document.getElementById("weatherBanner");
  if (!banner) return;

  const lang = localStorage.getItem("agroLang") || "en";

  if (!navigator.geolocation) {
    if (document.getElementById("weatherDesc")) {
      document.getElementById("weatherDesc").textContent = i18n[lang]?.weather_geo_unavail || "Geolocation not supported";
    }
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Get human-readable location name
        const locRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${lang}`);
        const locData = await locRes.json();
        const city = locData.address.city || locData.address.town || locData.address.village || i18n[lang]?.weather_unknown_loc || "Unknown Area";
        if (document.getElementById("weatherLocation")) {
          document.getElementById("weatherLocation").textContent = city;
        }

        // Fetch weather from Open-Meteo
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`);
        const weatherData = await weatherRes.json();

        if (weatherData.current) {
          const current = weatherData.current;
          const daily = weatherData.daily;
          
          const infoDesc = getWeatherDescription(current.weather_code);
          const infoIcon = getWeatherIcon(current.weather_code);

          if (document.getElementById("weatherTemp")) document.getElementById("weatherTemp").textContent = `${Math.round(current.temperature_2m)}°C`;
          if (document.getElementById("weatherDesc")) document.getElementById("weatherDesc").textContent = infoDesc;
          if (document.getElementById("weatherIcon")) document.getElementById("weatherIcon").textContent = infoIcon;
          if (document.getElementById("weatherDate")) {
            const now = new Date();
            document.getElementById("weatherDate").textContent = now.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' });
          }

          // New metrics
          if (document.getElementById("weatherRain")) document.getElementById("weatherRain").textContent = `${daily.precipitation_probability_max[0]}%`;
          if (document.getElementById("weatherHum")) document.getElementById("weatherHum").textContent = `${current.relative_humidity_2m}%`;
          if (document.getElementById("weatherWind")) document.getElementById("weatherWind").textContent = Math.round(current.wind_speed_10m);

          banner.classList.remove("d-none");
          banner.classList.add("animate-fade");

          // Disaster Alert logic
          const disasterAlert = document.getElementById("disasterAlert");
          const disasterMsg = document.getElementById("disasterMsg");

          if (current.weather_code >= 95 || daily.precipitation_probability_max[0] > 90 || current.wind_speed_10m > 50) {
            if (disasterAlert && disasterMsg) {
              disasterAlert.classList.remove("d-none");
              disasterMsg.textContent = i18n[lang]?.alert_disaster || "Extreme weather detected! Take immediate shelter and protect crops.";
            }
          } else {
            if (disasterAlert) disasterAlert.classList.add("d-none");
          }

          // Crop Specific Alerts
          generateCropAlerts(current, daily, lang);

          // Render 3-Day Forecast
          const forecastEl = document.getElementById("forecastContainer");
          if (forecastEl && daily.time) {
            let fHtml = "";
            for (let i = 1; i <= 3; i++) { // Next 3 days
              if (daily.time[i]) {
                const fDate = new Date(daily.time[i]);
                const dayStr = fDate.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                const code = daily.weather_code[i];
                const maxT = Math.round(daily.temperature_2m_max[i]);
                const minT = Math.round(daily.temperature_2m_min[i]);
                const rain = daily.precipitation_sum[i];
                const fIcon = getWeatherIcon(code);
                const desc = getWeatherDescription(code);

                fHtml += `
                <div class="col-md-4">
                  <div class="card border-0 shadow-sm h-100 text-center p-4" style="border-radius: 16px;">
                    <div class="fw-bold mb-3" style="color: var(--primary);">${dayStr}</div>
                    <div class="display-3 mb-3">${fIcon}</div>
                    <div class="fw-bold fs-4 mb-1 text-dark">${maxT}°C <br><span class="text-muted fs-6">${minT}°C</span></div>
                    <div class="small text-muted fw-bold mb-3">${desc}</div>
                    <div class="badge bg-info bg-opacity-10 text-info w-100 py-2" style="border-radius: 8px;">
                      💧 Rain: ${rain} mm
                    </div>
                  </div>
                </div>`;
              }
            }
            forecastEl.innerHTML = fHtml;
          }
        }
      } catch (err) {
        console.error("Weather fetch error:", err);
      }
    },
    (err) => {
      console.error("Geolocation error:", err);
    }
  );
}

function generateCropAlerts(current, daily, lang) {
  const container = document.getElementById("cropAlertsContainer");
  const insightEl = document.getElementById("cropInsight");
  if (!container || !insightEl) return;

  const alerts = [];
  let mainInsight = i18n[lang]?.insight_perfect || "Conditions are ideal for farming today. Focus on harvesting or weeding.";

  // Temp Logic
  if (current.temperature_2m > 35) {
    alerts.push({ icon: "🔥", title: i18n[lang]?.alert_heat_title || "Heat Wave Warning", desc: i18n[lang]?.alert_heat_desc || "Ensure additional irrigation during evening hours." });
    mainInsight = i18n[lang]?.insight_heat || "Extreme heat detected. Avoid fertilizing now; it may burn the roots.";
  } else if (current.temperature_2m < 15) {
    alerts.push({ icon: "❄️", title: i18n[lang]?.alert_cold_title || "Cold Snap", desc: i18n[lang]?.alert_cold_desc || "Protect sensitive young plants with mulch or cover." });
    mainInsight = i18n[lang]?.insight_cold || "Cold weather slow down growth. Monitor soil temperature.";
  }

  // Rain Logic
  if (daily.precipitation_probability_max[0] > 60) {
    alerts.push({ icon: "🌧️", title: i18n[lang]?.alert_rain_title || "Rain Expected", desc: i18n[lang]?.alert_rain_desc || "Clear drainage channels to prevent waterlogging." });
    mainInsight = i18n[lang]?.insight_rain || "Rain is coming. Natural watering is great, but watch for flooding.";
  }

  // Wind Logic
  if (current.wind_speed_10m > 25) {
    alerts.push({ icon: "💨", title: i18n[lang]?.alert_wind_title || "High Winds", desc: i18n[lang]?.alert_wind_desc || "Support tall crops like sugarcane or banana trees." });
    mainInsight = i18n[lang]?.insight_wind || "Strong winds may damage tall crops. Check supports.";
  }

  // Humidity Logic
  if (current.relative_humidity_2m > 85) {
    alerts.push({ icon: "🍄", title: i18n[lang]?.alert_pest_title || "Pest/Fungi Risk", desc: i18n[lang]?.alert_pest_desc || "High humidity increases fungal risks. Check leaf undersides." });
  }

  if (alerts.length === 0) {
    container.innerHTML = `
      <div class="p-4 bg-success bg-opacity-10 rounded-4 border border-success border-opacity-20 text-center">
        <div class="fs-1 mb-2">✅</div>
        <h6 class="fw-bold text-success mb-1">All Systems Green</h6>
        <p class="small text-muted mb-0">No immediate threats to your crops detected.</p>
      </div>
    `;
  } else {
    container.innerHTML = alerts.map(a => `
      <div class="p-3 bg-white rounded-4 border border-light shadow-sm d-flex align-items-center gap-3 animate-fade">
        <div class="fs-3">${a.icon}</div>
        <div>
          <h6 class="fw-bold mb-0">${a.title}</h6>
          <p class="small text-muted mb-0">${a.desc}</p>
        </div>
      </div>
    `).join("");
  }

  insightEl.textContent = mainInsight;
}

async function loadReservoirData() {
  const tableBody = document.getElementById("reservoirTableBody");
  if (!tableBody) return;

  try {
    const res = await fetch("/api/reservoir");
    const data = await res.json();
    const lang = localStorage.getItem("agroLang") || "en";

    let html = "";
    let floodWarning = false;

    data.forEach(r => {
      const percentage = (r.waterLevel / r.totalCapacity) * 100;
      let statusClass = "bg-success";
      let statusText = "Safe";

      if (percentage >= 100) {
        statusClass = "bg-danger pulse-red";
        statusText = "Overflow";
        floodWarning = true;
      } else if (percentage >= 95) {
        statusClass = "bg-danger";
        statusText = "Critical";
        floodWarning = true;
      } else if (percentage >= 85) {
        statusClass = "bg-warning text-dark";
        statusText = "Warning";
      }

      html += `
        <tr>
          <td class="ps-4 fw-bold">${escapeHtml(r.name)}</td>
          <td>${escapeHtml(r.district)}</td>
          <td class="fw-bold text-primary">${r.waterLevel}</td>
          <td>${r.totalCapacity}</td>
          <td>${r.depth}</td>
          <td>${r.inflow.toLocaleString()}</td>
          <td>${r.outflow.toLocaleString()}</td>
          <td>
            <span class="badge ${r.gateStatus === 'Open' ? 'bg-info' : 'bg-secondary'}">
              ${r.gateStatus}
            </span>
          </td>
          <td class="small text-muted">${new Date(r.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
          <td class="pe-4">
            <span class="badge ${statusClass}">${statusText}</span>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;

    const banner = document.getElementById("floodAlertBanner");
    if (banner) {
      if (floodWarning) {
        banner.classList.remove("d-none");
        // Also trigger toast if on reservoir page
        const toast = document.getElementById("notificationToast");
        const toastMsg = document.getElementById("toastMessage");
        const toastTitle = document.getElementById("toastTitle");
        if (toast && toastMsg && toastTitle) {
          toastTitle.textContent = "FLOOD ALERT!";
          toastMsg.textContent = "High water levels detected. Gates opening.";
          const bsToast = new bootstrap.Toast(toast);
          bsToast.show();
        }
      } else {
        banner.classList.add("d-none");
      }
    }
  } catch (err) {
    console.error("Reservoir fetch error:", err);
  }
}

if (document.getElementById("reservoirTableBody")) loadReservoirData();

async function loadNews() {
  const container = document.getElementById("newsContainer");
  if (!container) return;

  const categoryReq = document.getElementById("newsCategory")?.value || "All";

  try {
    const res = await fetch(`/api/news?category=${categoryReq}`);
    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = `<div class="col-12 text-center py-5 text-muted">No news found for this category.</div>`;
      return;
    }

    container.innerHTML = data.map(n => `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 border-0 shadow-sm overflow-hidden" style="border-radius: 12px;">
          <img src="${n.image}" class="card-img-top" alt="${n.title}" style="height: 180px; object-fit: cover;">
          <div class="card-body p-4 d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">${n.category}</span>
                <small class="text-muted fw-bold">${new Date(n.date).toLocaleDateString()}</small>
            </div>
            <h5 class="fw-bold mb-3 text-dark lh-sm">${escapeHtml(n.title)}</h5>
            <p class="text-muted small mb-4">${escapeHtml(n.description)}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-light">
                <small class="text-muted fw-bold">Source: ${escapeHtml(n.source)}</small>
                <a href="${n.link}" class="btn btn-sm btn-outline-success fw-bold px-3">Read More →</a>
            </div>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("News fetch error:", err);
  }
}

if (document.getElementById("newsContainer")) loadNews();

/* ========== WEATHER MODULE ========== */

// Weather icon mapping
function getWeatherIcon(code, isDay = true) {
  const icons = {
    0: "☀️",      // Clear sky
    1: "🌤️",     // Mainly clear
    2: "⛅",     // Partly cloudy
    3: "☁️",     // Overcast
    45: "🌫️",    // Fog
    48: "🌫️",    // Depositing rime fog
    51: "🌦️",    // Drizzle light
    53: "🌦️",    // Drizzle moderate
    55: "🌧️",    // Drizzle dense
    61: "🌧️",    // Rain slight
    63: "🌧️",    // Rain moderate
    65: "🌧️",    // Rain heavy
    71: "🌨️",    // Snow slight
    73: "🌨️",    // Snow moderate
    75: "❄️",     // Snow heavy
    77: "🌨️",    // Snow grains
    80: "🌦️",    // Rain showers slight
    81: "🌧️",    // Rain showers moderate
    82: "⛈️",     // Rain showers violent
    85: "🌨️",    // Snow showers slight
    86: "❄️",     // Snow showers heavy
    95: "⛈️",     // Thunderstorm
    96: "⛈️",     // Thunderstorm with hail
    99: "⛈️"      // Thunderstorm with heavy hail
  };
  return icons[code] || "🌤️";
}

// Weather description mapping
function getWeatherDescription(code) {
  const descriptions = {
    0: t('weather_clear') || "Clear Sky",
    1: t('weather_p_cloudy') || "Partly Cloudy",
    2: t('weather_p_cloudy') || "Partly Cloudy",
    3: t('weather_cloudy') || "Cloudy",
    45: t('weather_foggy') || "Foggy",
    48: t('weather_foggy') || "Foggy",
    51: t('weather_drizzle') || "Drizzle",
    53: t('weather_drizzle') || "Drizzle",
    55: t('weather_drizzle') || "Drizzle",
    61: t('weather_rainy') || "Rainy",
    63: t('weather_rainy') || "Rainy",
    65: t('weather_rainy') || "Rainy",
    71: t('weather_snowy') || "Snowy",
    73: t('weather_snowy') || "Snowy",
    75: t('weather_snowy') || "Snowy",
    77: t('weather_snowy') || "Snowy",
    80: t('weather_r_showers') || "Rain Showers",
    81: t('weather_r_showers') || "Rain Showers",
    82: t('weather_r_showers') || "Rain Showers",
    85: t('weather_s_showers') || "Snow Showers",
    86: t('weather_s_showers') || "Snow Showers",
    95: t('weather_t_storm') || "Thunderstorm",
    96: t('weather_t_storm') || "Thunderstorm",
    99: t('weather_t_storm') || "Thunderstorm"
  };
  return descriptions[code] || t('weather_clear') || "Clear Sky";
}

// Generate crop insights based on weather
function generateCropInsight(temp, humidity, windSpeed, weatherCode, precipitation) {
  // Perfect conditions
  if (temp >= 20 && temp <= 30 && humidity >= 40 && humidity <= 70 && windSpeed < 15) {
    return t('insight_perfect') || "Conditions are ideal for farming today. Focus on harvesting or weeding.";
  }

  // Extreme heat
  if (temp > 35) {
    return t('insight_heat') || "Extreme heat detected. Avoid fertilizing now; it may burn the roots.";
  }

  // Cold weather
  if (temp < 10) {
    return t('insight_cold') || "Cold weather slow down growth. Monitor soil temperature.";
  }

  // Rain expected
  if (precipitation > 5 || [61, 63, 65, 80, 81, 82].includes(weatherCode)) {
    return t('insight_rain') || "Rain is coming. Natural watering is great, but watch for flooding.";
  }

  // High winds
  if (windSpeed > 25) {
    return t('insight_wind') || "Strong winds may damage tall crops. Check supports.";
  }

  return t('insight_perfect') || "Good conditions for regular farm activities.";
}

// Generate smart alerts
function generateSmartAlerts(temp, humidity, windSpeed, weatherCode, precipitation) {
  const alerts = [];

  // Heat warning
  if (temp > 35) {
    alerts.push({
      icon: "🌡️",
      title: t('alert_heat_title') || "Heat Wave Warning",
      desc: t('alert_heat_desc') || "Ensure additional irrigation during evening hours.",
      color: "danger"
    });
  }

  // Cold warning
  if (temp < 10) {
    alerts.push({
      icon: "❄️",
      title: t('alert_cold_title') || "Cold Snap",
      desc: t('alert_cold_desc') || "Protect sensitive young plants with mulch or cover.",
      color: "info"
    });
  }

  // Rain alert
  if (precipitation > 10) {
    alerts.push({
      icon: "🌧️",
      title: t('alert_rain_title') || "Rain Expected",
      desc: t('alert_rain_desc') || "Clear drainage channels to prevent waterlogging.",
      color: "primary"
    });
  }

  // Wind alert
  if (windSpeed > 25) {
    alerts.push({
      icon: "💨",
      title: t('alert_wind_title') || "High Winds",
      desc: t('alert_wind_desc') || "Support tall crops like sugarcane or banana trees.",
      color: "warning"
    });
  }

  // Pest/fungi risk (high humidity + moderate temp)
  if (humidity > 80 && temp > 20 && temp < 30) {
    alerts.push({
      icon: "🐛",
      title: t('alert_pest_title') || "Pest/Fungi Risk",
      desc: t('alert_pest_desc') || "High humidity increases fungal risks. Check leaf undersides.",
      color: "warning"
    });
  }

  return alerts;
}

// Check for disaster conditions
function checkDisasterConditions(weatherCode, windSpeed, precipitation) {
  // Severe thunderstorm
  if ([95, 96, 99].includes(weatherCode)) {
    return {
      isDisaster: true,
      message: t('disaster_storm') || "Severe Storm predicted tomorrow! Please secure all outdoor equipment and livestock."
    };
  }

  // Extreme rainfall
  if (precipitation > 50) {
    return {
      isDisaster: true,
      message: t('disaster_rain') || "Extreme rainfall expected tomorrow. Potential for flooding in low-lying fields."
    };
  }

  // Extreme winds
  if (windSpeed > 50) {
    return {
      isDisaster: true,
      message: t('alert_disaster') || "Extreme weather detected! Take immediate shelter and protect crops."
    };
  }

  return { isDisaster: false };
}

// Main weather fetch function
async function fetchWeather() {
  const weatherBanner = document.getElementById("weatherBanner");
  if (!weatherBanner) return;

  try {
    // Get user's location
    if (!navigator.geolocation) {
      throw new Error(t('weather_geo_unavail') || "Geolocation not supported");
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Fetch weather data from Open-Meteo API (free, no API key needed)
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

        const response = await fetch(weatherUrl);
        const data = await response.json();

        if (!data.current) {
          throw new Error("Weather data unavailable");
        }

        // Get location name using reverse geocoding
        const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();
        const locationName = geoData.locality || geoData.city || geoData.principalSubdivision || t('weather_unknown_loc') || "Unknown Area";

        // Current weather
        const temp = Math.round(data.current.temperature_2m);
        const humidity = data.current.relative_humidity_2m;
        const windSpeed = Math.round(data.current.wind_speed_10m);
        const weatherCode = data.current.weather_code;
        const precipitation = data.current.precipitation || 0;

        // Update UI
        document.getElementById("weatherLocation").textContent = locationName;
        document.getElementById("weatherDate").textContent = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        document.getElementById("weatherIcon").textContent = getWeatherIcon(weatherCode);
        document.getElementById("weatherTemp").textContent = `${temp}°C`;
        document.getElementById("weatherDesc").textContent = getWeatherDescription(weatherCode);
        document.getElementById("weatherHum").textContent = `${humidity}%`;
        document.getElementById("weatherWind").textContent = windSpeed;

        // Crop insight
        const insight = generateCropInsight(temp, humidity, windSpeed, weatherCode, precipitation);
        document.getElementById("cropInsight").textContent = insight;

        // Smart alerts
        const alerts = generateSmartAlerts(temp, humidity, windSpeed, weatherCode, precipitation);
        const alertsContainer = document.getElementById("cropAlertsContainer");

        if (alerts.length > 0) {
          alertsContainer.innerHTML = alerts.map(alert => `
            <div class="p-3 bg-${alert.color} bg-opacity-10 border border-${alert.color} border-opacity-25 rounded-4">
              <div class="d-flex align-items-start gap-2">
                <span style="font-size: 1.5rem;">${alert.icon}</span>
                <div class="flex-grow-1">
                  <h6 class="fw-bold mb-1 text-${alert.color}">${alert.title}</h6>
                  <p class="mb-0 small text-dark">${alert.desc}</p>
                </div>
              </div>
            </div>
          `).join('');
        } else {
          alertsContainer.innerHTML = `
            <div class="p-4 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-4 text-center">
              <span style="font-size: 2rem;">✅</span>
              <p class="mb-0 mt-2 fw-medium text-success">All conditions normal</p>
            </div>
          `;
        }

        // Check for disasters
        const tomorrowWeatherCode = data.daily.weather_code[1];
        const tomorrowPrecip = data.daily.precipitation_sum[1];
        const disaster = checkDisasterConditions(tomorrowWeatherCode, windSpeed, tomorrowPrecip);

        const disasterAlert = document.getElementById("disasterAlert");
        if (disaster.isDisaster) {
          document.getElementById("disasterMsg").textContent = disaster.message;
          disasterAlert.classList.remove("d-none");
        } else {
          disasterAlert.classList.add("d-none");
        }

        // Show weather banner
        weatherBanner.classList.remove("d-none");

      },
      (error) => {
        console.error("Geolocation error:", error);
        document.getElementById("weatherLocation").textContent = t('weather_denied') || "Location access denied";
        document.getElementById("weatherDesc").textContent = t('weather_unavail') || "Please enable location to see weather";
        weatherBanner.classList.remove("d-none");
      }
    );

  } catch (error) {
    console.error("Weather fetch error:", error);
    document.getElementById("weatherLocation").textContent = t('weather_unavail') || "Weather unavailable";
    weatherBanner.classList.remove("d-none");
  }
}

// Initialize weather on home page
if (window.location.pathname.includes("home.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/")) {
  if (document.getElementById("weatherBanner")) {
    fetchWeather();
  }
}


// Marketplace Recommendations
async function renderRecommendations() {
  const container = document.getElementById("recommendationsList");
  const newestContainer = document.getElementById("newestProducts");
  if (!container && !newestContainer) return;

  const products = window.allProducts || [];
  if (products.length === 0) return;

  const user = getCurrentUser();
  const lang = localStorage.getItem("agroLang") || "en";

  // Recommended: Same location as user if available, otherwise high variety
  let recommended = [];
  if (user && user.location) {
    recommended = products.filter(p => p.location === user.location).slice(0, 4);
  }
  
  if (recommended.length < 4) {
    const others = products.filter(p => !recommended.includes(p));
    recommended = recommended.concat(others.slice(0, 4 - recommended.length));
  }

  // Newest: Last 4 products
  const newest = [...products].reverse().slice(0, 4);

  const renderCard = (p) => {
    const pName = i18n[lang][`crop_${p.name.toLowerCase()}`] || p.name;
    return `
      <div class="col-md-3">
        <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden product-card animate-fade">
          <div class="position-relative">
            <div class="product-image-placeholder bg-light d-flex align-items-center justify-content-center" style="height: 160px;">
              ${p.image ? `<img src="${p.image}" class="w-100 h-100" style="object-fit: cover;">` : `<span style="font-size: 4rem;">${getCropEmoji(p.name)}</span>`}
            </div>
            <div class="position-absolute top-0 end-0 m-2">
              <span class="badge bg-success shadow-sm">₹${p.price}/kg</span>
            </div>
          </div>
          <div class="card-body p-3">
            <h6 class="fw-bold mb-1">${escapeHtml(pName)}</h6>
            <p class="text-muted small mb-2"><span class="icon">📍</span> ${escapeHtml(p.location || 'Unknown')}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="small text-muted">Farmer: ${escapeHtml(p.farmerUsername)}</span>
              <button class="btn btn-sm btn-outline-success rounded-pill px-3" onclick="window.location.href='index.html?search=${encodeURIComponent(p.name)}'">View</button>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  if (container) container.innerHTML = recommended.map(renderCard).join("");
  if (newestContainer) newestContainer.innerHTML = newest.map(renderCard).join("");
}

function handleCartClick() {
  const user = getCurrentUser();
  if (!user || user.role !== 'buyer') {
    alert("Please sign in as a buyer to view your cart.");
    window.location.href = "login.html?role=buyer";
    return;
  }
  window.location.href = "cart.html";
}
