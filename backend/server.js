const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Products = require("./models/Products");
const Invoice = require("./models/Invoice");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");
const User = require("./models/User");


const app = express();
const server = http.createServer(app);
const PORT = 8080;
const JWT_SECRET = "cps630_pos_secret_key";

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const DATABASE_HOST = "localhost";
const DATABASE_PORT = 27017;
const DATABASE_NAME = "pos-system";

// Middleware
app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

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
  await seedUsers();
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

async function seedUsers() {
  try {
    const existingUsers = await User.countDocuments();

    if (existingUsers === 0) {
      const users = [
        {
          username: "worker1",
          password: await bcrypt.hash("123456", 10),
          role: "worker",
        },
        {
          username: "manager1",
          password: await bcrypt.hash("123456", 10),
          role: "manager",
        },
        {
          username: "owner1",
          password: await bcrypt.hash("123456", 10),
          role: "owner",
        },
      ];

      await User.insertMany(users);
      console.log("Default users created");
    } else {
      console.log("Users already exist");
    }
  } catch (error) {
    console.error("Error seeding users:", error);
  }
}

app.get("/", (req, res) => {
  res.send("POS Backend Running");
});

// REST Api

app.post("/api/register", authMiddleware, requireRoles("owner"), async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        error: "Username, password, and role are required.",
      });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({
        error: "Username already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      error: "Failed to register user.",
    });
  }
});

// GET ALL USERS
app.get("/api/users", authMiddleware, requireRoles("owner"), async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// UPDATE USER PASSWORD
app.put("/api/users/:id", authMiddleware, requireRoles("owner"), async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(req.params.id, {
      password: hashedPassword
    });

    res.status(200).json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE USER
app.delete("/api/users/:id", authMiddleware, requireRoles("owner"), async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userToDelete.role === "owner") {
      return res.status(403).json({ error: "Cannot delete owner account" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required.",
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        error: "Invalid username or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid username or password.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Failed to login.",
    });
  }
});



function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Access denied. No token provided.",
    });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token.",
    });
  }
}

function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden. You do not have access.",
      });
    }

    next();
  };
}

app.get("/api/me", authMiddleware, async (req, res) => {
  res.status(200).json({
    user: req.user,
  });
});

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
app.post("/api/items", authMiddleware, requireRoles("manager", "owner"), async (req, res) => {
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

    io.emit("inventoryUpdated", {
      message: "Inventory has been updated.",
    });

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
app.put("/api/items/:id", authMiddleware, requireRoles("manager", "owner"), async (req, res) => {  try {
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

    io.emit("inventoryUpdated", {
      message: "Inventory has been updated.",
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).json({
      error: "Failed to update item",
    });
  }
});

// DELETE ITEM BY product_id
app.delete("/api/items/:id", authMiddleware, requireRoles("manager", "owner"), async (req, res) => {  try {
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

    io.emit("inventoryUpdated", {
      message: "Inventory has been updated.",
    });

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
app.post("/api/invoices", authMiddleware, requireRoles("worker", "manager", "owner"), async (req, res) => {  try {
    const { items, subtotal, tax, total, date } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: "Cannot create an invoice without items.",
      });
    }

    // Find last invoice
    const lastInvoice = await Invoice.findOne().sort({ invoice_id: -1 });
    const newId =
      lastInvoice && lastInvoice.invoice_id ? lastInvoice.invoice_id + 1 : 1001;

    const newInvoice = new Invoice({
      invoice_id: newId,
      items,
      subtotal: Number(Number(subtotal).toFixed(2)),
      tax: Number(Number(tax).toFixed(2)),
      total: Number(Number(total).toFixed(2)),
      date: date || new Date(),
    });

    // Deduct inventory safely
    for (let item of items) {
      const product = await Products.findOne({ product_id: item.product_id });

      if (!product) {
        return res.status(404).json({
          error: "Product not found",
        });
      }

      if (item.quantity > product.stock_quantity) {
        return res.status(400).json({
          error: `${product.name} does not have enough stock`,
        });
      }
    }

    // Only if valid then update
    for (let item of items) {
      await Products.updateOne(
        { product_id: item.product_id },
        { $inc: { stock_quantity: -item.quantity } }
      );
    }

    // Save to DB
    await newInvoice.save();
    io.emit("checkoutCompleted", {
      message: "A new checkout was completed.",
      invoiceId: newInvoice.invoice_id,
    });

    io.emit("inventoryUpdated", {
      message: "Inventory changed after checkout.",
    });

    console.log(`Invoice created successfully! Total: $${total}`);

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
app.get("/api/invoices", authMiddleware, requireRoles("manager", "owner"), async (req, res) => {
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

// Process a refund for an invoice
app.post("/api/invoices/:id/refund", authMiddleware, requireRoles("manager", "owner"), async (req, res) => {  // Convert URL param to a Number to match your invoice_id schema
  const invoiceId = Number(req.params.id);
  const { itemsToRefund } = req.body;

  try {
    // 1. Fetch the invoice first
    const invoice = await Invoice.findOne({ invoice_id: invoiceId });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // 2. Loop through the refund request and update the items array in memory
    for (const refundItem of itemsToRefund) {
      const targetId = Number(refundItem.id);
      const refundQty = Number(refundItem.qty);

      // Find the item in the invoice array
      const itemIndex = invoice.items.findIndex(
        (item) => Number(item.product_id) === targetId,
      );

      if (itemIndex > -1) {
        // Ensure we are adding to the existing refunded amount
        const currentRefunded = Number(
          invoice.items[itemIndex].refunded_quantity || 0,
        );
        const maxAllowed = Number(invoice.items[itemIndex].quantity);

        // Safety check: Don't allow refunding more than was bought
        const newRefundTotal = Math.min(
          currentRefunded + refundQty,
          maxAllowed,
        );

        invoice.items[itemIndex].refunded_quantity = newRefundTotal;

        // Update Product Stock
        await Products.updateOne(
          { product_id: targetId },
          { $inc: { stock_quantity: refundQty } },
        );
      }
    }

    // 3. IMPORTANT: Force Mongoose to see the change in the Mixed Array
    invoice.markModified("items");

    // 4. Recalculate the overall status
    let totalBought = 0;
    let totalRefunded = 0;

    invoice.items.forEach((item) => {
      totalBought += item.quantity;
      totalRefunded += item.refunded_quantity || 0;
    });

    if (totalRefunded >= totalBought) {
      invoice.status = "Fully Refunded";
    } else if (totalRefunded > 0) {
      invoice.status = "Partially Refunded";
    }

    // 5. Save everything to the database
    await invoice.save();
    io.emit("refundProcessed", {
      message: "A refund was processed.",
      invoiceId: invoice.invoice_id,
    });

    io.emit("inventoryUpdated", {
      message: "Inventory changed after refund.",
    });

    // 6. Send the updated invoice back to the frontend
    res.status(200).json({
      message: "Refund processed successfully",
      invoice: invoice,
    });
  } catch (error) {
    console.error("Refund Error:", error);
    res.status(500).json({ error: "Failed to process refund." });
  }
});

// Server Start

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
  console.log(`MongoDB URL: ${dbURL}`);
});
