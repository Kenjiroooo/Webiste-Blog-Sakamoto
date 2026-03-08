import Database from 'better-sqlite3';

const db = new Database('database.sqlite', { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT,
    featuredImage TEXT,
    status TEXT DEFAULT 'Draft',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userName TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    gearRating INTEGER NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed some initial data if empty
const stmt = db.prepare('SELECT COUNT(*) as count FROM posts');
const { count } = stmt.get() as { count: number };

if (count === 0) {
  const insertPost = db.prepare(`
    INSERT INTO posts (title, slug, content, author, category, tags, featuredImage, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPost.run(
    'Quantum Computing Breakthroughs',
    'quantum-computing-breakthroughs',
    'Exploring the next frontier of processing power. How stable qubits are changing the landscape of cryptography and complex simulations.\\n\\n## The Qubit Revolution\\nUnlike classical bits, qubits can exist in a superposition of states...',
    'Dr. Alan Turing',
    'Hardware',
    'quantum, computing, cryptography',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1000',
    'Published'
  );

  insertPost.run(
    'RISC-V Architecture: The Open Source Hardware Revolution',
    'risc-v-architecture',
    'An in-depth look at how the open-source instruction set architecture is challenging traditional proprietary chip designs.\\n\\n## Why RISC-V?\\nIt provides a free and open ISA enabling a new era of processor innovation...',
    'Jane Doe',
    'Hardware',
    'risc-v, architecture, open-source',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000',
    'Published'
  );
}

export default db;
