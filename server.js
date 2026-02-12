const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const DATA_FILE = path.join(__dirname, "data", "products.json");

// --- Helper functions ---
const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading file:", err);
    return [];
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing file:", err);
  }
};

// --- Routes ---

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/home.html"));
});

// Earnings page
app.get("/earnings", (req, res) => {
  res.sendFile(path.join(__dirname, "views/earnings.html"));
});

// GET all products
app.get("/api/items", (req, res) => {
  const products = readData();
  res.json(products);
});

// POST a new product
app.post("/api/items", (req, res) => {
  const products = readData();
  const userInput = req.body;

  if (!userInput.name || !userInput.price) {
    return res.status(400).json({ error: "Name and Price are required" });
  }

  let newId = 1;
  if (products.length > 0) {
    newId = products[products.length - 1].product_id + 1;
  }

  const newItem = {
    product_id: newId,
    ...userInput,
  };

  products.push(newItem);
  writeData(products);

  console.log(`Added Item: ${newItem.name} (ID: ${newId})`);
  res.status(201).json(newItem);
});

// --- GET sales for earnings page ---
app.get("/api/sales", (req, res) => {
  const products = readData();

  // Generate random quantity sold for testing
  const sales = products.map((p) => {
    const quantity = Math.floor(Math.random() * 21); // 0-20
    return {
      item: p.name,
      price: p.price,
      quantity,
      total: +(p.price * quantity).toFixed(2),
    };
  });

  res.json(sales);
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
  console.log(`__dirname: ${__dirname}`);
  console.log(`Looking for data at: ${DATA_FILE}`);
});
