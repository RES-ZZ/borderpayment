// src/ui/components/RegistrationForm.jsx
import { useState } from "react";
import Input from "./Input";
import Button from "./Button";

const RegistrationForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registering user:", email, password);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Register
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
            className="w-full"
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full py-2 text-lg"
          >
            Register
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
