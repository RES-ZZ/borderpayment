import { storage } from '../firebase';































import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';































































const GROQ_API_KEY = "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";































































export const predictPriceFromImage = async (imageBlob) => {

    try {

        // Convert blob to base64 with image compression

        const compressedImage = await compressImage(imageBlob);

        const base64Image = await blobToBase64(compressedImage);



        // Call Groq API with improved prompt

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

                        content: "You are a price prediction assistant specialized in Indian market prices. When shown an image, identify the item and estimate its current market price in INR. Focus on common consumer goods and provide a confidence level for your prediction."

                    },

                    {

                        role: "user",

                        content: "Analyze this image and provide: 1) Item name 2) Estimated price in INR 3) Confidence level (0-100%). Format your response as: 'Item: [name], Price: ₹[amount], Confidence: [X]%'"

                    }

                ],

                max_tokens: 150,

                temperature: 0.

            })

        });



        if (!response.ok) {

            throw new Error(`API Error: ${response.status}`);

        }



        const data = await response.json();

        console.log("API Response:", data);



        if (!data.choices || !data.choices[0]?.message?.content) {

            throw new Error('Invalid API response');

        }



        // Parse the response with improved regex

        const content = data.choices[0].message.content;



        // More specific regex patterns

        const itemMatch = content.match(/Item:\s*([^,\n]+)/i);

        const priceMatch = content.match(/Price:\s*₹\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);

        const confidenceMatch = content.match(/Confidence:\s*(\d+)%/i);



        const result = {

            predictedPrice: priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0,

            itemName: itemMatch ? itemMatch[1].trim() : "Unknown Item",

            confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 70,

            rawResponse: content

        };



        console.log("Parsed result:", result);

        return result;



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



// Helper function to compress image

const compressImage = async (blob) => {

    return new Promise((resolve) => {

        const canvas = document.createElement('canvas');

        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const img = new Image();



        img.onload = () => {

            // Calculate new dimensions (max 800px)

            let width = img.width;

            let height = img.height;

            const maxSize = 800;



            if (width > height && width > maxSize) {

                height = (height * maxSize) / width;

                width = maxSize;

            } else if (height > maxSize) {

                width = (width * maxSize) / height;

                height = maxSize;

            }



            canvas.width = width;

            canvas.height = height;



            // Draw and compress

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(

                (blob) => resolve(blob),

                'image/jpeg',

                0.6  // Compression quality

            );

        };



        img.src = URL.createObjectURL(blob);

    });

};



// Helper function to convert blob to base64

const blobToBase64 = (blob) => {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onloadend = () => {

            const base64String = reader.result.split(',')[1];

            resolve(base64String);

        };

        reader.onerror = reject;

        reader.readAsDataURL(blob);

    });

};






























































