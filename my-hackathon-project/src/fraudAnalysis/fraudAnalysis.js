import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const analyzeUserTransactionPattern = async (userId, newTransaction) => {
    try {
        // Fetch user's transaction history
        const q = query(
            collection(db, "transactions"),
            where("senderAddress", "==", newTransaction.senderAddress),
            orderBy("timestamp", "desc"),
            limit(10)
        );

        const querySnapshot = await getDocs(q);
        const transactionHistory = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));

        // Prepare data for analysis
        const analysisData = {
            newTransaction: {
                amount: newTransaction.amount,
                recipient: newTransaction.recipient,
                timestamp: new Date().toISOString(),
            },
            historicalTransactions: transactionHistory,
            patterns: {
                averageAmount: calculateAverageAmount(transactionHistory),
                frequentRecipients: getFrequentRecipients(transactionHistory),
                timePatterns: analyzeTimePatterns(transactionHistory),
            }
        };

        // Send to GROQ for analysis
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "mixtral-8x7b-32768",
                messages: [
                    {
                        role: "system",
                        content: "You are a fraud detection expert analyzing cryptocurrency transactions. Analyze the transaction patterns and identify potential fraud indicators."
                    },
                    {
                        role: "user",
                        content: `Analyze this transaction and history for fraud:
              ${JSON.stringify(analysisData, null, 2)}
              
              Consider:
              1. Unusual amount patterns
              2. Transaction frequency anomalies
              3. New recipient risk
              4. Time-based patterns
              5. Historical behavior consistency
              
              Return a JSON with:
              {
                riskLevel: "LOW"|"MEDIUM"|"HIGH",
                riskScore: <number between 0-100>,
                anomalies: [],
                recommendations: [],
                requiresManualReview: boolean
              }`
                    }
                ],
                temperature: 0.2,
                max_tokens: 1000
            })
        });

        const result = await response.json();
        return JSON.parse(result.choices[0].message.content);
    } catch (error) {
        console.error("Fraud analysis error:", error);
        return {
            riskLevel: "ERROR",
            riskScore: 100,
            anomalies: ["Failed to perform analysis"],
            recommendations: ["Manual review required"],
            requiresManualReview: true
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