import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyBKmhvY0K0NtmbTwRM1hqyYw_jJMYeOcnQ",
  authDomain: "tf-task-manager-83f70.firebaseapp.com",
  projectId: "tf-task-manager-83f70",
  storageBucket: "tf-task-manager-83f70.firebasestorage.app",
  messagingSenderId: "841011545997",
  appId: "1:841011545997:web:e08b9066ea06a201bc5fc4",
  measurementId: "G-MR062BZTLK"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);