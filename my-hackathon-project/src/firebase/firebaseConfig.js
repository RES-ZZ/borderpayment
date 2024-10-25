// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCd5RzMGZI2kM6Kfhtc2n-dJA5F9b3Sz4Y",
    authDomain: "border-payment.firebaseapp.com",
    projectId: "border-payment",
    storageBucket: "border-payment.appspot.com",
    messagingSenderId: "628404843659",
    appId: "1:628404843659:web:85b59f0958a0a6e37fd08e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
