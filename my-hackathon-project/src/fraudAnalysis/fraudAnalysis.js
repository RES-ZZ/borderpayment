import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const analyzeUserTransactionPattern = async (account, transactionData) => {
    try {
        // Basic fraud analysis implementation
        const { amount } = transactionData;
        const amountNum = parseFloat(amount);

        let riskLevel = "LOW";
        let riskScore = 0;
        const anomalies = [];
        const recommendations = [];

        // Check for high-value transactions
        if (amountNum > 1000) {
            riskLevel = "HIGH";
            riskScore += 50;
            anomalies.push("Unusually high transaction amount");
            recommendations.push("Consider splitting into multiple smaller transactions");
        }

        // Check for odd hours transactions (if between 11 PM and 5 AM)
        const hour = new Date().getHours();
        if (hour >= 23 || hour <= 5) {
            riskScore += 20;
            anomalies.push("Transaction attempted during unusual hours");
            recommendations.push("Consider conducting transactions during regular business hours");
        }

        // Adjust risk level based on score
        if (riskScore >= 50) {
            riskLevel = "HIGH";
        } else if (riskScore >= 20) {
            riskLevel = "MEDIUM";
        }

        return {
            riskLevel,
            riskScore,
            anomalies,
            recommendations,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("Error in fraud analysis:", error);
        return {
            riskLevel: "LOW",
            riskScore: 0,
            anomalies: [],
            recommendations: [],
            timestamp: new Date().toISOString()
        };
    }
};

// Helper functions
const calculateAverageAmount = (transactions) => {
    if (!transactions.length) return 0;
    const sum = transactions.reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
    return sum / transactions.length;
};

const getFrequentRecipients = (transactions) => {
    const recipients = {};
    transactions.forEach(tx => {
        recipients[tx.recipientAddress] = (recipients[tx.recipientAddress] || 0) + 1;
    });
    return recipients;
};

const analyzeTimePatterns = (transactions) => {
    if (!transactions.length) return {};

    const timeDeltas = [];
    for (let i = 1; i < transactions.length; i++) {
        const delta = new Date(transactions[i - 1].timestamp) - new Date(transactions[i].timestamp);
        timeDeltas.push(delta / (1000 * 60)); // Convert to minutes
    }

    return {
        averageTimeBetweenTx: timeDeltas.reduce((a, b) => a + b, 0) / timeDeltas.length,
        minTimeDelta: Math.min(...timeDeltas),
        maxTimeDelta: Math.max(...timeDeltas)
    };
};
