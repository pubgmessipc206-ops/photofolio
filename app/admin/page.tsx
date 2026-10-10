'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface MediaItem {
  id: string;
  title: string;
  url: string;
  type: string;
  section: string;
  created_at: string;
}

function getYouTubeEmbedUrl(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
}

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const [title, setTitle] = useState('');
  const [section, setSection] = useState('gallery');
  const [uploadMode, setUploadMode] = useState<'file' | 'youtube'>('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);

  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    setMounted(true);
    const savedAuth = sessionStorage.getItem('admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      fetchMedia();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      fetchMedia();
    } else {
      alert('كلمة السر غير صحيحة!');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const fetchMedia = async () => {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMediaList(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (uploadMode === 'youtube') {
        if (!title) throw new Error('الرجاء إدخال عنوان العنصر!');
        if (!youtubeUrl) throw new Error('الرجاء إدخال رابط يوتيوب!');
        const embedUrl = getYouTubeEmbedUrl(youtubeUrl);
        if (!embedUrl) throw new Error('رابط يوتيوب غير صحيح!');

        const { error: dbError } = await supabase.from('media_items').insert([
          {
            title,
            url: youtubeUrl,
            type: 'video',
            section,
          },
        ]);

        if (dbError) throw dbError;
      } else {
        if (files.length === 0) throw new Error('الرجاء اختيار ملف واحد على الأقل لرفعه!');

        // رفع جميع الملفات المختارة
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${i}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${section}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('media')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);

          const publicUrl = publicUrlData.publicUrl;
          const isVideo = file.type.startsWith('video');

          // لو المستخدم كاتب عنوان نستخدمه، لو رفع أكتر من ملف وما كتبش عنوان نستخدم اسم الملف
          const itemTitle = title
            ? (files.length > 1 ? `${title} (${i + 1})` : title)
            : file.name.replace(/\.[^/.]+$/, "");

          const { error: dbError } = await supabase.from('media_items').insert([
            {
              title: itemTitle,
              url: publicUrl,
              type: isVideo ? 'video' : 'image',
              section,
            },
          ]);

          if (dbError) throw dbError;
        }
      }

      alert(`تم رفع ${files.length > 0 ? files.length : 1} عنصر بنجاح! 🎉`);
      setTitle('');
      setYoutubeUrl('');
      setFiles([]);
      fetchMedia();
    } catch (error: any) {
      alert('حدث خطأ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      const { error } = await supabase.from('media_items').delete().eq('id', id);
      if (error) throw error;

      alert('تم الحذف بنجاح');
      fetchMedia();
    } catch (error: any) {
      alert('حدث خطأ أثناء الحذف: ' + error.message);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        جاري التحميل...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white rtl" dir="rtl">
        <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full text-center space-y-6">
          <div className="text-5xl">🔒</div>
          <h1 className="text-2xl font-bold text-amber-400">لوحة التحكم المغلقة</h1>
          <p className="text-sm text-slate-400">يرجى إدخال كلمة السر للدخول</p>

          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="أدخل كلمة السر هنا"
            className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-center focus:outline-none focus:border-amber-400 transition"
            required
          />

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 font-bold rounded-xl text-slate-950 transition"
          >
            دخول للوحة التحكم 🚀
          </button>
        </form>

        <Link href="/" className="mt-6 text-slate-400 hover:text-amber-400 text-sm font-semibold transition">
          ← العودة للصفحة الرئيسية للموقع
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-10 rtl" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-400">
            لوحة تحكم Pʜᴏᴛᴏ • Kʜᴏʟɪᴏ 📸
          </h1>
          <div className="flex gap-3">
            <Link
              href="/"
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-1"
            >
              عرض الموقع 🌐
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-lg"
            >
              تسجيل خروج 🔒
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-2xl space-y-4 mb-10 shadow-xl border border-slate-700">
          <h2 className="text-xl font-semibold text-slate-200">إضافة صور أو فيديوهات متعددة</h2>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">العنوان (اختياري عند رفع صور متعددة):</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: جلسة تصوير ساحلية (سيتم ترقيم العنوان تلقائياً)"
              className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">القسم المخصص:</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-amber-400 transition"
            >
              <option value="hero">Hero (السلايدر الرئيسي)</option>
              <option value="about">About (قسم من نحن)</option>
              <option value="reels">Reels & Shorts (فيديوهات الريلز القصيرة 📱)</option>
              <option value="gallery">Gallery (معرض الصور والفيديوهات العادي)</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">طريقة الإضافة:</label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`py-2 px-4 rounded-xl text-sm font-bold border transition ${
                  uploadMode === 'file'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-700 text-slate-300 border-slate-600'
                }`}
              >
                📁 رفع ملفات متعددة (صور / فيديوهات)
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('youtube')}
                className={`py-2 px-4 rounded-xl text-sm font-bold border transition ${
                  uploadMode === 'youtube'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-700 text-slate-300 border-slate-600'
                }`}
              >
                🎬 يوتيوب / شورتس (رابط)
              </button>
            </div>
          </div>

          {uploadMode === 'youtube' ? (
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">رابط يوتيوب أو شورتس (YouTube / Shorts):</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="مثال: https://youtube.com/shorts/xxxxx أو رابط عادي"
                className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-amber-400 transition text-left dir-ltr"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-300">اختر الملفات (يمكنك تحديد عدة صور معاً):</label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="w-full p-2 rounded-xl bg-slate-700 border border-slate-600 text-white cursor-pointer text-sm"
                required
              />
              {files.length > 0 && (
                <p className="mt-2 text-xs text-amber-400 font-semibold">
                  تم تحديد {files.length} ملف جاهز للرفع 📸
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 font-bold rounded-xl transition text-slate-950 disabled:opacity-50 mt-4"
          >
            {loading ? 'جاري رفع الملفات...' : `رفع وحفظ الآن (${files.length || 1}) 🚀`}
          </button>
        </form>

        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-slate-200">العناصر المضافة حالياً</h2>

          {mediaList.length === 0 ? (
            <p className="text-slate-400 text-center py-6">لا توجد عناصر بعد.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {mediaList.map((item) => {
                const ytEmbed = getYouTubeEmbedUrl(item.url);

                return (
                  <div key={item.id} className="bg-slate-700/60 p-3 rounded-xl border border-slate-600/50 flex flex-col justify-between">
                    <div>
                      {ytEmbed ? (
                        <iframe
                          src={ytEmbed}
                          className="w-full h-36 rounded-lg mb-2"
                          allowFullScreen
                        />
                      ) : item.type === 'video' ? (
                        <video src={item.url} controls className="w-full h-36 object-cover rounded-lg mb-2" />
                      ) : (
                        <img src={item.url} alt={item.title} className="w-full h-36 object-contain bg-slate-900 rounded-lg mb-2" />
                      )}
                      <h3 className="font-bold text-sm text-slate-100 truncate">{item.title}</h3>
                      <div className="flex gap-2 items-center mt-2">
                        <span className="text-xs font-semibold text-amber-400 bg-slate-800 px-2 py-0.5 rounded">
                          {item.section}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="mt-4 w-full py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition"
                    >
                      حذف 🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}