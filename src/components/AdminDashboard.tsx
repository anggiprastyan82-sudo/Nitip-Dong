import React from 'react';
import { 
  Users, Compass, ShoppingBag, DollarSign, Check, X, ShieldAlert,
  Star, Ban, ShieldCheck, ExternalLink, Activity
} from 'lucide-react';
import { DbUser, DbDriver, DbOrder, DbPayment } from '../types';

interface AdminDashboardProps {
  users: DbUser[];
  drivers: DbDriver[];
  orders: DbOrder[];
  payments: DbPayment[];
  onVerifyPayment: (paymentId: string, action: 'approve' | 'reject') => void;
  onUpdateDriverStatus: (driverUserId: string, status: string) => void;
}

export default function AdminDashboard({
  users,
  drivers,
  orders,
  payments,
  onVerifyPayment,
  onUpdateDriverStatus,
}: AdminDashboardProps) {
  // Stats calculations
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const totalDrivers = drivers.length;
  const totalOrdersCount = orders.length;
  
  const completedOrders = orders.filter(o => o.status === 'Selesai');
  const totalTransactionVolume = completedOrders.reduce((sum, o) => sum + o.total_price, 0);

  // Filter pending payments
  const pendingPayments = payments.filter(p => p.verification_status === 'pending');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-emerald-800 text-white rounded-2xl p-6 shadow-md flex justify-between items-center relative overflow-hidden">
        {/* Decorative graphic */}
        <span className="absolute right-0 bottom-0 text-9xl opacity-5 translate-x-12 translate-y-6">🛡️</span>
        <div className="relative z-10 space-y-1">
          <h2 className="text-base font-extrabold tracking-wider flex items-center gap-1.5 justify-start">
            <ShieldCheck className="w-5 h-5 text-emerald-300 animate-pulse" />
            <span>KONSOL ADMIN NITIP DONG</span>
          </h2>
          <p className="text-[11px] text-emerald-100 max-w-xl leading-relaxed">
            Kelola mitra jastip Kemayoran, pantau log transaksi order harian, kelayakan berkendara driver, serta jalankan verifikasi tagihan QRIS instan.
          </p>
        </div>
        <div className="bg-emerald-700/85 text-emerald-100 px-3 py-1.5 border border-emerald-600/50 rounded-xl text-[10px] font-bold shrink-0 font-mono">
          Kemayoran Core
        </div>
      </div>

      {/* 2. Admin Bento Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-emerald-101 border-emerald-110 border-emerald-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Customer</span>
            <span className="text-xl font-extrabold text-slate-800 block mt-1">{totalCustomers}</span>
          </div>
          <Users className="w-8 h-8 text-emerald-300" />
        </div>

        <div className="bg-white border border-emerald-101 border-emerald-110 border-emerald-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Driver</span>
            <span className="text-xl font-extrabold text-slate-800 block mt-1">{totalDrivers}</span>
          </div>
          <Compass className="w-8 h-8 text-emerald-300" />
        </div>

        <div className="bg-white border border-emerald-101 border-emerald-110 border-emerald-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Order</span>
            <span className="text-xl font-extrabold text-slate-800 block mt-1">{totalOrdersCount}</span>
          </div>
          <ShoppingBag className="w-8 h-8 text-emerald-300" />
        </div>

        <div className="bg-white border border-emerald-101 border-emerald-110 border-emerald-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Volume Transaksi</span>
            <span className="text-xl font-extrabold text-emerald-600 block mt-1 font-mono">Rp {totalTransactionVolume.toLocaleString('id-ID')}</span>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-500 bg-emerald-50 rounded-xl p-1" />
        </div>
      </div>

      {/* 3. QRIS Payment Verifications Row */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Verifikasi Pembayaran QRIS ({pendingPayments.length})</span>
          </h3>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Butuh Approval</span>
        </div>

        {pendingPayments.length === 0 ? (
          <div className="bg-white border border-emerald-100/60 p-8 rounded-2xl text-center text-xs text-slate-400 font-bold shadow-sm">
            ✓ Belum ada bukti transfer baru yang diunggah oleh customer.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingPayments.map((p) => {
              const matchedOrder = orders.find(o => o.id === p.order_id);
              return (
                <div key={p.id} className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-slate-800">Order ID: #{p.order_id}</span>
                      <span className="text-[9px] text-emerald-600 font-extrabold font-mono">{new Date(p.created_at).toLocaleTimeString()}</span>
                    </div>

                    {matchedOrder && (
                      <div className="text-xs bg-emerald-50/30 p-3 rounded-xl border border-emerald-100/55 text-slate-600 space-y-1">
                        <p className="font-semibold text-slate-700">Rincian: {matchedOrder.item_description}</p>
                        <p className="font-extrabold text-emerald-600 font-mono mt-1 text-sm">Nominal: Rp {matchedOrder.total_price.toLocaleString('id-ID')}</p>
                      </div>
                    )}

                    {/* Receipt Evidence Display */}
                    <div className="border border-emerald-100 rounded-xl overflow-hidden bg-emerald-50/20 relative group">
                      <img 
                        src={p.payment_proof} 
                        alt="Bukti Transfer" 
                        className="w-full h-[180px] object-cover hover:scale-[1.03] transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded px-2.5 py-1 text-[8px] font-extrabold uppercase shadow-sm">
                        Struk QRIS Mitra
                      </div>
                    </div>
                  </div>

                  {/* Approve / Reject Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => onVerifyPayment(p.id, 'approve')}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-250/20 active:scale-95 transition-transform"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Transaksi</span>
                    </button>
                    <button
                      onClick={() => onVerifyPayment(p.id, 'reject')}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center justify-center gap-1 border border-rose-200 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Driver Management Panel */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Manajemen Mitra Driver Jastip ({drivers.length})</span>
        </h3>

        <div className="bg-white border border-emerald-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-emerald-50/50 text-emerald-800 font-extrabold border-b border-emerald-100 text-[10px] tracking-wider uppercase">
                  <th className="p-4">Nama Driver / No. HP</th>
                  <th className="p-4">Peta GPS Lat & Lng</th>
                  <th className="p-4 text-center">Status Online</th>
                  <th className="p-4 text-center">Status Akun</th>
                  <th className="p-4 text-right font-extrabold text-slate-500">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100/50 text-slate-700">
                {drivers.map((drv) => {
                  const isOnline = drv.online_status === 'online';
                  const isSuspended = drv.status === 'suspended';
                  return (
                    <tr key={drv.id} className="hover:bg-emerald-50/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={drv.avatar} 
                            alt={drv.name} 
                            className="w-9 h-9 rounded-full object-cover shrink-0 border border-emerald-100"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-extrabold text-slate-800 block text-ellipsis truncate max-w-[120px]">{drv.name}</span>
                            <span className="text-[10px] text-emerald-600 font-mono font-bold block mt-0.5">{drv.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[10px] text-slate-400 font-bold">
                        {drv.latitude.toFixed(5)}, {drv.longitude.toFixed(5)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${
                          isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                        }`}></span>
                        <span className="text-[10px] font-bold font-mono uppercase tracking-tight text-slate-600">
                          {drv.online_status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {isSuspended ? (
                          <span className="bg-red-50 text-red-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-150">
                            Suspended
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-150">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isSuspended ? (
                          <button
                            onClick={() => onUpdateDriverStatus(drv.user_id, 'approved')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition-colors active:scale-95 transition-transform"
                          >
                            Unsuspend
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateDriverStatus(drv.user_id, 'suspended')}
                            className="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 ml-auto border border-red-200 active:scale-95 transition-all text-[9px] uppercase tracking-wider"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Suspend Driver</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. All Order Listing Logs */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Riwayat Catatan Order Jastip</span>
        </h3>

        <div className="bg-white border border-emerald-100 rounded-2xl overflow-hidden shadow-sm">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-bold">
              Belum ada riwayat order di platform.
            </div>
          ) : (
            <div className="divide-y divide-emerald-50">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4.5 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs hover:bg-emerald-50/10 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-850">Order #{ord.id}</span>
                      <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1 font-medium">
                      Customer: {ord.customer_name} ➔ Driver: Mas {ord.driver_name}
                    </p>
                    <p className="font-semibold text-slate-700 mt-1 bg-emerald-50/30 px-2 py-1 rounded inline-block border border-emerald-100/40">Item: {ord.item_description}</p>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="text-emerald-600 font-extrabold font-mono text-sm block">
                      Rp {ord.total_price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono font-bold block mt-1">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
