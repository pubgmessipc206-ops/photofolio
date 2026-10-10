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

interface GroupedMedia {
  title: string;
  type: string;
  section: string;
  items: MediaItem[];
}

function getYouTubeEmbedUrl(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
}

// مكون تقليب الصور على طريقة إنستجرام
function InstagramCarousel({ items, heightClass = 'h-64 sm:h-80' }: { items: MediaItem[]; heightClass?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = Math.abs(e.currentTarget.scrollLeft);
    const width = e.currentTarget.offsetWidth;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      setActiveIndex(index);
    }
  };

  return (
    <div className="relative group w-full overflow-hidden rounded-2xl bg-slate-950">
      {items.length > 1 && (
        <div className="absolute top-3 left-3 z-20 bg-slate-950/85 backdrop-blur-md text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-800">
          {activeIndex + 1} / {items.length} 📸
        </div>
      )}

      <div
        onScroll={handleScroll}
        className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none dir-ltr"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
      >
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className={`w-full flex-shrink-0 snap-center ${heightClass} flex items-center justify-center bg-slate-950`}
          >
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-slate-800">
          {items.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-5 bg-amber-400' : 'w-2 bg-slate-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

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

  // تجميع الصور التي تحمل نفس العنوان في ألبوم واحد تلقائياً
  const groupMediaItems = (items: MediaItem[]): GroupedMedia[] => {
    const groups: { [title: string]: MediaItem[] } = {};
    const result: GroupedMedia[] = [];

    items.forEach((item) => {
      const key = item.title.trim();
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    Object.keys(groups).forEach((titleKey) => {
      const groupItems = groups[titleKey];
      result.push({
        title: titleKey,
        type: groupItems[0].type,
        section: groupItems[0].section,
        items: groupItems,
      });
    });

    return result;
  };

  const heroItems = mediaList.filter((item) => item.section === 'hero');
  const aboutItems = mediaList.filter((item) => item.section === 'about');
  const reelsItems = mediaList.filter((item) => item.section === 'reels');

  const galleryRaw = mediaList
    .filter((item) => item.section === 'gallery' || !item.section)
    .filter((item) => (filter === 'all' ? true : item.type === filter));

  const galleryGrouped = groupMediaItems(galleryRaw);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans rtl overflow-x-hidden max-w-full" dir="rtl">
      <style jsx global>{`
        @keyframes rgbGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .rgb-border-box {
          position: relative;
          background: #020617;
          border-radius: 0.8rem;
          padding: 1.5px;
        }
        .rgb-border-box::before {
          content: '';
          position: absolute;
          inset: -1.5px;
          border-radius: 0.85rem;
          background: linear-gradient(90deg, #ff0055, #ff0000, #ff7700, #ffeb00, #00ff66, #00ffff, #0055ff, #ff0055);
          background-size: 400% 400%;
          z-index: 0;
          animation: rgbGlow 6s linear infinite;
        }
        .rgb-inner-content {
          position: relative;
          z-index: 1;
          background: #090d16;
          border-radius: 0.75rem;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* القائمة العلوية */}
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-2.5 sm:px-6 py-2.5 sm:py-4 flex justify-between items-center max-w-7xl mx-auto gap-2">
        <div className="rgb-border-box shrink-0">
          <div className="rgb-inner-content px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2.5">
            <span className="text-sm sm:text-xl">📸</span>
            <span className="text-xs sm:text-lg font-black tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent font-serif whitespace-nowrap">
              Pʜᴏᴛᴏ • Kʜᴏʟɪᴏ
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-300 shrink-0">
          <a href="#gallery" onClick={() => setFilter('image')} className="hover:text-amber-400 transition">
            الصور 📷
          </a>
          <a href="#reels" className="hover:text-amber-400 transition">الريلز 📱</a>
          <a href="#gallery" onClick={() => setFilter('all')} className="hover:text-amber-400 transition">
            المعرض
          </a>
          
          <Link href="/admin" className="p-1 rounded-lg text-slate-600 hover:text-slate-300 transition text-sm sm:text-lg">
            ⚙️
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section id="hero" className="relative py-10 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight">
          معرض الأعمال الفوتوغرافية
        </h1>
      </section>

      {/* Reels & Shorts */}
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
                <div key={item.id} className="w-full max-w-[280px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
                  <div className="relative w-full aspect-[9/16] bg-black overflow-hidden">
                    {ytEmbed ? (
                      <iframe src={ytEmbed} className="w-full h-full object-cover" allowFullScreen />
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

      {/* المعرض */}
      <section id="gallery" className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10 gap-4 text-center sm:text-right">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">معرض الأعمال المتميزة</h2>
            <p className="text-slate-400 text-xs sm:text-sm">قم بالسحب لتقليب صور الألبوم 📸</p>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                filter === 'all' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل
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
          <div className="text-center py-20 text-slate-400">جاري تحميل المعرض...</div>
        ) : galleryGrouped.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
            لا توجد عناصر حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryGrouped.map((group, idx) => (
              <div
                key={idx}
                className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-400/50 transition shadow-lg flex flex-col"
              >
                {/* سلايدر الصور */}
                <InstagramCarousel items={group.items} heightClass="h-64 sm:h-80" />

                <div className="p-4 flex justify-between items-center mt-auto border-t border-slate-800/80">
                  <h3 className="font-bold text-slate-200 text-sm sm:text-base truncate">{group.title}</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-amber-400 shrink-0">
                    {group.items.length > 1 ? `ألبوم (${group.items.length})` : 'صورة'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* الفوتر */}
      <footer className="border-t border-slate-800 py-6 sm:py-8 text-center text-slate-500 text-xs sm:text-sm px-4">
        © 2026 Pʜᴏᴛᴏ • Kʜᴏʟɪᴏ – جميع الحقوق محفوظة 🚀
      </footer>
    </div>
  );
}