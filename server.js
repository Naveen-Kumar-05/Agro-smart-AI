// AgroSmart Server — SQLite backend
process.on("uncaughtException",  (err)    => { console.error("FATAL:", err);    process.exit(1); });
process.on("unhandledRejection", (reason) => { console.error("FATAL:", reason); process.exit(1); });

const express    = require("express");
const http       = require("http");
const bodyParser = require("body-parser");
const path       = require("path");
const cors       = require("cors");
const { Users, Products, Orders, placeOrder } = require("./db");

const app = express();
app.get("/", (req, res) => res.redirect("/home.html"));
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/reservoir", require("./routes/reservoir.routes"));
app.use("/api/news",      require("./routes/news.routes"));

app.post("/register", (req, res) => {
  const { username, password, role, contactNumber, location } = req.body;
  if (!username || !password || !role || !contactNumber || !location)
    return res.status(400).json({ message: "All fields required" });
  if (!["farmer","buyer"].includes(role))
    return res.status(400).json({ message: "Role must be farmer or buyer" });
  if (Users.exists(username))
    return res.status(400).json({ message: "Username already exists" });
  Users.create({ username, password, role, contactNumber, location });
  res.json({ message: "Registered successfully" });
});

app.post("/login", (req, res) => {
  const { username, password, role } = req.body;
  const user = Users.findByCredentials(username, password, role);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  res.json({ message: "Login success", user: { username: user.username, role: user.role, contactNumber: user.contact || "", location: user.location || "" } });
});

app.get("/products", (req, res) => res.json(Products.getAll()));

app.post("/addProduct", (req, res) => {
  const { name, price, qty, location, farmerUsername, image } = req.body;
  if (!name || !price || !qty || !location || !farmerUsername)
    return res.status(400).json({ message: "Fill all details" });
  Products.create({ name, price, qty, location, farmerUsername, image });
  res.json({ message: "Product added successfully!" });
});

app.post("/updateProduct", (req, res) => {
  const ok = Products.update(req.body);
  if (!ok) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product updated successfully!" });
});

app.post("/deleteProduct", (req, res) => {
  Products.delete(req.body.id);
  res.json({ message: "Deleted successfully!" });
});

app.get("/orders", (req, res) => res.json(Orders.getAll()));

