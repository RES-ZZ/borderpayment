// src/ui/components/LoginForm.jsx
import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import Alert from "./Alert";
import { auth } from "../../firebase"; // Import auth from your firebase.js file
import { signInWithEmailAndPassword } from "firebase/auth";
import Web3 from "web3";
const contractABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "publicKey",
        type: "bytes32",
      },
    ],
    name: "LogRegisterUser",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_publicKey",
        type: "bytes32",
      },
    ],
    name: "registerUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "message",
        type: "string",
      },
    ],
    name: "getMessageHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getPublicKey",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userPublicKeys",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_messageHash",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes",
      },
    ],
    name: "validateSignature",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "message",
        type: "string",
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes",
      },
    ],
    name: "validateSignatureWithMessage",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "verifyUser",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const contractAddress = "0x987904bE3875FD0034a257777a68D20C286F4801";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const validateSignatureOnChain = async () => {
    // First connect MetaMask if not connected
    if (!web3 || !account) {
      if (!window.ethereum || !window.ethereum.isMetaMask) {
        setError("Please install MetaMask!");
        return;
      }

      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);

        const contractInstance = new web3Instance.eth.Contract(
          contractABI,
          contractAddress
        );
        setContract(contractInstance);
      } catch (error) {
        console.error("MetaMask connection error:", error);
        setError("Failed to connect to MetaMask");
        return;
      }
    }

    try {
      const message = "Login Authentication";
      const messageHash = web3.utils.sha3(
        "\x19Ethereum Signed Message:\n" + message.length + message
      );
      console.log("Message Hash:", messageHash);

      const signature = await web3.eth.personal.sign(message, account, "");
      console.log("Signature:", signature);

      const isValid = await contract.methods
        .validateSignature(messageHash, signature)
        .call();

      if (isValid) {
        setSuccessMessage("Signature verified successfully!");
        console.log("Signature is valid!");
      } else {
        setError("Invalid signature!");
        console.log("Signature is invalid!");
      }
    } catch (error) {
      console.error("Error validating signature:", error.message);
      setError("Failed to validate signature: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      // Use Firebase to sign in the user
      await signInWithEmailAndPassword(auth, email, password);
      setError(null);
      alert("Login successful!");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-white
"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl w-1/2 shadow-lg border border-blue-100"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-600 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            className="mb-6 bg-red-50 border-red-200 text-red-600"
          />
        )}
        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            className="mb-6 bg-green-50 border-green-200 text-green-600"
          />
        )}

        <div className="space-y-6">
          <div>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400"
            />
          </div>

          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400"
            />
          </div>

          <div className="pt-6 border-t border-blue-100">
            <h3 className="text-xl font-semibold mb-4 text-center text-blue-600">
              Wallet Authentication
            </h3>

            <Button
              type="button"
              onClick={validateSignatureOnChain}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Validate Wallet
            </Button>

            {account && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 break-all">
                  <span className="font-medium">Connected Wallet:</span>
                  <br />
                  {account}
                </p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg mt-4"
          >
            Sign In
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
