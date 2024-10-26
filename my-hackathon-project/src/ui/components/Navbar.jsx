import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { Link } from "react-router-dom";
import SignOutButton from "./SignOutButton";
import { useContext, useEffect } from "react";
import { Web3Context } from "../../context/Web3Context";
import Web3 from "web3";
import { motion } from "framer-motion";

const NavBar = () => {
  const [user, loading] = useAuthState(auth);
  const { web3, setWeb3, account, setAccount } = useContext(Web3Context);

  const connectMetaMask = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
      } catch (error) {
        console.error("User denied account access", error);
      }
    } else {
      alert("MetaMask not detected. Please install MetaMask!");
    }
  };

  const shortenAddress = (addr) => {
    return addr
      ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
      : "";
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
    }
  }, [setAccount]);

  return (
    <div className="relative">
      {/* Starry Background */}
      <div className="absolute inset-0 mt-13 h-[80px] bg-[#1a0b2e] overflow-hidden stars-background">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

      <nav className="relative bg-gradient-to-r mt-16 from-purple-900/90 via-purple-800/90 to-purple-900/90 backdrop-blur-sm border-b border-purple-700/30">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center"
        >
          {/* Logo and Navigation */}
          <div className="flex mt-13 items-center space-x-6">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/"
                className="text-lg font-semibold text-purple-100 hover:text-white transition-colors"
              >
                Home
              </Link>
            </motion.div>
            {user && (
              <>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link
                    to="/payments"
                    className="text-lg font-semibold text-purple-100 hover:text-white transition-colors"
                  >
                    Payments
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link
                    to="/history"
                    className="text-lg font-semibold text-purple-100 hover:text-white transition-colors"
                  >
                    Transaction History
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* MetaMask Connection */}
            {web3 && account ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 py-2 bg-purple-800/50 rounded-lg border border-purple-600/30"
              >
                <span className="text-purple-100">
                  {shortenAddress(account)}
                </span>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={connectMetaMask}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Connect Wallet
              </motion.button>
            )}

            {/* Auth Status */}
            {loading ? (
              <div className="text-purple-100 animate-pulse">Loading...</div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-purple-100">{user.email}</span>
                <SignOutButton />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    Register
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </nav>
    </div>
  );
};

export default NavBar;
