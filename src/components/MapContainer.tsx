import React, { useState, useEffect } from 'react';
import { MapPin, Compass, Navigation, Info, AlertCircle } from 'lucide-react';
import { DbDriver } from '../types';

interface MapContainerProps {
  drivers: DbDriver[];
  activeDriverId?: string | null;
  onSelectDriver?: (driverId: string) => void;
  customerLocation?: { latitude: number; longitude: number };
  interactive?: boolean;
  onSetLocation?: (lat: number, lng: number, address: string) => void;
}

// Kemayoran boundaries for scaling
const LAT_MIN = -6.165;
const LAT_MAX = -6.145;
const LNG_MIN = 106.835;
const LNG_MAX = 106.858;

export default function MapContainer({
  drivers,
  activeDriverId,
  onSelectDriver,
  customerLocation = { latitude: -6.155, longitude: 106.845 },
  interactive = false,
  onSetLocation,
}: MapContainerProps) {
  // Convert lat/lng to percentage coordinates on our map grid
  const getCoords = (lat: number, lng: number) => {
    const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
    // Latitude is inverted on Y-axis
    const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100;
    return { 
      x: Math.max(5, Math.min(95, x)), 
      y: Math.max(5, Math.min(95, y)) 
    };
  };

  // Convert map percentage to real lat/lng
  const getLatLngFromPercent = (xPct: number, yPct: number) => {
    const lng = LNG_MIN + (xPct / 100) * (LNG_MAX - LNG_MIN);
    const lat = LAT_MAX - (yPct / 100) * (LAT_MAX - LAT_MIN);
    return { lat, lng };
  };

  // Kemayoran Landmarks to render beautifully on the grid
  const landmarks = [
    { name: "JIExpo Kemayoran (PRJ)", lat: -6.149, lng: 106.842, desc: "Pusat Pameran & Jajanan", color: "bg-blue-50 border-blue-200 text-blue-600" },
    { name: "Wisma Atlet Kemayoran", lat: -6.153, lng: 106.852, desc: "Hunian Driver & Kost", color: "bg-indigo-50 border-indigo-200 text-indigo-600" },
    { name: "Hutan Kota Kemayoran", lat: -6.148, lng: 106.849, desc: "Taman Rekreasi", color: "bg-emerald-50 border-emerald-200 text-emerald-600" },
    { name: "Mega Glodok Kemayoran", lat: -6.156, lng: 106.841, desc: "Sentra Belanja & Kuliner", color: "bg-amber-50 border-amber-200 text-amber-600" },
    { name: "Stasiun Kemayoran", lat: -6.162, lng: 106.837, desc: "Akses Transportasi", color: "bg-slate-50 border-slate-200 text-slate-600" },
    { name: "Pasar Jiung Ketan Susu", lat: -6.160, lng: 106.848, desc: "Kuliner Legendaris", color: "bg-red-50 border-red-200 text-red-600" }
  ];

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onSetLocation) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    
    const { lat, lng } = getLatLngFromPercent(xPct, yPct);
    
    // Reverse geocode dummy address based on proximity to landmarks
    let nearestLandmark = "Jalan Kemayoran Gempol";
    let minDist = 999;
    
    landmarks.forEach(l => {
      const d = Math.sqrt((l.lat - lat) ** 2 + (l.lng - lng) ** 2);
      if (d < minDist) {
        minDist = d;
        nearestLandmark = `Sekitar ${l.name}`;
      }
    });

    const streetNumber = Math.floor(1 + Math.random() * 88);
    const mockAddress = `${nearestLandmark} No. ${streetNumber}, Kemayoran, Jakarta Pusat`;
    onSetLocation(lat, lng, mockAddress);
  };

  const custCoords = getCoords(customerLocation.latitude, customerLocation.longitude);

  return (
    <div className="relative w-full h-[320px] bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      {/* Top Header Indicators */}
      <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-center pointer-events-none">
        <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-slate-100 text-[11px] font-medium text-slate-700 flex items-center gap-1.5 pointer-events-auto">
          <Compass className="w-3.5 h-3.5 text-emerald-500 animate-spin-slow" />
          <span>Peta Kemayoran, Jakpus</span>
        </div>
        
        {interactive && (
          <div className="bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-md text-[10px] font-semibold flex items-center gap-1 animate-pulse pointer-events-auto">
            <Navigation className="w-3 h-3" />
            <span>Klik Peta untuk Set Lokasi</span>
          </div>
        )}
      </div>

      {/* SVG Background Grid / Roads of Kemayoran */}
      <div 
        onClick={handleMapClick}
        className={`relative flex-1 w-full bg-[#f9fbf9] select-none overflow-hidden ${interactive ? 'cursor-crosshair' : 'cursor-default'}`}
        id="kemayoran-live-map-canvas"
      >
        {/* Styled Roads */}
        <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
          {/* Main Highway - Jl. Benyamin Sueb (Vertical Main Strip) */}
          <line x1="45%" y1="0%" x2="45%" y2="100%" stroke="#e2e8f0" strokeWidth="24" strokeLinecap="round" />
          <line x1="45%" y1="0%" x2="45%" y2="100%" stroke="#fff" strokeWidth="2" strokeDasharray="6,6" strokeLinecap="round" />
          
          {/* Jl. HBR Motik (Horizontal Top Strip) */}
          <line x1="0%" y1="25%" x2="100%" y2="25%" stroke="#e2e8f0" strokeWidth="20" strokeLinecap="round" />
          <line x1="0%" y1="25%" x2="100%" y2="25%" stroke="#fff" strokeWidth="2" strokeDasharray="6,6" strokeLinecap="round" />

          {/* Jl. Bendungan Jago (Horizontal Middle Area) */}
          <line x1="0%" y1="60%" x2="100%" y2="60%" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
          
          {/* Jl. Kemayoran Gempol (Diagonal path) */}
          <line x1="10%" y1="10%" x2="90%" y2="90%" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" strokeDasharray="3,4" />
          
          {/* Grid grids */}
          <circle cx="45%" cy="25%" r="60" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4,4" />
          <circle cx="45%" cy="60%" r="40" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4,4" />
        </svg>

        {/* Landmarks Render */}
        {landmarks.map((landmark, idx) => {
          const coords = getCoords(landmark.lat, landmark.lng);
          return (
            <div 
              key={idx}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-1 pointer-events-none`}
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 opacity-60 mb-0.5"></div>
              <div className="bg-white/90 border border-slate-200 px-1.5 py-0.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-[8px] font-medium text-slate-500 whitespace-nowrap text-center max-w-[90px] leading-tight">
                <div className="font-semibold text-slate-700 truncate">{landmark.name}</div>
                <div className="text-[7px] text-slate-400 leading-none mt-0.5">{landmark.desc}</div>
              </div>
            </div>
          );
        })}

        {/* Path line from Active Driver to Customer (if active order) */}
        {drivers.map(drv => {
          if (drv.user_id !== activeDriverId || drv.online_status !== "online") return null;
          const drvCoords = getCoords(drv.latitude, drv.longitude);
          return (
            <svg key={`path-${drv.id}`} className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <path
                d={`M ${drvCoords.x} ${drvCoords.y} Q ${(drvCoords.x + custCoords.x) / 2 + 10} ${(drvCoords.y + custCoords.y) / 2 - 10} ${custCoords.x} ${custCoords.y}`}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="4,4"
                className="animate-dash"
              />
            </svg>
          );
        })}

        {/* Customer Location Pin */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 z-30"
          style={{ left: `${custCoords.x}%`, top: `${custCoords.y}%` }}
        >
          <div className="relative flex flex-col items-center">
            {/* Pulsing ring */}
            <span className="absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-30 animate-ping"></span>
            
            <div className="bg-white border-2 border-emerald-500 p-1.5 rounded-full shadow-lg flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
            </div>
            
            <div className="bg-emerald-900/90 backdrop-blur text-white font-semibold text-[8px] px-1.5 py-0.5 rounded mt-1 whitespace-nowrap shadow-sm">
              Lokasi Anda (Kemayoran)
            </div>
          </div>
        </div>

        {/* Driver Pins */}
        {drivers.map((drv) => {
          if (drv.online_status !== "online") return null;
          const coords = getCoords(drv.latitude, drv.longitude);
          const isActive = drv.user_id === activeDriverId;

          return (
            <button
              key={drv.id}
              onClick={() => onSelectDriver?.(drv.user_id)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 z-20 outline-none focus:outline-none`}
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            >
              <div className="relative flex flex-col items-center group">
                {/* Visual Glow for Active Tracking */}
                {isActive && (
                  <span className="absolute -top-1 -left-1 inline-flex h-10 w-10 rounded-full bg-blue-500/20 animate-ping"></span>
                )}

                {/* Driver Pin Element */}
                <div className={`flex items-center gap-1 p-1 rounded-full border shadow-md transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-600 border-blue-400 scale-110 text-white' 
                    : drv.status === 'suspended'
                    ? 'bg-red-500 border-red-300 scale-95 text-white'
                    : 'bg-white border-slate-200 text-slate-800 hover:scale-105'
                }`}>
                  <img 
                    src={drv.avatar} 
                    alt={drv.name} 
                    className="w-5 h-5 rounded-full object-cover border border-white/20"
                    referrerPolicy="no-referrer"
                  />
                  <Navigation className={`w-3 h-3 ${isActive ? 'text-white' : 'text-emerald-500'} transform rotate-45 animate-pulse`} />
                </div>

                {/* Minimal Label */}
                <div className={`mt-1 px-1.5 py-0.5 rounded text-[8px] font-semibold tracking-tight whitespace-nowrap shadow-sm border ${
                  isActive 
                    ? 'bg-blue-900 border-blue-850 text-white' 
                    : 'bg-white border-slate-100 text-slate-700'
                }`}>
                  {drv.name?.split(' ')[0]} {isActive ? '(Jastip Jalan)' : `(${drv.rating}★)`}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Map Footer Information */}
      <div className="bg-white px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Driver online ditandai dengan ikon motor 🛵 biru/putih</span>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Anda</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <span>Driver Track</span>
          </div>
        </div>
      </div>
    </div>
  );
}
