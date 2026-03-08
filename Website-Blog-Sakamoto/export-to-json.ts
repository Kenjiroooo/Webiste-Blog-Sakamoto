import db from './src/db.js';
import * as fs from 'fs';

// Helper function to generate Firebase-like push IDs (approximate)
function generatePushId() {
    const chars = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
    let id = '';
    for (let i = 0; i < 20; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

try {
    const postsStmt = db.prepare('SELECT * FROM posts');
    const posts = postsStmt.all();

    const feedStmt = db.prepare('SELECT * FROM feedback');
    const feedbackList = feedStmt.all();

    const exportData: any = {
        blogs: {},
        feedback: {}
    };

    for (const post of posts) {
        const newId = generatePushId();
        exportData.blogs[newId] = {
            title: post.title,
            slug: post.slug,
            content: post.content,
            author: post.author,
            category: post.category,
            tags: post.tags || '',
            featuredImage: post.featuredImage || '',
            status: post.status,
            createdAt: new Date(post.createdAt + 'Z').toISOString(),
            authorId: 'admin' // placeholder
        };
    }

    for (const fb of feedbackList) {
        const newId = generatePushId();
        exportData.feedback[newId] = {
            userName: fb.userName,
            email: fb.email,
            message: fb.message,
            gearRating: fb.gearRating,
            date: new Date(fb.date + 'Z').toISOString()
        };
    }

    fs.writeFileSync('firebase-export.json', JSON.stringify(exportData, null, 2));
    console.log("Successfully exported SQLite database to firebase-export.json");
} catch (e) {
    console.error("Failed to export:", e);
}
