// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6eyj94NXwDQ1i010U1iX_bVt2JvbaNxc",
  authDomain: "vote-ready-test.firebaseapp.com",
  projectId: "vote-ready-test",
  storageBucket: "vote-ready-test.appspot.com",
  messagingSenderId: "838659287017",
  appId: "1:838659287017:web:cd07b542f946e2db9b8d78",
  measurementId: "G-04E50HYSPE"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const app = getFirestore(firebaseApp);
  
  export { app };