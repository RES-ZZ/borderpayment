import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegistrationForm from "./ui/components/RegistrationForm";
import LoginForm from "./ui/components/LoginForm";
import Home from "./ui/components/Home";
import NavBar from "./ui/components/Navbar";
import ProtectedRoute from "./ui/components/ProtectedRoute";
import PaymentPage from "./ui/components/PaymentPage";
function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/" element={<Home />} />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
