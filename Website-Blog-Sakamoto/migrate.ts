import db from './src/db.js';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

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
const auth = getAuth(app);

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'SecureAdminPassword123!';

async function migrateData() {
    try {
        console.log("Attempting to create or sign in admin user...");
        let userCredential;
        try {
            userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
            console.log("Created new admin user.");
        } catch (e: any) {
            if (e.code === 'auth/email-already-in-use') {
                userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
                console.log("Signed in existing admin user.");
            } else {
                throw e;
            }
        }

        const userId = userCredential.user.uid;

        console.log("Reading from SQLite...");
        const postsStmt = db.prepare('SELECT * FROM posts');
        const posts = postsStmt.all();

        const feedStmt = db.prepare('SELECT * FROM feedback');
        const feedbackList = feedStmt.all();

        console.log(`Found ${posts.length} posts. Migrating...`);
        for (const post of posts) {
            const newPostRef = push(ref(database, 'blogs'));
            await set(newPostRef, {
                title: post.title,
                slug: post.slug,
                content: post.content,
                author: post.author,
                category: post.category,
                tags: post.tags || '',
                featuredImage: post.featuredImage || '',
                status: post.status,
                createdAt: new Date(post.createdAt + 'Z').toISOString(), // SQLite dates might lack timezone
                authorId: userId
            });
            console.log(`Migrated post: ${post.title}`);
        }

        console.log(`Found ${feedbackList.length} feedback entries. Migrating...`);
        for (const fb of feedbackList) {
            const newFbRef = push(ref(database, 'feedback'));
            await set(newFbRef, {
                userName: fb.userName,
                email: fb.email,
                message: fb.message,
                gearRating: fb.gearRating,
                date: new Date(fb.date + 'Z').toISOString()
            });
            console.log(`Migrated feedback from: ${fb.userName}`);
        }

        console.log("Migration complete! You can now use ADMIN_EMAIL and ADMIN_PASSWORD to log into the Admin Dashboard.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrateData();
