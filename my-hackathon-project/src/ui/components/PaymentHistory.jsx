import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";

const PaymentHistory = () => {
  const [user] = useAuthState(auth);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "payments"),
          where("userId", "==", user.uid),
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

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Payment History</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-white p-4 rounded-lg shadow">
              <p>
                Amount: {payment.amountCFX} CFX (₹{payment.amountINR})
              </p>
              <p>To: {payment.to}</p>
              <p>Date: {payment.timestamp.toDate().toLocaleString()}</p>
              <p className="text-sm text-gray-500 break-all">
                Transaction: {payment.txHash}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
