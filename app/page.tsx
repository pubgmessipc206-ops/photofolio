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
  const reelsItems = mediaList.filter((item) => item.section === 'reels');
  const galleryItems = mediaList
    .filter((item) => item.section === 'gallery' || !item.section)
    .filter((item) => (filter === 'all' ? true : item.type === filter));

  const renderMediaContent = (item: MediaItem, heightClass = 'h-64 sm:h-80') => {
    const ytEmbed = getYouTubeEmbedUrl(item.url);

    if (ytEmbed) {
      return (
        <iframe
          src={ytEmbed}
          className={`w-full ${heightClass} rounded-2xl`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (item.type === 'video') {
      return (
        <video src={item.url} controls className={`w-full ${heightClass} object-cover`} />
      );
    }

    return (
      <img
        src={item.url}
        alt={item.title}
        className={`w-full ${heightClass} object-cover group-hover:scale-105 transition duration-500`}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans rtl overflow-x-hidden max-w-full" dir="rtl">
      {/* القائمة العلوية مع الشعار المزخرف داخل إطار وزر الإعدادات المخفي */}
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-950 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.12)] hover:border-amber-400 transition duration-300">
          <span className="text-base sm:text-lg">📸</span>
          <span className="text-sm sm:text-base font-black tracking-widest bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent font-serif">
            Pʜᴏᴛᴏ • Kʜᴏʟɪᴏ
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-300">
          <a href="#hero" className="hover:text-amber-400 transition">الرئيسية</a>
          <a href="#reels" className="hover:text-amber-400 transition">الريلز 📱</a>
          <a href="#gallery" className="hover:text-amber-400 transition">المعرض</a>
          
          <Link
            href="/admin"
            title="لوحة التحكم"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800/50 transition duration-300 text-base sm:text-lg opacity-60 hover:opacity-100"
          >
            ⚙️
          </Link>
        </div>
      </nav>

      {/* قسم Hero */}
      <section id="hero" className="relative py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight break-words">
          معرض الأعمال الفوتوغرافية & البصرية 🎬
        </h1>
        <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 px-2 leading-relaxed">
          أهلاً بك في معرض أعمالي. استكشف أحدث الصور والفيديوهات الاحترافية التي قمت بإلتقاطها وتصميمها.
        </p>

        {heroItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6">
            {heroItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="relative group overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl cursor-pointer bg-slate-900"
              >
                {renderMediaContent(item, 'h-64 sm:h-80')}
                <div className="p-4 bg-slate-900 text-right">
                  <h3 className="text-base sm:text-xl font-bold text-amber-300 break-words">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* قسم Reels & Shorts القصيرة العمودية */}
      {reelsItems.length > 0 && (
        <section id="reels" className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto bg-slate-900/30 border-y border-slate-900">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-4xl font-black text-amber-400 mb-2">Reels & Shorts Videos 📱🔥</h2>
            <p className="text-slate-400 text-xs sm:text-sm">شاهد أحدث اللقطات والمقاطع العمودية المصممة خصيصاً للموبايل</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
            {reelsItems.map((item) => {
              const ytEmbed = getYouTubeEmbedUrl(item.url);
              return (
                <div
                  key={item.id}
                  className="w-full max-w-[280px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col group hover:border-amber-400/50 transition"
                >
                  <div className="relative w-full aspect-[9/16] bg-black overflow-hidden">
                    {ytEmbed ? (
                      <iframe
                        src={ytEmbed}
                        className="w-full h-full object-cover"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={item.url} controls className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-4 bg-slate-900 text-center mt-auto">
                    <h3 className="font-bold text-slate-200 text-sm truncate">{item.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* قسم About */}
      <section id="about" className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-3 sm:mb-4">نبذة عني</h2>
            <p className="text-slate-300 leading-relaxed text-base sm:text-lg mb-4 sm:mb-6">
              مصور صانع محتوى بصري شغوف بتقديم أعلى درجات الجودة والاحترافية. أشارك معكم هنا أفضل اللقطات والمقاطع التي أعمل عليها.
            </p>
          </div>
          <div>
            {aboutItems.length > 0 ? (
              aboutItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-700 shadow-xl cursor-pointer bg-slate-900"
                >
                  {renderMediaContent(item, 'h-64 sm:h-80')}
                </div>
              ))
            ) : (
              <div className="bg-slate-800 h-64 sm:h-80 rounded-2xl sm:rounded-3xl flex items-center justify-center text-slate-500 border border-dashed border-slate-700 p-4 text-center text-sm">
                يمكنك رفع صورة أو فيديو لقسم "About" من لوحة التحكم
              </div>
            )}
          </div>
        </div>
      </section>

      {/* قسم المعرض */}
      <section id="gallery" className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10 gap-4 text-center sm:text-right">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">معرض الأعمال المتميزة</h2>
            <p className="text-slate-400 text-xs sm:text-sm">استعرض كل الصور والفيديوهات التي تم رفعها</p>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 max-w-full">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                filter === 'all' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل ({galleryItems.length})
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                filter === 'image' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              صور 📷
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                filter === 'video' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              فيديوهات 🎥
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 sm:py-20 text-slate-400 text-base sm:text-lg">جاري تحميل الأعمال من Supabase...</div>
        ) : galleryItems.length === 0 ? (
          <div className="text-center py-16 sm:py-20 px-4 text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800 text-xs sm:text-sm">
            لا توجد عناصر في المعرض حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-400/50 transition shadow-lg group flex flex-col cursor-pointer"
              >
                <div className="relative overflow-hidden bg-slate-950">
                  {renderMediaContent(item, 'h-48 sm:h-64')}
                </div>
                <div className="p-3 sm:p-4 flex justify-between items-center mt-auto gap-2">
                  <h3 className="font-bold text-slate-200 text-sm sm:text-base truncate">{item.title}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-800 text-amber-400 shrink-0">
                    {getYouTubeEmbedUrl(item.url) ? 'يوتيوب' : item.type === 'video' ? 'فيديو' : 'صورة'}
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
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-8"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-800 overflow-hidden shadow-2xl p-2 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-3 left-3 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full flex items-center justify-center text-base sm:text-xl font-bold transition border border-slate-700"
            >
              ✕
            </button>

            <div className="flex items-center justify-center bg-black/50 rounded-xl sm:rounded-2xl overflow-hidden max-h-[70vh]">
              {renderMediaContent(selectedMedia, 'max-h-[65vh]')}
            </div>

            <div className="p-3 text-center">
              <h3 className="text-base sm:text-xl font-bold text-amber-400 break-words">{selectedMedia.title}</h3>
            </div>
          </div>
        </div>
      )}

      {/* الفوتر */}
      <footer className="border-t border-slate-800 py-6 sm:py-8 text-center text-slate-500 text-xs sm:text-sm px-4">
        © 2026 Pʜᴏᴛᴏ • Kʜᴏʟɪᴏ – جميع الحقوق محفوظة 🚀
      </footer>
    </div>
  );
}