import { Link, useLocation } from 'react-router-dom';
import { Cpu, Terminal } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="text-xl font-bold tracking-tight text-white">Sakamoto's Tech Blog</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {!isAdmin ? (
            <>
              <Link to="/" className="text-sm font-medium text-slate-400 hover:text-electric transition-colors">Home</Link>
              <Link to="/feedback" className="text-sm font-medium text-slate-400 hover:text-electric transition-colors">Feedback</Link>
              <Link to="/admin/login" className="px-5 py-2 rounded-lg bg-electric/10 text-electric border border-electric/20 hover:bg-electric hover:text-white transition-all text-sm font-bold shadow-[0_0_15px_rgba(0,127,255,0.2)]">
                Admin Login
              </Link>
            </>
          ) : (
            <>
              <Link to="/admin/dashboard" className="text-sm font-medium text-slate-400 hover:text-electric transition-colors">Dashboard</Link>
              <Link to="/admin/editor" className="text-sm font-medium text-slate-400 hover:text-electric transition-colors">New Post</Link>
              <Link to="/" className="px-5 py-2 rounded-lg bg-slate-800 text-white border border-white/10 hover:bg-slate-700 transition-all text-sm font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Exit Admin
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
