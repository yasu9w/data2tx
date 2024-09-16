import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/storage";
import "firebase/compat/firestore";

//export const firebaseConfig = {
//    apiKey: "AIzaSyDdU1xPtz5HXh -Be_5lzZYAzSvrX3q3FZw", //process.env.API_KEY,
//    authDomain: "aifoods-f8902.firebaseapp.com", //process.env.AUTH_DOMAIN,
//    projectId: "aifoods-f8902", //process.env.PROJECT_ID,
//    storageBucket: "aifoods-f8902.appspot.com", //process.env.STORAGE_BUCKET,
//    messagingSenderId: "443980374690", //process.env.MESSAGING_SENDER_ID,
//    appId: "1:443980374690:web:42d279f5c40b1c6198edfb", //process.env.APP_ID,
//    measurementId: "G-3K0704R9X8", //process.env.MEASUREMENT_ID,
//};

export const firebaseConfig = {
    apiKey: "AIzaSyDIT3jFmwd9nJemQEPkoQGyMa4HxWUBv5w",
    authDomain: "aifoods3.firebaseapp.com",
    projectId: "aifoods3",
    storageBucket: "aifoods3.appspot.com",
    messagingSenderId: "413794843993",
    appId: "1:413794843993:web:61532b845f91195932e048",
    measurementId: "G-DK4YBM24EL"
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