'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State - Product
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('1 كيلو');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  // Form State - Video
  const [videoTitle, setVideoTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    const { data: pData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    const { data: vData } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
    if (pData) setProducts(pData);
    if (vData) setVideos(vData);
    setLoading(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('products').insert([
      { name, price: parseFloat(price), size, image, description }
    ]);
    if (!error) {
      setName(''); setPrice(''); setImage(''); setDescription('');
      fetchAdminData();
    } else {
      alert('حدث خطأ في إضافة المنتج');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('هل أنت تأكد من حذف هذا المنتج؟')) {
      await supabase.from('products').delete().eq('id', id);
      fetchAdminData();
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('videos').insert([
      { title: videoTitle, youtube_url: youtubeUrl }
    ]);
    if (!error) {
      setVideoTitle(''); setYoutubeUrl('');
      fetchAdminData();
    } else {
      alert('حدث خطأ في إضافة الفيديو');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (confirm('حذف هذا الفيديو؟')) {
      await supabase.from('videos').delete().eq('id', id);
      fetchAdminData();
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-4 sm:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex justify-between items-center bg-stone-800 p-4 rounded-2xl border border-stone-700">
          <h1 className="text-xl sm:text-2xl font-black text-amber-400">⚙️ لوحة تحكم متجر POB~Honey</h1>
          <Link href="/" className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm">
            عرض المتجر 🍯
          </Link>
        </div>

        {/* 1. قسم إضافة منتج / باقة جديدة */}
        <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700 space-y-4">
          <h2 className="text-lg font-bold text-amber-300">إضافة منتج أو باقة أسعار جديد</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="اسم المنتج" required value={name} onChange={e => setName(e.target.value)} className="bg-stone-900 border border-stone-700 rounded-xl p-3 text-sm" />
            <input type="number" placeholder="السعر (جنيه)" required value={price} onChange={e => setPrice(e.target.value)} className="bg-stone-900 border border-stone-700 rounded-xl p-3 text-sm" />
            <input type="text" placeholder="الحجم (مثال: 1 كيلو / 500 جرام / باقة)" required value={size} onChange={e => setSize(e.target.value)} className="bg-stone-900 border border-stone-700 rounded-xl p-3 text-sm" />
            <input type="url" placeholder="رابط صورة المنتج (URL)" required value={image} onChange={e => setImage(e.target.value)} className="bg-stone-900 border border-stone-700 rounded-xl p-3 text-sm" />
            <textarea placeholder="وصف المنتج" value={description} onChange={e => setDescription(e.target.value)} className="bg-stone-900 border border-stone-700 rounded-xl p-3 text-sm sm:col-span-2" rows={2} />
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black p-3 rounded-xl sm:col-span-2 transition">
              + إضافة المنتج إلى المتجر
            </button>
          </form>
        </div>

        {/* 2. قسم إضافة فيديو يوتيوب */}
        <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700 space-y-4">
          <h2 className="text-lg font-bold text-amber-300">إضافة فيديو من يوتيوب 🎥</h2>
          <form onSubmit={handleAddVideo} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="عنوان الفيديو" required value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="bg-stone-900 border border-stone-700 rounded-xl p-3 text-sm" />
            <input type="url" placeholder="رابط فيديو YouTube الكامل" required value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} className="bg-stone-900 border border-stone-700 rounded-xl p-3 text-sm" />
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black p-3 rounded-xl sm:col-span-2 transition">
              + إضافة الفيديو
            </button>
          </form>
        </div>

        {/* 3. قائمة المنتجات الحالية الحالية */}
        <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700 space-y-4">
          <h2 className="text-lg font-bold text-amber-300">المنتجات الحالية ({products.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-stone-900 p-4 rounded-xl border border-stone-700 flex flex-col justify-between">
                <div>
                  <img src={p.image} alt={p.name} className="h-32 w-full object-cover rounded-lg mb-2" />
                  <h3 className="font-bold text-white">{p.name}</h3>
                  <p className="text-amber-400 font-bold text-sm">{p.price} جنيه ({p.size})</p>
                </div>
                <button onClick={() => handleDeleteProduct(p.id)} className="mt-3 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold py-2 rounded-lg transition">
                  حذف المنتج 🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. قائمة الفيديوهات */}
        <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700 space-y-4">
          <h2 className="text-lg font-bold text-amber-300">فيديوهات يوتيوب ({videos.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map(v => (
              <div key={v.id} className="bg-stone-900 p-4 rounded-xl border border-stone-700 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-sm">{v.title}</h3>
                  <p className="text-stone-400 text-xs truncate max-w-xs">{v.youtube_url}</p>
                </div>
                <button onClick={() => handleDeleteVideo(v.id)} className="bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition">
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}