// src/ui/components/LoginForm.jsx
import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import Alert from "./Alert";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic (e.g., Firebase Authentication)
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    console.log("Logging in user:", email, password);
    setError(null);
    // Reset form
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
        {error && <Alert type="error" message={error} />}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          required
        />
        <Button type="submit" variant="primary" className="w-full mt-4">
          Login
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
