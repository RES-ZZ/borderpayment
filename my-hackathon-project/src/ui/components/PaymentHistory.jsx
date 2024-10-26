import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { generateUserTransactionSummary } from "../../utils/transactionAnalysis";
import { FiDownload, FiBarChart2 } from "react-icons/fi";

const PaymentHistory = () => {
  const [user] = useAuthState(auth);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [analyzingTransactions, setAnalyzingTransactions] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "transactions"),
          where("senderAddress", "==", user.address),
          orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);
        const paymentsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPayments(paymentsList);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  const analyzeTransactions = async () => {
    setAnalyzingTransactions(true);
    try {
      const summary = await generateUserTransactionSummary(user.address);
      setAnalysis(summary);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setAnalyzingTransactions(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <button
          onClick={analyzeTransactions}
          disabled={analyzingTransactions}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <FiBarChart2 />
          {analyzingTransactions ? "Analyzing..." : "Analyze Patterns"}
        </button>
      </div>

      {analysis && analysis.success && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Transaction Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-xl font-semibold">
                {analysis.metrics.totalTransactions}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Total Volume</p>
              <p className="text-xl font-semibold">
                {analysis.metrics.totalVolume.toFixed(2)} CELO
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Unique Recipients</p>
              <p className="text-xl font-semibold">
                {analysis.metrics.uniqueRecipients}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Average Transaction</p>
              <p className="text-xl font-semibold">
                {analysis.metrics.averageAmount.toFixed(2)} CELO
              </p>
            </div>
          </div>
          <div className="prose max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: analysis.analysis.replace(/\n/g, "<br/>"),
              }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold">{payment.amount} CELO</p>
                  <p className="text-sm text-gray-600">
                    To: {payment.recipientUsername || payment.recipientAddress}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {payment.txHash && (
                    <a
                      href={`https://alfajores.celoscan.io/tx/${payment.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View on Explorer
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
