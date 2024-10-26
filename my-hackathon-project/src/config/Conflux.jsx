// src/hooks/useConflux.js
import { useState, useEffect } from "react";

const useConflux = () => {
  const [cfxRate, setCfxRate] = useState(null);
  const [network, setNetwork] = useState(null);
  const [error, setError] = useState(null);

  // Fetch current CFX to INR rate
  useEffect(() => {
    const fetchCFXRate = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=conflux-token&vs_currencies=inr"
        );
        const data = await response.json();
        setCfxRate(data["conflux-token"].inr);
      } catch (error) {
        console.error("Error fetching CFX rate:", error);
        setError("Failed to fetch current exchange rate");
      }
    };
    fetchCFXRate();
  }, []);

  // Function to switch to Conflux Testnet
  const switchToConfluxTestnet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      await window.ethereum
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x47" }],
        })
        .catch(async (switchError) => {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x47",
                  chainName: "Conflux eSpace Testnet",
                  nativeCurrency: {
                    name: "Conflux",
                    symbol: "CFX",
                    decimals: 18,
                  },
                  rpcUrls: ["https://evmtestnet.confluxrpc.com"],
                  blockExplorerUrls: ["https://evmtestnet.confluxscan.io"],
                },
              ],
            });
          } else {
            throw switchError;
          }
        });
    } catch (error) {
      console.error("Error switching network:", error);
      setError(error.message || "Failed to switch network");
      throw error; // Re-throw to handle in the calling function
    }
  };

  // Check current network on mount and listen for changes
  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        try {
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          setNetwork(chainId);

          if (chainId !== "0x47") {
            // If not on Conflux Testnet
            setError("Please switch to Conflux Testnet");
          }
        } catch (error) {
          console.error("Error checking network:", error);
        }
      }
    };

    checkNetwork();

    // Listen for network changes
    const handleChainChanged = (chainId) => {
      setNetwork(chainId);
      if (chainId !== "0x47") {
        setError("Please switch to Conflux Testnet");
      } else {
        setError(null);
      }
    };

    if (window.ethereum) {
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    // Cleanup listener on unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  return { cfxRate, network, error, switchToConfluxTestnet };
};

export default useConflux;
