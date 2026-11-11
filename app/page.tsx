'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, MessageCircle, Shield, Award, Phone, Play, Plus, Minus } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  size: string;
  image: string;
  description: string;
}

interface VideoItem {
  id: string;
  title: string;
  youtube_url: string;
}

export default function HoneyStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: pData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      const { data: vData } = await supabase.from('videos').select('*').order('created_at', { ascending: false });

      if (pData) setProducts(pData);
      if (vData) setVideos(vData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const updated = current + delta;
      if (updated <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: updated };
    });
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const p = products.find(item => item.id === id);
      return total + (p ? p.price * qty : 0);
    }, 0);
  };

  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(cart).length === 0) {
      alert('يرجى اختيار منتج واحد على الأقل قبل إتمام الطلب.');
      return;
    }

    let message = `🛒 *طلب جديد من متجر POB~Honey*\n\n`;
    if (customerName) message += `👤 الاسم: ${customerName}\n`;
    if (customerAddress) message += `📍 العنوان: ${customerAddress}\n\n`;
    message += `*المنتجات المطلوبة:*\n`;

    Object.entries(cart).forEach(([id, qty]) => {
      const p = products.find(item => item.id === id);
      if (p) {
        message += `- ${p.name} (${p.size}) × ${qty} = ${p.price * qty} جنيه\n`;
      }
    });

    message += `\n💰 *الإجمالي الكلي: ${getTotalPrice()} جنيه*\n`;
    message += `\nشكراً لاختياركم POB~Honey 🍯`;

    window.open(`https://wa.me/201001316599?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-amber-50/40 text-stone-800 font-sans" dir="rtl">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-amber-700/95 backdrop-blur-md text-white shadow-md px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-xl sm:text-2xl font-black">
            <ShoppingBag className="w-7 h-7" />
            <span>POB~Honey</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="bg-amber-800 hover:bg-amber-900 text-amber-100 text-xs sm:text-sm px-3 py-1.5 rounded-lg font-bold border border-amber-600 transition">
              لوحة التحكم ⚙️
            </Link>
            <a href="https://wa.me/201001316599" target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm font-bold transition">
              <Phone className="w-4 h-4" />
              واتساب
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-amber-100 to-amber-50/50 py-12 sm:py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-amber-950 mb-4">
            أجود أنواع العسل الطبيعي النقي 100%
          </h1>
          <p className="text-amber-800 text-base sm:text-lg mb-6">
            من مناحلنا إلى مائدتك مباشرة. جودة مضمونة وصحة متكاملة.
          </p>
          <div className="flex justify-center gap-6 text-amber-900 font-bold text-sm">
            <div className="flex items-center gap-1"><Shield className="w-4 h-4 text-amber-700" /> مفحوص ومضمون</div>
            <div className="flex items-center gap-1"><Award className="w-4 h-4 text-amber-700" /> إنتاج فاخر</div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-amber-950 mb-8">المنتجات والباقات المتاحة</h2>
        {loading ? (
          <div className="text-center py-12 text-amber-800 font-semibold">جاري تحميل المنتجات من Supabase...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-amber-900 bg-amber-100/50 rounded-2xl border border-amber-200">
            لا تتوفر منتجات حالياً. يمكنك إضافتها من <Link href="/admin" className="underline font-bold text-amber-700">لوحة التحكم</Link>.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-2xl border border-amber-200 shadow-md overflow-hidden flex flex-col justify-between">
                <div>
                  <img src={product.image} alt={product.name} className="w-full h-52 object-cover" />
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-stone-900">{product.name}</h3>
                      <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full font-bold">{product.size}</span>
                    </div>
                    <p className="text-stone-600 text-xs sm:text-sm mb-4 leading-relaxed">{product.description}</p>
                    <div className="text-xl font-black text-amber-800">{product.price} جنيه</div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between border border-amber-200 rounded-xl p-2 bg-amber-50/50">
                    <span className="text-xs font-bold text-amber-950">الكمية:</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(product.id, -1)} className="w-7 h-7 bg-white border border-amber-300 rounded-lg flex items-center justify-center text-amber-900 font-bold hover:bg-amber-100">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-base w-6 text-center">{cart[product.id] || 0}</span>
                      <button onClick={() => updateQuantity(product.id, 1)} className="w-7 h-7 bg-amber-600 text-white rounded-lg flex items-center justify-center font-bold hover:bg-amber-700">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Youtube Section */}
      {videos.length > 0 && (
        <section className="bg-amber-900/5 border-y border-amber-200 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-amber-950 mb-8">معرض فيديوهات المناحل والإنتاج 🎬</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {videos.map(video => {
                const embedUrl = getEmbedUrl(video.youtube_url);
                return (
                  <div key={video.id} className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-md flex flex-col justify-between">
                    <div className="relative h-48 bg-stone-900 flex items-center justify-center">
                      {embedUrl ? (
                        <iframe src={embedUrl} title={video.title} className="w-full h-full" allowFullScreen />
                      ) : (
                        <button onClick={() => setSelectedVideo(video)} className="flex flex-col items-center gap-2 text-amber-400">
                          <Play className="w-12 h-12" />
                          <span className="text-xs font-bold">تشغيل الفيديو</span>
                        </button>
                      )}
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-bold text-stone-900 text-sm">{video.title}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Checkout Form */}
      <section className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-amber-200 p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-black text-amber-950 mb-6 text-center">إتمام الطلب عبر الواتساب</h3>
          <form onSubmit={handleWhatsAppCheckout} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">الاسم الكريم</label>
              <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="ادخل اسمك هنا" className="w-full px-4 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-stone-700 mb-1">عنوان التوصيل التفصيلي</label>
              <input type="text" required value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="المدينة / المنطقة / الشارع" className="w-full px-4 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none" />
            </div>
            <div className="border-t border-b border-amber-100 py-3 my-2 flex justify-between font-bold text-amber-950">
              <span>الإجمالي الكلي:</span>
              <span>{getTotalPrice()} جنيه</span>
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition text-sm sm:text-base">
              <MessageCircle className="w-5 h-5" />
              إرسال الطلب للواتساب
            </button>
          </form>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
          <div className="relative max-w-3xl w-full bg-stone-900 rounded-2xl overflow-hidden p-2" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedVideo(null)} className="absolute top-3 left-3 z-10 w-8 h-8 bg-stone-800 text-white rounded-full flex items-center justify-center font-bold">✕</button>
            <div className="w-full h-80 sm:h-96">
              <iframe src={getEmbedUrl(selectedVideo.youtube_url) || ''} title={selectedVideo.title} className="w-full h-full rounded-xl" allowFullScreen />
            </div>
          </div>
        </div>
      )}

      <footer className="bg-amber-950 text-amber-200 py-6 text-center text-xs sm:text-sm">
        © 2026 POB~Honey. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}