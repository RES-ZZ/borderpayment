import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = "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";

export const generateUserTransactionSummary = async (userAddress) => {
    try {
        // Fetch all user transactions
        const q = query(
            collection(db, "transactions"),
            where("senderAddress", "==", userAddress),
            orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);
        const transactions = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }));

        // Calculate metrics
        const metrics = {
            totalTransactions: transactions.length,
            totalVolume: transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0),
            uniqueRecipients: new Set(transactions.map(tx => tx.recipientAddress)).size,
            averageAmount: transactions.length ? transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) / transactions.length : 0,
            timespan: transactions.length ? {
                start: new Date(Math.min(...transactions.map(tx => new Date(tx.timestamp)))),
                end: new Date(Math.max(...transactions.map(tx => new Date(tx.timestamp))))
            } : null
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
                        content: "You are a financial analyst specializing in cryptocurrency transaction patterns. Provide detailed insights about user behavior and patterns."
                    },
                    {
                        role: "user",
                        content: `Analyze this user's transaction history and provide a detailed summary:
                            Total Transactions: ${metrics.totalTransactions}
                            Total Volume: ${metrics.totalVolume} CELO
                            Unique Recipients: ${metrics.uniqueRecipients}
                            Average Transaction: ${metrics.averageAmount} CELO
                            Time Period: ${metrics.timespan ? `${metrics.timespan.start.toLocaleDateString()} to ${metrics.timespan.end.toLocaleDateString()}` : 'N/A'}
                            
                            Transaction History:
                            ${JSON.stringify(transactions, null, 2)}
                            
                            Provide a comprehensive analysis including:
                            1. User behavior patterns
                            2. Transaction frequency trends
                            3. Risk assessment
                            4. Notable patterns or anomalies
                            5. Recommendations for the user
                            
                            Format the response in clear sections with headers.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        const result = await response.json();
        return {
            metrics,
            analysis: result.choices[0].message.content,
            success: true
        };

    } catch (error) {
        console.error("Transaction analysis error:", error);
        return {
            success: false,
            error: error.message
        };
    }
};