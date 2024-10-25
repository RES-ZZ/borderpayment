// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import EnhancedRegistrationForm from "./ui/components/EnhancedRegistrationForm";
import LoginForm from "./ui/components/LoginForm";
import Home from "./ui/components/Home";

function App() {
  return (
    <Router>
      <nav className="bg-gray-800 p-4">
        <Link to="/register" className="text-white mr-4">
          Register
        </Link>
        <Link to="/login" className="text-white">
          Login
        </Link>
      </nav>
      <Routes>
        <Route path="/register" element={<EnhancedRegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
