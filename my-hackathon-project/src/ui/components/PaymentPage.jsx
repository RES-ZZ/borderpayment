import { useState, useContext } from "react";
import { Web3Context } from "../../context/Web3Context";
import { motion } from "framer-motion";
import Web3 from "web3";
import { v4 as uuidv4 } from "uuid";
import {
  FiSend,
  FiDollarSign,
  FiCopy,
  FiArrowUpRight,
  FiArrowDownLeft,
} from "react-icons/fi";

const CELO_ALFAJORES_PARAMS = {
  chainId: "0xaef3", // 44787 in hex
  chainName: "Celo Alfajores Testnet",
  nativeCurrency: {
    name: "CELO",
    symbol: "CELO",
    decimals: 18,
  },
  rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
  blockExplorerUrls: ["https://alfajores.celoscan.io/"],
};

const PaymentPage = () => {
  const { web3, account } = useContext(Web3Context);
  const [recipient, setRecipient] = useState("");
  const [recipientUsername, setRecipientUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [paymentMode, setPaymentMode] = useState("send"); // "send" or "request"
  const [receipt, setReceipt] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Address copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const generateReceipt = (txHash, amount) => {
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      txHash,
      amount,
      recipient: recipientUsername || recipient,
      type: paymentMode,
    };
  };

  const switchToCeloAlfajores = async () => {
    try {
      // Try to switch to Celo Alfajores
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CELO_ALFAJORES_PARAMS.chainId }],
      });
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [CELO_ALFAJORES_PARAMS],
          });
        } catch (addError) {
          throw new Error("Please add Celo Alfajores network to MetaMask");
        }
      }
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (paymentMode === "request") {
        // Handle payment request logic here
        const newReceipt = generateReceipt("request-" + uuidv4(), amount);
        setReceipt(newReceipt);
        setLoading(false);
        return;
      }

      if (!window.ethereum) {
        throw new Error("Please install MetaMask");
      }

      await switchToCeloAlfajores();
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.getAccounts();

      if (!accounts || accounts.length === 0) {
        throw new Error("Please connect your wallet");
      }

      const amountWei = web3Instance.utils.toWei(amount, "ether");
      const tx = await web3Instance.eth.sendTransaction({
        from: accounts[0],
        to: recipient,
        value: amountWei,
        gas: "21000",
        gasPrice: await web3Instance.eth.getGasPrice(),
      });

      setTxHash(tx.transactionHash);
      const newReceipt = generateReceipt(tx.transactionHash, amount);
      setReceipt(newReceipt);
      setRecipient("");
      setRecipientUsername("");
      setAmount("");
    } catch (error) {
      console.error("Payment error:", error);
      setError(error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Generate a payment request receipt
      const requestId = uuidv4();
      const newReceipt = {
        id: requestId,
        timestamp: new Date().toISOString(),
        type: "request",
        amount,
        from: account,
        to: recipient,
        username: recipientUsername,
        message: requestMessage,
        status: "pending",
      };

      setReceipt(newReceipt);
      // Here you would typically send this request to your backend
      // For demo, we'll just show the receipt
    } catch (error) {
      setError(error.message || "Failed to create request");
    } finally {
      setLoading(false);
      setShowRequestModal(false);
    }
  };

  const RequestModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-md m-4"
      >
        <h3 className="text-xl font-semibold mb-4">Payment Request</h3>
        <form onSubmit={handleRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Add a message to your request..."
              className="w-full p-3 border rounded-lg resize-none h-24"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowRequestModal(false)}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FiDollarSign />
              Request {amount} CELO
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Wallet Info */}
        {account && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="text-sm text-gray-600">Your Wallet</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">{`${account.slice(
                0,
                6
              )}...${account.slice(-4)}`}</span>
              <button
                onClick={() => copyToClipboard(account)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiCopy className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {receipt ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg border-2 border-blue-100"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                {receipt.type === "request" ? (
                  <FiDollarSign className="w-8 h-8 text-green-600" />
                ) : (
                  <FiArrowUpRight className="w-8 h-8 text-green-600" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                {receipt.type === "request"
                  ? "Payment Requested!"
                  : "Payment Sent!"}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Receipt ID: {receipt.id.slice(0, 8)}</p>
                <p>Amount: {receipt.amount} CELO</p>
                <p>
                  {receipt.type === "request" ? "From" : "To"}:{" "}
                  {receipt.username || receipt.to}
                </p>
                <p>Date: {new Date(receipt.timestamp).toLocaleString()}</p>
                {receipt.message && <p className="italic">{receipt.message}</p>}
                {receipt.txHash && (
                  <a
                    href={`https://alfajores.celoscan.io/tx/${receipt.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline block"
                  >
                    View on Explorer
                  </a>
                )}
              </div>
              <button
                onClick={() => {
                  setReceipt(null);
                  setTxHash(null);
                }}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Transaction
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Amount (CELO)
              </label>
              <input
                type="number"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.1"
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiSend />
                    Send
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={loading || !amount || !recipient}
                onClick={() => setShowRequestModal(true)}
                className="flex-1 py-4 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <FiDollarSign />
                Request
              </button>
            </div>
          </form>
        )}

        {showRequestModal && <RequestModal />}
      </div>
    </div>
  );
};

export default PaymentPage;
