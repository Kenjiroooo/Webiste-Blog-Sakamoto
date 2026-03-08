import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileText, Users, MessageSquare, Server, Plus, MoreVertical, Edit, Trash2, Eye, Terminal } from 'lucide-react';
import { ref, onValue, remove, child } from 'firebase/database';
import { database } from '../firebase';

interface Post {
  id: string; // Firebase keys are strings
  title: string;
  slug: string;
  author: string;
  status: string;
  createdAt: string;
  category: string;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);

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
        setPosts(postsArray);
      } else {
        setPosts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const deletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await remove(child(ref(database, 'blogs'), id));
        // local state update not strictly needed if onValue is active, but fine to clear early
      } catch (e) {
        console.error("Error deleting post:", e);
        alert("Failed to delete post. Check your permissions.");
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 px-6 py-8 max-w-7xl mx-auto w-full">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between whitespace-nowrap border-b border-white/10 pb-6 mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-electric/20 flex items-center justify-center text-electric border border-electric/30 shadow-[0_0_15px_rgba(0,127,255,0.2)]">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white leading-tight tracking-tight">System Overview</h2>
            <p className="text-slate-400 font-mono text-sm">Admin Dashboard / v1.0.4</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search registry..."
              className="w-full bg-midnight border border-white/10 rounded-lg py-2 pl-10 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric font-mono text-sm transition-all"
            />
          </div>
          <Link
            to="/admin/editor"
            className="flex items-center justify-center rounded-lg h-10 px-5 bg-electric hover:bg-electric/90 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(0,127,255,0.3)] gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Post</span>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { title: 'Total Posts', value: posts.length, icon: FileText, color: 'text-electric', bg: 'bg-electric/10', border: 'border-electric/20', trend: '+12%' },
          { title: 'Total Users', value: '1,204', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', trend: '+5%' },
          { title: 'Total Feedback', value: '342', icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', trend: '+2%' },
          { title: 'Server Uptime', value: '99.9%', icon: Server, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', trend: '-0.1%' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="flex flex-col gap-4 rounded-2xl p-6 border border-white/5 bg-midnight shadow-[0_0_20px_rgba(0,0,0,0.3)] relative overflow-hidden group"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl group-hover:bg-white/10 transition-colors"></div>
            <div className="flex items-center justify-between relative z-10">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
              <div className={`${stat.color} ${stat.bg} p-2.5 rounded-xl border ${stat.border}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-white tracking-tight text-4xl font-black mb-2">{stat.value}</p>
              <p className={`text-xs font-mono ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stat.trend} this month
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-electric" />
          Post Registry
        </h2>
      </div>

      <div className="border border-white/10 rounded-2xl overflow-hidden bg-midnight shadow-[0_0_30px_rgba(0,0,0,0.4)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-obsidian/50 border-b border-white/10">
                <th className="px-6 py-5 text-slate-400 text-xs font-bold uppercase tracking-wider">Title</th>
                <th className="px-6 py-5 text-slate-400 text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Author</th>
                <th className="px-6 py-5 text-slate-400 text-xs font-bold uppercase tracking-wider">Category</th>
                <th className="px-6 py-5 text-slate-400 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-slate-400 text-xs font-bold uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="px-6 py-5 text-right text-slate-400 text-xs font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="text-white text-sm font-bold group-hover:text-electric transition-colors">{post.title}</p>
                    <p className="text-slate-500 font-mono text-[10px] mt-1 sm:hidden">{post.author} • {new Date(post.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-5 text-slate-300 text-sm hidden sm:table-cell font-medium">{post.author}</td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-electric/10 text-electric border border-electric/20">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${post.status === 'Published'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${post.status === 'Published' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-400 font-mono text-xs hidden md:table-cell">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/post/${post.slug}`} className="p-2 text-slate-400 hover:text-electric transition-colors rounded-lg hover:bg-electric/10">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link to={`/admin/editor/${post.id}`} className="p-2 text-slate-400 hover:text-electric transition-colors rounded-lg hover:bg-electric/10">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => deletePost(post.id)} className="p-2 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-mono text-sm">
                    No records found in registry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Dummy Search icon since it wasn't imported initially
function Search(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
}
