import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBfmjhLDDw7fKSgZSXxuwhNx1QRFLt_yEM",
    authDomain: "crud-e229f.firebaseapp.com",
    projectId: "crud-e229f",
    storageBucket: "crud-e229f.appspot.com",
    messagingSenderId: "57041408978",
    appId: "1:57041408978:web:9fd567cb3dda44f9f9ae0b",
    measurementId: "G-00X30T89CF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); // Use firebaseConfig here
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

