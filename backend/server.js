const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Products = require("./models/Products");
const Invoice = require("./models/Invoice");

const app = express();
const PORT = 8080;

const DATABASE_HOST = "localhost";
const DATABASE_PORT = 27017;
const DATABASE_NAME = "pos-system";

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const dbURL = `mongodb://${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`;
mongoose.connect(dbURL);

const db = mongoose.connection;

db.on("error", function (e) {
  console.log("Error connecting to database: " + e);
});

db.on("open", async function () {
  console.log("Database connected!");
  await seedProducts();
  await seedInvoices();
});

// File used for initial seed
const PRODUCT_DATA_FILE = path.join(__dirname, "data", "products.json");
const INVOICES_DATA_FILE = path.join(__dirname, "data", "invoices.json");

// Read products.json
const readProductData = () => {
  try {
    if (!fs.existsSync(PRODUCT_DATA_FILE)) return [];
    const data = fs.readFileSync(PRODUCT_DATA_FILE, "utf8");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading file:", err);
    return [];
  }
};

// Read invoices.json
const readInvoicesData = () => {
  try {
    if (!fs.existsSync(INVOICES_DATA_FILE)) return [];
    const data = fs.readFileSync(INVOICES_DATA_FILE, "utf8");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading file:", err);
    return [];
  }
};

// Seed MongoDB from products.json
async function seedProducts() {
  try {
    const existingProducts = await Products.countDocuments();

    if (existingProducts === 0) {
      const products = readProductData();

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

async function seedInvoices() {
  try {
    const existingInvoices = await Invoice.countDocuments();

    if (existingInvoices === 0) {
      const invoices = readInvoicesData();

      if (invoices.length > 0) {
        await Invoice.insertMany(invoices);
        console.log("Invoices inserted into MongoDB");
      }
    } else {
      console.log("Invoices already exist in MongoDB");
    }
  } catch (error) {
    console.error("Error seeding invoices:", error);
  }
}

app.get("/", (req, res) => {
  res.send("POS Backend Running");
});

// REST Api

// READ ALL ITEMS
app.get("/api/items", async (req, res) => {
  try {
    const items = await Products.find().sort({ product_id: 1 });
    res.status(200).json(items);
  } catch (error) {
    console.error("Read all error:", error);
    res.status(500).json({
      error: "Failed to fetch items",
    });
  }
});

// READ ONE ITEM BY product_id
app.get("/api/items/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    const item = await Products.findOne({ product_id: productId });

    if (!item) {
      return res.status(404).json({
        error: "Item not found",
      });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("Read one error:", error);
    res.status(500).json({
      error: "Invalid ID or database error",
    });
  }
});

// CREATE ITEM
app.post("/api/items", async (req, res) => {
  try {
    const userInput = req.body;

    if (!userInput.name || !userInput.price) {
      return res.status(400).json({
        error: "Name and Price are required",
      });
    }

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
    console.error("Create error:", error);
    res.status(400).json({
      error: "Failed to create item",
      details: error.message,
    });
  }
});

// UPDATE ITEM BY product_id
app.put("/api/items/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    const updatedItem = await Products.findOneAndUpdate(
      { product_id: productId },
      req.body,
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedItem) {
      return res.status(404).json({
        error: "Item not found",
      });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).json({
      error: "Failed to update item",
    });
  }
});

// DELETE ITEM BY product_id
app.delete("/api/items/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    const deletedItem = await Products.findOneAndDelete({
      product_id: productId,
    });

    if (!deletedItem) {
      return res.status(404).json({
        error: "Item not found",
      });
    }

    console.log(
      `Deleted Item: ${deletedItem.name} (ID: ${deletedItem.product_id})`,
    );

    res.status(200).json({
      message: "Item deleted",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      error: "Failed to delete item",
    });
  }
});

// CREATE INVOICE (Checkout)
app.post("/api/invoices", async (req, res) => {
  try {
    const { items, subtotal, tax, total, date } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: "Cannot create an invoice without items.",
      });
    }

    // Find last invoice
    const lastInvoice = await Invoice.findOne().sort({ invoice_id: -1 });
    const newId = lastInvoice && lastInvoice.invoice_id ? lastInvoice.invoice_id + 1 : 1001;

    const newInvoice = new Invoice({
      invoice_id: newId,
      items,
      subtotal: Number(Number(subtotal).toFixed(2)),
      tax: Number(Number(tax).toFixed(2)),
      total: Number(Number(total).toFixed(2)),
      date: date || new Date()
    });

    // Save to DB
    await newInvoice.save();
    console.log(`Invoice created successfully! Total: $${total}`);

    // Deduct inventory
    for (let item of items) {
      await Products.findOneAndUpdate(
        { product_id: item.product_id },
        { $inc: { stock_quantity: -item.quantity } },
      );
    }

    // 4. Send success response back to frontend
    res.status(201).json(newInvoice);
  } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({
      error: "Failed to create invoice",
      details: error.message,
    });
  }
});

// READ ALL INVOICES
app.get("/api/invoices", async (req, res) => {
  try {
    // newest invoices show up at the top of the list
    const invoices = await Invoice.find().sort({ date: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    console.error("Fetch invoices error:", error);
    res.status(500).json({
      error: "Failed to fetch invoices",
    });
  }
});

// Server Start

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
  console.log(`MongoDB URL: ${dbURL}`);
});
