"use client";

import React from 'react';
import { Linkedin, Twitter, Instagram } from 'lucide-react';

function LogoIcon() {
  return (
    <div className="w-8 h-8 bg-[#0a4595] rounded-[8px] flex items-center justify-center shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 20C4 20 4 14 10 10C16 6 20 4 20 4C20 4 18 8 14 14C10 20 4 20 4 20Z" fill="white" />
        <path d="M4 20L10 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function FooterSection() {
  return (
    <footer className="w-full flex flex-col items-center bg-white border-t border-slate-200">
      
      {/* CTA SECTION - Full width */}
      <div className="w-full relative bg-slate-50 border-b border-slate-200 overflow-hidden">
        
        {/* Background Image with Gradient Fade */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[55%] z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 hidden lg:block"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-10 lg:hidden"></div>
          <img src="/coastal-harvest.png" alt="Panen Pesisir" className="w-full h-full object-cover object-[center_60%] opacity-90" />
        </div>

        <div className="container relative z-20 mx-auto px-4 md:px-6 py-16 md:py-20 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold font-['Outfit'] text-[#0F172A] mb-4">Bergabunglah dengan BAHARI</h2>
            <p className="text-[#64748B] text-lg mb-8 leading-relaxed">Jadilah bagian dari ekosistem yang memberdayakan nelayan, koperasi, dan menjaga kelestarian laut kita.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="/register" className="bg-[#0a4595] text-white hover:bg-[#083573] transition-colors rounded-full px-8 py-4 text-[15px] font-semibold shadow-lg text-center">
                Daftar Sekarang
              </a>
              <a href="/contact" className="bg-white text-[#0a4595] border-2 border-[#0a4595] hover:bg-slate-50 transition-colors rounded-full px-8 py-4 text-[15px] font-semibold text-center">
                Hubungi Kami
              </a>
            </div>
          </div>

          {/* QR Codes for apps */}
          <div className="flex gap-4 shrink-0 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://bahari.id/seller" alt="QR Code Seller" className="w-full h-full" />
              </div>
              <p className="text-slate-600 text-[11px] text-center leading-tight w-24">Unduh Aplikasi<br/><b className="text-[#0a4595]">BAHARI Seller</b></p>
            </div>
            
            <div className="w-px bg-slate-200 mx-2"></div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://bahari.id/buyer" alt="QR Code Buyer" className="w-full h-full" />
              </div>
              <p className="text-slate-600 text-[11px] text-center leading-tight w-24">Unduh Aplikasi<br/><b className="text-[#0a4595]">BAHARI Buyer</b></p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Directories */}
      <div className="w-full container mx-auto px-4 md:px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        {/* Brand Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-2.5">
            <img src="/logo-horizontal.png" alt="BAHARI Logo" className="h-10 object-contain" />
          </div>
          <p className="text-[#64748B] leading-relaxed text-[16px] font-normal max-w-[320px]">
            Dari Laut untuk Kehidupan Berkelanjutan. Ekosistem digital inklusif untuk masyarakat pesisir Indonesia.
          </p>
          <div className="flex items-center gap-3">
            {[Linkedin, Twitter, Instagram].map((Icon, idx) => (
              <button key={idx} className="w-[44px] h-[44px] flex items-center justify-center rounded-xl border border-slate-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-slate-50 transition-all active:scale-95 group">
                <Icon className="w-5 h-5 text-slate-800" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Column */}
        <div className="space-y-6">
          <h4 className="text-[14px] font-medium text-[#94A3B8] uppercase tracking-wider">Platform</h4>
          <ul className="space-y-4">
            {['Koperasi Digital', 'Marketplace B2B', 'Cold Chain', 'Eco Point'].map((link) => (
              <li key={link}>
                <a href="#" className="text-[15px] font-medium text-[#1E293B] hover:text-[#0a4595] transition-colors">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company Column */}
        <div className="space-y-6">
          <h4 className="text-[14px] font-medium text-[#94A3B8] uppercase tracking-wider">Perusahaan</h4>
          <ul className="space-y-4">
            {['Tentang Kami', 'Dampak Sosial', 'Mitra', 'Karir'].map((link) => (
              <li key={link}>
                <a href="#" className="text-[15px] font-medium text-[#1E293B] hover:text-[#0a4595] transition-colors">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources Column */}
        <div className="space-y-6">
          <h4 className="text-[14px] font-medium text-[#94A3B8] uppercase tracking-wider">Pusat Bantuan</h4>
          <ul className="space-y-4">
            {['FAQ', 'Panduan Pengguna', 'Blog', 'Hubungi Kami'].map((link) => (
              <li key={link}>
                <a href="#" className="text-[15px] font-medium text-[#1E293B] hover:text-[#0a4595] transition-colors">{link}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="w-full bg-[#F9F9FB] border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-6 text-[14px]">
          <p className="text-[#64748B] font-medium">© 2026 BAHARI. Hak Cipta Dilindungi.</p>
          <div className="flex flex-row items-center gap-6 md:gap-8 text-[#64748B] font-medium">
            <a href="#" className="hover:text-[#1E293B] transition-colors">Kebijakan Privasi</a>
            <div className="w-[1px] h-4 bg-slate-300" />
            <a href="#" className="hover:text-[#1E293B] transition-colors">Syarat Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
