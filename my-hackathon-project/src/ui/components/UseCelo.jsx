// src/hooks/useCelo.js
import { useState, useEffect } from "react";

// Celo Alfajores Testnet Configuration
const celoAlfajores = {
  chainId: "0xa4ec", // 42220 in decimal
  chainName: "Celo Alfajores Testnet",
  nativeCurrency: {
    name: "Celo",
    symbol: "CELO",
    decimals: 18,
  },
  rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
  blockExplorerUrls: ["https://alfajores-blockscout.celo-testnet.org"],
};

const useCelo = () => {
  const [network, setNetwork] = useState(null);
  const [celoRate, setCeloRate] = useState(null);
  const [error, setError] = useState(null);

  // Fetch CELO to INR exchange rate from CoinGecko
  const fetchCeloRate = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=inr"
      );
      const data = await response.json();
      if (data.celo && data.celo.inr) {
        setCeloRate(data.celo.inr);
      } else {
        throw new Error("Invalid data from exchange rate API");
      }
    } catch (err) {
      console.error("Error fetching CELO rate:", err);
      setError("Failed to fetch current exchange rate");
    }
  };

  // Switch MetaMask to Celo Alfajores Testnet
  const switchToCeloAlfajores = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: celoAlfajores.chainId }],
      });
    } catch (switchError) {
      // If the network is not added to MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [celoAlfajores],
          });
        } catch (addError) {
          console.error("Error adding Celo Alfajores network:", addError);
          setError("Failed to add Celo Alfajores network");
          throw addError;
        }
      } else {
        console.error("Error switching network:", switchError);
        setError("Failed to switch network");
        throw switchError;
      }
    }
  };

  // Check the current network
  const checkNetwork = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        setNetwork(chainId);

        if (chainId === celoAlfajores.chainId) {
          await fetchCeloRate();
          setError(null);
        } else {
          setCeloRate(null);
          setError("Please switch to Celo Alfajores Testnet");
        }
      } catch (err) {
        console.error("Error checking network:", err);
        setError("Failed to detect the network");
      }
    } else {
      setError("MetaMask is not installed");
    }
  };

  useEffect(() => {
    checkNetwork();

    // Listen for network changes
    const handleChainChanged = (chainId) => {
      setNetwork(chainId);
      if (chainId === celoAlfajores.chainId) {
        fetchCeloRate();
        setError(null);
      } else {
        setCeloRate(null);
        setError("Please switch to Celo Alfajores Testnet");
      }
    };

    if (window.ethereum) {
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    // Cleanup listener on unmount
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { network, celoRate, error, switchToCeloAlfajores };
};

export default useCelo;
