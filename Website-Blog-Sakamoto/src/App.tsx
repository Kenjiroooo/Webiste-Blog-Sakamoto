/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import AdminDashboard from './pages/AdminDashboard';
import Editor from './pages/Editor';
import Feedback from './pages/Feedback';
import AdminLogin from './pages/AdminLogin';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-obsidian text-slate-200 relative">
        <div className="absolute inset-0 bg-circuit pointer-events-none opacity-50"></div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/post/:slug" element={<PostDetail />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/editor" element={<Editor />} />
              <Route path="/admin/editor/:id" element={<Editor />} />
            </Routes>
          </main>
          <footer className="py-6 text-center border-t border-white/10 mt-auto">
            <p className="text-sm text-slate-400 font-mono">
              &copy; 2026 Engr. Kenji D. Sakamoto. All Rights Reserved.
            </p>
          </footer>
        </div>
      </div>
    </Router>
  );
}
