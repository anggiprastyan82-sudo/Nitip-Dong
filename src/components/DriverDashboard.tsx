import React, { useState, useEffect } from 'react';
import { 
  Compass, MapPin, MessageSquare, ShieldCheck, DollarSign, 
  Plus, Check, AlertCircle, ShoppingBag, Clock, ShieldAlert, Navigation 
} from 'lucide-react';
import { DbUser, DbDriver, DbOrder, DbChat, DbMessage } from '../types';
import ChatWindow from './ChatWindow';

interface DriverDashboardProps {
  currentUser: DbUser;
  drivers: DbDriver[];
  chats: DbChat[];
  orders: DbOrder[];
  messages: DbMessage[];
  onToggleOnline: (status: 'online' | 'offline') => void;
  onUpdateLocation: (lat: number, lng: number) => void;
  onSendMessage: (chatId: string, text: string, imageUrl?: string | null, lat?: number | null, lng?: number | null) => void;
  onCreateOrder: (orderData: { customer_id: string; item_description: string; food_price: number; delivery_fee: number }) => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
}

export default function DriverDashboard({
  currentUser,
  drivers,
  chats,
  orders,
  messages,
  onToggleOnline,
  onUpdateLocation,
  onSendMessage,
  onCreateOrder,
  onUpdateOrderStatus,
}: DriverDashboardProps) {
  const currentDriver = drivers.find(d => d.user_id === currentUser.id);
  const activeDriverOrders = orders.filter(o => o.driver_id === currentUser.id);
  
  // States
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [gpsSimulating, setGpsSimulating] = useState(false);

  // Order creator form states
  const [targetCustomerId, setTargetCustomerId] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [foodPrice, setFoodPrice] = useState(25000);
  const [deliveryFee, setDeliveryFee] = useState(12000);

  // Current chat context
  const activeChat = chats.find(c => c.driver_id === currentUser.id && c.customer_id === selectedCustomerId);
  const currentChatMessages = activeChat ? messages.filter(m => m.chat_id === activeChat.id) : [];

  // Update selected customer chat refs
  useEffect(() => {
    if (selectedCustomerId) {
      const chat = chats.find(c => c.driver_id === currentUser.id && c.customer_id === selectedCustomerId);
      if (chat) {
        setActiveChatId(chat.id);
      }
    } else {
      setActiveChatId(null);
    }
  }, [selectedCustomerId, chats, currentUser.id]);

  // Handle GPS Motion Simulation for Active Delivery Tracker
  useEffect(() => {
    let interval: any = null;
    if (gpsSimulating && currentDriver) {
      // Simulate slow moving motor along Kemayoran roads
      interval = setInterval(() => {
        // Slowly nudge coordinates toward center or towards mock customer (-6.155, 106.845)
        const targetLat = -6.155;
        const targetLng = 106.845;
        
        const nextLat = currentDriver.latitude + (targetLat - currentDriver.latitude) * 0.15;
        const nextLng = currentDriver.longitude + (targetLng - currentDriver.longitude) * 0.15;
        
        onUpdateLocation(nextLat, nextLng);

        // Send a mock GPS share event coordinates to customer inside the active chat if present
        if (activeChatId && Math.random() > 0.6) {
          onSendMessage(
            activeChatId, 
            "🛵 [Live GPS] Update lokasi pengantaran driver di Jl. Benyamin Sueb", 
            null, 
            nextLat, 
            nextLng
          );
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [gpsSimulating, currentDriver, activeChatId, onUpdateLocation]);

  const handleCreateOrderBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomerId || !itemDesc) return;
    
    onCreateOrder({
      customer_id: targetCustomerId,
      item_description: itemDesc,
      food_price: foodPrice,
      delivery_fee: deliveryFee
    });

    // Clear form
    setItemDesc('');
    setTargetCustomerId('');
  };

  // Helper calculation for driver stats
  const completedOrders = activeDriverOrders.filter(o => o.status === 'Selesai');
  const totalCompletedCount = completedOrders.length;
  const deliveryEarning = completedOrders.reduce((sum, o) => sum + o.delivery_fee, 0);
  const foodEarnings = completedOrders.reduce((sum, o) => sum + o.food_price, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Header & Online Switcher Row */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
              referrerPolicy="no-referrer"
            />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              currentDriver?.online_status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
            }`}></span>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-800 leading-none">{currentUser.name}</h2>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-extrabold text-[10px] uppercase">Mitra Driver</span>
              <span>•</span>
              <span className="font-mono text-emerald-600 font-bold">#DRV-{currentUser.phone.slice(-4)}</span>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* GPS Simulation Switcher */}
          <button
            onClick={() => setGpsSimulating(!gpsSimulating)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
              gpsSimulating 
                ? 'bg-emerald-500 text-white animate-pulse shadow-emerald-250/20' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${gpsSimulating ? 'animate-bounce' : ''}`} />
            <span>{gpsSimulating ? 'GPS Live Simulating' : 'Simulasikan GPS Motor'}</span>
          </button>

          {/* Toggle Online status */}
          <div className="flex items-center gap-1.5 bg-emerald-50/60 p-1.5 rounded-xl border border-emerald-100">
            <button
              onClick={() => onToggleOnline('online')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentDriver?.online_status === 'online'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-emerald-700'
              }`}
            >
              Online
            </button>
            <button
              onClick={() => onToggleOnline('offline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentDriver?.online_status === 'offline'
                  ? 'bg-rose-500 text-white'
                  : 'text-slate-400 hover:text-rose-500'
              }`}
            >
              Offline
            </button>
          </div>
        </div>
      </div>

      {/* 2. Driver Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-emerald-105 border-emerald-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Antaran Jastip</span>
          <span className="text-xl font-extrabold text-slate-800 block mt-1">{totalCompletedCount} Selesai</span>
        </div>

        <div className="bg-white border border-emerald-105 border-emerald-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Jasa Jastip Masuk</span>
          <span className="text-xl font-extrabold text-emerald-600 block mt-1 font-mono">Rp {deliveryEarning.toLocaleString('id-ID')}</span>
        </div>

        <div className="bg-white border border-emerald-105 border-emerald-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Modal Talangan</span>
          <span className="text-xl font-extrabold text-slate-650 text-slate-800 block mt-1 font-mono">Rp {foodEarnings.toLocaleString('id-ID')}</span>
        </div>

        <div className="bg-white border border-emerald-105 border-emerald-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Status Mitra</span>
          <span className="text-xs font-extrabold font-mono text-emerald-600 uppercase tracking-wider block mt-2.5">
            ✅ VERIFIED ACTIVE
          </span>
        </div>
      </div>

      {/* 3. Chats and Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Chats Inbox columns (2) */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest px-1">Antrean Chat Customer</h3>
          
          <div className="space-y-2">
            {chats.map((c: DbChat) => {
              const isSelected = c.customer_id === selectedCustomerId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.customer_id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-550 border-emerald-500 shadow-sm'
                      : 'bg-white border-emerald-100/60 hover:border-emerald-300'
                  }`}
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                    alt={c.customer_name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-emerald-105 border-emerald-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-extrabold text-xs text-slate-850 block truncate">{c.customer_name}</span>
                    <p className="text-[10px] text-slate-450 truncate mt-0.5 font-medium">{c.last_message_text}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[9px] text-emerald-600 font-mono font-bold block">
                      {new Date(c.last_message_time || '').toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </button>
              );
            })}

            {chats.length === 0 && (
              <div className="bg-emerald-50/10 border border-emerald-100 border-dashed rounded-xl p-8 text-center text-xs text-slate-400">
                Belum ada customer mengirim chat jastip anda di Kemayoran.
              </div>
            )}
          </div>
        </div>

        {/* Message Panel Box (3) */}
        <div className="md:col-span-3">
          {selectedCustomerId ? (
            activeChatId ? (
              <ChatWindow
                chatId={activeChatId}
                senderId={currentUser.id}
                recipientName={chats.find(c => c.customer_id === selectedCustomerId)?.customer_name || 'Customer'}
                messages={currentChatMessages}
                onSendMessage={(text, img, lat, lng) => onSendMessage(activeChatId, text, img, lat, lng)}
                onSetMapUserLocation={() => {}}
              />
            ) : null
          ) : (
            <div className="h-[420px] bg-emerald-50/20 border border-emerald-100 rounded-2xl border-dashed flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs">
              <MessageSquare className="w-10 h-10 text-emerald-500 mb-2 animate-bounce-slow" />
              <span className="font-bold max-w-[240px] text-slate-650 leading-relaxed">Silakan pilih customer di sisi kiri untuk membalas chat / membuat rincian belanja makanan!</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. order Management & Creator */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Bill/Order Creator Form (2 columns) */}
        <div className="md:col-span-2 bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm self-start space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-emerald-105 border-emerald-100">
            <Plus className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Buat Rincian Jastip</h3>
          </div>

          <form onSubmit={handleCreateOrderBill} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-500 font-extrabold mb-1.5 uppercase text-[9px] tracking-wider">Kirim Untuk Customer:</label>
              <select
                value={targetCustomerId}
                onChange={(e) => setTargetCustomerId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-emerald-100 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Pilih Customer --</option>
                {chats.map(c => (
                  <option key={c.customer_id} value={c.customer_id}>{c.customer_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-extrabold mb-1.5 uppercase text-[9px] tracking-wider">Nama Detail Jajanan (Deskripsi):</label>
              <textarea
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                required
                placeholder="cth: 1 Bakso Bakar (Rp 15k) & 1 Ketan Klapa (Rp 10k)"
                className="w-full bg-slate-50 border border-emerald-100 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-extrabold mb-1.5 uppercase text-[9px] tracking-wider">Harga Belanja (Rp):</label>
                <input
                  type="number"
                  value={foodPrice}
                  onChange={(e) => setFoodPrice(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-emerald-100 rounded-xl px-3.5 py-2.5 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-extrabold mb-1.5 uppercase text-[9px] tracking-wider">Ongkir Jastip (Rp):</label>
                <input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-emerald-100 rounded-xl px-3.5 py-2.5 font-mono font-bold"
                />
              </div>
            </div>

            <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/60 text-center flex justify-between font-extrabold text-slate-800 text-[11px]">
              <span className="text-slate-500">Total Tagihan:</span>
              <span className="text-emerald-700 font-mono text-sm leading-none pt-0.5">Rp {(foodPrice + deliveryFee).toLocaleString('id-ID')}</span>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3 rounded-xl transition-all shadow-md shadow-emerald-250/30 uppercase tracking-wider active:scale-95 transition-transform"
            >
              Kirim Rincian Order
            </button>
          </form>
        </div>

        {/* Active Orders Status Management (3 columns) */}
        <div className="md:col-span-3 space-y-3.5">
          <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest px-1">📋 Daftar Order Jastip Aktif</h3>

          <div className="space-y-3">
            {activeDriverOrders.map((ord) => {
              const status = ord.status;
              return (
                <div key={ord.id} className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-sm text-slate-850">Order #{ord.id}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">Untuk Customer: {ord.customer_name}</span>
                    </div>

                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">
                      {status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl text-xs leading-relaxed text-slate-700 border border-slate-100">
                    <p className="font-semibold text-slate-800">{ord.item_description}</p>
                    <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200/60 flex justify-between text-[10px] text-slate-400 font-medium">
                      <span>Harga Belanja: Rp {ord.food_price.toLocaleString('id-ID')}</span>
                      <span>Ongkir Jastip: Rp {ord.delivery_fee.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Actions to progression status */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {status === 'Menunggu Pembayaran' && (
                      <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1.5 bg-amber-50 rounded-xl px-3.5 py-2 w-full border border-amber-100">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Menunggu customer melakukan scan QRIS & Upload bukti transfer...</span>
                      </p>
                    )}

                    {status === 'Menunggu Verifikasi' && (
                      <div className="w-full space-y-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                        <p className="text-[10px] text-indigo-700 font-bold">
                          ✓ Customer telah upload bukti transfer. Anda perlu menyetujui untuk memproses belanja jastip Anda!
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onUpdateOrderStatus(ord.id, 'Sedang Belanja')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-emerald-250/20 active:scale-95 transition-transform uppercase tracking-wider"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui & Mulai Belanja</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {status === 'Sedang Belanja' && (
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'Dalam Perjalanan')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-200 active:scale-95 transition-transform uppercase tracking-wider"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Mulai Kirim Pesanan ke Tujuan 🛵</span>
                      </button>
                    )}

                    {status === 'Dalam Perjalanan' && (
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'Selesai')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-200 active:scale-95 transition-transform uppercase tracking-wider"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Selesai Terima / Sampai di Lokasi ✓</span>
                      </button>
                    )}

                    {status === 'Selesai' && (
                      <p className="text-[10px] text-emerald-650 text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl w-full">
                        ✓ Transaksi selesai! Jasa jastip masuk saldo harian Anda.
                      </p>
                    )}

                    {status !== 'Selesai' && status !== 'Dibatalkan' && (
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'Dibatalkan')}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 border border-red-200 text-[10px] font-bold px-3 py-1.5 rounded-xl ml-auto transition-colors active:scale-95 transition-transform"
                      >
                        Batalkan Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {activeDriverOrders.length === 0 && (
              <div className="bg-white border border-emerald-100 p-8 rounded-2xl text-center">
                <ShoppingBag className="w-10 h-10 text-emerald-300 mx-auto mb-1.5" />
                <p className="text-xs text-slate-400">Belum ada order jastip aktif untuk Anda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
