// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore, collection, addDoc ,getDocs, updateDoc,  doc,deleteDoc  } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {

};

// Initialize Firebase
initializeApp(firebaseConfig);
const db = getFirestore();
const invoicsCollectionRef = collection(db, "invoices");
export {  invoicsCollectionRef, addDoc ,getDocs ,  doc , updateDoc , deleteDoc };
