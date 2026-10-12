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

interface PackageItem {
  id?: string;
  title: string;
  category: string;
  price: string;
  description: string;
  features: string[];
  is_popular: boolean;
  display_order: number;
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
  const [activeTab, setActiveTab] = useState<'media' | 'packages'>('media');

  // حالات إدارة الوسائط
  const [title, setTitle] = useState('');
  const [section, setSection] = useState('gallery');
  const [uploadMode, setUploadMode] = useState<'file' | 'youtube'>('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);

  // حالات إدارة الباقات والأسعار
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [pkgTitle, setPkgTitle] = useState('');
  const [pkgCategory, setPkgCategory] = useState('');
  const [pkgPrice, setPkgPrice] = useState('');
  const [pkgDescription, setPkgDescription] = useState('');
  const [pkgFeaturesText, setPkgFeaturesText] = useState('');
  const [pkgIsPopular, setPkgIsPopular] = useState(false);

  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    setMounted(true);
    const savedAuth = sessionStorage.getItem('admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      fetchMedia();
      fetchPackages();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      fetchMedia();
      fetchPackages();
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

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) {
      setPackages(data);
    }
  };

  // رفع الوسائط
  const handleSubmitMedia = async (e: React.FormEvent) => {
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

        const sharedTitle = title || 'ألبوم صور';

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

          const itemTitle = files.length === 1 ? (title || file.name.replace(/\.[^/.]+$/, "")) : sharedTitle;

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

      alert('تم رفع الملفات بنجاح! 🎉');
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

  const handleDeleteMedia = async (id: string) => {
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

  // حفظ أو تعديل الباقة
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgTitle) return alert('يرجى كتابة عنوان الباقة');

    const featuresArray = pkgFeaturesText.split('\n').filter((f) => f.trim() !== '');

    const pkgData = {
      title: pkgTitle,
      category: pkgCategory,
      price: pkgPrice,
      description: pkgDescription,
      features: featuresArray,
      is_popular: pkgIsPopular,
    };

    if (editingPkgId) {
      const { error } = await supabase.from('packages').update(pkgData).eq('id', editingPkgId);
      if (error) alert('خطأ في التحديث: ' + error.message);
      else alert('تم تحديث الباقة بنجاح! ✨');
    } else {
      const { error } = await supabase.from('packages').insert([pkgData]);
      if (error) alert('خطأ في الإضافة: ' + error.message);
      else alert('تم إضافة الباقة بنجاح! 🎉');
    }

    resetPkgForm();
    fetchPackages();
  };

  const handleEditPackage = (pkg: PackageItem) => {
    setEditingPkgId(pkg.id || null);
    setPkgTitle(pkg.title || '');
    setPkgCategory(pkg.category || '');
    setPkgPrice(pkg.price || '');
    setPkgDescription(pkg.description || '');
    setPkgFeaturesText((pkg.features || []).join('\n'));
    setPkgIsPopular(pkg.is_popular || false);
  };

