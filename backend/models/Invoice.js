const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  invoice_id: { 
    type: Number, 
    required: true 
  },
  items: { 
    type: Array, 
    required: true 
  }, 
  status: { 
    type: String, 
    default: "Paid" 
  },
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Invoice = mongoose.model("invoice", InvoiceSchema);
module.exports = Invoice;
