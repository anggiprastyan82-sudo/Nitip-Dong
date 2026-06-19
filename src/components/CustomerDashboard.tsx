import React, { useState } from 'react';
import { 
  Compass, MapPin, MessageSquare, ShieldCheck, QrCode, 
  CreditCard, Check, AlertCircle, ShoppingBag, Clock, Star, Landmark
} from 'lucide-react';
import { DbUser, DbDriver, DbOrder, DbChat } from '../types';
import MapContainer from './MapContainer';
import ChatWindow from './ChatWindow';

interface CustomerDashboardProps {
  currentUser: DbUser;
  drivers: DbDriver[];
  chats: DbChat[];
  orders: DbOrder[];
  messages: any[];
  onStartChat: (driverId: string) => void;
  onSendMessage: (chatId: string, text: string, imageUrl?: string | null, lat?: number | null, lng?: number | null) => void;
  onUploadPaymentProof: (orderId: string, proofBase64: string) => void;
}

export default function CustomerDashboard({
  currentUser,
  drivers,
  chats,
  orders,
  messages,
  onStartChat,
  onSendMessage,
  onUploadPaymentProof,
}: CustomerDashboardProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [customerLoc, setCustomerLoc] = useState({ latitude: -6.155, longitude: 106.845, address: 'Jl. Benyamin Sueb No. 10, Kemayoran' });
  const [receiptFiles, setReceiptFiles] = useState<{ [orderId: string]: string }>({});

  const activeDriver = drivers.find(d => d.user_id === selectedDriverId);
  const activeChat = chats.find(c => c.customer_id === currentUser.id && c.driver_id === selectedDriverId);
  const currentChatMessages = activeChat ? messages.filter(m => m.chat_id === activeChat.id) : [];

  const handleStartChatWithDriver = (driverId: string) => {
    setSelectedDriverId(driverId);
    onStartChat(driverId);
  };

  // Find chat if there's an active selected one
  React.useEffect(() => {
    if (selectedDriverId) {
      const chat = chats.find(c => c.customer_id === currentUser.id && c.driver_id === selectedDriverId);
      if (chat) {
        setActiveChatId(chat.id);
      }
    } else {
      setActiveChatId(null);
    }
  }, [selectedDriverId, chats, currentUser.id]);

  // Handle mock receipt file selection using generic meal images to speed up mock experience
  const handleSelectMockProofReceipt = (orderId: string, url: string) => {
    setReceiptFiles(prev => ({ ...prev, [orderId]: url }));
    onUploadPaymentProof(orderId, url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Welcome Splash/Popup */}
      {!welcomeDismissed && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-200/50 animate-fade-in relative overflow-hidden border border-emerald-400/20">
          {/* Accent decoration */}
          <span className="absolute right-0 bottom-0 text-[100px] leading-none opacity-10 translate-x-12 translate-y-6">🛵</span>
          
          <div className="relative z-10 max-w-lg">
            <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-200 mb-1">Mulai Jastip Kuliner</div>
            <h2 className="text-xl font-extrabold tracking-tight leading-tight mb-2 italic">
              Selamat Datang di NITIP DONG!
            </h2>
            <p className="text-xs text-emerald-100 leading-relaxed mb-4">
              Pesan makanan, minuman, jajanan pasar, minimarket, warteg, atau kaki lima di area Kemayoran lewat chat. Kami menghubungkan Anda secara langsung dengan driver online tercepat.
            </p>
            <button
              onClick={() => setWelcomeDismissed(true)}
              className="bg-white text-emerald-700 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors shadow-md uppercase tracking-wider active:scale-95 transition-transform"
              id="btn-dismiss-splash"
            >
              Mulai Pesan Sekarang
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Banner Branding */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none italic uppercase">
          NITIP <span className="text-emerald-500">DONG</span>
        </h2>
        <p className="text-xs text-slate-500 mt-2 font-medium italic">
          Nitip Jajanan & Makanan Jadi Gampang — Kemayoran, Jakarta Pusat
        </p>
        <div className="inline-block bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-extrabold text-emerald-600 tracking-widest uppercase font-sans mt-3">
          #FoodJastipKemayoran
        </div>
      </div>

      {/* 3. Interactive Kemayoran Live Map */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest">Live Map Tracking & Drivers</h3>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Kemayoran, Jakarta Pusat</span>
        </div>
        <MapContainer 
          drivers={drivers}
          activeDriverId={selectedDriverId}
          onSelectDriver={handleStartChatWithDriver}
          customerLocation={customerLoc}
          interactive={true}
          onSetLocation={(lat, lng, address) => {
            setCustomerLoc({ latitude: lat, longitude: lng, address });
          }}
        />
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 rounded-xl flex items-start gap-2.5 shadow-xs">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block text-slate-800">Lokasi Kirim Anda:</span>
            <span className="text-slate-600 mt-0.5 inline-block">{customerLoc.address}</span>
            <span className="text-[9px] block text-emerald-500 font-mono mt-1 font-bold">Lat: {customerLoc.latitude.toFixed(5)} | Lng: {customerLoc.longitude.toFixed(5)}</span>
          </div>
        </div>
      </div>

      {/* 4. Active Conversation Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Drivers List sidebar (2 columns) */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest">Driver Online</h3>
            <span className="text-[10px] bg-emerald-500 text-white rounded-full px-2.5 py-0.5 font-extrabold shadow-sm">
              {drivers.filter(d => d.online_status === 'online').length} Aktif
            </span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {drivers.filter(drv => drv.online_status === 'online').length === 0 ? (
              <div className="bg-white border border-rose-100 rounded-2xl p-6 text-center text-xs text-rose-500 font-extrabold shadow-sm flex flex-col items-center gap-2">
                <AlertCircle className="w-6 h-6 text-rose-400 animate-pulse" />
                <span>Driver Tidak Ditemukan / Belum Ada Driver Online</span>
                <span className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Silakan buat/ganti role akun menjadi Driver di bar atas dan Login untuk mengaktifkan driver baru.
                </span>
              </div>
            ) : (
              drivers.filter(drv => drv.online_status === 'online').map((drv) => {
                const isSelected = drv.user_id === selectedDriverId;
                const isOnline = drv.online_status === 'online';
                return (
                  <button
                    key={drv.id}
                    onClick={() => handleStartChatWithDriver(drv.user_id)}
                    disabled={drv.status === 'suspended'}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      drv.status === 'suspended'
                        ? 'bg-slate-50 border-emerald-100 opacity-50 cursor-not-allowed'
                        : isSelected 
                        ? 'bg-emerald-50 border-emerald-500 border-l-4 shadow-sm shadow-emerald-100' 
                        : 'bg-white border-emerald-100/65 hover:border-emerald-305 hover:bg-emerald-50/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                        src={drv.avatar} 
                        alt={drv.name} 
                        className="w-10 h-10 rounded-full object-cover border border-emerald-100"
                        referrerPolicy="no-referrer"
                        />
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}></span>
                      </div>

                      <div className="text-xs">
                        <span className="font-extrabold text-slate-800 block text-ellipsis truncate max-w-[140px]">
                          {drv.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-450 mt-1">
                          <span className="flex items-center text-amber-500 font-extrabold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5 inline animate-pulse" />
                            {drv.rating}
                          </span>
                          <span>•</span>
                          <span className="text-[10px] font-mono text-emerald-600 font-extrabold uppercase">
                            {drv.online_status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {drv.status === 'suspended' ? (
                        <span className="text-[9px] bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Suspended</span>
                      ) : (
                        <span className="text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform uppercase tracking-wider">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat
                        </span>
                      )}
                      <span className="text-[9px] text-slate-400 font-mono font-medium">
                        Kemayoran
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat window interface (3 columns) */}
        <div className="md:col-span-3">
          {selectedDriverId ? (
            activeChatId ? (
              <ChatWindow
                chatId={activeChatId}
                senderId={currentUser.id}
                recipientName={activeDriver?.name || 'Driver'}
                recipientAvatar={activeDriver?.avatar}
                messages={currentChatMessages}
                onSendMessage={(text, img, lat, lng) => onSendMessage(activeChatId, text, img, lat, lng)}
                onSetMapUserLocation={() => {}}
              />
            ) : (
              <div className="h-[420px] bg-white border border-emerald-100 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-lg shadow-emerald-50">
                <Clock className="w-10 h-10 text-emerald-500 animate-pulse mb-3" />
                <h4 className="text-sm font-extrabold text-slate-800">Menghubungkan Jastip...</h4>
                <p className="text-xs text-slate-400 mt-1">Silakan ketuk tombol chat untuk memulai obrolan langsung bebas biaya dengan driver.</p>
              </div>
            )
          ) : (
            <div className="h-[420px] bg-emerald-50/20 border border-emerald-100/80 rounded-2xl border-dashed flex flex-col items-center justify-center p-6 text-center">
              <Compass className="w-10 h-10 text-emerald-500 mb-2 animate-bounce-slow" />
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Pilih Driver Terlebih Dahulu</h4>
              <p className="text-[11px] text-slate-400 max-w-[220px] mt-1 lead-relaxed">
                Pilih salah satu mitra jastip driver Kemayoran di daftar kiri untuk mulai chat dan titip apa saja!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. active Orders Tracker & Payment UI */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest">📦 Status Order Jastip Anda</h3>
        
        {orders.length === 0 ? (
          <div className="bg-white border border-emerald-100 p-8 rounded-2xl text-center shadow-sm">
            <ShoppingBag className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Anda belum mengirim rincian belanja. Silakan hubungi Driver untuk membuat rincian harga order!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((ord) => {
              const needsPayment = ord.status === 'Menunggu Pembayaran';
              const waitingVerif = ord.status === 'Menunggu Verifikasi';
              const isShopping = ord.status === 'Sedang Belanja';
              const isTransit = ord.status === 'Dalam Perjalanan';
              const isDone = ord.status === 'Selesai';
              const isCancel = ord.status === 'Dibatalkan';

              return (
                <div key={ord.id} className="bg-white border border-emerald-100/80 rounded-2xl p-5 shadow-sm space-y-3.5 relative overflow-hidden">
                  {/* Status Banner Tag */}
                  <span className={`absolute top-0 right-0 text-[10px] px-3.5 py-1.5 rounded-bl-xl font-extrabold uppercase tracking-wider ${
                    needsPayment 
                      ? 'bg-amber-100 text-amber-700' 
                      : waitingVerif 
                      ? 'bg-indigo-100 text-indigo-700 font-extrabold' 
                      : isShopping 
                      ? 'bg-blue-100 text-blue-750 font-extrabold' 
                      : isTransit 
                      ? 'bg-emerald-500 text-white font-extrabold shadow-sm' 
                      : isDone 
                      ? 'bg-slate-100 text-slate-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {ord.status}
                  </span>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-850">Order #{ord.id}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Driver: Mas {ord.driver_name || 'Driver'}</p>
                    <div className="text-slate-600 bg-slate-50 p-3 rounded-xl text-xs leading-relaxed mt-2.5 border border-slate-100/80">
                      <span className="font-extrabold block text-[9px] uppercase text-emerald-800 tracking-wider">Rincian Jastip:</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{ord.item_description}</p>
                    </div>
                  </div>

                  {/* Pricing Sheet */}
                  <div className="border-t border-b border-dashed border-emerald-100 py-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Harga Jajanan Makanan</span>
                      <span className="font-mono text-slate-700 font-semibold">Rp {ord.food_price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ongkir Jastip Kemayoran</span>
                      <span className="font-mono text-slate-700 font-semibold">Rp {ord.delivery_fee.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-sm text-slate-850 pt-2 border-t border-emerald-100/60">
                      <span>Total Pembayaran</span>
                      <span className="text-emerald-600 font-mono">Rp {ord.total_price.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* ORIS Payment Section */}
                  {needsPayment && (
                    <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5 space-y-3.5">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-emerald-600" />
                        <div>
                          <span className="font-extrabold text-xs text-slate-800">Scan QRIS NITIP DONG</span>
                          <span className="text-[9px] text-slate-400 block font-medium">Transfer instan bebas biaya admin</span>
                        </div>
                      </div>

                      {/* Pure CSS Authentic QRIS Visual */}
                      <div className="flex items-center justify-center p-2.5 bg-white rounded-lg border border-emerald-100 w-[120px] h-[120px] mx-auto shadow-sm">
                        {/* Static QR code design */}
                        <div className="relative w-full h-full bg-slate-100 border border-slate-300 rounded p-1 flex flex-wrap justify-between">
                          <div className="w-6 h-6 border-4 border-slate-855 rounded-sm"></div>
                          <div className="w-6 h-6 border-4 border-slate-855 rounded-sm"></div>
                          <div className="w-6 h-6 border-4 border-slate-855 rounded-sm self-end"></div>
                          <div className="w-4 h-4 bg-emerald-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-[7px] font-black text-white">ND</div>
                          <div className="absolute inset-0 bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:6px_6px] p-2 opacity-80 pointer-events-none"></div>
                        </div>
                      </div>

                      {/* Mock Receipt Upload Buttons to Speed Up Testing Interface */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-emerald-800 font-bold block uppercase tracking-wider text-center">Simulasikan Upload Bukti Transfer</span>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          <button
                            onClick={() => handleSelectMockProofReceipt(ord.id, 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=200')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] px-2.5 py-1.5 rounded-lg font-bold transition-colors shadow-xs active:scale-95 transition-transform"
                          >
                            Struk BCA
                          </button>
                          <button
                            onClick={() => handleSelectMockProofReceipt(ord.id, 'https://images.unsplash.com/photo-1534531173927-aeb928d54385?auto=format&fit=crop&q=80&w=200')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] px-2.5 py-1.5 rounded-lg font-bold transition-colors shadow-xs active:scale-95 transition-transform"
                          >
                            Struk Mandiri
                          </button>
                        </div>
                        
                        {receiptFiles[ord.id] && (
                          <div className="text-center text-[10px] text-emerald-600 font-extrabold p-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center gap-1.5 mt-2 animate-pulse">
                            <Check className="w-4 h-4" />
                            <span>Bukti Diunggah! Menunggu Verifikasi Admin</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {waitingVerif && (
                    <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 p-3 rounded-xl text-xs flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
                      <div>
                        <span className="font-extrabold block">Status: Menunggu Verifikasi</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 leading-relaxed">Pembayaran sedang diperiksa oleh Admin/Driver untuk memproses belanja jastip Anda!</span>
                      </div>
                    </div>
                  )}

                  {isShopping && (
                    <div className="bg-blue-50 border border-blue-100 text-blue-800 p-3 rounded-xl text-xs flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-blue-500 animate-bounce shrink-0" />
                      <div>
                        <span className="font-extrabold block">Status: Sedang Belanja</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 leading-relaxed">Driver Anda sedang berada di kedai pedagang membelikan titipan pesanan Anda!</span>
                      </div>
                    </div>
                  )}

                  {isTransit && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2.5">
                      <Compass className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
                      <div>
                        <span className="font-extrabold block">Status: Dalam Perjalanan</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 leading-relaxed">Driver meluncur ke lokasi rumah Anda di Kemayoran. Silakan pantau peta live!</span>
                      </div>
                    </div>
                  )}

                  {isDone && (
                    <div className="bg-gray-50 border border-emerald-100 text-gray-700 p-3 rounded-xl text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-semibold">Order jastip selesai diterima. Terima kasih!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
