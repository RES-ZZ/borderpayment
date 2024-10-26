// src/ui/components/RegistrationForm.jsx
import { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import Alert from "./Alert"; // Assuming you have an Alert component for displaying errors
import { auth, db } from "../../firebase"; // Import auth from your firebase.js file
import { createUserWithEmailAndPassword } from "firebase/auth";
import Web3 from "web3"; // Ensure Web3 is imported
import elliptic from "elliptic";
import { useNavigate } from "react-router-dom";

import { doc, setDoc } from "firebase/firestore"; // Add this

// ABI and contract address for the deployed contract
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
const contractAddress = "0x987904bE3875FD0034a257777a68D20C286F4801"; // Replace with actual contract address

// Elliptic curve for key generation
const EC = elliptic.ec;
const ec = new EC("secp256k1"); // Same curve used by Ethereum

const RegistrationForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null); // MetaMask account (public key)
  const [contract, setContract] = useState(null); // Smart contract instance
  const [publicKeyX, setPublicKeyX] = useState(""); // X-coordinate of the public key (32 bytes)
  const [privateKey, setPrivateKey] = useState(""); // Generated private key
  const [web3, setWeb3] = useState(null); // Web3 instance
  const navigate = useNavigate(); // Add this
  const [isRegistering, setIsRegistering] = useState(false);

  // Connect to MetaMask and initialize Web3
  const connectMetaMask = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3Instance = new Web3(window.ethereum); // Initialize Web3 instance
        setWeb3(web3Instance); // Set the Web3 instance to state

        // Get MetaMask accounts and set account (Ethereum address)
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]); // Set the MetaMask account

        // Load the contract instance
        const contractInstance = new web3Instance.eth.Contract(
          contractABI,
          contractAddress
        );
        setContract(contractInstance);

        console.log("Connected MetaMask Account:", accounts[0]);
        console.log("Contract loaded:", contractInstance);
      } catch (error) {
        console.error("User denied account access", error);
      }
    } else {
      alert("MetaMask not detected. Please install MetaMask!");
    }
  };

  // Generate a new public/private key pair and get the X-coordinate of the public key
  const generateKeyPair = () => {
    const keyPair = ec.genKeyPair(); // Generate new key pair

    // Get the X-coordinate of the public key (32 bytes)
    const pubKeyX = keyPair.getPublic().getX().toString(16).padStart(64, "0"); // Ensure 32 bytes (64 hex characters)

    setPublicKeyX(pubKeyX); // Store the X-coordinate of the public key
    setPrivateKey(keyPair.getPrivate("hex")); // Store the private key

    console.log("32-byte Public Key (X-coordinate): 0x" + pubKeyX);
    console.log("Private Key:", keyPair.getPrivate("hex"));
  };

  // Register the 32-byte public key on-chain
  const registerPublicKeyOnChain = async () => {
    if (contract && publicKeyX && web3) {
      try {
        console.log(
          "Registering 32-byte Public Key (X-coordinate):",
          publicKeyX
        );

        // Convert the hex public key to bytes32 format
        const publicKeyBytes32 = "0x" + publicKeyX.padStart(64, "0"); // Ensure it's 32 bytes (64 hex chars)

        console.log("Public Key (Bytes32):", publicKeyBytes32);

        // Register the public key on-chain (in bytes32 format)
        await contract.methods.registerUser(publicKeyBytes32).send({
          from: account,
          gas: 300000,
          gasPrice: await web3.eth.getGasPrice(),
        });

        alert("Public key registered successfully on-chain!");
      } catch (error) {
        console.error("Error registering public key on-chain:", error.message);
      }
    } else {
      alert(
        "Contract or public key not loaded. Please ensure MetaMask is connected."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !publicKeyX) {
      setError("Please fill in all fields and generate a public key first.");
      return;
    }

    setIsRegistering(true);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2. Store user data and public key in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        publicKey: "0x" + publicKeyX,
        walletAddress: account,
        // privateKey: privateKey, // Be careful with storing private keys!
        createdAt: new Date().toISOString(),
      });

      setError(null);
      alert("Registration successful!");

      // 3. Navigate to payments page
      navigate("/payments"); // Update this to your actual payments route
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl transform transition-all duration-300 hover:shadow-2xl">
        {/* Header with animation */}
        <div className="text-center mb-8 transform transition-all duration-300 hover:scale-105">
          <h2 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Register
          </h2>
          <p className="text-gray-600">Create your secure account</p>
        </div>

        {error && (
          <Alert type="error" message={error} className="mb-6 animate-fadeIn" />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input fields with hover effect */}
          <div className="transform transition-all duration-200 hover:translate-x-1">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full focus:ring-2 focus:ring-blue-500 rounded-lg transition-all duration-200"
            />
          </div>

          <div className="transform transition-all duration-200 hover:translate-x-1">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              className="w-full focus:ring-2 focus:ring-blue-500 rounded-lg transition-all duration-200"
            />
          </div>

          {/* Generate Key Pair Button */}
          <Button
            type="button"
            onClick={async () => {
              await connectMetaMask();
              generateKeyPair();
            }}
            className="w-full py-2.5 text-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Key Pair
          </Button>

          {/* Animated Public Key Display */}
          {publicKeyX && (
            <div className="mt-4 bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-blue-100 animate-fadeIn transform transition-all duration-200 hover:shadow-md">
              <p className="text-indigo-600">
                <strong className="text-indigo-700">
                  Public Key (X-coordinate):
                </strong>
                <br />
                <span className="font-mono break-all text-sm">
                  0x{publicKeyX}
                </span>
              </p>
            </div>
          )}

          {/* Register Public Key Button */}
          <Button
            type="button"
            onClick={registerPublicKeyOnChain}
            disabled={!publicKeyX || !web3 || !account}
            className="w-full py-2.5 text-lg bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Register Public Key
          </Button>

          {/* Complete Registration Button */}
          <Button
            type="submit"
            disabled={isRegistering || !publicKeyX || !account}
            className="w-full py-2.5 text-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegistering ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Registering...
              </span>
            ) : (
              "Complete Registration"
            )}
          </Button>
        </form>

        {/* Sign In Link with hover effect */}
        <div className="mt-8 text-center text-gray-600 transform transition-all duration-200 hover:scale-105">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 border-b border-blue-600 hover:border-blue-500"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
