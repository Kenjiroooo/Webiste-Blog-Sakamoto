import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Cpu, HardDrive, Bot, Search, ArrowRight, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

interface Post {
  id: string; // Firebase keys are strings
  title: string;
  slug: string;
  content: string;
  author: string;
  category: string;
  featuredImage: string;
  createdAt: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Topics');

  useEffect(() => {
    const postsRef = ref(database, 'blogs');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const postsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        // Sort by createdAt descending
        postsArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        // Filter out drafts if they exist
        const publishedPosts = postsArray.filter(post => post.status !== 'Draft');
        setPosts(publishedPosts);
      } else {
        setPosts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  const filteredPosts = regularPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All Topics' || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All Topics', 'Hardware', 'Robotics', 'AI & ML', 'Embedded'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      {featuredPost && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-16 group shadow-[0_0_40px_rgba(0,127,255,0.1)] border border-white/5"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent z-10"></div>
          <img
            src={featuredPost.featuredImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000'}
            alt={featuredPost.title}
            className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 w-full max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric/20 text-electric border border-electric/30 backdrop-blur-sm mb-6">
              <Star className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider uppercase">Featured</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              {featuredPost.title}
            </h1>
            <p className="text-slate-300 text-lg mb-8 line-clamp-2">
              {featuredPost.content.replace(/#/g, '').substring(0, 150)}...
            </p>
            <Link
              to={`/post/${featuredPost.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-electric hover:bg-electric/90 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(0,127,255,0.3)] hover:shadow-[0_0_30px_rgba(0,127,255,0.5)]"
            >
              Read Full Article <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Terminal className="w-5 h-5 text-electric animate-pulse" />
          </div>
          <input
            type="text"
            placeholder="Search insights />_"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-midnight border border-white/10 rounded-xl py-4 pl-12 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric font-mono transition-all"
          />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-4 rounded-xl font-medium whitespace-nowrap transition-all ${activeCategory === cat
                  ? 'bg-electric text-white shadow-[0_0_15px_rgba(0,127,255,0.3)]'
                  : 'bg-midnight text-slate-400 border border-white/5 hover:bg-slate-800 hover:text-slate-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="flex items-center gap-3 mb-8">
        <Cpu className="w-6 h-6 text-electric" />
        <h2 className="text-2xl font-bold text-white">Latest Publications</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post, index) => (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={post.id}
            className="flex flex-col bg-midnight rounded-2xl overflow-hidden border border-white/5 glow-hover group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={post.featuredImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000'}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-obsidian/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-md border border-white/10">
                {post.category}
              </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-electric transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-slate-400 text-sm mb-6 line-clamp-3">
                {post.content.replace(/#/g, '').substring(0, 100)}...
              </p>
              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-white/10">
                    {post.author.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-200">{post.author}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/post/${post.slug}`}
                  className="w-8 h-8 rounded-full bg-electric/10 flex items-center justify-center text-electric group-hover:bg-electric group-hover:text-white transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
