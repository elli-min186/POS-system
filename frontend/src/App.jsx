import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Earnings from "./pages/Earnings";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Login from "./pages/Login";


function App() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={isLoggedIn ? <Home /> : <Navigate to="/login" />}
        />
        {/* Login */}
        <Route
          path="/login"
          element={!isLoggedIn ? <Login /> : <Navigate to="/" />}
        />
        {/* Protected routes */}
        <Route
          path="/inventory"
          element={isLoggedIn ? <Inventory /> : <Navigate to="/login" />}
        />
        <Route
          path="/invoices"
          element={isLoggedIn ? <Invoices /> : <Navigate to="/login" />}
        />
        <Route
          path="/earnings"
          element={isLoggedIn ? <Earnings /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;