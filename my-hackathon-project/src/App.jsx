import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./ui/components/Navbar";
import RegistrationForm from "./ui/components/RegistrationForm";
import LoginForm from "./ui/components/LoginForm"; // Assuming you have a LoginForm component
import Home from "./ui/components/Home"; // Assuming you have a Home component
import PaymentPage from "./ui/components/PaymentPage"; // Assuming you have a PaymentPage component
import ProtectedRoute from "./ui/components/ProtectedRoute"; // Assuming you have a ProtectedRoute component

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />
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
