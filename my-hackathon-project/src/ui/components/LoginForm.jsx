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
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    console.log("Logging in user:", email, password);
    setError(null);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg mx-auto bg-gray-900 p-8 rounded-lg shadow-md text-white"
      >
        <h2 className="text-3xl font-semibold mb-6 text-center text-white">
          Login
        </h2>
        {error && <Alert type="error" message={error} />}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white mb-4"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          required
          className="bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white mb-4"
        />
        <Button
          type="submit"
          variant="primary"
          className="w-full mt-4 bg-white text-black hover:bg-gray-200"
        >
          Login
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;