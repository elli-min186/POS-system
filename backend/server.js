const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Products = require("./models/Products");

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
});

// File used for initial seed
const DATA_FILE = path.join(__dirname, "data", "products.json");

// Read products.json
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


// Seed MongoDB from products.json
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



app.get("/", (req, res) => {
  res.send("POS Backend Running");
});


// REST Api


// READ ALL ITEMS
app.get("/api/items", async (req, res) => {

  try {

    const items = await Products.find();

    res.status(200).json(items);

  } catch (error) {

    res.status(500).json({
      error: "Failed to fetch items"
    });

  }

});


// READ ONE ITEM
app.get("/api/items/:id", async (req, res) => {

  try {

    const item = await Products.findById(req.params.id);

    if (!item) {

      return res.status(404).json({
        error: "Item not found"
      });

    }

    res.status(200).json(item);

  } catch (error) {

    res.status(500).json({
      error: "Invalid ID or database error"
    });

  }

});


// CREATE ITEM
app.post("/api/items", async (req, res) => {

  try {

    const userInput = req.body;

    if (!userInput.name || !userInput.price) {

      return res.status(400).json({
        error: "Name and Price are required"
      });

    }

    // auto increment product_id
    const lastProduct = await Products.findOne().sort({ product_id: -1 });

    const newId = lastProduct ? lastProduct.product_id + 1 : 1;

    const newItem = new Products({
      product_id: newId,
      ...userInput
    });

    await newItem.save();

    console.log(`Added Item: ${newItem.name} (ID: ${newId})`);

    res.status(201).json(newItem);

  } catch (error) {

    res.status(400).json({
      error: "Failed to create item",
      details: error.message
    });

  }

});


// UPDATE ITEM
app.put("/api/items/:id", async (req, res) => {

  try {

    const updatedItem = await Products.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedItem) {

      return res.status(404).json({
        error: "Item not found"
      });

    }

    res.status(200).json(updatedItem);

  } catch (error) {

    res.status(400).json({
      error: "Failed to update item"
    });

  }

});


// DELETE ITEM
app.delete("/api/items/:id", async (req, res) => {

  try {

    const deletedItem = await Products.findByIdAndDelete(req.params.id);

    if (!deletedItem) {

      return res.status(404).json({
        error: "Item not found"
      });

    }

    console.log(`Deleted Item: ${deletedItem.name}`);

    res.status(200).json({
      message: "Item deleted"
    });

  } catch (error) {

    res.status(500).json({
      error: "Failed to delete item"
    });

  }

});


// Server Start

app.listen(PORT, () => {

  console.log(`Server started on port: ${PORT}`);
  console.log(`MongoDB URL: ${dbURL}`);

});