app.post("/orders", (req, res) => {
  const { productId, qty, price, buyerName, buyerContact, buyerAltPhone, productName, farmerUsername, paymentStatus, transactionId, address, deliveryLocation } = req.body;
  try {
    const product = Products.getById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const { orderId, remainingQty } = placeOrder({
      productId, qty, price, buyerName,
      buyerContact: buyerContact || null, buyerAltPhone: buyerAltPhone || null,
      address: address || null, deliveryLocation: deliveryLocation || null,
      productName: productName || product.name,
      farmerUsername: farmerUsername || product.farmerUsername,
      status: paymentStatus === "completed" ? "placed" : "pending",
      paymentStatus: paymentStatus || "unpaid",
      transactionId: transactionId || null
    });
    res.json({ message: "Order placed!", remainingQty, orderId });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

app.post("/updateOrderStatus", (req, res) => {
  const { id, status } = req.body;
  const order = Orders.getById(id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  Orders.updateStatus(id, status);
  res.json({ message: "Order status updated", order: { ...order, status } });
});

app.post("/process-payment", (req, res) => {
  const { cardNumber, expiry, cvv, amount } = req.body;
  if (!cardNumber || !expiry || !cvv || !amount)
    return res.status(400).json({ success: false, message: "Missing payment details" });
  setTimeout(() => {
    if (cardNumber.replace(/\s/g,"").endsWith("0000"))
      return res.status(402).json({ success: false, message: "Payment declined. Please try another card." });
    res.json({ success: true, message: "Payment authorized", transactionId: "TXN-" + Date.now() + "-" + Math.random().toString(36).substr(2,5).toUpperCase(), amount, status: "completed" });
  }, 1500);
});

app.post("/suggest-fertilizer", (req, res) => {
  const { cropType, soilType, phLevel, waterType, cropAge } = req.body;
  if (!cropType || !soilType || !phLevel || !waterType || !cropAge)
    return res.status(400).json({ message: "Please provide all details" });
  const ph = parseFloat(phLevel), age = parseFloat(cropAge);
  const crop = cropType.toLowerCase(), soil = soilType.toLowerCase();
  let rec = { fertilizer:"General NPK (20-10-10)", quantity:"40 kg/acre", frequency:"Once every 3 weeks", tips:"Maintain consistent soil moisture." };
  if (crop==="rice") rec = ph<6 ? { fertilizer:"Lime + Urea + MOP", quantity:"50 kg/acre", frequency:"3 split applications", tips:"Apply lime 2 weeks before sowing." } : { fertilizer:"DAP + Urea", quantity:"45 kg/acre", frequency:"At tillering stage", tips:"Ensure proper drainage during flowering." };
  else if (crop==="wheat") rec = { fertilizer:"CAN + SSP", quantity:"35 kg/acre", frequency:"At first irrigation", tips:"Monitor for yellowing of leaves." };
  else if (crop==="maize") rec = { fertilizer:"Urea + DAP + MOP", quantity:"50 kg/acre", frequency:"2 split applications", tips:"Apply first dose at sowing, second at knee-high stage." };
  else if (crop==="tomato"||crop==="vegetables") rec = { fertilizer:"NPK 19-19-19 + Calcium Nitrate", quantity:"30 kg/acre", frequency:"Weekly foliar spray", tips:"Calcium prevents blossom end rot." };
  else if (crop==="cotton") rec = { fertilizer:"Urea + SSP + MOP", quantity:"55 kg/acre", frequency:"3 split applications", tips:"Avoid excess nitrogen after boll formation." };
  else if (soil==="sandy") rec = { ...rec, fertilizer:"Organic Compost + Slow-release NPK", quantity:"60 kg/acre", tips:"Sandy soil leaches nutrients quickly." };
  else if (soil==="black") rec = { ...rec, fertilizer:"SSP + Urea", tips:"Black soil retains moisture well; avoid over-irrigation." };
  if (ph<5.5) rec.tips += " Soil too acidic — apply agricultural lime.";
  if (ph>8.0) rec.tips += " Soil alkaline — use acidifying fertilizers.";
  if (age>60)  rec.tips += " Reduce nitrogen, focus on potassium for fruit/grain development.";
  res.json(rec);
});

app.get("/predictPrice", (req, res) => {
  const name = (req.query.name||"").trim(), location = (req.query.location||"").trim();
  const local = Products.searchByName(name, location);
  if (local.length>0) { const avg=local.reduce((s,p)=>s+parseFloat(p.price),0)/local.length; return res.json({ suggestedPrice:+avg.toFixed(2), sampleCount:local.length, reason:"Local Average" }); }
  const market = Products.searchByName(name, null);
  if (market.length>0) { const avg=market.reduce((s,p)=>s+parseFloat(p.price),0)/market.length; return res.json({ suggestedPrice:+avg.toFixed(2), sampleCount:market.length, reason:"Market Average" }); }
  res.json({ suggestedPrice:null, reason:"No data available" });
});

app.post("/analyze-disease", (req, res) => {
  const { cropType, soilType, waterType, remarks, imageBase64 } = req.body;
  if (!cropType||!soilType||!waterType||!remarks) return res.status(400).json({ message:"Please fill all details" });
  const prompt = `You are an expert agricultural scientist. Analyze: Crop:${cropType} Soil:${soilType} Water:${waterType} Symptoms:${remarks}. Return JSON: diseaseName, reason, remedy, medicine`;
  const payload = { model:"phi3", prompt, stream:false, format:"json" };
  if (imageBase64) payload.images = [imageBase64.replace(/^data:image\/\w+;base64,/,"")];
  const body = JSON.stringify(payload);
  const r2 = http.request({ hostname:"localhost", port:11434, path:"/api/generate", method:"POST", headers:{"Content-Type":"application/json","Content-Length":Buffer.byteLength(body)} }, (res2) => {
    let raw=""; res2.on("data",c=>raw+=c);
    res2.on("end",()=>{ try { const p=JSON.parse(raw); const j=JSON.parse(p.response||"{}"); res.json({ diseaseName:j.diseaseName||"Unknown Disease", reason:j.reason||"N/A", remedy:j.remedy||"Consult a local agricultural officer.", medicine:j.medicine||"N/A" }); } catch { res.status(500).json({ message:"Could not parse AI response." }); } });
  });
  r2.on("error",()=>res.status(500).json({ message:"AI Model (Ollama) not responding on port 11434." }));
  r2.write(body); r2.end();
});

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log("========================================");
    console.log(" AgroSmart Server  (SQLite)");
    console.log(" URL : http://localhost:" + port);
    console.log(" Time: " + new Date().toLocaleString());
    console.log("========================================");
  });
  server.on("error", (e) => {
    if (e.code==="EADDRINUSE") { console.log("Port "+port+" busy, trying "+(port+1)+"..."); startServer(port+1); }
    else throw e;
  });
};

startServer(parseInt(process.env.PORT||5000));
