import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/storage";
import "firebase/compat/firestore";

export const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_AUTHDOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGEING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app();
}

//var auth_obj = firebase.auth();
//var storage_obj = firebase.storage();
var db_obj = firebase.firestore();
var storageBucket_original = firebase.app().storage("gs://aifoods-original");
var storageBucket_preview = firebase.app().storage("gs://aifoods-preview");

export default firebase;
//export const auth = auth_obj;
//export const storage = storage_obj;
export const db = db_obj;
export const storage_original = storageBucket_original;
export const storage_preview = storageBucket_preview;