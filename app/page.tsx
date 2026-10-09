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

export default function HomePage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMediaList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const heroItems = mediaList.filter((item) => item.section === 'hero');
  const aboutItems = mediaList.filter((item) => item.section === 'about');
  const galleryItems = mediaList
    .filter((item) => item.section === 'gallery' || !item.section)
    .filter((item) => (filter === 'all' ? true : item.type === filter));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans rtl" dir="rtl">
      {/* القائمة العلوية */}
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-black text-amber-400 tracking-wider flex items-center gap-2">
          📸 PhotoFolio
        </div>
        <div className="flex gap-6 items-center text-sm font-semibold text-slate-300">
          <a href="#hero" className="hover:text-amber-400 transition">الرئيسية</a>
          <a href="#about" className="hover:text-amber-400 transition">من نحن</a>
          <a href="#gallery" className="hover:text-amber-400 transition">معرض الأعمال</a>
          <Link
            href="/admin"
            className="bg-amber-500 text-slate-950 px-4 py-2 rounded-xl font-bold hover:bg-amber-400 transition"
          >
            لوحة التحكم ⚙️
          </Link>
        </div>
      </nav>

      {/* قسم Hero */}
      <section id="hero" className="relative py-20 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
          معرض الأعمال الفوتوغرافية & البصرية 🎬
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          أهلاً بك في معرض أعمالي. استكشف أحدث الصور والفيديوهات الاحترافية التي قمت بإلتقاطها وتصميمها.
        </p>

        {heroItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {heroItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="relative group overflow-hidden rounded-3xl border border-slate-800 shadow-2xl cursor-pointer"
              >
                {item.type === 'video' ? (
                  <video src={item.url} autoPlay loop muted className="w-full h-80 object-cover" />
                ) : (
                  <img src={item.url} alt={item.title} className="w-full h-80 object-cover group-hover:scale-105 transition duration-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                  <h3 className="text-xl font-bold text-amber-300">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* قسم About */}
      <section id="about" className="py-16 px-6 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-amber-400 mb-4">نبذة عني</h2>
            <p className="text-slate-300 leading-relaxed text-lg mb-6">
              مصور صانع محتوى بصري شغوف بتقديم أعلى درجات الجودة والاحترافية. أشارك معكم هنا أفضل اللقطات والمقاطع التي أعمل عليها.
            </p>
          </div>
          <div>
            {aboutItems.length > 0 ? (
              aboutItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className="rounded-3xl overflow-hidden border border-slate-700 shadow-xl cursor-pointer"
                >
                  {item.type === 'video' ? (
                    <video src={item.url} controls className="w-full h-80 object-cover" />
                  ) : (
                    <img src={item.url} alt={item.title} className="w-full h-80 object-cover" />
                  )}
                </div>
              ))
            ) : (
              <div className="bg-slate-800 h-80 rounded-3xl flex items-center justify-center text-slate-500 border border-dashed border-slate-700">
                يمكنك رفع صورة لقسم "About" من لوحة التحكم
              </div>
            )}
          </div>
        </div>
      </section>

      {/* قسم المعرض */}
      <section id="gallery" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">معرض الأعمال المتميزة</h2>
            <p className="text-slate-400">استعرض كل الصور والفيديوهات التي تم رفعها</p>
          </div>

          <div className="flex gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                filter === 'all' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل ({galleryItems.length})
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                filter === 'image' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              صور 📷
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                filter === 'video' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              فيديوهات 🎥
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-lg">جاري تحميل الأعمال من Supabase...</div>
        ) : galleryItems.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
            لا توجد عناصر في المعرض حالياً. اذهب إلى <Link href="/admin" className="text-amber-400 underline">لوحة التحكم</Link> لرفع محتوى جديد!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-400/50 transition shadow-lg group flex flex-col cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden bg-slate-950">
                  {item.type === 'video' ? (
                    <video src={item.url} className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  )}
                </div>
                <div className="p-4 flex justify-between items-center mt-auto">
                  <h3 className="font-bold text-slate-200 text-base truncate">{item.title}</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-amber-400">
                    {item.type === 'video' ? 'فيديو' : 'صورة'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 left-4 z-10 w-10 h-10 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full flex items-center justify-center text-xl font-bold transition border border-slate-700"
            >
              ✕
            </button>

            <div className="flex items-center justify-center bg-black/50 rounded-2xl overflow-hidden max-h-[80vh]">
              {selectedMedia.type === 'video' ? (
                <video src={selectedMedia.url} controls autoPlay className="w-full max-h-[75vh] object-contain" />
              ) : (
                <img src={selectedMedia.url} alt={selectedMedia.title} className="w-full max-h-[75vh] object-contain" />
              )}
            </div>

            <div className="p-4 text-center">
              <h3 className="text-xl font-bold text-amber-400">{selectedMedia.title}</h3>
            </div>
          </div>
        </div>
      )}

      {/* الفوتر */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
<footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
  © 2026 PhotoFolio – تم الربط بـ Supabase 🚀
</footer>
      </footer>
    </div>
  );
}