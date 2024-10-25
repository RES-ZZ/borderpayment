// src/ui/components/PaymentPage.jsx
import { useState } from "react";
import Input from "./Input";
import Button from "./Button";

const PaymentPage = () => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState(null);

  const handlePayment = (e) => {
    e.preventDefault();
    if (!recipient || !amount) {
      setMessage("Please fill in all fields.");
      return;
    }

    // Placeholder logic for payment submission
    console.log(`Paying ${amount} to ${recipient}`);
    alert(`Payment of ${amount} to ${recipient} was successful!`);

    // Reset fields
    setRecipient("");
    setAmount("");
    setMessage(null);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Payment Dashboard
        </h2>
        {message && (
          <div className="text-red-600 mb-4 text-center">{message}</div>
        )}
        <form onSubmit={handlePayment} className="space-y-6">
          <Input
            label="Recipient Address"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient's Wallet Address"
            required
            className="w-full"
          />
          <Input
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount to Pay"
            required
            className="w-full"
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full py-2 text-lg"
          >
            Send Payment
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
