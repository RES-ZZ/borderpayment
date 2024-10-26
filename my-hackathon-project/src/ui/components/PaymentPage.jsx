import { useState, useContext, useEffect } from "react";
import { Web3Context } from "../../context/Web3Context";
import { motion } from "framer-motion";
import Web3 from "web3";
import { v4 as uuidv4 } from "uuid";
import {
  FiSend,
  FiDollarSign,
  FiCopy,
  FiArrowUpRight,
  FiInfo,
  FiMapPin,
  FiCamera,
} from "react-icons/fi";
import { db, storage } from "../../firebase"; // Make sure you have this configured
import { collection, addDoc } from "firebase/firestore";
import { PDFDocument, rgb } from "pdf-lib";
import { FiDownload } from "react-icons/fi";
import { analyzeUserTransactionPattern } from "../../fraudAnalysis/fraudAnalysis";
import { testFraudDetection } from "../../utils/testFraudScenarios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PropTypes from "prop-types";

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

// Add this component before the PaymentPage component
const ReceiptDisplay = ({ receipt, generatePDF, setReceipt, setTxHash }) => {
  return (
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
          {receipt.type === "request" ? "Payment Requested!" : "Payment Sent!"}
        </h3>
        <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="font-medium">Receipt ID:</span>
            <span className="font-mono">{receipt.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="text-black font-medium">Amount:</span>
            <span className="text-green-600 font-bold">
              {receipt.amount} CELO
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="font-medium">
              {receipt.type === "request" ? "From" : "To"}:
            </span>
            <span className="font-mono">
              {receipt.recipientUsername || receipt.recipientAddress}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 pb-2">
            <span className="font-medium">Date:</span>
            <span>{new Date(receipt.timestamp).toLocaleString()}</span>
          </div>
          {receipt.message && (
            <div className="border-b border-gray-200 pb-2">
              <p className="italic text-left">{receipt.message}</p>
            </div>
          )}
          {receipt.txHash && (
            <div className="pt-2">
              <a
                href={`https://alfajores.celoscan.io/tx/${receipt.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center justify-center gap-2"
              >
                <span>View on Explorer</span>
                <FiArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => generatePDF(receipt)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <FiDownload className="w-5 h-5" />
            Download Receipt
          </button>
          <button
            onClick={() => {
              setReceipt(null);
              setTxHash(null);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FiArrowUpRight className="w-5 h-5" />
            New Transaction
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Add PropTypes for ReceiptDisplay
ReceiptDisplay.propTypes = {
  receipt: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    amount: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    recipientUsername: PropTypes.string,
    recipientAddress: PropTypes.string,
    message: PropTypes.string,
    txHash: PropTypes.string,
  }).isRequired,
  generatePDF: PropTypes.func.isRequired,
  setReceipt: PropTypes.func.isRequired,
  setTxHash: PropTypes.func.isRequired,
};

const PaymentPage = () => {
  // Add missing state variables

  const [activeTab, setActiveTab] = useState("payment");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [goodsDescription, setGoodsDescription] = useState("");
  const [location, setLocation] = useState("");
  const [marketPrice, setMarketPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [category, setCategory] = useState("");

  const PRODUCT_CATEGORIES = [
    "Groceries",
    "Electronics",
    "Clothing",
    "Healthcare",
    "Transportation",
    "Education",
    "Housing",
    "Others",
  ];

  // Add missing function
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Address copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Add error handling for web3 context
  const { web3, account } = useContext(Web3Context) || {};

  // Add error state if web3 is not available
  useEffect(() => {
    if (!web3) {
      setError("Please connect your wallet");
    }
  }, [web3]);

  // Modify submitPriceData to handle errors better
  const submitPriceData = async () => {
    if (!account && !isAnonymous) {
      setError("Please connect your wallet first or submit anonymously");
      return;
    }

    try {
      setLoading(true);
      let imageUrl = null;

      if (imageFile) {
        const storageRef = ref(
          storage,
          `market-prices/${Date.now()}-${imageFile.name}`
        );
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const priceData = {
        category,
        goodsDescription,
        price: marketPrice,
        location,
        timestamp: new Date().toISOString(),
        reportedBy: isAnonymous ? "Anonymous" : senderName,
        walletAddress: isAnonymous ? "anonymous" : account,
        imageUrl,
        isAnonymous,
      };

      // Store in Firebase
      await addDoc(collection(db, "marketPrices"), priceData);

      // Clear form
      setCategory("");
      setGoodsDescription("");
      setMarketPrice("");
      setLocation("");
      setImageFile(null);
      setImagePreview(null);
      setShowPriceForm(false);

      alert("Price information submitted successfully!");
    } catch (error) {
      console.error("Error submitting price data:", error);
      setError(error.message || "Failed to submit price information");
    } finally {
      setLoading(false);
    }
  };

  // Add loading state for async operations
  const [loading, setLoading] = useState(false);

  // Modify handlePayment to include better error handling
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!web3 || !account) {
      setError("Please connect your wallet first");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Prepare transaction data
      const transactionData = {
        amount,
        recipient,
        senderAddress: account,
        timestamp: new Date().toISOString(),
      };

      // Perform fraud analysis
      const fraudAnalysis = await analyzeUserTransactionPattern(
        account,
        transactionData
      );

      // Handle high-risk transactions
      if (fraudAnalysis.riskLevel === "HIGH") {
        const proceed = window.confirm(
          `⚠️ High-risk transaction detected:\n\n${fraudAnalysis.anomalies.join(
            "\n"
          )}\n\nRecommendations:\n${fraudAnalysis.recommendations.join(
            "\n"
          )}\n\nDo you want to proceed?`
        );
        if (!proceed) {
          throw new Error("Transaction cancelled due to high risk");
        }
      }

      // Handle medium-risk transactions
      if (fraudAnalysis.riskLevel === "MEDIUM") {
        alert(
          `⚠️ Warning:\n\n${fraudAnalysis.anomalies.join(
            "\n"
          )}\n\nPlease review carefully.`
        );
      }

      // Continue with existing payment logic
      await switchToCeloAlfajores();
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.getAccounts();

      if (!accounts || accounts.length === 0) {
        throw new Error("Please connect your wallet");
      }

      const blockchainUUID = await generateBlockchainUUID(
        web3Instance,
        accounts[0]
      );
      const amountWei = web3Instance.utils.toWei(amount, "ether");

      const tx = await web3Instance.eth.sendTransaction({
        from: accounts[0],
        to: recipient,
        value: amountWei,
        gas: "21000",
        gasPrice: await web3Instance.eth.getGasPrice(),
      });

      // Include fraud analysis in receipt
      const newReceipt = await generateReceipt(
        tx.transactionHash,
        amount,
        blockchainUUID,
        fraudAnalysis
      );

      setTxHash(tx.transactionHash);
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

  // Add validation for form fields
  const validateForm = () => {
    if (!recipient) {
      setError("Recipient address is required");
      return false;
    }
    if (!amount || isNaN(parseFloat(amount))) {
      setError("Please enter a valid amount");
      return false;
    }
    if (!isAnonymous && !senderName) {
      setError("Please enter your name or choose to remain anonymous");
      return false;
    }
    return true;
  };

  const [recipient, setRecipient] = useState("");
  const [recipientUsername, setRecipientUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState(null);
  const [paymentMode, setPaymentMode] = useState("send"); // "send" or "request"
  const [receipt, setReceipt] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");

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

  const generateBlockchainUUID = async (web3Instance, account) => {
    const timestamp = Date.now().toString();
    const message = `${account}-${timestamp}`;
    const hash = web3Instance.utils.sha3(message);
    return hash.substring(2, 38); // Take a portion of the hash as UUID
  };

  const generateReceipt = async (
    txHash,
    amount,
    blockchainUUID,
    fraudAnalysis
  ) => {
    const receipt = {
      id: blockchainUUID,
      timestamp: new Date().toISOString(),
      txHash,
      amount,
      senderUsername: "Your Username",
      senderAddress: account,
      recipientUsername: recipientUsername || "Unknown",
      recipientAddress: recipient,
      recipientEmail: "recipient@email.com",
      type: paymentMode,
      status: "completed",
      riskAnalysis: {
        level: fraudAnalysis.riskLevel,
        score: fraudAnalysis.riskScore,
        anomalies: fraudAnalysis.anomalies,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      const docRef = await addDoc(collection(db, "transactions"), receipt);
      console.log("Transaction stored with ID: ", docRef.id);
    } catch (error) {
      console.error("Error storing transaction:", error);
    }

    return receipt;
  };
  const generatePDF = async (receiptData) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([550, 750]);
    const { width, height } = page.getSize();

    page.drawText("Payment Receipt", {
      x: 50,
      y: height - 50,
      size: 20,
      color: rgb(0, 0, 0),
    });

    const details = [
      `Transaction ID: ${receiptData.id}`,
      `Amount: ${receiptData.amount} CELO`,
      `Recipient: ${receiptData.recipient}`,
      `Date: ${new Date(receiptData.timestamp).toLocaleString()}`,
      `Status: ${receiptData.status}`,
      receiptData.txHash ? `Transaction Hash: ${receiptData.txHash}` : "",
    ];

    details.forEach((detail, index) => {
      page.drawText(detail, {
        x: 50,
        y: height - 100 - index * 30,
        size: 12,
        color: rgb(0, 0, 0),
      });
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${receiptData.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  // Add this new component for the price submission form
  const PriceSubmissionForm = () => {
    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4">Submit Price Information</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitPriceData();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            >
              <option value="">Select a category</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Description *
            </label>
            <input
              type="text"
              value={goodsDescription}
              onChange={(e) => setGoodsDescription(e.target.value)}
              placeholder="e.g., 1kg Rice, Samsung TV 43-inch"
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (in local currency) *
            </label>
            <input
              type="number"
              value={marketPrice}
              onChange={(e) => setMarketPrice(e.target.value)}
              placeholder="Enter price"
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                className="flex-1 p-3 border rounded-lg"
                required
              />
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      async (position) => {
                        try {
                          const response = await fetch(
                            `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=YOUR_OPENCAGE_API_KEY`
                          );
                          const data = await response.json();
                          if (data.results[0]) {
                            setLocation(data.results[0].formatted);
                          }
                        } catch (error) {
                          console.error("Error getting location:", error);
                        }
                      },
                      (error) => {
                        console.error("Error getting location:", error);
                      }
                    );
                  }
                }}
                className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
              >
                <FiMapPin />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Enter your name"
                className={`w-full p-3 border rounded-lg ${
                  isAnonymous ? "opacity-50" : ""
                }`}
                disabled={isAnonymous}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-600">
                  Prefer not to say
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Image (Optional)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full object-contain"
                    />
                  ) : (
                    <FiCamera className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowPriceForm(false)}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit Price Info
            </button>
          </div>
        </form>
      </motion.div>
    );
  };

  // Add PaymentForm component
  const PaymentForm = ({
    isAnonymous,
    setIsAnonymous,
    recipient,
    setRecipient,
    recipientUsername, // Add this prop
    setRecipientUsername, // Add this prop
    amount,
    setAmount,
    loading,
    handlePayment,
    setShowPriceForm, // Add this prop
  }) => {
    return (
      <form onSubmit={handlePayment} className="space-y-6">
        {/* Privacy Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Submit anonymously?</span>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded text-blue-600"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-600">
              Prefer not to say
            </label>
          </div>
        </div>

        {/* Recipient Details */}
        <div className="space-y-4">
          <FormField
            label="Recipient's Name"
            value={recipientUsername}
            onChange={setRecipientUsername}
            placeholder="Enter recipient's name"
            required
          />

          <FormField
            label="Recipient's Address"
            value={recipient}
            onChange={setRecipient}
            placeholder="0x..."
            required
          />
        </div>

        {/* Amount */}
        <FormField
          label="Amount (CELO)"
          value={amount}
          onChange={setAmount}
          placeholder="1 CELO = ₹57"
          type="number"
          step="0.0001"
          required
        />

        {/* Price Tracking Button */}
        <button
          type="button"
          onClick={() => setShowPriceForm(true)}
          className="w-full py-3 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
        >
          <FiInfo className="w-4 h-4" />
          Submit Price Information
        </button>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2 font-medium"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FiSend className="w-4 h-4" />
              Send Payment
            </>
          )}
        </button>
      </form>
    );
  };

  // Add after the PaymentForm component
  PaymentForm.propTypes = {
    isAnonymous: PropTypes.bool.isRequired,
    setIsAnonymous: PropTypes.func.isRequired,
    recipient: PropTypes.string.isRequired,
    setRecipient: PropTypes.func.isRequired,
    recipientUsername: PropTypes.string.isRequired,
    setRecipientUsername: PropTypes.func.isRequired,
    amount: PropTypes.string.isRequired,
    setAmount: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    handlePayment: PropTypes.func.isRequired,
    setShowPriceForm: PropTypes.func.isRequired,
  };

  return (
    <div className="w-screen bg-gray-200 pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-4xl relative">
        {" "}
        {/* Added relative positioning */}
        {/* Exit Button */}
        <button
          onClick={() => window.history.back()} // Go back to previous page
          className="absolute -top-12 right-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <span>Exit</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {/* Rest of your existing code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Section - Wallet Info */}
          <div className="md:col-span-1">
            <div className="bg-teal-400 rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-black mb-4">
                {" "}
                {/* Changed to text-black */}
                Wallet Details
              </h2>
              {account ? (
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-black block mb-1">
                      {" "}
                      {/* Changed to text-black */}
                      Connected Address
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-black">
                        {" "}
                        {/* Changed to text-black */}
                        {`${account.slice(0, 6)}...${account.slice(-4)}`}
                      </span>
                      <button
                        onClick={() => copyToClipboard(account)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <FiCopy className="w-4 h-4 text-black" />{" "}
                        {/* Changed to text-black */}
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-black text-center mt-2">
                    {" "}
                    {/* Changed to text-black */}
                    Connected to Celo Network
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-black">Please connect your wallet</p>{" "}
                  {/* Changed to text-black */}
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Payment Form */}
          <div className="md:col-span-2">
            {/* Error Display */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {/* Main Form Card */}
            <div className="bg-blue-100 rounded-xl shadow-sm border border-gray-100 p-6">
              <h1 className="text-2xl font-bold text-black mb-6">
                {" "}
                {/* Changed to text-black */}
                Send Payment
              </h1>

              {receipt ? (
                <ReceiptDisplay
                  receipt={receipt}
                  generatePDF={generatePDF}
                  setReceipt={setReceipt}
                  setTxHash={setTxHash}
                />
              ) : (
                <PaymentForm
                  isAnonymous={isAnonymous}
                  setIsAnonymous={setIsAnonymous}
                  recipient={recipient}
                  setRecipient={setRecipient}
                  recipientUsername={recipientUsername}
                  setRecipientUsername={setRecipientUsername}
                  amount={amount}
                  setAmount={setAmount}
                  loading={loading}
                  handlePayment={handlePayment}
                  setShowPriceForm={setShowPriceForm}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Price Form Modal - Updated text colors */}
      {showPriceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-black">
                  {" "}
                  {/* Changed to text-black */}
                  Submit Price Information
                </h3>
                <button
                  onClick={() => setShowPriceForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <span className="text-2xl text-black">×</span>{" "}
                  {/* Changed to text-black */}
                </button>
              </div>
              <PriceTrackingForm
                goodsDescription={goodsDescription}
                setGoodsDescription={setGoodsDescription}
                location={location}
                setLocation={setLocation}
                marketPrice={marketPrice}
                setMarketPrice={setMarketPrice}
                imageFile={imageFile}
                setImageFile={setImageFile}
                submitPriceData={submitPriceData}
                priceHistory={priceHistory}
                analysisResult={analysisResult}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modified PriceTrackingForm to prevent refresh
const PriceTrackingForm = ({
  goodsDescription,
  setGoodsDescription,
  location,
  setLocation,
  marketPrice,
  setMarketPrice,
  imageFile,
  setImageFile,
  submitPriceData,
  priceHistory,
  analysisResult,
  loading,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form submission refresh
    submitPriceData();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Goods Description"
        value={goodsDescription}
        onChange={setGoodsDescription}
        placeholder="Describe the goods/services"
        required
      />

      <FormField
        label="Location"
        value={location}
        onChange={setLocation}
        placeholder="Enter your location"
        required
      />

      <FormField
        label="Market Price (INR)"
        value={marketPrice}
        onChange={setMarketPrice}
        placeholder="Current market price"
        type="number"
        required
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Upload Image (Optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="w-full p-2 border rounded-lg text-sm"
        />
      </div>

      {/* Price History */}
      {priceHistory.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <h3 className="font-medium text-gray-900">Recent Price Reports</h3>
          {priceHistory.slice(-3).map((entry, index) => (
            <div key={index} className="text-sm text-gray-600">
              {entry.goodsDescription}: ₹{entry.price} at {entry.location}
            </div>
          ))}
        </div>
      )}

      {/* Analysis Result */}
      {analysisResult && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <h3 className="font-medium text-gray-900">Price Analysis</h3>
          <div className="text-sm text-gray-600">
            <p>Market Trend: {analysisResult.trend}</p>
            <p>Price Comparison: {analysisResult.comparison}</p>
            {analysisResult.recommendations && (
              <div className="mt-2">
                <p className="font-medium">Recommendations:</p>
                <ul className="list-disc pl-4 mt-1">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          "Submit Price Information"
        )}
      </button>
    </form>
  );
};

// Modified FormField component
const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-black">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      defaultValue={value} // Change value to defaultValue
      onBlur={(e) => onChange(e.target.value)} // Only update on blur
      onChange={(e) => e.target.value} // Allow typing without state updates
      placeholder={placeholder}
      required={required}
      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
    />
  </div>
);

// Add prop types validation if you're using TypeScript or PropTypes
FormField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
};

// Add PropTypes for PriceTrackingForm
PriceTrackingForm.propTypes = {
  goodsDescription: PropTypes.string.isRequired,
  setGoodsDescription: PropTypes.func.isRequired,
  location: PropTypes.string.isRequired,
  setLocation: PropTypes.func.isRequired,
  marketPrice: PropTypes.string.isRequired,
  setMarketPrice: PropTypes.func.isRequired,
  imageFile: PropTypes.object,
  setImageFile: PropTypes.func.isRequired,
  submitPriceData: PropTypes.func.isRequired,
  priceHistory: PropTypes.arrayOf(
    PropTypes.shape({
      goodsDescription: PropTypes.string.isRequired,
      price: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
    })
  ).isRequired,
  analysisResult: PropTypes.shape({
    trend: PropTypes.string,
    comparison: PropTypes.string,
    recommendations: PropTypes.arrayOf(PropTypes.string),
  }),
  loading: PropTypes.bool.isRequired,
};

export default PaymentPage;
