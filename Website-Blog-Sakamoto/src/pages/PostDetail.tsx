import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Cpu, Terminal, Bookmark, Share2, MessageSquare, Code, Cpu as Microchip } from 'lucide-react';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { database } from '../firebase';

interface Post {
  id: string; // Firebase keys are strings
  title: string;
  slug: string;
  content: string;
  author: string;
  category: string;
  tags: string;
  featuredImage: string;
  createdAt: string;
}

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const postsRef = ref(database, 'blogs');
    const q = query(postsRef, orderByChild('slug'), equalTo(slug));

    get(q).then(snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const key = Object.keys(data)[0];
        setPost({ id: key, ...data[key] });
      } else {
        setPost(null);
      }
      setLoading(false);
    }).catch((error) => {
      console.error(error);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Terminal className="w-12 h-12 text-electric animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold text-white">404 - Not Found</h1>
        <p className="text-slate-400 font-mono">The requested resource could not be located.</p>
        <Link to="/" className="text-electric hover:underline mt-4">Return Home</Link>
      </div>
    );
  }

  // Component to load images stored in Firebase DB
  function DbImage({ imgKey, alt }: { imgKey: string; alt: string }) {
    const [src, setSrc] = useState<string>('');
    useEffect(() => {
      get(ref(database, `images/${imgKey}/data`)).then(snap => {
        if (snap.exists()) setSrc(snap.val());
      });
    }, [imgKey]);
    if (!src) return <div className="my-8 h-48 rounded-2xl bg-midnight border border-white/10 flex items-center justify-center"><span className="text-slate-500 animate-pulse">Loading image...</span></div>;
    return (
      <div className="my-8 rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,127,255,0.1)] group">
        <img src={src} alt={alt} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 bg-midnight" />
      </div>
    );
  }

  // Markdown parser
  const renderContent = (content: string) => {
    // Normalize: handle escaped \\n, \r\n, and \r
    const normalized = content.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');

    return lines.map((rawLine, i) => {
      const line = rawLine.trimEnd();

      // Headings
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-5">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-bold text-white mt-8 mb-4">{line.replace('### ', '')}</h3>;
      }

      // Standalone image line
      const imgMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const [, alt, src] = imgMatch;
        // Handle dbimg: references (stored in Firebase DB)
        if (src.startsWith('dbimg:')) {
          const key = src.replace('dbimg:', '');
          return <DbImage key={i} imgKey={key} alt={alt} />;
        }
        // Handle regular URLs and data URLs
        return (
          <div key={i} className="my-8 rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,127,255,0.1)] group">
            <img src={src} alt={alt} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 bg-midnight" />
          </div>
        );
      }

      // Code block
      if (line.startsWith('```')) {
        return (
          <div key={i} className="my-6 rounded-xl border border-white/10 bg-[#1e1e1e] overflow-hidden shadow-[0_0_20px_rgba(0,127,255,0.1)]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#404040]">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <Code className="w-4 h-4" /> snippet
              </span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-[#d4d4d4]">
              <code>{line.replace(/```/g, '')}</code>
            </pre>
          </div>
        );
      }

      // Empty line
      if (line.trim() === '') return <br key={i} />;

      // List items
      if (line.trim().startsWith('* ')) {
        const listContent = line.trim().replace(/^\* /, '');
        const formatted = listContent
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="text-slate-200">$1</em>');
        return <li key={i} className="mb-2 text-lg text-slate-300 leading-relaxed ml-6 list-disc" dangerouslySetInnerHTML={{ __html: formatted }} />;
      }

      // Regular paragraph — also handle inline images
      let html = line;
      html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-4 w-full border border-white/10" />');
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em class="text-slate-200">$1</em>');
      html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-electric hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

      return <p key={i} className="mb-6 text-lg text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 min-w-0"
      >
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-md bg-electric/10 text-electric text-xs font-bold tracking-wider uppercase border border-electric/20">
              {post.category}
            </span>
            {post.tags && post.tags.split(',').map(tag => (
              <span key={tag} className="px-3 py-1 rounded-md bg-white/5 text-slate-400 text-xs font-bold tracking-wider uppercase border border-white/10">
                {tag.trim()}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center justify-between border-y border-white/10 py-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-300 border border-white/10">
                {post.author.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-white text-lg">{post.author}</div>
                <div className="text-sm text-slate-400 font-mono">
                  {new Date(post.createdAt).toLocaleDateString()} • 10 min read
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/20">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/20">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <figure className="mb-12 w-full relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-electric to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <img
            src={post.featuredImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000'}
            alt={post.title}
            className="relative w-full h-[400px] sm:h-[500px] object-cover rounded-2xl border border-white/10 shadow-2xl"
          />
        </figure>

        <article className="prose prose-invert prose-lg max-w-none font-sans">
          {renderContent(post.content)}
        </article>

        <section className="border-t border-white/10 pt-12 mt-16">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-electric" />
            Developer Discussion (12)
          </h3>

          <div className="flex gap-6 mb-12">
            <div className="w-12 h-12 rounded-full bg-slate-800 shrink-0 border border-white/10 flex items-center justify-center font-bold">
              U
            </div>
            <div className="flex-1">
              <textarea
                className="w-full rounded-xl bg-midnight border border-white/10 p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric resize-y transition-all font-mono text-sm"
                placeholder="Share your technical insights..."
                rows={4}
              ></textarea>
              <div className="flex justify-end mt-4">
                <button className="bg-electric hover:bg-electric/90 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-[0_0_15px_rgba(0,127,255,0.3)]">
                  Post Comment
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-slate-800 shrink-0 border border-white/10 flex items-center justify-center font-bold">
                AC
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-white">Alex Chen</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-electric/20 text-electric border border-electric/30 flex items-center gap-1">
                    <Code className="w-3 h-3" /> Developer
                  </span>
                  <span className="text-xs text-slate-500 font-mono ml-auto">2 hours ago</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed bg-midnight p-5 rounded-2xl rounded-tl-none border border-white/5 shadow-lg">
                  Great write-up. The systolic array architecture is fascinating. I'm currently working on a compiler optimization pass that maximizes data reuse in these arrays. Have you looked into how quantization affects the memory bandwidth requirements specifically for edge NPUs?
                </p>
              </div>
            </div>
          </div>
        </section>
      </motion.main>

      <aside className="w-full lg:w-80 shrink-0">
        <div className="sticky top-24 space-y-8">
          <div className="glass rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
              <Terminal className="w-5 h-5 text-electric" />
              Related Tech Articles
            </h3>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Link key={i} to="#" className="group flex gap-4 items-start">
                  <div className="w-20 h-20 rounded-xl bg-slate-800 shrink-0 border border-white/10 overflow-hidden relative">
                    <div className="absolute inset-0 bg-circuit opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-electric transition-colors line-clamp-2 leading-snug mb-2">
                      Optimizing Transformers for Edge Devices
                    </h4>
                    <span className="text-xs text-slate-500 font-mono">Oct 10 • 8 min read</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-electric/20 to-purple-600/20 rounded-2xl p-6 border border-electric/30 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-circuit opacity-20"></div>
            <div className="relative z-10">
              <Terminal className="w-10 h-10 text-electric mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-3">Join the Newsletter</h3>
              <p className="text-sm text-slate-300 mb-6">Get the latest deep dives into hardware and systems engineering.</p>
              <input
                type="email"
                placeholder="developer@domain.com"
                className="w-full rounded-xl bg-obsidian/50 border border-white/20 px-4 py-3 text-sm mb-4 focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric font-mono text-white placeholder-slate-500 backdrop-blur-sm"
              />
              <button className="w-full bg-electric hover:bg-electric/90 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,127,255,0.4)]">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div >
  );
}
