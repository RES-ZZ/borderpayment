// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Add this
import { collection } from 'firebase/firestore';

// Import the functions you need from the SDKs you need

import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCIfq2l7vgh8cXZl_aLUPlSUEUiOYfKF8A",
    authDomain: "borderpayment.firebaseapp.com",
    projectId: "borderpayment",
    storageBucket: "borderpayment.appspot.com",
    messagingSenderId: "742305168932",
    appId: "1:742305168932:web:d28d700a12ddd1a06ea2b1",
    measurementId: "G-HKFVB831ER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app); // Add this

// Create payments collection reference
export const paymentsCollection = collection(db, 'payments');
