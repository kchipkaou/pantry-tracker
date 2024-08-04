// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBN3kTM5lauy97FPBtsCJNvLr6btmGpbx0",
  authDomain: "inventory-management-f6039.firebaseapp.com",
  projectId: "inventory-management-f6039",
  storageBucket: "inventory-management-f6039.appspot.com",
  messagingSenderId: "413048593818",
  appId: "1:413048593818:web:c509f73a9f18376123ae23",
  measurementId: "G-TQ0P8Y8WJS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}