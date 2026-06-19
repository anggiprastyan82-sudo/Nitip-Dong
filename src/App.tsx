import React, { useState, useEffect } from 'react';
import { 
  DbUser, DbDriver, DbChat, DbMessage, DbOrder, DbPayment 
} from './types';
import RoleSelector from './components/RoleSelector';
import CustomerDashboard from './components/CustomerDashboard';
import DriverDashboard from './components/DriverDashboard';
import AdminDashboard from './components/AdminDashboard';
import { 
  Phone, Smartphone, ShieldCheck, Compass, CompassIcon, ArrowRight, Star, Activity
} from 'lucide-react';

export default function App() {
  // Sync States loaded from backend
  const [users, setUsers] = useState<DbUser[]>([]);
  const [drivers, setDrivers] = useState<DbDriver[]>([]);
  const [chats, setChats] = useState<DbChat[]>([]);
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [payments, setPayments] = useState<DbPayment[]>([]);

  // Auth / Navigation States
  const [currentUser, setCurrentUser] = useState<DbUser | null>((() => {
    try {
      const persisted = localStorage.getItem('nitip_dong_user');
      if (persisted) {
        const u = JSON.parse(persisted);
        if (u && u.name && /gojek/i.test(u.name)) {
          u.name = u.name.replace(/Gojek\s+Jastiper\s+Google/gi, "Teman Titipku").replace(/Gojek/gi, "Teman Titipku");
          localStorage.setItem('nitip_dong_user', JSON.stringify(u));
        }
        return u;
      }
      return null;
    } catch {
      return null;
    }
  })());
  const [authMode, setAuthMode] = useState<'phone' | 'google'>('phone');
  const [phoneNo, setPhoneNo] = useState('');
  const [fullName, setFullName] = useState('');
  const [authRole, setAuthRole] = useState<'customer' | 'driver' | 'admin'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleEmail, setGoogleEmail] = useState('');

  // Active Simulated View mode (RoleSelector)
  const [simulatorRole, setSimulatorRole] = useState<'customer' | 'driver' | 'admin'>('customer');

  // Load and Pool state from backend
  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setDrivers(data.drivers || []);
        setChats(data.chats || []);
        setMessages(data.messages || []);
        setOrders(data.orders || []);
        setPayments(data.payments || []);

        // Also update local current user reference if updated in database
        if (currentUser) {
          const matched = (data.users || []).find((u: DbUser) => u.id === currentUser.id);
          if (matched && JSON.stringify(matched) !== JSON.stringify(currentUser)) {
            setCurrentUser(matched);
            localStorage.setItem('nitip_dong_user', JSON.stringify(matched));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching state from server:', error);
    }
  };

  // Poll state every 2 seconds for realtime feel
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Handle Login / Registration
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNo.trim()) return;
    setAuthError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneNo, 
          name: fullName || undefined,
          role: authRole 
        })
      });

      if (res.ok) {
        const user = await res.json() as DbUser;
        setCurrentUser(user);
        setSimulatorRole(user.role);
        localStorage.setItem('nitip_dong_user', JSON.stringify(user));
        fetchState();
      } else {
        const errData = await res.json();
        setAuthError(errData.error || 'Terjadi kesalahan sistem');
      }
    } catch (err) {
      console.error('Login error:', err);
      setAuthError('Gagal menghubungi server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/users/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: fullName || 'Teman Titipku',
          role: authRole,
          email: googleEmail
        })
      });

      if (res.ok) {
        const user = await res.json() as DbUser;
        setCurrentUser(user);
        setSimulatorRole(user.role);
        localStorage.setItem('nitip_dong_user', JSON.stringify(user));
        fetchState();
      } else {
        const errData = await res.json();
        setAuthError(errData.error || 'Akses ditolak atau kesalahan sistem');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setAuthError('Gagal menghubungi server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nitip_dong_user');
  };

  const handleResetDb = async () => {
    if (!confirm('Apakah Anda yakin ingin me-reset database simulasi ke pengaturan bawaan?')) return;
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        fetchState();
        // Keep login or sync role
        const data = await res.json();
        alert('Database sukses dikembalikan ke kondisi default!');
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  // Actions
  const handleStartChat = async (driverId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/chats/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: currentUser.id, driver_id: driverId })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error('Start chat error:', err);
    }
  };

  const handleSendMessage = async (
    chatId: string, 
    text: string, 
    imageUrl?: string | null, 
    lat?: number | null, 
    lng?: number | null
  ) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          sender_id: currentUser.id,
          message: text,
          image_url: imageUrl || null,
          latitude: lat || null,
          longitude: lng || null
        })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const handleUploadPaymentProof = async (orderId: string, proofUrl: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Menunggu Verifikasi',
          payment_proof: proofUrl
        })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error('Upload proof error:', err);
    }
  };

  const handleToggleOnline = async (onlineStatus: 'online' | 'offline') => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/drivers/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          online_status: onlineStatus
        })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error('Toggle online error:', err);
    }
  };

  const handleUpdateLocation = async (lat: number, lng: number) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/drivers/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          latitude: lat,
          longitude: lng
        })
      });
      if (res.ok) {
        // quiet update
        setDrivers(prev => prev.map(d => d.user_id === currentUser.id ? { ...d, latitude: lat, longitude: lng } : d));
      }
    } catch (err) {
      console.error('GPS update error:', err);
    }
  };

  const handleCreateOrder = async (orderData: { customer_id: string; item_description: string; food_price: number; delivery_fee: number }) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: currentUser.id,
          ...orderData
        })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error('Create order error:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const handleVerifyPayment = async (paymentId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error('Verify payment error:', err);
    }
  };

  const handleUpdateDriverStatusByAdmin = async (driverUserId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/drivers/${driverUserId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchState();
      }
    } catch (err) {
      console.error('Suspend/approve driver error:', err);
    }
  };

  // --- RENDERING VIEWS ---

  if (!currentUser) {
    // Elegant Startup Authentication Splash UI
    return (
      <div className="min-h-screen bg-emerald-50/40 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white border border-emerald-100 rounded-3xl p-6 shadow-xl shadow-emerald-250/50 space-y-6">
          {/* Logo Heading */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-150/50 overflow-hidden border border-emerald-100">
              <img 
                src="https://i.postimg.cc/Yqy7CvSj/fb1e47cf-6b21-4017-9043-d948cba2e5fe.png" 
                alt="Teman Titipku Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight italic">NITIP DONG</h1>
              <p className="text-xs text-slate-400 font-medium tracking-tight">Nitip Makanan Jadi Gampang</p>
              <div className="inline-block mt-2 font-mono text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                #FoodJastipKemayoran
              </div>
            </div>
          </div>

          {/* Form container */}
          <div className="space-y-4">
            {/* Choose simulated role in registration */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pilih Role Akun</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAuthRole('customer')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    authRole === 'customer' 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200' 
                      : 'bg-white border-emerald-100/60 text-slate-500 hover:bg-emerald-50/50'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setAuthRole('driver')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    authRole === 'driver' 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200' 
                      : 'bg-white border-emerald-100/60 text-slate-500 hover:bg-emerald-50/50'
                  }`}
                >
                  Driver
                </button>
                <button
                  type="button"
                  onClick={() => setAuthRole('admin')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    authRole === 'admin' 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200' 
                      : 'bg-white border-emerald-100/60 text-slate-500 hover:bg-emerald-50/50'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold leading-relaxed shadow-sm shadow-red-100 flex items-start gap-2">
                <span className="text-sm">⚠️</span>
                <span>{authError}</span>
              </div>
            )}

            {/* Auth switcher tabs */}
            <div className="flex border-b border-emerald-100/70">
              <button
                onClick={() => setAuthMode('phone')}
                className={`flex-1 pb-2 text-center text-xs font-bold border-b-2 transition-all ${
                  authMode === 'phone' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'
                }`}
              >
                Nomor HP (OTP)
              </button>
              <button
                onClick={() => setAuthMode('google')}
                className={`flex-1 pb-2 text-center text-xs font-bold border-b-2 transition-all ${
                  authMode === 'google' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'
                }`}
              >
                G-Suite / Google
              </button>
            </div>

            {authMode === 'phone' ? (
              <form onSubmit={handlePhoneLogin} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-450 text-slate-500">Nama Lengkap</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama Anda"
                    required
                    className="w-full bg-slate-50 border border-emerald-100/80 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-450 text-slate-500">Nomor Handphone</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-xs font-bold text-emerald-600 font-mono">+62</span>
                    <input
                      type="tel"
                      value={phoneNo}
                      onChange={(e) => setPhoneNo(e.target.value)}
                      placeholder="812345678"
                      required
                      className="w-full bg-slate-50/50 border border-emerald-100/80 rounded-xl pl-12 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3 rounded-xl text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-250/30 uppercase tracking-wider"
                >
                  <span>Kirim Kode OTP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="space-y-3.5 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-450 text-slate-500">Nama Akun Google</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="cth: Muhammad Anggi"
                    className="w-full bg-slate-50/50 border border-emerald-100/80 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Email Google</label>
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="contoh@gmail.com"
                    required
                    className="w-full bg-slate-50/50 border border-emerald-100/80 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-500 font-mono"
                  />
                  {authRole === 'admin' && (
                    <p className="text-[10px] text-red-650 font-extrabold animate-pulse">
                      * Perhatian: Role Admin wajib menggunakan email pemilik yang sah & terdaftar.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full border border-emerald-100 bg-white hover:bg-emerald-50/50 text-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.66 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.41 7.55l3.82 2.96C6.18 7.42 8.87 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.97 3.7-8.62z" />
                    <path fill="#34A853" d="M5.23 14.41c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.41 6.83C.51 8.63 0 10.41 0 12c0 1.59.51 3.37 1.41 5.17l3.82-2.76z" strokeWidth="0" />
                    <path fill="#FBBC05" d="M12 18.96c-3.13 0-5.82-2.38-6.77-5.47l-3.82 2.76C3.37 20.35 7.35 23 12 23c2.98 0 5.66-.99 7.55-2.69l-3.73-2.89c-1.07.72-2.41 1.54-3.82 1.54z" />
                  </svg>
                  <span>Hubungkan dengan Google</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Guest shortcut info */}
        <p className="text-[10px] text-slate-400 mt-4 text-center max-w-[280px]">
          Masukan asal nama apa saja untuk register instan. Nomor HP akan terdaftar otomatis!
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/30 flex flex-col font-sans">
      {/* 1. Multi-role simulator toolbar */}
      <RoleSelector
        currentRole={simulatorRole}
        onChangeRole={(role) => {
          if (role === 'admin') {
            const hasAccess = currentUser && currentUser.email && currentUser.email.toLowerCase().startsWith('anggiprastyan82@gmail');
            if (!hasAccess) {
              alert('Akses Terkunci! Hanya akun email pemilik yang sah & terdaftar yang diperbolehkan mengakses dashboard Admin.');
              return;
            }
          }
          setSimulatorRole(role);
        }}
        onReset={handleResetDb}
        currentUserPhone={currentUser.phone}
      />

      {/* 2. Logged User profile header */}
      <div className="bg-white border-b border-emerald-100 px-6 py-2 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span>Sesi Aktif: <strong className="text-slate-700 font-extrabold">{currentUser.name}</strong> • Akun {currentUser.role?.toUpperCase()}</span>
        </div>

        <button
          onClick={handleLogout}
          className="text-rose-500 hover:text-rose-600 font-extrabold text-[10px] uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100 transition-colors"
        >
          [Logout Keluar]
        </button>
      </div>

      {/* 3. Role Viewports container */}
      <div className="flex-1 pb-16">
        {simulatorRole === 'customer' && (
          <CustomerDashboard
            currentUser={currentUser}
            drivers={drivers}
            chats={chats}
            orders={orders}
            messages={messages}
            onStartChat={handleStartChat}
            onSendMessage={handleSendMessage}
            onUploadPaymentProof={handleUploadPaymentProof}
          />
        )}

        {simulatorRole === 'driver' && (
          <DriverDashboard
            currentUser={currentUser}
            drivers={drivers}
            chats={chats}
            orders={orders}
            messages={messages}
            onToggleOnline={handleToggleOnline}
            onUpdateLocation={handleUpdateLocation}
            onSendMessage={handleSendMessage}
            onCreateOrder={handleCreateOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {simulatorRole === 'admin' && (
          <AdminDashboard
            users={users}
            drivers={drivers}
            orders={orders}
            payments={payments}
            onVerifyPayment={handleVerifyPayment}
            onUpdateDriverStatus={handleUpdateDriverStatusByAdmin}
          />
        )}
      </div>

      {/* 4. Bottom Simulated Banner HUD */}
      <div className="fixed bottom-0 left-0 right-0 h-10 bg-slate-900 border-t border-slate-800 flex items-center justify-center px-4 text-[10px] text-slate-400 z-50 font-mono">
        <Activity className="w-3.5 h-3.5 text-emerald-400 mr-2 animate-pulse" />
        <span>Syncing Kemayoran Node: OK Polling Active | Try switching Roles at upper toolbar to test end-to-end jastip flow!</span>
      </div>
    </div>
  );
}
