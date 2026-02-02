import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCgYLmjrH80Yy8yLysWPZL0Be90kgMxSrQ",
  authDomain: "strangerthings-b3a79.firebaseapp.com",
  projectId: "strangerthings-b3a79",
  storageBucket: "strangerthings-b3a79.firebasestorage.app",
  messagingSenderId: "716054434731",
  appId: "1:716054434731:web:420c4f70d305ba620478ee" // Double check if this ID is complete!
};

const app = initializeApp(firebaseConfig);
console.log("Firebase App Initialized", firebaseConfig.projectId);

export const auth = getAuth(app);

// Modern way to initialize Firestore with persistence and multi-tab support
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true, // Force HTTP instead of WebSockets to bypass firewall/proxy issues
});

export const storage = getStorage(app);
