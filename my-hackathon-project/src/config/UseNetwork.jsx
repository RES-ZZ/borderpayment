// src/hooks/useNetwork.js
import { useState, useEffect } from "react";

// Define supported testnets with their details
const supportedNetworks = {
  "0x4": {
    name: "Rinkeby Testnet",
    symbol: "ETH",
    coingeckoId: "ethereum",
  },
  "0x2a": {
    name: "Kovan Testnet",
    symbol: "ETH",
    coingeckoId: "ethereum",
  },
  "0x5": {
    name: "Goerli Testnet",
    symbol: "ETH",
    coingeckoId: "ethereum",
  },
  "0x61": {
    name: "BSC Testnet",
    symbol: "BNB",
    coingeckoId: "binancecoin",
  },
  "0x47": {
    name: "Conflux eSpace Testnet",
    symbol: "CFX",
    coingeckoId: "conflux-token",
  },
  // Add more testnets as needed
};

const useNetwork = () => {
  const [network, setNetwork] = useState(null);
  const [nativeSymbol, setNativeSymbol] = useState("");
  const [exchangeRate, setExchangeRate] = useState(null);
  const [error, setError] = useState(null);

  // Function to fetch exchange rate from CoinGecko
  const fetchExchangeRate = async (coingeckoId) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=inr`
      );
      const data = await response.json();
      if (data[coingeckoId] && data[coingeckoId].inr) {
        setExchangeRate(data[coingeckoId].inr);
      } else {
        throw new Error("Invalid data from exchange rate API");
      }
    } catch (err) {
      console.error("Error fetching exchange rate:", err);
      setError("Failed to fetch current exchange rate");
    }
  };

  // Function to switch to a specific network
  const switchToNetwork = async (chainId) => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
    } catch (switchError) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902 && supportedNetworks[chainId]) {
        try {
          const networkData = supportedNetworks[chainId];
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId,
                chainName: networkData.name,
                nativeCurrency: {
                  name: networkData.symbol,
                  symbol: networkData.symbol,
                  decimals: 18,
                },
                rpcUrls: getRpcUrls(chainId),
                blockExplorerUrls: getBlockExplorerUrls(chainId),
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding network:", addError);
          setError("Failed to add the network");
          throw addError;
        }
      } else {
        console.error("Error switching network:", switchError);
        setError("Failed to switch network");
        throw switchError;
      }
    }
  };

  // Helper functions to get RPC URLs and Block Explorer URLs based on chainId
  const getRpcUrls = (chainId) => {
    const rpcUrlsMap = {
      "0x4": ["https://rinkeby.infura.io/v3/YOUR_INFURA_PROJECT_ID"],
      "0x2a": ["https://kovan.infura.io/v3/YOUR_INFURA_PROJECT_ID"],
      "0x5": ["https://goerli.infura.io/v3/YOUR_INFURA_PROJECT_ID"],
      "0x61": ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
      "0x47": ["https://evmtestnet.confluxrpc.com"],
      // Add more RPC URLs as needed
    };
    return rpcUrlsMap[chainId] || [];
  };

  const getBlockExplorerUrls = (chainId) => {
    const explorerUrlsMap = {
      "0x4": ["https://rinkeby.etherscan.io"],
      "0x2a": ["https://kovan.etherscan.io"],
      "0x5": ["https://goerli.etherscan.io"],
      "0x61": ["https://testnet.bscscan.com"],
      "0x47": ["https://evmtestnet.confluxscan.io"],
      // Add more Explorer URLs as needed
    };
    return explorerUrlsMap[chainId] || [];
  };

  // Function to check the current network
  const checkNetwork = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        setNetwork(chainId);

        if (supportedNetworks[chainId]) {
          const networkData = supportedNetworks[chainId];
          setNativeSymbol(networkData.symbol);
          await fetchExchangeRate(networkData.coingeckoId);
          setError(null);
        } else {
          setNativeSymbol("");
          setExchangeRate(null);
          setError(
            "Unsupported network. Please switch to a supported testnet."
          );
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
      if (supportedNetworks[chainId]) {
        const networkData = supportedNetworks[chainId];
        setNativeSymbol(networkData.symbol);
        fetchExchangeRate(networkData.coingeckoId);
        setError(null);
      } else {
        setNativeSymbol("");
        setExchangeRate(null);
        setError("Unsupported network. Please switch to a supported testnet.");
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

  return { network, nativeSymbol, exchangeRate, error, switchToNetwork };
};

export default useNetwork;
