// src/components/Receipt.jsx
import React from "react";
import PropTypes from "prop-types";
import Button from "./Button";
import { motion } from "framer-motion";

const Receipt = ({ receipt, onReset }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 p-6 bg-green-50 rounded-lg"
    >
      <h3 className="text-xl font-semibold text-green-700">
        Payment Successful!
      </h3>
      <div className="space-y-2 text-green-600">
        <p>
          Amount: {receipt.amount} {receipt.nativeSymbol} (₹{receipt.inrAmount})
        </p>
        <p>Recipient: {receipt.recipient}</p>
        <p className="text-sm break-all">
          Transaction Hash:{" "}
          <a
            href={`https://alfajores-blockscout.celo-testnet.org/tx/${receipt.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600"
          >
            {receipt.hash}
          </a>
        </p>
      </div>
      <Button
        onClick={onReset}
        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
      >
        Make Another Payment
      </Button>
    </motion.div>
  );
};

Receipt.propTypes = {
  receipt: PropTypes.shape({
    amount: PropTypes.string.isRequired,
    nativeSymbol: PropTypes.string.isRequired,
    inrAmount: PropTypes.string.isRequired,
    recipient: PropTypes.string.isRequired,
    hash: PropTypes.string.isRequired,
  }).isRequired,
  onReset: PropTypes.func.isRequired,
};

export default Receipt;
