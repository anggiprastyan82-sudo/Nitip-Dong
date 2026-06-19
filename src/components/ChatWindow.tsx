import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, MapPin, CheckCheck, Smile, Keyboard } from 'lucide-react';
import { DbMessage, DbUser } from '../types';

interface ChatWindowProps {
  chatId: string;
  recipientName: string;
  recipientAvatar?: string;
  senderId: string;
  messages: DbMessage[];
  onSendMessage: (text: string, imageUrl?: string | null, lat?: number | null, lng?: number | null) => void;
  onSetMapUserLocation?: () => void; // request setting custom location
}

// Famous Jakarta/Kemayoran food images for instant photo-message simulations
const MEAL_PHOTO_SAMPLES = [
  { name: 'Nasi Goreng Gila', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=300' },
  { name: 'Ketan Susu Kemayoran', url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=300' },
  { name: 'Sate Ayam Madura', url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&q=80&w=300' },
  { name: 'Es Kelapa Muda', url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=300' },
  { name: 'Warteg Telur Dadar & Kikil', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300' },
];

export default function ChatWindow({
  chatId,
  recipientName,
  recipientAvatar,
  senderId,
  messages,
  onSendMessage,
  onSetMapUserLocation,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [showPhotoTray, setShowPhotoTray] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), null);
    setInputText('');
  };

  const handleSendPhoto = (url: string, name: string) => {
    onSendMessage(`📸 Membagikan foto makanan: *${name}*`, url);
    setShowPhotoTray(false);
  };

  const handleSendLocation = () => {
    // Kemayoran coordinates variation
    const kmLat = -6.155 + (Math.random() - 0.5) * 0.01;
    const kmLng = 106.845 + (Math.random() - 0.5) * 0.01;
    onSendMessage("📍 Membagikan lokasi pengantaran saya di Kemayoran", null, kmLat, kmLng);
    if (onSetMapUserLocation) {
      onSetMapUserLocation();
    }
  };

  return (
    <div className="flex flex-col h-[420px] bg-emerald-50/10 border border-emerald-100 rounded-2xl overflow-hidden shadow-lg shadow-emerald-50">
      {/* Active Chat Header */}
      <div className="px-5 py-4 bg-white border-b border-emerald-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={recipientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'} 
              alt={recipientName} 
              className="w-10 h-10 rounded-full object-cover border border-emerald-100"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></span>
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 leading-tight">{recipientName}</h4>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Mitra Jastip Aktif</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSendLocation}
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-all active:scale-95 shadow-sm"
            title="Bagikan Lokasi"
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5" id="chat-messages-container">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Smile className="w-8 h-8 text-emerald-300 mb-2 animate-bounce-slow" />
            <p className="text-[11px] font-bold text-slate-400 max-w-[220px]">Belum ada obrolan. Tulis pesan masukan apa saja, atau kirim rute lokasi!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === senderId;
            return (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <img 
                    src={recipientAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'} 
                    alt={recipientName} 
                    className="w-7 h-7 rounded-full object-cover self-end border border-emerald-100"
                    referrerPolicy="no-referrer"
                  />
                )}
                
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                  isMe 
                    ? 'bg-emerald-500 text-white rounded-br-none shadow-md shadow-emerald-200' 
                    : 'bg-white border border-emerald-100 text-slate-800 rounded-bl-none'
                }`}>
                  {/* Image Attachment (Food/Receipt photo) */}
                  {msg.image_url && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-emerald-100/50 bg-slate-55 bg-emerald-50/50">
                      <img 
                        src={msg.image_url} 
                        alt="Makanan" 
                        className="w-full max-h-[140px] object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Location Attachment Card */}
                  {msg.latitude && msg.longitude && (
                    <div className="mb-2 p-2 bg-slate-900 border border-slate-800 text-white rounded-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="text-[10px]">
                        <span className="font-bold block text-emerald-405 text-emerald-400">Koordinat Kemayoran</span>
                        <span className="text-slate-300 font-mono text-[9px]">{msg.latitude.toFixed(4)}, {msg.longitude.toFixed(4)}</span>
                      </div>
                    </div>
                  )}

                  {/* Text Message with markdown boldness supported */}
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </p>

                  {/* Footer Meta: Time & Status */}
                  <div className={`flex items-center justify-end gap-1 text-[9px] mt-1.5 ${
                    isMe ? 'text-emerald-100' : 'text-slate-400'
                  }`}>
                    <span className="font-medium">{new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Instant Action Trays / Attachments */}
      {showPhotoTray && (
        <div className="bg-white border-t border-emerald-100 p-4 animate-slide-up">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Simulasikan Kirim Foto Jajanan Kemayoran</span>
            <button 
              onClick={() => setShowPhotoTray(false)}
              className="text-[10px] text-rose-500 hover:text-rose-600 font-extrabold uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded"
            >
              [Tutup]
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {MEAL_PHOTO_SAMPLES.map((meal) => (
              <button
                key={meal.name}
                onClick={() => handleSendPhoto(meal.url, meal.name)}
                className="flex-shrink-0 w-[100px] text-left border border-emerald-100 rounded-xl overflow-hidden hover:border-emerald-500 hover:shadow-xs hover:scale-[1.02] active:scale-95 transition-all"
              >
                <img 
                  src={meal.url} 
                  alt={meal.name} 
                  className="w-full h-14 object-cover" 
                  referrerPolicy="no-referrer"
                />
                <span className="block p-1 text-[9px] font-bold text-slate-700 truncate">{meal.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Action Form */}
      <form onSubmit={handleSendText} className="p-3 bg-white border-t border-emerald-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPhotoTray(!showPhotoTray)}
          className={`p-2 rounded-xl hover:bg-emerald-50 transition-all ${
            showPhotoTray ? 'text-emerald-500 bg-emerald-50 border border-emerald-200' : 'text-slate-400'
          }`}
          title="Lampirkan Foto Makanan"
        >
          <Image className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ketik pesanan Anda..."
          className="flex-1 bg-slate-50 border border-emerald-100/60 rounded-xl px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-500 focus:bg-white transition-all"
        />

        <button
          type="submit"
          className="bg-emerald-500 text-white p-2.5 rounded-xl hover:bg-emerald-600 transition-colors shrink-0 shadow-md shadow-emerald-200 active:scale-95 transition-transform"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