  const handleDeletePackage = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الباقة؟')) {
      const { error } = await supabase.from('packages').delete().eq('id', id);
      if (error) alert('خطأ في الحذف: ' + error.message);
      else {
        alert('تم الحذف بنجاح');
        fetchPackages();
      }
    }
  };

  const resetPkgForm = () => {
    setEditingPkgId(null);
    setPkgTitle('');
    setPkgCategory('');
    setPkgPrice('');
    setPkgDescription('');
    setPkgFeaturesText('');
    setPkgIsPopular(false);
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
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
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

        {/* أزرار التبويبات (Tabs) */}
        <div className="flex gap-3 mb-8 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('media')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === 'media' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🖼️ إدارة الصور والريلز
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === 'packages' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            💎 إدارة باقات الأسعار
          </button>
        </div>

        {/* محتوى تبويب الوسائط */}
        {activeTab === 'media' && (
          <>
            <form onSubmit={handleSubmitMedia} className="bg-slate-800 p-6 rounded-2xl space-y-4 mb-10 shadow-xl border border-slate-700">
              <h2 className="text-xl font-semibold text-slate-200">إضافة صور أو فيديوهات متعددة</h2>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">عنوان الألبوم أو الصورة:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: جلسة تصوير النيل"
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
                      uploadMode === 'file' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-700 text-slate-300 border-slate-600'
                    }`}
                  >
                    📁 رفع ملفات متعددة
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('youtube')}
                    className={`py-2 px-4 rounded-xl text-sm font-bold border transition ${
                      uploadMode === 'youtube' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-700 text-slate-300 border-slate-600'
                    }`}
                  >
                    🎬 يوتيوب / شورتس
                  </button>
                </div>
              </div>

              {uploadMode === 'youtube' ? (
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-300">رابط يوتيوب أو شورتس:</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/shorts/xxxxx"
                    className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-amber-400 transition text-left dir-ltr"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-300">اختر الملفات:</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    className="w-full p-2 rounded-xl bg-slate-700 border border-slate-600 text-white cursor-pointer text-sm"
                    required
                  />
                  {files.length > 0 && (
                    <p className="mt-2 text-xs text-amber-400 font-semibold">تم تحديد {files.length} ملف جاهز للرفع 📸</p>
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
                            <iframe src={ytEmbed} className="w-full h-36 rounded-lg mb-2" allowFullScreen />
                          ) : item.type === 'video' ? (
                            <video src={item.url} controls className="w-full h-36 object-cover rounded-lg mb-2" />
                          ) : (
                            <img src={item.url} alt={item.title} className="w-full h-36 object-contain bg-slate-900 rounded-lg mb-2" />
                          )}
                          <h3 className="font-bold text-sm text-slate-100 truncate">{item.title}</h3>
                        </div>
                        <button
                          onClick={() => handleDeleteMedia(item.id)}
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
          </>
        )}

        {/* محترف تبويب الباقات والأسعار */}
        {activeTab === 'packages' && (
          <>
            <form onSubmit={handleSavePackage} className="bg-slate-800 p-6 rounded-2xl space-y-4 mb-10 shadow-xl border border-slate-700">
              <h2 className="text-xl font-semibold text-slate-200">{editingPkgId ? '✏️ تعديل باقة' : '➕ إضافة باقة جديدة'}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-300">اسم الباقة (مثال: الباقة الشاملة):</label>
                  <input
                    type="text"
                    value={pkgTitle}
                    onChange={(e) => setPkgTitle(e.target.value)}
                    placeholder="اسم الباقة"
                    className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-amber-400 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-300">التصنيف أو نوع الجلسة:</label>
                  <input
                    type="text"
                    value={pkgCategory}
                    onChange={(e) => setPkgCategory(e.target.value)}
                    placeholder="مثال: المناسبات والأفراح"
                    className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-300">السعر (اختياري - مثال: 1500 ج.م):</label>
                  <input
                    type="text"
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(e.target.value)}
                    placeholder="السعر"
                    className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={pkgIsPopular}
                    onChange={(e) => setPkgIsPopular(e.target.checked)}
                    className="w-5 h-5 accent-amber-400 rounded"
                  />
                  <label htmlFor="popular" className="text-sm font-bold text-amber-400 cursor-pointer">
                    تمييز كـ "الأكثر طلباً 🔥"
                  </label>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">وصف قصير للباقة:</label>
                <input
                  type="text"
                  value={pkgDescription}
                  onChange={(e) => setPkgDescription(e.target.value)}
                  placeholder="وصف مختصر للباقة"
                  className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">المميزات (اكتب كل ميزة في سطر منفصل):</label>
                <textarea
                  rows={4}
                  value={pkgFeaturesText}
                  onChange={(e) => setPkgFeaturesText(e.target.value)}
                  placeholder={'مدة الجلسة: ساعة واحدة\nتسليم 10 صور معدلة\nمكان تصوير خارجي'}
                  className="w-full p-3 rounded-xl bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 font-bold rounded-xl transition text-slate-950"
                >
                  {editingPkgId ? 'حفظ تعديلات الباقة' : 'إضافة الباقة الجديدة 💎'}
                </button>
                {editingPkgId && (
                  <button
                    type="button"
                    onClick={resetPkgForm}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>

            <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 text-slate-200">الباقات الحالية ({packages.length})</h2>
              {packages.length === 0 ? (
                <p className="text-slate-400 text-center py-6">لا توجد باقات مضافة حالياً.</p>
              ) : (
                <div className="space-y-4">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="bg-slate-700/60 p-4 rounded-xl border border-slate-600/50 flex justify-between items-center gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-amber-400 text-base">{pkg.title}</h3>
                          {pkg.price && <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-0.5 rounded-md font-mono">{pkg.price}</span>}
                          {pkg.is_popular && <span className="bg-amber-400/20 text-amber-400 text-xs px-2 py-0.5 rounded-md font-bold">الأكثر طلباً 🔥</span>}
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{pkg.description}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-slate-100 text-xs font-bold rounded-lg transition"
                        >
                          تعديل ✏️
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id!)}
                          className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition"
                        >
                          حذف 🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}