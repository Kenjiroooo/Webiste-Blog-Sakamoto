import { initializeApp } from "firebase/app";
import { getDatabase, ref, query, orderByChild, equalTo, get } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyA0JCeUA3If9mlTJvjtu8udoQQdky6QRzE",
    authDomain: "udd-cpe-blog-sakamoto.firebaseapp.com",
    databaseURL: "https://udd-cpe-blog-sakamoto-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "udd-cpe-blog-sakamoto",
    storageBucket: "udd-cpe-blog-sakamoto.firebasestorage.app",
    messagingSenderId: "479484817482",
    appId: "1:479484817482:web:42dfa74a4f12ea63d536b3",
    measurementId: "G-0SYDTS2V0Q"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const postsRef = ref(database, 'blogs');
const slug = 'risc-v-architecture';
const q = query(postsRef, orderByChild('slug'), equalTo(slug));

get(q).then(snapshot => {
    if (snapshot.exists()) {
        console.log("SUCCESS! Got data:", snapshot.val());
    } else {
        console.log("FAILED to find anything for slug:", slug);
    }
    process.exit(0);
}).catch(err => {
    console.error("ERROR", err);
    process.exit(1);
});
