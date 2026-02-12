
const express = require("express");
const app = express();
const path = require("path");

const PORT = 8080;

app.use("/", express.static(path.join(__dirname, "/public"))); // use when anything request root
console.log("__dirname: " + __dirname);

app.get("/", (req, res) => {
  res.send("<h1>root route</h1>");
});

// starts server
app.listen(PORT, () => {
  console.log("Server started on port: " + PORT);
});

app.get("/earnings", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "earnings.html"));
});

// TEMP sales data for earnings page
app.get("/api/sales", (req, res) => {
  res.json([
    { item: "Keyboard", price: 50 },
    { item: "Mouse", price: 25 }
  ]);
});

app.listen(PORT, () => {
  console.log("Server started on port: " + PORT);
});