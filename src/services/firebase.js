import { initializeApp }
from 'firebase/app';

import {
getFirestore
}
from 'firebase/firestore';

import {
getFunctions
}
from 'firebase/functions';

import {
getStorage
}
from 'firebase/storage';

import {
initializeAuth,
getReactNativePersistence,
getAuth
}
from 'firebase/auth';

import AsyncStorage
from '@react-native-async-storage/async-storage';

import {
Platform
} from 'react-native';

const firebaseConfig = {

apiKey:
"AIzaSyDG2syQ-5XRPaACm6uhyucwkY2EPDgJr-Q",

authDomain:
"sis-checklist.firebaseapp.com",

projectId:
"sis-checklist",

storageBucket:
"sis-checklist.firebasestorage.app",

messagingSenderId:
"453929677836",

appId:
"1:453929677836:web:aadb0a85b025db4c77aa29"

};

const app =
initializeApp(firebaseConfig);

export const db =
getFirestore(app);

export const functions =
getFunctions(app);

export const storage =
getStorage(app);

let auth;

if (Platform.OS === 'web') {

auth =
getAuth(app);

} else {

auth =
initializeAuth(app, {

persistence:
getReactNativePersistence(
AsyncStorage
)

});

}

export { auth };
