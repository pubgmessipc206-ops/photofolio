'react';
import React, { useState } from 'react';
import { Phone, MessageCircle, ShoppingBag, Award, ShieldCheck, Truck, Sparkles, Star } from 'lucide-react';

export default function HoneyStore() {
  const [selectedSize, setSelectedSize] = useState('1 كجم');
  const [quantity, setQuantity] = useState(1);

  const honeyTypes = [
    { name: "عسل السدر الطبيعي", price: 450, desc: "عسل نقي فاخر مستخلص من أزهاره البرية، غني بالفوائد العلاجية." },
    { name: "عسل الموالح", price: 300, desc: "عسل خفيف ومنعش، مثالي للاستخدام اليومي وتحلية المشروبات." },
    { name: "عسل حبة البركة", price: 400, desc: "مزيج غني يجمع بين فوائد العسل الأصلي وخصائص الحبة السوداء." }
  ];

  const whatsappNumber = "201001316599"; // الرقم الجديد الخاص بك

  const handleOrder = (productName: string, price: number) => {
    const message = `مرحباً POB~Honey، أود طلب:
- المنتج: ${productName}
- الحجم: ${selectedSize}
- الكمية: ${quantity}
- الإجمالي: ${price * quantity} جنيه`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <main className="min-h-screen bg-stone-950 text-amber-50 font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* الهيدر */}
      <header className="border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 bg-clip-text text-transparent">
              POB~Honey
            </span>
          </div>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 px-5 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-amber-500/20"
          >
            <MessageCircle className="w-5 h-5" />
            <span>تواصل معنا</span>
          </a>
        </div>
      </header>

      {/* القسم الرئيسي */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6">
          <Star className="w-4 h-4 fill-amber-400" />
          <span className="text-sm font-medium">عسل طبيعي 100% من أطهر المناحل</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          حلاوة الطبيعة الأصيلة في كل قطرة
        </h1>
        <p className="text-stone-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          نقدم لك أجود أنواع العسل الطبيعي المفحوص مختبرياً لضمان أعلى معايير الجودة والنقاء لصحتك وصحة عائلتك.
        </p>
      </section>

      {/* مميزات المتجر */}
      <section className="border-y border-stone-900 bg-stone-900/40 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-900/60 border border-stone-800">
            <ShieldCheck className="w-10 h-10 text-amber-400 shrink-0" />
            <div>
              <h3 className="font-bold text-lg">مضمون ومفحوص</h3>
              <p className="text-stone-400 text-sm">خالٍ تماماً من أي إضافات سكرية.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-900/60 border border-stone-800">
            <Award className="w-10 h-10 text-amber-400 shrink-0" />
            <div>
              <h3 className="font-bold text-lg">جودة فائقة</h3>
              <p className="text-stone-400 text-sm">نقاء عالي ومعبأ بأحدث المعايير.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-900/60 border border-stone-800">
            <Truck className="w-10 h-10 text-amber-400 shrink-0" />
            <div>
              <h3 className="font-bold text-lg">توصيل سريع</h3>
              <p className="text-stone-400 text-sm">شحنات آمنة لحد باب البيت.</p>
            </div>
          </div>
        </div>
      </section>

      {/* منتجات العسل */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">أبرز منتجاتنا</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {honeyTypes.map((item, index) => (
            <div key={index} className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all">
              <div>
                <div className="h-48 bg-stone-800/50 rounded-xl mb-6 flex items-center justify-center border border-stone-700/50">
                  <ShoppingBag className="w-16 h-16 text-amber-500/40" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                <p className="text-stone-400 text-sm mb-6 leading-relaxed">{item.desc}</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-amber-400">{item.price} ج.م</span>
                  <select 
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-amber-200 outline-none"
                  >
                    <option value="نصف كيلو">نصف كيلو</option>
                    <option value="1 كجم">1 كجم</option>
                  </select>
                </div>
                <button
                  onClick={() => handleOrder(item.name, item.price)}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>اطلب عبر الواتساب</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* الفوتر */}
      <footer className="border-t border-stone-900 py-8 text-center text-stone-500 text-sm">
        <p>© 2026 POB~Honey. جميع الحقوق محفوظة.</p>
      </footer>
    </main>
  );
}