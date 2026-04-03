import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Earnings from "./pages/Earnings";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Login from "./pages/Login";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;