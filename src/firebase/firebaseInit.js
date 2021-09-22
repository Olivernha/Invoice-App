// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore, collection, addDoc } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAsLaMXb8iWHoq0mrAND9-zCEjVBRYjWE",
  authDomain: "invoice-app-01.firebaseapp.com",
  projectId: "invoice-app-01",
  storageBucket: "invoice-app-01.appspot.com",
  messagingSenderId: "273310150255",
  appId: "1:273310150255:web:d796be872bb95eb789e79a",
};

// Initialize Firebase
initializeApp(firebaseConfig);
const db = getFirestore();
const invoicsCollectionRef = collection(db, "invoices");
export {  invoicsCollectionRef, addDoc };
