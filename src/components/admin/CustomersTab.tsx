
import React, { useState } from 'react';
import {
  User, Flag, Mail, Phone, Calendar, Plus,
  Search, MoreVertical, X, UserPlus, Upload,
  MessageSquare, ExternalLink, Send
} from 'lucide-react';
import { AuthAPI } from '../../services/api';

interface Visitor {
  id: string;
  name: string;
  country: string;
  email: string;
  phone: string;
  arrivalDate: string;
  avatar?: string;
}

const CustomersTab: React.FC = () => {
  const [customers, setCustomers] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [contactVisitor, setContactVisitor] = useState<Visitor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add User State
  const [newUserData, setNewUserData] = useState({ name: '', email: '', phone: '', password: '', country: '' });
  const [addLoading, setAddLoading] = useState(false);

  // Fetch users from API
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await AuthAPI.getUsers();
        if (response.success && response.data?.users) {
          // Map backend User to frontend Visitor interface
          const mappedUsers: Visitor[] = response.data.users.map((user: any) => {
            const lastBooking = user.bookings && user.bookings.length > 0 ? user.bookings[0] : null;
            const arrivalDate = lastBooking
              ? new Date(lastBooking.checkIn).toLocaleDateString('ar-EG')
              : 'لم يحجز بعد';

            return {
              id: `USR-${user.id.slice(0, 4).toUpperCase()}`,
              name: user.name,
              country: user.country || 'السعودية',
              email: user.email,
              phone: user.phone || 'غير مسجل',
              arrivalDate: arrivalDate,
              avatar: undefined
            };
          });
          setCustomers(mappedUsers);
        } else {
          setError('فشل في تحميل بيانات المستخدمين');
        }
      } catch (err) {
        setError('حدث خطأ أثناء الاتصال بالسيرفر');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openWhatsApp = (phone: string) => {
    // تنظيف الرقم من أي رموز غير رقمية
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const openEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-bold">جاري تحميل بيانات العملاء...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100">
        <p className="text-red-500 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">إدارة المعتمرين والزوار</h2>
          <p className="text-slate-400 font-bold mt-2 flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-[#0ca678]"></span>
            {customers.length > 0 ? `${customers.length} عضو مسجل في النظام` : 'لا يوجد مستخدمين حالياً'}
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={() => alert('جاري تحضير ملف الاستيراد...')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white rounded-[1.25rem] text-xs font-black text-slate-600 hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
          >
            <Upload size={18} /> استيراد CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-[#0ca678] text-white rounded-[1.25rem] text-xs font-black shadow-lg shadow-emerald-200 hover:bg-[#087f5b] active:scale-95 transition-all"
          >
            <UserPlus size={18} /> إضافة عضو جديد
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0ca678] transition-colors" size={20} />
          <input
            type="text"
            placeholder="البحث بالاسم، البريد الإلكتروني، أو رقم العضوية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#0ca678]/5 focus:border-[#0ca678] font-bold text-slate-700 transition-all"
          />
        </div>
      </div>

      {/* Visitors List */}
      <div className="space-y-4">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col lg:flex-row items-center justify-between group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 relative overflow-hidden"
          >
            {/* Info Section */}
            <div className="flex items-center gap-6 w-full lg:w-auto">
              <div className="relative">
                <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#e6fcf5] group-hover:text-[#0ca678] transition-all duration-500 shadow-inner">
                  <User size={36} strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-white rounded-xl shadow-md flex items-center justify-center border border-slate-50 text-xs">
                  🕋
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-black text-slate-800 text-xl tracking-tight">{customer.name}</h4>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 tracking-widest uppercase">#{customer.id}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 md:gap-x-8 mt-4">
                  <div className="flex items-center gap-2.5 text-[11px] font-black text-slate-500">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0ca678] flex items-center justify-center border border-emerald-100"><Flag size={14} /></div>
                    {customer.country}
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] font-black text-slate-500">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100"><Mail size={14} /></div>
                    {customer.email}
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] font-black text-slate-500">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100"><Phone size={14} /></div>
                    {customer.phone}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center justify-between lg:justify-end gap-10 w-full lg:w-auto mt-8 lg:mt-0 pt-8 lg:pt-0 border-t lg:border-t-0 border-slate-50">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center justify-end gap-2 tracking-[0.2em]">
                  <Calendar size={12} /> تاريخ الوصول
                </p>
                <p className="text-sm font-black text-slate-700 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 shadow-inner">
                  {customer.arrivalDate}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setContactVisitor(customer)}
                  className="px-6 py-4 bg-[#e6fcf5] text-[#0ca678] hover:bg-[#0ca678] hover:text-white rounded-[1.25rem] transition-all shadow-sm border border-[#c3fae8] flex items-center gap-3 font-black text-xs group/btn"
                >
                  <MessageSquare size={20} className="group-hover/btn:scale-110 transition-transform" />
                  تواصل الآن
                </button>
                <button className="p-4 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-[1.25rem] transition-all border border-slate-200">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-emerald-50/20 rounded-full blur-3xl group-hover:bg-emerald-100/40 transition-colors"></div>
          </div>
        ))}
      </div>

      {/* Modal: Contact Options */}
      {contactVisitor && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setContactVisitor(null)}></div>
          <div className="relative glass-card w-full max-w-md rounded-[3rem] border border-white p-10 animate-in zoom-in-95 duration-300 shadow-2xl overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-slate-800/10 blur-[60px] rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full"></div>

            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-100 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                  <Send size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-text">تواصل مع الزائر</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">اختر وسيلة التواصل المناسبة</p>
                </div>
              </div>
              <button onClick={() => setContactVisitor(null)} className="p-2.5 bg-slate-100 text-slate-400 hover:text-red-500 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-slate-400 shadow-sm">
                  <User size={24} />
                </div>
                <div>
                  <p className="font-black text-text text-sm">{contactVisitor.name}</p>
                  <p className="text-[10px] font-bold text-slate-400">{contactVisitor.country}</p>
                </div>
              </div>

              <button
                onClick={() => openWhatsApp(contactVisitor.phone)}
                className="w-full flex items-center justify-between p-6 bg-[#25D366] text-white rounded-[1.75rem] font-black text-sm shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <MessageSquare size={20} />
                  </div>
                  <span>واتساب (WhatsApp)</span>
                </div>
                <ExternalLink size={18} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => openEmail(contactVisitor.email)}
                className="w-full flex items-center justify-between p-6 bg-primary text-white rounded-[1.75rem] font-black text-sm shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <span>البريد الإلكتروني (Email)</span>
                </div>
                <ExternalLink size={18} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            <p className="text-center text-[9px] font-bold text-slate-400 mt-8 tracking-widest uppercase">
              نظام ضيافة خلود - التواصل الذكي v1.0
            </p>
          </div>
        </div>
      )}

      {/* Add Visitor Modal (Same as before but with minor UI tweaks) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
          <div className="relative glass-card w-full max-w-xl rounded-[3rem] border border-white p-10 animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-text">إضافة ضيف جديد</h3>
                  <p className="text-sm font-bold text-slate-400 mt-1">أدخل بيانات المعتمر أو الزائر بدقة</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-3 bg-slate-100 text-slate-400 hover:text-red-500 rounded-2xl transition-all">
                <X size={20} />
              </button>
            </div>

            <form className="space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              try {
                // Basic validation
                if (!newUserData.name || !newUserData.email || !newUserData.password) {
                  alert('يرجى ملء جميع الحقول المطلوبة');
                  return;
                }

                setAddLoading(true);
                const response = await AuthAPI.register(newUserData);

                if (response.success) {
                  alert('تمت إضافة المستخدم بنجاح!');
                  setShowAddModal(false);
                  setNewUserData({ name: '', email: '', phone: '', password: '', country: '' });
                  // Refresh list
                  window.location.reload(); // Simple refresh to fetch new data
                } else {
                  alert(response.error || 'فشل إضافة المستخدم');
                }
              } catch (err) {
                console.error(err);
                alert('حدث خطأ غير متوقع');
              } finally {
                setAddLoading(false);
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 mr-2">الاسم بالكامل</label>
                  <input
                    type="text"
                    required
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 ring-emerald-500/20"
                    placeholder="مثال: محمد علي"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 mr-2">الجنسية / الدولة</label>
                  <input
                    type="text"
                    value={(newUserData as any).country || ''}
                    onChange={(e) => setNewUserData({ ...newUserData, country: e.target.value } as any)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 ring-emerald-500/20"
                    placeholder="مثال: السعودية"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 mr-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 ring-emerald-500/20"
                    placeholder="mail@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 mr-2">رقم الهاتف (بدون +)</label>
                  <input
                    type="tel"
                    required
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 ring-emerald-500/20"
                    placeholder="9665xxxxxxxx"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 mr-2">كلمة المرور (مطلوب)</label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 ring-emerald-500/20"
                    placeholder="يفضل استخدام كلمة مرور قوية"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={addLoading}
                className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ البيانات وتأكيد الإضافة'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersTab;
