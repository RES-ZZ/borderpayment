// src/ui/components/RegistrationForm.jsx
import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import Alert from "./Alert"; // Assuming you have an Alert component for displaying errors
import { auth } from "../../firebase"; // Import auth from your firebase.js file
import { createUserWithEmailAndPassword } from "firebase/auth";

const RegistrationForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      // Use Firebase to register the user
      await createUserWithEmailAndPassword(auth, email, password);
      setError(null);
      alert("Registration successful! You can now log in.");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Register
        </h2>
        {error && <Alert type="error" message={error} />}
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
