import express from 'express';
import { createServer as createViteServer } from 'vite';
import db from './src/db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/posts', (req, res) => {
    const stmt = db.prepare('SELECT * FROM posts ORDER BY createdAt DESC');
    const posts = stmt.all();
    res.json(posts);
  });

  app.get('/api/posts/:slug', (req, res) => {
    const stmt = db.prepare('SELECT * FROM posts WHERE slug = ?');
    const post = stmt.get(req.params.slug);
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  });

  app.post('/api/posts', (req, res) => {
    const { title, slug, content, author, category, tags, featuredImage, status } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO posts (title, slug, content, author, category, tags, featuredImage, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(title, slug, content, author, category, tags, featuredImage, status);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/posts/:id', (req, res) => {
    const { title, slug, content, author, category, tags, featuredImage, status } = req.body;
    try {
      const stmt = db.prepare(`
        UPDATE posts
        SET title = ?, slug = ?, content = ?, author = ?, category = ?, tags = ?, featuredImage = ?, status = ?
        WHERE id = ?
      `);
      stmt.run(title, slug, content, author, category, tags, featuredImage, status, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/posts/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/feedback', (req, res) => {
    const stmt = db.prepare('SELECT * FROM feedback ORDER BY date DESC');
    const feedback = stmt.all();
    res.json(feedback);
  });

  app.post('/api/feedback', (req, res) => {
    const { userName, email, message, gearRating } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO feedback (userName, email, message, gearRating)
        VALUES (?, ?, ?, ?)
      `);
      const info = stmt.run(userName, email, message, gearRating);
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
