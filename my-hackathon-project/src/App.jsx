import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegistrationForm from "./ui/components/RegistrationForm";
import LoginForm from "./ui/components/LoginForm";
import Home from "./ui/components/Home";
import Navbar from "./ui/components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
