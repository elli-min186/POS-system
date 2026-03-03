const mongoose = require("mongoose");

const ProductsSchema = new mongoose.Schema({
  product_id: {
    type: Number,
    required: true,
    unique: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: false
  },
  brand: {
    type: String,
    required: true,
    unique: false
  },
  category: {
    type: String,
    required: true,
    unique: false
  },
  storage: {
    type: String,
    required: false,
    unique: false
  },
  color: {
    type: String,
    required: true,
    unique: false
  },
  price: {
    type: Number,
    required: true,
    unique: false
  },
  stock_quantity: {
    type: Number,
    required: true,
    unique: false
  },
  description: {
    type: String,
    required: false,
    unique: false
  },
});

const Products = mongoose.model("products", ProductsSchema);
module.exports = Products;
