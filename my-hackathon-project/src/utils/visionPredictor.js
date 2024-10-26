import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const GROQ_API_KEY = "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";

export const predictPriceFromImage = async (imageBlob) => {
    try {
        // Upload image to Firebase Storage
        const imageRef = ref(storage, `temp-predictions/${Date.now()}.jpg`);
        await uploadBytes(imageRef, imageBlob);
        const imageUrl = await getDownloadURL(imageRef);

        // Call Groq API for text analysis
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
                        content: "You are a price prediction assistant. Based on the image description, estimate the market price in INR."
                    },
                    {
                        role: "user",
                        content: "Analyze this image and provide a price estimate in INR, along with item identification and confidence level. Format response as JSON with predictedPrice (number), itemName (string), and confidence (number between 0-100)."
                    }
                ],
                temperature: 0.3,
                max_tokens: 150
            })
        });

        const data = await response.json();
        
        // Provide default response if API fails
        if (!data.choices || !data.choices[0]?.message?.content) {
            return {
                predictedPrice: 0,
                itemName: "Unknown Item",
                confidence: 0
            };
        }

        try {
            // Try to parse the response as JSON
            const result = JSON.parse(data.choices[0].message.content);
            return {
                predictedPrice: result.predictedPrice || 0,
                itemName: result.itemName || "Unknown Item",
                confidence: result.confidence || 0
            };
        } catch (parseError) {
            // If JSON parsing fails, extract information from text
            const content = data.choices[0].message.content;
            return {
                predictedPrice: 0,
                itemName: "Analysis Failed",
                confidence: 0,
                rawResponse: content
            };
        }
    } catch (error) {
        console.error('Error in price prediction:', error);
        return {
            predictedPrice: 0,
            itemName: "Error in Analysis",
            confidence: 0,
            error: error.message
        };
    }
};
