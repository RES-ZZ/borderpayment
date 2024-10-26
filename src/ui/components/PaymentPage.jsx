import { motion } from "framer-motion";
import { FiDownload, FiCheck, FiX } from "react-icons/fi";

const ReceiptDisplay = ({ receipt, generatePDF, setReceipt, setTxHash }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 border-2 border-green-100 rounded-lg space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-green-600">
          Payment Successful!
        </h3>
        <button
          onClick={() => {
            setReceipt(null);
            setTxHash(null);
          }}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <FiX className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Amount:</span>
          <span className="font-medium">{receipt.amount} CELO</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Recipient:</span>
          <span className="font-mono">{receipt.recipient}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Transaction Hash:</span>
          <a
            href={`https://celoscan.io/tx/${receipt.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-mono"
          >
            {`${receipt.txHash.slice(0, 6)}...${receipt.txHash.slice(-4)}`}
          </a>
        </div>

        {receipt.timestamp && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Time:</span>
            <span>{new Date(receipt.timestamp).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="pt-4 flex gap-3">
        <button
          onClick={generatePDF}
          className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <FiDownload className="w-4 h-4" />
          Download Receipt
        </button>
        <button
          onClick={() => {
            setReceipt(null);
            setTxHash(null);
          }}
          className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <FiCheck className="w-4 h-4" />
          Done
        </button>
      </div>
    </motion.div>
  );
};

const PaymentPage = () => {
  // ... existing state variables ...

  const generatePDF = async () => {
    try {
      // Implement PDF generation logic here
      // You might want to use a library like jsPDF or html2pdf
      alert("PDF generation not implemented yet");
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF");
    }
  };

  // ... rest of your PaymentPage component ...
};

// ... rest of your code ...
