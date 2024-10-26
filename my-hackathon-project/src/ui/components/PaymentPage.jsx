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
import { db } from "../../firebase"; // Make sure you have this configured
import { collection, addDoc } from "firebase/firestore";
import { PDFDocument, rgb } from "pdf-lib";
import { FiDownload } from "react-icons/fi";
import { analyzeUserTransactionPattern } from "../../fraudAnalysis/fraudAnalysis";
import { testFraudDetection } from "../../utils/testFraudScenarios";

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
              <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-medium">Receipt ID:</span>
                  <span className="font-mono">{receipt.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className=" text-black font-medium">Amount:</span>
                  <span className="text-green-600 font-bold">
                    {receipt.amount} CELO
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-medium">
                    {receipt.type === "request" ? "From" : "To"}:
                  </span>
                  <span className="font-mono">
                    {receipt.username || receipt.to}
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

              <div className="mt-4 text-xs text-gray-500">
                Transaction ID stored on blockchain and Firebase
              </div>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label className="block text-sm text-black font-medium mb-2">
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
              <label className="block text-sm text-black font-medium mb-2">
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

        {!receipt && (
          <div className=" border-spacing-5 border-gray-200 mt-6 flex gap-3">
            <button
              onClick={async () => {
                try {
                  const testTransaction = {
                    amount: "1000", // Unusually high amount
                    recipient: "0x123...", // New recipient
                    senderAddress: account,
                    timestamp: new Date().toISOString(),
                  };

                  const fraudAnalysis = await analyzeUserTransactionPattern(
                    account,
                    testTransaction
                  );

                  console.log("Fraud Analysis Result:", fraudAnalysis);
                  alert(
                    `Risk Level: ${fraudAnalysis.riskLevel}\n` +
                      `Risk Score: ${fraudAnalysis.riskScore}\n` +
                      `Anomalies: ${fraudAnalysis.anomalies.join("\n")}\n` +
                      `Recommendations: ${fraudAnalysis.recommendations.join(
                        "\n"
                      )}`
                  );
                } catch (error) {
                  console.error("Test failed:", error);
                  alert("Test failed: " + error.message);
                }
              }}
              className="mb-6 w-full py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
            >
              Test Fraud Detection
            </button>
          </div>
        )}
        <div className=" blockflex gap-3">
          <button
            onClick={async () => {
              try {
                const results = await testFraudDetection();
                console.table(results);

                const summary = results
                  .map(
                    (r) =>
                      `${r.scenario}: ${r.passed ? "✅" : "❌"}\n` +
                      `Expected: ${r.expected}\n` +
                      `Received: ${r.received}\n` +
                      `${r.error ? "Error: " + r.error : ""}\n`
                  )
                  .join("\n");

                alert(`Test Results:\n\n${summary}`);
              } catch (error) {
                console.error("Test suite failed:", error);
                alert("Test suite failed: " + error.message);
              }
            }}
            className="mb-6 w-full py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
          >
            Run All Fraud Detection Tests
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
