import React, { createContext, useState, useEffect } from "react";
import Web3 from "web3";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);

  // Function to connect MetaMask
  const connectMetaMask = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        setAccount(accounts[0]);

        // Listen for account changes
        window.ethereum.on("accountsChanged", (accounts) => {
          setAccount(accounts[0] || null);
        });
      } catch (error) {
        console.error("User denied account access", error);
      }
    } else {
      alert("MetaMask not detected. Please install MetaMask!");
    }
  };

  // Automatically connect if already connected
  useEffect(() => {
    const init = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        setAccount(window.ethereum.selectedAddress);
      }
    };
    init();
  }, []);

  return (
    <Web3Context.Provider value={{ web3, account, connectMetaMask }}>
      {children}
    </Web3Context.Provider>
  );
};
