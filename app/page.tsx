'use client';

import React, { useState } from 'react';
import { MessageCircle, ShoppingBag, Award, Shield, Plus, Minus, Phone } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  size: string;
  image: string;
  description: string;
}

const products: Product[] = [
  {
    id: 1,
    name: 'عسل نحل طبيعي أصلي (سدر ملكي)',
    price: 450,
    size: '1 كيلو',
    image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    description: 'عسل سدر طبيعي 100% مفيد للمناعة والصحة العامة، مفحوص ومضمون.'
  },
  {
    id: 2,
    name: 'عسل حبة البركة النقي',
    price: 350,
    size: '1 كيلو',
    image: 'https://images.unsplash.com/photo-1471943311424-64696f669e9a?auto=format&fit=crop&w=600&q=80',
    description: 'عسل غني بفوائد حبة البركة لتقوية الجسم والجهاز التنفسي.'
  },
  {
    id: 3,
    name: 'عسل الموالح الطبيعي',
    price: 300,
    size: '1 كيلو',
    image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    description: 'عسل خفيف ولذيذ، ممتاز للاستخدام اليومي وللأطفال.'
  }
];

export default function HoneyStore() {
  const [cart, setCart] = useState<{ [key: number]: number }({});
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const updateQuantity = (id: number, delta: number) => {
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
      const product = products.find(p => p.id === Number(id));
      return total + (product ? product.price * qty : 0);
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
    if (customerAddress) message += `📍 العنوان: ${customerAddress}\n`;
    message += `\n*المنتجات المطلوبة:*\n`;

    Object.entries(cart).forEach(([id, qty]) => {
      const product = products.find(p => p.id === Number(id));
      if (product) {
        message += `- ${product.name} (${product.size}) × ${qty} = ${product.price * qty} جنيه\n`;
      }
    });

    message += `\n💰 *الإجمالي الكلي: ${getTotalPrice()} جنيه*\n`;
    message += `\nشكراً لاختياركم POB~Honey 🍯`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/201001316599?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-amber-50/50 text-gray-800 font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-amber-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-wider">POB~Honey</span>
          </div>
          <a
            href="https://wa.me/201001316599"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition"
          >
            <Phone className="w-5 h-5" />
            تواصل واتساب
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-100 to-amber-50 py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-900 mb-4">
            أجود أنواع العسل الطبيعي النقي 100%
          </h1>
          <p className="text-lg text-amber-800 mb-8">
            من النحل إلى مائدتك مباشرة. جودة مضمونة وصحة متكاملة لأسرتك.
          </p>
          <div className="flex justify-center gap-6 text-amber-900 font-semibold">
            <div className="flex items-center gap-1"><Shield className="w-5 h-5 text-amber-700" /> مفحوص ومضمون</div>
            <div className="flex items-center gap-1"><Award className="w-5 h-5 text-amber-700" /> إنتاج فاخر</div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-amber-900 mb-10">منتجاتنا المميزة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-amber-100 flex flex-col justify-between">
              <div>
                <img src={product.image} alt={product.name} className="w-full h-56 object-cover" />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                    <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">{product.size}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                  <div className="text-2xl font-black text-amber-700 mb-4">{product.price} جنيه</div>
                </div>
              </div>
              <div className="p-6 pt-0">
                <div className="flex items-center justify-between border border-amber-200 rounded-lg p-2 bg-amber-50/50">
                  <span className="text-sm font-medium text-amber-900">الكمية:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(product.id, -1)}
                      className="w-8 h-8 bg-white border border-amber-300 rounded-md flex items-center justify-center hover:bg-amber-100 text-amber-900"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-lg w-6 text-center">{cart[product.id] || 0}</span>
                    <button
                      onClick={() => updateQuantity(product.id, 1)}
                      className="w-8 h-8 bg-amber-600 text-white rounded-md flex items-center justify-center hover:bg-amber-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart & Checkout Section */}
        <div className="mt-16 max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-amber-200 p-8">
          <h3 className="text-2xl font-bold text-amber-900 mb-6 text-center">إتمام الطلب عبر الواتساب</h3>
          <form onSubmit={handleWhatsAppCheckout} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكريم</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="ادخل اسمك هنا"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان التوصيل</label>
              <input
                type="text"
                required
                value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value)}
                placeholder="المدينة / المنطقة / التفاصيل"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="border-t border-b border-amber-100 py-4 my-4">
              <div className="flex justify-between text-lg font-bold text-amber-900">
                <span>الإجمالي الكلي:</span>
                <span>{getTotalPrice()} جنيه</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition"
            >
              <MessageCircle className="w-6 h-6" />
              إرسال الطلب عبر الواتساب
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-100 py-8 mt-16 text-center">
        <p>© 2026 POB~Honey. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}