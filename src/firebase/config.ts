import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Debug: Check if environment variables are loaded
console.log('Firebase Config Check:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Present' : 'Missing',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'Present' : 'Missing',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Present' : 'Missing',
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCGvsJzOpkOdQT-iiOhEpRtCE3Q2oLklhE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'studysync-ai-83ae6.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'studysync-ai-83ae6',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'studysync-ai-83ae6.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '365968725293',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:365968725293:web:17a02f4a75547cdbe46fac'
};

// Validate that we have at least an API key
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'AIzaSyCGvsJzOpkOdQT-iiOhEpRtCE3Q2oLklhE') {
  console.error('⚠️ Firebase API key is missing and is therefore using the default value.');
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);