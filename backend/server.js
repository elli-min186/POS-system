const express = require("express");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const path = require("path");
const fs = require("fs");
const Products = require("./models/Products");

const app = express();
const PORT = 8080;
const DATABASE_HOST = "localhost";
const DATABASE_PORT = 27017;
const DATABASE_NAME = "pos-system";

//Enable CORS for frontend requests
app.use(cors());
app.use(express.json());

//database connect
const dbURL = `mongodb://${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`;
mongoose.connect(dbURL);

const db = mongoose.connection;
db.on("error", function (e) {
  console.log("error connecting" + e);
});
db.on("open", async function () {
  console.log("database connected!");
  await seedProducts();
});

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

// --- Test function to load products.json into MongoDB on startup ---
async function seedProducts() {
  try {
    const existingProducts = await Products.countDocuments();

    if (existingProducts === 0) {
      const products = readData();

      if (products.length > 0) {
        await Products.insertMany(products);
        console.log("Products inserted into MongoDB");
      }
    } else {
      console.log("Products already exist in MongoDB");
    }

  } catch (error) {
    console.error("Error seeding products:", error);
  }
}

// --- Routes for frontend ---

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/home.html"));
});

// Earnings page
app.get("/earnings", (req, res) => {
  res.sendFile(path.join(__dirname, "views/earnings.html"));
});

// Inventory page
app.get("/inventory", (req, res) => {
  res.sendFile(path.join(__dirname, "views/inventory.html"));
});

// READ all items
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// READ one item by ID
app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json(item);

  } catch (error) {
    res.status(500).json({ error: "Invalid ID or database error" });
  }
});


// POST a new product
app.post("/api/items", async (req, res) => {
  try {
    const userInput = req.body;

    if (!userInput.name || !userInput.price) {
      return res.status(400).json({ error: "Name and Price are required" });
    }

    // auto increment logic for product_id
    // product_id: -1 for sort gets highest id first
    const lastProduct = await Products.findOne().sort({ product_id: -1 });
    const newId = lastProduct ? lastProduct.product_id + 1 : 1;

    const newItem = new Products({
      product_id: newId,
      ...userInput,
    });

    await newItem.save();
    
    console.log(`Added Item: ${newItem.name} (ID: ${newId})`);
    res.status(201).json(newItem);

  } catch (error) {
    res.status(400).json({ error: "Failed to create item", details: error.message });
  }
});

// DELETE a product by ID
app.delete("/api/items/:id", (req, res) => {
  const products = readData();

  const id = parseInt(req.params.id);

  const newProducts = products.filter((item) => item.product_id !== id);

  if (newProducts.length === products.length) {
    return res.status(404).json({ error: "Item not found" });
  }

  writeData(newProducts);

  console.log(`Deleted Item ID: ${id}`);

  res.status(200).json({ message: "Item deleted" });
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