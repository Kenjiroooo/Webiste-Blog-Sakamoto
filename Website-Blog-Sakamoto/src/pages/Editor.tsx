import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Terminal, Save, Send, Image, Link as LinkIcon, List, Code, Bold, Italic, Settings, Upload, Loader2 } from 'lucide-react';
import { ref, get, set, push, child } from 'firebase/database';
import { database, auth } from '../firebase';

// Compress image client-side and return a base64 data URL
function compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [uploading, setUploading] = useState(false);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const contentImageRef = useRef<HTMLInputElement>(null);
  const featuredImageRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    author: 'Admin User',
    category: 'Hardware',
    tags: '',
    featuredImage: '',
    status: 'Draft',
    createdAt: ''
  });

  useEffect(() => {
    if (id) {
      get(child(ref(database, 'blogs'), id))
        .then(snapshot => {
          if (snapshot.exists()) {
            setFormData(snapshot.val());
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' && !id ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') } : {})
    }));
  };

  // Upload image and insert into content
  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      // Store the image in a separate Firebase node
      const imgRef = push(ref(database, 'images'));
      await set(imgRef, { data: dataUrl, name: file.name, createdAt: new Date().toISOString() });

      const textarea = contentRef.current;
      const cursorPos = textarea?.selectionStart || formData.content.length;
      // Use the Firebase image key as a reference
      const markdownImg = `\n![${file.name}](dbimg:${imgRef.key})\n`;
      const newContent = formData.content.slice(0, cursorPos) + markdownImg + formData.content.slice(cursorPos);
      setFormData(prev => ({ ...prev, content: newContent }));
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Upload image and set as featured image
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFeatured(true);
    try {
      const url = await compressImage(file);
      setFormData(prev => ({ ...prev, featuredImage: url }));
    } catch (err) {
      console.error(err);
      alert('Failed to upload featured image. Please try again.');
    } finally {
      setUploadingFeatured(false);
      e.target.value = '';
    }
  };

  const handleSave = async (status: string) => {
    const postData = {
      ...formData,
      status,
      authorId: auth.currentUser?.uid || 'anonymous',
      createdAt: formData.createdAt || new Date().toISOString()
    };

    try {
      if (id) {
        await set(child(ref(database, 'blogs'), id), postData);
      } else {
        const newPostRef = push(ref(database, 'blogs'));
        await set(newPostRef, postData);
      }
      navigate('/admin/dashboard');
    } catch (e) {
      console.error("Error saving post:", e);
      alert("Failed to save post. Are you logged in?");
    }
  };

  if (loading) return <div className="p-12 text-center text-electric font-mono animate-pulse">Loading editor...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)] overflow-hidden bg-obsidian">
      {/* Hidden file inputs */}
      <input type="file" ref={contentImageRef} accept="image/*" className="hidden" onChange={handleContentImageUpload} />
      <input type="file" ref={featuredImageRef} accept="image/*" className="hidden" onChange={handleFeaturedImageUpload} />

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col border-r border-white/10 bg-midnight/50">
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-obsidian/80 backdrop-blur-md">
          <div className="flex gap-2">
            {[Bold, Italic, Code, LinkIcon, List].map((Icon, i) => (
              <button key={i} className="p-2.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/20">
                <Icon className="w-4 h-4" />
              </button>
            ))}
            {/* Insert Image Button */}
            <button
              onClick={() => contentImageRef.current?.click()}
              disabled={uploading}
              className={`p-2.5 rounded-lg transition-colors border flex items-center gap-2 ${uploading
                ? 'bg-electric/20 text-electric border-electric/30 cursor-wait'
                : 'hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border-transparent hover:border-emerald-500/30'
                }`}
              title="Upload & insert image into content"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
              <span className="text-xs font-bold hidden sm:inline">{uploading ? 'Uploading...' : 'Add Image'}</span>
            </button>
          </div>
          <div className="text-xs font-mono text-electric bg-electric/10 px-3 py-1.5 rounded-md border border-electric/20">
            Markdown Supported
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 scrollbar-hide">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Post Title here..."
            className="w-full bg-transparent border-none outline-none text-4xl font-black text-white placeholder-slate-600 focus:ring-0 p-0"
          />
          <textarea
            ref={contentRef}
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your masterpiece..."
            className="w-full flex-1 bg-transparent border-none outline-none resize-none font-mono text-lg leading-relaxed text-slate-300 placeholder-slate-600 focus:ring-0 p-0"
          ></textarea>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="w-full lg:w-96 flex flex-col bg-obsidian border-l border-white/10 overflow-y-auto scrollbar-hide">
        <div className="p-6 border-b border-white/10 bg-midnight/30 sticky top-0 z-10 backdrop-blur-md">
          <h3 className="text-lg font-bold text-white flex items-center gap-3">
            <Settings className="w-5 h-5 text-electric" />
            Post Settings
          </h3>
        </div>

        <div className="p-6 space-y-8">
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">URL Slug</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">/</span>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full bg-midnight border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm text-white focus:border-electric focus:ring-1 focus:ring-electric outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-midnight border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-electric focus:ring-1 focus:ring-electric outline-none transition-all appearance-none cursor-pointer"
            >
              <option>Hardware</option>
              <option>Robotics</option>
              <option>AI & ML</option>
              <option>Embedded</option>
              <option>Software</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. react, performance, css"
              className="w-full bg-midnight border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-electric focus:ring-1 focus:ring-electric outline-none transition-all font-mono"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Featured Image</label>
            <button
              onClick={() => featuredImageRef.current?.click()}
              disabled={uploadingFeatured}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold border text-sm ${uploadingFeatured
                ? 'bg-electric/10 text-electric border-electric/20 cursor-wait'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                }`}
            >
              {uploadingFeatured ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploadingFeatured ? 'Uploading...' : 'Upload Featured Image'}
            </button>
            <input
              type="text"
              name="featuredImage"
              value={formData.featuredImage}
              onChange={handleChange}
              placeholder="Or paste URL here..."
              className="w-full bg-midnight border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-electric focus:ring-1 focus:ring-electric outline-none transition-all font-mono"
            />
            {formData.featuredImage && (
              <div className="mt-4 rounded-xl overflow-hidden border border-white/10 h-32 relative">
                <img src={formData.featuredImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-white/10 bg-midnight/30 flex flex-col gap-3">
          <button
            onClick={() => handleSave('Draft')}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all font-bold border border-white/10"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button
            onClick={() => handleSave('Published')}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-electric hover:bg-electric/90 text-white transition-all font-bold shadow-[0_0_20px_rgba(0,127,255,0.4)]"
          >
            <Send className="w-4 h-4" /> Publish Post
          </button>
        </div>
      </div>
    </div>
  );
}
