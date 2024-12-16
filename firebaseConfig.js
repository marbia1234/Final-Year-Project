// firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD0Uzcntrjzwp9Owe2gnnCDrkyOvKyTsv4",
    authDomain: "eggplant-8c790.firebaseapp.com",
    projectId: "eggplant-8c790",
    storageBucket: "eggplant-8c790.appspot.com",
    messagingSenderId: "93967196213",
    appId: "1:93967196213:web:d0208260b4fb0bee7dd17c"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

const database = getDatabase(app);
const storage = getStorage(app);

export { auth, database, storage };
