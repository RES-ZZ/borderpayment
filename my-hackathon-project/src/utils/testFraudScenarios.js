import { analyzeUserTransactionPattern } from "../fraudAnalysis/fraudAnalysis";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

export const testScenarios = [
    {
        name: "High Amount Transaction",
        transaction: {
            amount: "5000",
            recipient: "0x123...",
            senderAddress: "0x456...",
            timestamp: new Date().toISOString()
        },
        expectedRisk: "HIGH"
    },
    {
        name: "Multiple Rapid Transactions",
        transaction: {
            amount: "100",
            recipient: "0x789...",
            senderAddress: "0x456...",
            timestamp: new Date().toISOString()
        },
        previousTransactions: [
            {
                amount: "100",
                recipient: "0x789...",
                timestamp: new Date(Date.now() - 60000).toISOString()
            },
            {
                amount: "100",
                recipient: "0x789...",
                timestamp: new Date(Date.now() - 120000).toISOString()
            }
        ],
        expectedRisk: "MEDIUM"
    },
    {
        name: "New Recipient Large Amount",
        transaction: {
            amount: "1000",
            recipient: "0xNEW...",
            senderAddress: "0x456...",
            timestamp: new Date().toISOString()
        },
        expectedRisk: "MEDIUM"
    },
    {
        name: "Normal Transaction",
        transaction: {
            amount: "10",
            recipient: "0x123...",
            senderAddress: "0x456...",
            timestamp: new Date().toISOString()
        },
        expectedRisk: "LOW"
    }
];

export const testFraudDetection = async () => {
    const results = [];

    for (const scenario of testScenarios) {
        try {
            // Add test transactions to Firebase if needed
            if (scenario.previousTransactions) {
                for (const tx of scenario.previousTransactions) {
                    await addDoc(collection(db, "transactions"), {
                        ...tx,
                        senderAddress: scenario.transaction.senderAddress
                    });
                }
            }

            // Run fraud detection
            const analysis = await analyzeUserTransactionPattern(
                scenario.transaction.senderAddress,
                scenario.transaction
            );

            // Compare results
            const passed = analysis.riskLevel === scenario.expectedRisk;
            results.push({
                scenario: scenario.name,
                passed,
                expected: scenario.expectedRisk,
                received: analysis.riskLevel,
                details: analysis,
                anomalies: analysis.anomalies || [],
                recommendations: analysis.recommendations || []
            });

        } catch (error) {
            results.push({
                scenario: scenario.name,
                passed: false,
                error: error.message
            });
        }
    }

    return results;
};