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

// مكون السلايدر الخاص بالتقليب كـ ألبوم إنستجرام مع زر المشاركة والتكبير
function InstagramCarousel({
  items,
  heightClass = 'h-64 sm:h-80',
  onImageClick,
  groupTitle,
}: {
  items: MediaItem[];
  heightClass?: string;
  onImageClick: (item: MediaItem) => void;
  groupTitle: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = Math.abs(e.currentTarget.scrollLeft);
    const width = e.currentTarget.offsetWidth;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      setActiveIndex(index);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `شاهد ألبوم "${groupTitle}" على موقع Photo Kholio`;
    if (navigator.share) {
      navigator.share({ title: 'Photo Kholio', text: shareText, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group w-full overflow-hidden rounded-2xl bg-slate-950">
      {items.length > 1 && (
        <div className="absolute top-3 left-3 z-20 bg-slate-950/85 backdrop-blur-md text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-800 pointer-events-none">
          {activeIndex + 1} / {items.length} 📸
        </div>
      )}

      <button
        onClick={handleShare}
        className="absolute top-3 right-3 z-20 bg-slate-900/80 hover:bg-slate-800 text-slate-200 p-2 rounded-full backdrop-blur-md border border-slate-700 transition shadow-lg text-xs flex items-center gap-1"
        title="مشاركة الألبوم"
      >
        <span>🔗</span>
        {copied && <span className="text-[10px] text-emerald-400 font-bold px-1">تم النسخ!</span>}
      </button>

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
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: mediaData } = await supabase
        .from('media_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (mediaData) setMediaList(mediaData);

      const { data: pkgData } = await supabase
        .from('packages')
        .select('*')
        .order('display_order', { ascending: true });

      if (pkgData) setPackages(pkgData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      
      <style jsx global>{`
        @keyframes rgbGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeIn 0.5s ease-out forwards;
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
      <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-2.5 sm:py-4 max-w-7xl mx-auto shadow-xl">
        <div className="flex items-center justify-between gap-2">
          
          <div className="rgb-border-box shrink-0">
            <div className="rgb-inner-content px-2.5 sm:px-4 py-1 sm:py-2 flex items-center gap-1.5 sm:gap-2.5">
              <span className="text-xs sm:text-xl">📸</span>
              <span className="text-[11px] sm:text-lg font-black tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent font-serif whitespace-nowrap">
                Pʜᴏᴛᴏ • Kʜᴏʟɪᴏ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <a
              href="https://wa.me/201015732487?text=مرحباً، أريد الاستفسار عن جلسات التصوير"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/70 hover:border-emerald-400 transition text-xs font-bold whitespace-nowrap shadow-[0_0_12px_rgba(16,185,129,0.2)] shrink-0 group"
              title="تواصل معي عبر الواتساب"
            >
              <svg className="w-4 h-4 fill-emerald-400 group-hover:scale-110 transition duration-300" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span className="dir-ltr font-mono text-xs hidden sm:inline">01015732487</span>
            </a>

            <div className="flex items-center gap-1.5 sm:gap-4 text-[11px] sm:text-sm font-semibold text-slate-300 overflow-x-auto scrollbar-none">
              <a href="#gallery" onClick={() => setFilter('image')} className="hover:text-amber-400 transition whitespace-nowrap">صور 📷</a>
              <a href="#reels" className="hover:text-amber-400 transition whitespace-nowrap">ريلز 📱</a>
              {packages.length > 0 && <a href="#pricing" className="hover:text-amber-400 transition whitespace-nowrap">الباقات 💎</a>}
              <a href="#gallery" onClick={() => setFilter('all')} className="hover:text-amber-400 transition whitespace-nowrap">المعرض</a>
              <Link href="/admin" className="p-1 rounded-lg text-slate-600 hover:text-slate-300 transition text-sm sm:text-lg">⚙️</Link>
            </div>
          </div>

        </div>
      </nav>

      {/* قسم Hero */}
      <section id="hero" className="relative py-10 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto text-center fade-in">
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

      {/* قسم الباقات والأسعار (ديناميكي من لوحة التحكم) */}
      {packages.length > 0 && (
        <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-amber-400 mb-3">باقات التصوير والأسعار 💎</h2>
            <p className="text-slate-400 text-xs sm:text-sm">اختر الباقة المناسبة لجلسة تصويرك القادمة واحجز مباشرة عبر الواتساب</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-slate-900 rounded-3xl border p-6 flex flex-col justify-between transition shadow-xl relative ${
                  pkg.is_popular
                    ? 'border-2 border-amber-400 bg-gradient-to-b from-slate-900 to-slate-950 transform md:-translate-y-2 shadow-2xl'
                    : 'border-slate-800 hover:border-amber-400/50'
                }`}
              >
                {pkg.is_popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    الأكثر طلباً 🔥
                  </div>
                )}

                <div>
                  {pkg.category && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-amber-400">
                      {pkg.category}
                    </span>
                  )}
                  
                  <div className="flex justify-between items-center mt-4 mb-2">
                    <h3 className="text-xl font-bold text-white">{pkg.title}</h3>
                    {pkg.price && <span className="text-lg font-black text-amber-400 dir-ltr">{pkg.price}</span>}
                  </div>

                  {pkg.description && <p className="text-slate-400 text-xs mb-6">{pkg.description}</p>}

                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="space-y-3 text-xs sm:text-sm text-slate-300 mb-6">
                      {pkg.features.map((feat: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          ✅ {feat}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <a
                  href={`https://wa.me/201015732487?text=${encodeURIComponent(`مرحباً، أريد حجز ${pkg.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-center transition text-xs sm:text-sm shadow-lg mt-4"
                >
                  احجز الباقة الآن 💬
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* المعرض الرئيسي */}
      <section id="gallery" className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10 gap-4 text-center sm:text-right">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">معرض الأعمال المتميزة</h2>
            <p className="text-slate-400 text-xs sm:text-sm">اسحب لتقليب ألبوم الصور، اضغط للتكبير، أو شارك الألبوم 📸</p>
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
                <InstagramCarousel
                  items={group.items}
                  heightClass="h-64 sm:h-80"
                  onImageClick={(item) => setSelectedMedia(item)}
                  groupTitle={group.title}
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