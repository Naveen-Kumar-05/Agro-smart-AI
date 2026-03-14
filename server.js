// server.js - AgroSmart Application with Login + Dashboard
process.on("uncaughtException", (err) => {
  console.error("FATAL: Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("FATAL: Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
// ALWAYS redirect root to home page
app.get("/", (req, res) => {
  res.redirect("/home.html");
});

app.use(cors());
app.use(bodyParser.json());

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// New Routes
const reservoirRoutes = require("./routes/reservoir.routes");
const newsRoutes = require("./routes/news.routes");
app.use("/api/reservoir", reservoirRoutes);
app.use("/api/news", newsRoutes);

const DATA_DIR = path.join(__dirname, "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Ensure data folder & files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(PRODUCTS_FILE)) fs.writeFileSync(PRODUCTS_FILE, "[]");
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");

// In-Memory Cache for Performance
const memoryCache = {
  users: JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]'),
  products: JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8') || '[]'),
  orders: JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8') || '[]')
};

const readJson = file => {
  if (file === USERS_FILE) return memoryCache.users;
  if (file === PRODUCTS_FILE) return memoryCache.products;
  if (file === ORDERS_FILE) return memoryCache.orders;
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
};

const writeJson = (file, data) => {
  if (file === USERS_FILE) memoryCache.users = data;
  else if (file === PRODUCTS_FILE) memoryCache.products = data;
  else if (file === ORDERS_FILE) memoryCache.orders = data;
  
  // Asynchronous write to avoid event loop blocking
  fs.promises.writeFile(file, JSON.stringify(data, null, 2)).catch(err => console.error("Write error on", file, ":", err));
};


/* ---------- AUTH: REGISTER + LOGIN ---------- */

// POST /register  {username,password,role,contactNumber,location}
app.post("/register", (req, res) => {
  const { username, password, role, contactNumber, location } = req.body;

  if (!username || !password || !role || !contactNumber || !location)
    return res.status(400).json({ message: "All fields required" });

  const users = readJson(USERS_FILE);
  if (users.find(u => u.username === username))
    return res.status(400).json({ message: "Username already exists" });

  users.push({ username, password, role, contactNumber, location });
  writeJson(USERS_FILE, users);

  res.json({ message: "Registered successfully" });
});

// POST /login  {username,password,role}
app.post("/login", (req, res) => {
  const { username, password, role } = req.body;
  const users = readJson(USERS_FILE);
  const user = users.find(
    u => u.username === username && u.password === password && u.role === role
  );
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  // also send contactNumber and location to frontend
  res.json({
    message: "Login success",
    user: {
      username: user.username,
      role: user.role,
      contactNumber: user.contactNumber || "",
      location: user.location || ""
    }
  });
});

/* ---------- PRODUCTS ---------- */

app.get("/products", (req, res) => {
  res.json(readJson(PRODUCTS_FILE));
});

// Add product (farmerUsername comes from frontend)
app.post("/addProduct", (req, res) => {
  const product = { ...req.body, id: Date.now(), createdAt: new Date().toISOString() };

  if (!product.name || !product.price || !product.qty || !product.location || !product.farmerUsername) {
    return res.status(400).json({ message: "Fill all details (including farmer & location)" });
  }

  const products = readJson(PRODUCTS_FILE);
  products.push(product);
  writeJson(PRODUCTS_FILE, products);

  res.json({ message: "Product added successfully!" });
});

// Update product (edit)
app.post("/updateProduct", (req, res) => {
  const updated = req.body;
  let products = readJson(PRODUCTS_FILE);
  const index = products.findIndex(p => p.id === updated.id);

  if (index === -1) return res.status(404).json({ message: "Product not found" });

  products[index] = { ...products[index], ...updated };
  writeJson(PRODUCTS_FILE, products);

  res.json({ message: "Product updated successfully!" });
});

// Delete product
app.post("/deleteProduct", (req, res) => {
  const { id } = req.body;
  let products = readJson(PRODUCTS_FILE);
  products = products.filter(p => p.id !== id);
  writeJson(PRODUCTS_FILE, products);

  res.json({ message: "Deleted successfully!" });
});

/* ---------- ORDERS ---------- */

app.get("/orders", (req, res) => {
  res.json(readJson(ORDERS_FILE));
});

// Place Order + Reduce Quantity
app.post("/orders", (req, res) => {
  const {
    productId, qty, price, buyerName, buyerContact, productName, farmerUsername,
    paymentStatus, transactionId, address, deliveryLocation
  } = req.body;

  let products = readJson(PRODUCTS_FILE);
  const product = products.find(p => p.id === productId);

  if (!product) return res.status(404).json({ message: "Product not found" });

  const orderQty = parseFloat(qty);
  if (orderQty > parseFloat(product.qty)) {
    return res.status(400).json({ message: "Stock unavailable" });
  }

  product.qty = parseFloat(product.qty) - orderQty;
  writeJson(PRODUCTS_FILE, products);

  const orders = readJson(ORDERS_FILE);

  orders.push({
    id: Date.now(),
    productId,
    productName,
    qty,
    price,
    buyerName,
    buyerContact,
    address: address || "",
    deliveryLocation: deliveryLocation || "",
    farmerUsername: farmerUsername || product.farmerUsername,
    createdAt: new Date().toISOString(),
    status: paymentStatus === "completed" ? "placed" : "pending",
    paymentStatus: paymentStatus || "unpaid",
    transactionId: transactionId || null
  });

  writeJson(ORDERS_FILE, orders);

  res.json({ message: "Order placed!", remainingQty: product.qty, orderId: orders[orders.length - 1].id });
});

// Update order status  {id,status}
app.post("/updateOrderStatus", (req, res) => {
  const { id, status } = req.body;

  let orders = readJson(ORDERS_FILE);
  const index = orders.findIndex(o => o.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Order not found" });
  }

  orders[index].status = status;
  writeJson(ORDERS_FILE, orders);

  res.json({ message: "Order status updated", order: orders[index] });
});

/* ---------- PAYMENT ---------- */

// POST /process-payment  {cardNumber, expiry, cvv, amount}
app.post("/process-payment", (req, res) => {
  const { cardNumber, expiry, cvv, amount } = req.body;

  if (!cardNumber || !expiry || !cvv || !amount) {
    return res.status(400).json({ success: false, message: "Missing payment details" });
  }

  // Simulate a delay (network latency)
  setTimeout(() => {
    // Basic simulation: failure if card number ends in '0000'
    if (cardNumber.endsWith("0000")) {
      return res.status(402).json({
        success: false,
        message: "Payment declined by bank. Please try another card."
      });
    }

    res.json({
      success: true,
      message: "Payment authorized successfully",
      transactionId: "TXN-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5).toUpperCase(),
      amount,
      status: "completed"
    });
  }, 1500);
});

/* ---------- FERTILIZER RECOMMENDATION ---------- */

app.post("/suggest-fertilizer", (req, res) => {
  const { cropType, soilType, phLevel, waterType, cropAge } = req.body;

  if (!cropType || !soilType || !phLevel || !waterType || !cropAge) {
    return res.status(400).json({ message: "Please provide all details for analysis" });
  }

  const ph = parseFloat(phLevel);
  const age = parseFloat(cropAge);

  let recommendation = {
    fertilizer: "General NPK (20-10-10)",
    quantity: "40 kg/acre",
    frequency: "Once every 3 weeks",
    tips: "Maintain consistent soil moisture."
  };

  // Rule-based logic
  if (cropType.toLowerCase() === 'rice') {
    if (ph < 6.0) {
      recommendation = {
        fertilizer: "Lime + Urea + MOP",
        quantity: "50 kg/acre",
        frequency: "3 split applications",
        tips: "Apply lime 2 weeks before sowing to balance pH."
      };
    } else {
      recommendation = {
        fertilizer: "DAP + Urea",
        quantity: "45 kg/acre",
        frequency: "At tillering stage",
        tips: "Ensure proper drainage during flowering."
      };
    }
  } else if (cropType.toLowerCase() === 'wheat') {
    recommendation = {
      fertilizer: "Can (Calcium Ammonium Nitrate) + SSP",
      quantity: "35 kg/acre",
      frequency: "At first irrigation",
      tips: "Monitor for yellowing of leaves."
    };
  } else if (soilType.toLowerCase() === 'sandy') {
    recommendation.fertilizer = "Organic Compost + Slow-release NPK";
    recommendation.quantity = "60 kg/acre";
    recommendation.tips = "Sandy soil leaches nutrients quickly; use slow-release options.";
  }

  if (age > 60) {
    recommendation.tips += " Reduce nitrogen, focus on potassium for fruit/grain development.";
  }

  res.json(recommendation);
});

/* ---------- CROP DISEASE ANALYSIS (OLLAMA AI) ---------- */

app.post("/analyze-disease", (req, res) => {
  const { cropType, soilType, waterType, remarks, imageBase64 } = req.body;

  if (!cropType || !soilType || !waterType || !remarks) {
    return res.status(400).json({ message: "Please fill all details for analysis" });
  }

  const prompt = `
    You are an expert agricultural scientist. 
    Analyze these crop details (and image if provided) and provide a diagnosis in JSON format.
    
    Details:
    Crop: ${cropType}
    Soil: ${soilType}
    Water: ${waterType}
    Symptoms: ${remarks}

    Required JSON keys:
    "diseaseName": (string) The specific name of the disease or pest.
    "reason": (string) Why this happened (e.g., humidity, soil deficiency).
    "remedy": (string) Clear steps to fix the issue.
    "medicine": (string) Specific chemicals or organic treatments.
  `;

  const payload = {
    model: "phi3",
    prompt: prompt,
    stream: false,
    format: "json"
  };

  if (imageBase64) {
    // Ollama expects an array of base64 strings (without the data:image/jpeg;base64, prefix)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    payload.images = [base64Data];
  }

  const ollamaData = JSON.stringify(payload);

  const options = {
    hostname: 'localhost',
    port: 11434,
    path: '/api/generate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(ollamaData)
    }
  };

  const reqOllama = http.request(options, (resOllama) => {
    let rawData = '';
    resOllama.on('data', (chunk) => rawData += chunk);
    resOllama.on('end', () => {
      if (resOllama.statusCode !== 200) {
        return res.status(resOllama.statusCode).json({
          message: `Ollama returned an error (${resOllama.statusCode}). Check if the model 'llama3' is installed.`,
          raw: rawData
        });
      }

      try {
        const parsedData = JSON.parse(rawData);
        let aiResponseText = parsedData.response || "";

        try {
          // With format: "json", aiResponseText should be a valid JSON string
          const jsonResponse = JSON.parse(aiResponseText);

          // Ensure keys match what we expect (even if AI case differs slightly)
          const finalResponse = {
            diseaseName: jsonResponse.diseaseName || jsonResponse.disease_name || "Unknown Disease",
            reason: jsonResponse.reason || "N/A",
            remedy: jsonResponse.remedy || "Consult a local expert.",
            medicine: jsonResponse.medicine || jsonResponse.medication || "N/A"
          };

          res.json(finalResponse);
        } catch (parseErr) {
          // Fallback if somehow not valid JSON despite the flag
          const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            res.json(JSON.parse(jsonMatch[0]));
          } else {
            res.json({
              diseaseName: "Diagnosis Pending",
              reason: "The AI response was not in the expected format.",
              remedy: aiResponseText || "Please try again with more specific symptoms.",
              medicine: "N/A"
            });
          }
        }
      } catch (e) {
        res.status(500).json({ message: "Error parsing raw data from Ollama.", error: e.message });
      }
    });
  });

  reqOllama.on('error', (e) => {
    res.status(500).json({ message: "AI Model (Ollama) not responding. Check if it's running on port 11434.", error: e.message });
  });

  reqOllama.write(ollamaData);
  reqOllama.end();
});



/* ---------- AI PRICE SUGGESTION ---------- */

app.get("/predictPrice", (req, res) => {
  const name = (req.query.name || "").trim().toLowerCase();
  const location = (req.query.location || "").trim().toLowerCase();
  const products = readJson(PRODUCTS_FILE);

  // 1. Try local average
  const localMatches = products.filter(
    p => p.name.toLowerCase() === name && p.location.toLowerCase() === location
  );

  if (localMatches.length > 0) {
    const prices = localMatches.map(p => parseFloat(p.price));
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return res.json({
      suggestedPrice: Number(avg.toFixed(2)),
      sampleCount: prices.length,
      reason: "Local Average"
    });
  }

  // 2. Fallback to market average
  const marketMatches = products.filter(
    p => p.name.toLowerCase() === name
  );

  if (marketMatches.length > 0) {
    const prices = marketMatches.map(p => parseFloat(p.price));
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return res.json({
      suggestedPrice: Number(avg.toFixed(2)),
      sampleCount: prices.length,
      reason: "Market Average"
    });
  }

  res.json({ suggestedPrice: null, reason: "No data available" });
});

const DEFAULT_PORT = process.env.PORT || 5000;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log("========================================");
    console.log(" AgroSmart Server Started");
    console.log(" URL: http://localhost:" + port);
    console.log(" Time: " + new Date().toLocaleString());
    console.log(" Node: " + process.version);
    console.log(" PID:  " + process.pid);
    console.log("========================================");
  });

  server.on("error", (error) => {
    if (error.syscall !== "listen") throw error;
    if (error.code === "EADDRINUSE") {
      console.log(`Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("FATAL: Server error:", error);
      process.exit(1);
    }
  });
};

startServer(parseInt(DEFAULT_PORT));
