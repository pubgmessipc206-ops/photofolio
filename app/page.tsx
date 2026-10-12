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

// مكون السلايدر الخاص بالتقليب كـ ألبوم إنستجرام مع خاصية فتح الصورة عند الضغط
function InstagramCarousel({
  items,
  heightClass = 'h-64 sm:h-80',
  onImageClick,
}: {
  items: MediaItem[];
  heightClass?: string;
  onImageClick: (item: MediaItem) => void;
}) {
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
      {/* عداد الصور للألبوم */}
      {items.length > 1 && (
        <div className="absolute top-3 left-3 z-20 bg-slate-950/85 backdrop-blur-md text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-800 pointer-events-none">
          {activeIndex + 1} / {items.length} 📸
        </div>
      )}

      {/* حاوية التقليب بالسحب أو اللمس */}
      <div
        onScroll={handleScroll}
        className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none dir-ltr cursor-pointer"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
      >
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => onImageClick(item)}
            className={`w-full flex-shrink-0 snap-center ${heightClass} flex items-center justify-center bg-slate-950`}
          >
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-contain hover:scale-102 transition duration-300"
            />
          </div>
        ))}
      </div>

      {/* نقاط الترقيم في الأسفل */}
      {items.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-slate-800 pointer-events-none">
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

  // تجميع الصور بنفس العنوان
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
  const reelsItems = mediaList.filter((item) => item.section === 'reels');

  const galleryRaw = mediaList
    .filter((item) => item.section === 'gallery' || !item.section)
    .filter((item) => (filter === 'all' ? true : item.type === filter));

  const galleryGrouped = groupMediaItems(galleryRaw);

  const renderSingleMediaContent = (item: MediaItem, heightClass = 'h-64 sm:h-80') => {
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
      <div className={`w-full ${heightClass} bg-slate-950/80 flex items-center justify-center overflow-hidden`}>
        <img
          src={item.url}
          alt={item.title}
          className="w-full h-full object-contain"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans rtl overflow-x-hidden max-w-full" dir="rtl">
      
      {/* أنيميشن إطار الـ RGB المتحرك */}
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

      {/* القائمة العلوية مع زر الواتساب بجانب البراند */}
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-2 sm:px-6 py-2.5 sm:py-4 flex justify-between items-center max-w-7xl mx-auto gap-2">
        <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto scrollbar-none py-1">
          <div className="rgb-border-box shrink-0">
            <div className="rgb-inner-content px-2 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2.5">
              <span className="text-xs sm:text-xl">📸</span>
              <span className="text-[11px] sm:text-lg font-black tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent font-serif whitespace-nowrap">
                Pʜᴏᴛᴏ • Kʜᴏʟɪᴏ
              </span>
            </div>
          </div>

          {/* زر الواتساب المباشر */}
          <a
            href="https://wa.me/201015732487"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/70 hover:border-emerald-400 transition text-[11px] sm:text-xs font-bold whitespace-nowrap shadow-[0_0_10px_rgba(16,185,129,0.15)] shrink-0"
            title="تواصل معي عبر الواتساب"
          >
            <span>💬</span>
            <span className="dir-ltr">01015732487</span>
          </a>
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

      {/* قسم Hero */}
      <section id="hero" className="relative py-10 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight">
          معرض الأعمال الفوتوغرافية
        </h1>

        {heroItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6">
            {heroItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="relative group overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl cursor-pointer bg-slate-900"
              >
                {renderSingleMediaContent(item, 'h-64 sm:h-80')}
                <div className="p-4 bg-slate-900 text-right">
                  <h3 className="text-base sm:text-xl font-bold text-amber-300 break-words">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* قسم Reels & Shorts */}
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

      {/* المعرض الرئيسي */}
      <section id="gallery" className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10 gap-4 text-center sm:text-right">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">معرض الأعمال المتميزة</h2>
            <p className="text-slate-400 text-xs sm:text-sm">قم بالسحب لتقليب ألبوم الصور واضغط للتكبير 📸</p>
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
                <InstagramCarousel
                  items={group.items}
                  heightClass="h-64 sm:h-80"
                  onImageClick={(item) => setSelectedMedia(item)}
                />

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

      {/* نافذة العرض المكبرة (Lightbox) */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-8"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative max-w-5xl bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-800 overflow-hidden shadow-2xl p-4 max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-3 left-3 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full flex items-center justify-center text-base sm:text-xl font-bold transition border border-slate-700"
            >
              ✕
            </button>

            <div className="flex items-center justify-center bg-black/50 rounded-xl sm:rounded-2xl overflow-hidden p-2 max-h-[75vh]">
              {selectedMedia.type === 'video' ? (
                <video src={selectedMedia.url} controls className="max-w-full max-h-[70vh] object-contain" />
              ) : getYouTubeEmbedUrl(selectedMedia.url) ? (
                <iframe src={getYouTubeEmbedUrl(selectedMedia.url)!} className="w-[80vw] h-[70vh] rounded-2xl" allowFullScreen />
              ) : (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              )}
            </div>

            <div className="p-3 text-center mt-2">
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