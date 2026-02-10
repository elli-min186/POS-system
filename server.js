const express = require("express");
const bodyParser = require("body-parser")
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
