import React from 'react';
import { User, Shield, Compass, RefreshCw } from 'lucide-react';

interface RoleSelectorProps {
  currentRole: 'customer' | 'driver' | 'admin';
  onChangeRole: (role: 'customer' | 'driver' | 'admin') => void;
  onReset: () => void;
  currentUserPhone: string;
}

export default function RoleSelector({
  currentRole,
  onChangeRole,
  onReset,
  currentUserPhone,
}: RoleSelectorProps) {
  return (
    <div className="w-full bg-white border-b border-emerald-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
      {/* Brand Launcher Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-150/50 overflow-hidden border border-emerald-100">
          <img 
            src="https://i.postimg.cc/Yqy7CvSj/fb1e47cf-6b21-4017-9043-d948cba2e5fe.png" 
            alt="Teman Titipku Logo" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none italic">NITIP DONG</h1>
          <p className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase tracking-widest mt-1">#FoodJastipKemayoran</p>
        </div>
      </div>

      {/* Role Switches with modern rounded selector */}
      <div className="flex items-center gap-1.5 bg-emerald-50/60 p-1.5 rounded-full border border-emerald-100">
        <button
          onClick={() => onChangeRole('customer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
            currentRole === 'customer'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
              : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/80'
          }`}
          id="btn-role-customer"
        >
          <User className="w-3.5 h-3.5" />
          <span>Customer</span>
        </button>

        <button
          onClick={() => onChangeRole('driver')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
            currentRole === 'driver'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
              : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/80'
          }`}
          id="btn-role-driver"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Driver</span>
        </button>

        <button
          onClick={() => onChangeRole('admin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
            currentRole === 'admin'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
              : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/80'
          }`}
          id="btn-role-admin"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>
      </div>

      {/* Info context & reset action */}
      <div className="flex items-center gap-4">
        <div className="text-[10px] text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-800">Simulasi Akun</p>
          <p className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider font-mono mt-0.5">
            Phone: {currentUserPhone || '08123456789'}
          </p>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-rose-600 font-bold border border-rose-200 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
          title="Reset Simulation Data to Default Seed"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset DB</span>
        </button>
      </div>
    </div>
  );
}
