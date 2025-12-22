import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
let auth;

try {
    // Simple check for required keys
    if (!firebaseConfig.apiKey) {
        throw new Error('VITE_FIREBASE_API_KEY is missing');
    }
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
} catch (error) {
    console.error('❌ Econeura Firebase Init Error:', error);
    // We do NOT export a dummy auth because useAuthLogic depends on real SDK methods.
    // Instead, we let the app load, but auth-dependent features will crash if accessed.
    // The LoginView should ideally check if 'auth' is defined before trying to login.
    // For now, we allow the export to be undefined, or we export a dummy object that throws on use.

    // Safe fallback to prevent white screen crash on import
    auth = {
        currentUser: null,
        // override methods to Log warning
        verifyIdToken: () => Promise.reject("Firebase not initialized"),
    } as any;
}

export { auth };
