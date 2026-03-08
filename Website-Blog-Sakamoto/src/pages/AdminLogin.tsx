import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'motion/react';
import { Terminal, Lock, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Access Denied. Invalid credentials or authentication not enabled.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-3xl p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-t border-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric to-transparent opacity-50"></div>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-midnight border border-white/10 mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative group">
              <div className="absolute inset-0 bg-electric/20 rounded-2xl blur-xl group-hover:bg-electric/30 transition-colors"></div>
              <Terminal className="w-10 h-10 text-electric relative z-10" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">System Access</h1>
            <p className="text-slate-400 font-mono text-sm">Enter credentials to proceed.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 flex items-center gap-2">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-obsidian border border-white/10 rounded-xl px-4 py-3 text-white focus:border-electric focus:ring-1 focus:ring-electric outline-none transition-all placeholder-slate-600 shadow-inner"
                  placeholder="admin@example.com"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-electric" />
                Passkey
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-electric font-mono font-bold animate-pulse">{'>'}</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-obsidian border border-white/10 rounded-xl px-5 py-3 pl-10 text-white focus:border-electric focus:ring-1 focus:ring-electric outline-none transition-all font-mono placeholder-slate-600 shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 font-mono text-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-electric hover:bg-electric/90 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(0,127,255,0.4)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm mt-8"
            >
              {loading ? (
                <Terminal className="w-5 h-5 animate-pulse" />
              ) : (
                'Authenticate'
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-xs text-slate-500 font-mono">
              Unauthorized access is strictly prohibited.<br />
              All login attempts are logged.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
