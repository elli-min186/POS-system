const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const DATA_FILE = path.join(__dirname, "data", "products.json");

const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.log("File not found, returning empty list.");
      return [];
    }
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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/home.html"));
});

// GET
app.get("/api/items", (req, res) => {
  const products = readData();
  res.json(products);
});

// POST
app.post("/api/items", (req, res) => {
  const products = readData();
  const userInput = req.body;

  // form validation
  if (!userInput.name || !userInput.price) {
    return res.status(400).json({ error: "Name and Price are required" });
  }

  // auto generate id: last id + 1
  let newId = 1;
  if (products.length > 0) {
    const lastItem = products[products.length - 1];
    newId = lastItem.product_id + 1;
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

// start server
app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
  console.log(`__dirname: ${__dirname}`);
  console.log(`Looking for data at: ${DATA_FILE}`);
});
