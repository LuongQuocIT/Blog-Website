import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCYjCzwUYdLPD_M-m96bGVBQJB2yfn502I",
  authDomain: "reactjs-blog-website-5fdf7.firebaseapp.com",
  projectId: "reactjs-blog-website-5fdf7",
  storageBucket: "reactjs-blog-website-5fdf7.firebasestorage.app",
  messagingSenderId: "924835646325",
  appId: "1:924835646325:web:08dcf91fa6d42e1a29e13c",
  measurementId: "G-P6WKHLDTQN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const authWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const auth = getAuth();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const idToken = await user.getIdToken(); // ✅ lấy token chuẩn để gửi server
        return { user, accessToken: idToken };
    } catch (err) {
        console.error("🔥 Firebase login error:", err);
        return null;
    }
};