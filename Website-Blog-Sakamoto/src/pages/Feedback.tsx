import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Settings, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ref, push } from 'firebase/database';
import { database } from '../firebase';

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating.');
      return;
    }

    setStatus('submitting');
    try {
      const feedbackRef = ref(database, 'feedback');
      await push(feedbackRef, {
        userName: formData.name, // matching what SQLite previously stored
        email: formData.email,
        message: formData.message,
        gearRating: rating,
        date: new Date().toISOString()
      });

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setRating(0);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-electric/10 text-electric mb-6 border border-electric/20 shadow-[0_0_30px_rgba(0,127,255,0.2)]">
          <Settings className="w-10 h-10 animate-[spin_10s_linear_infinite]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">System Diagnostics</h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto font-mono">
          Help us calibrate the Sakamoto's Tech Blog platform. Your telemetry data is crucial for our next iteration.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric to-transparent opacity-50"></div>

        {status === 'success' ? (
          <div className="text-center py-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">Telemetry Received</h2>
            <p className="text-slate-400 font-mono mb-8">Data packet successfully transmitted to central servers.</p>
            <button
              onClick={() => setStatus('idle')}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10"
            >
              Send Another Report
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* 5-Gear Rating System */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-electric" />
                System Performance Rating
              </label>
              <div className="flex items-center gap-4 bg-midnight/50 p-6 rounded-2xl border border-white/5 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="relative focus:outline-none group"
                  >
                    <Settings
                      className={`w-12 h-12 transition-all duration-300 ${(hoveredRating || rating) >= star
                        ? 'text-electric drop-shadow-[0_0_15px_rgba(0,127,255,0.6)] scale-110 animate-[spin_4s_linear_infinite]'
                        : 'text-slate-600 hover:text-slate-400'
                        }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-xs font-mono text-slate-500">
                {rating === 0 ? 'Select calibration level' : `Level ${rating} Calibration Selected`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Operator Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-midnight border border-white/10 rounded-xl px-5 py-4 text-white focus:border-electric focus:ring-1 focus:ring-electric outline-none transition-all font-mono placeholder-slate-600"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Comm Link (Email)</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-midnight border border-white/10 rounded-xl px-5 py-4 text-white focus:border-electric focus:ring-1 focus:ring-electric outline-none transition-all font-mono placeholder-slate-600"
                  placeholder="john@domain.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Diagnostic Report</label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full bg-midnight border border-white/10 rounded-xl px-5 py-4 text-white focus:border-electric focus:ring-1 focus:ring-electric outline-none transition-all font-mono placeholder-slate-600 resize-y"
                placeholder="Describe the anomalies or suggest optimizations..."
              ></textarea>
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-3 text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 font-mono text-sm">
                <AlertCircle className="w-5 h-5" />
                Transmission failed. Please verify connection and retry.
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-electric hover:bg-electric/90 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(0,127,255,0.4)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {status === 'submitting' ? (
                <Settings className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  Transmit Data
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
