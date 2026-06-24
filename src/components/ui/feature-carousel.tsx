"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { Store, Snowflake, Leaf, Wallet, Recycle } from "lucide-react";
import { cn } from "@/lib/utils";

// Change Here
const FEATURES = [
  {
    id: "marketplace",
    label: "Marketplace",
    icon: Store,
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200",
    description: "Akses pasar langsung untuk nelayan dan koperasi. Jual ke restoran, hotel, pasar, hingga rumah tangga.",
  },
  {
    id: "cold-chain",
    label: "Cold Chain Desa",
    icon: Snowflake,
    image:
      "https://images.unsplash.com/photo-1582216503943-7f311df83df7?q=80&w=1200",
    description: "Fasilitas penyimpanan dingin di tingkat desa untuk menjaga kesegaran dan kualitas hasil tangkapan.",
  },
  {
    id: "eco-point",
    label: "Eco Point",
    icon: Leaf,
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200",
    description: "Dapatkan poin dari aksi menjaga lingkungan seperti mengumpulkan sampah laut dan menukarnya dengan hadiah.",
  },
  {
    id: "finance",
    label: "Akses Keuangan",
    icon: Wallet,
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200",
    description: "Riwayat transaksi dan aktivitas digunakan untuk mendapatkan akses pinjaman usaha, BPJS, dan program bantuan.",
  },
  {
    id: "circular",
    label: "Ekonomi Sirkular",
    icon: Recycle,
    image:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1200",
    description: "Limbah laut dan sampah plastik diolah menjadi produk bernilai jual untuk menambah penghasilan masyarakat.",
  },
];

const AUTO_PLAY_INTERVAL = 3000;
const ITEM_HEIGHT = 65;

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export function FeatureCarousel() {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentIndex =
    ((step % FEATURES.length) + FEATURES.length) % FEATURES.length;

  const nextStep = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const handleChipClick = (index: number) => {
    const diff = (index - currentIndex + FEATURES.length) % FEATURES.length;
    if (diff > 0) setStep((s) => s + diff);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused]);

  const getCardStatus = (index: number) => {
    const diff = index - currentIndex;
    const len = FEATURES.length;

    let normalizedDiff = diff;
    if (diff > len / 2) normalizedDiff -= len;
    if (diff < -len / 2) normalizedDiff += len;

    if (normalizedDiff === 0) return "active";
    if (normalizedDiff === -1) return "prev";
    if (normalizedDiff === 1) return "next";
    return "hidden";
  };

  return (
    <div className="w-full rounded-t-[2.5rem] lg:rounded-t-[4rem] overflow-hidden shadow-[0_-15px_40px_rgba(0,0,0,0.08)] relative z-40">
      <div className="relative flex flex-col lg:flex-row min-h-[500px] lg:min-h-[550px] w-full border-b border-slate-200/50">
        <div className="w-full lg:w-[45%] lg:h-auto lg:min-h-full relative z-30 flex flex-col overflow-hidden py-12 px-8 md:px-16 lg:pl-[10%] lg:py-16 bg-[#0f3e68]">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0f3e68] via-[#0f3e68]/80 to-transparent z-40 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0f3e68] via-[#0f3e68]/80 to-transparent z-40 pointer-events-none" />
          
          {/* Moved Title into left column */}
          <div className="relative z-30 w-full mb-8 lg:mb-10 text-center lg:text-left">
            <h2 className="text-3xl md:text-[36px] font-bold font-['Outfit'] text-white mb-3 tracking-tight">
              Fitur Unggulan BAHARI
            </h2>
            <p className="text-blue-100/90 text-[15px] md:text-base max-w-[380px] mx-auto lg:mx-0 leading-relaxed">
              Solusi lengkap untuk koperasi desa dan masyarakat pesisir
            </p>
          </div>

          <div className="relative w-full flex-1 flex items-center justify-center lg:justify-start z-20 min-h-[300px]">
            {FEATURES.map((feature, index) => {
              const isActive = index === currentIndex;
              const distance = index - currentIndex;
              const wrappedDistance = wrap(
                -(FEATURES.length / 2),
                FEATURES.length / 2,
                distance
              );

              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.id}
                  style={{
                    height: ITEM_HEIGHT,
                    width: "fit-content",
                  }}
                  animate={{
                    y: wrappedDistance * ITEM_HEIGHT,
                    opacity: 1 - Math.abs(wrappedDistance) * 0.25,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 22,
                    mass: 1,
                  }}
                  className="absolute flex items-center justify-start"
                >
                  <button
                    onClick={() => handleChipClick(index)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className={cn(
                      "relative flex items-center gap-4 px-6 md:px-10 lg:px-8 py-3.5 md:py-5 lg:py-4 rounded-full transition-all duration-700 text-left group border",
                      isActive
                        ? "bg-white text-[#0f3e68] border-white z-10 shadow-xl"
                        : "bg-transparent text-white/60 border-white/20 hover:border-white/40 hover:text-white"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center transition-colors duration-500",
                        isActive ? "text-[#0f3e68]" : "text-white/40"
                      )}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </div>

                    <span className="font-semibold text-sm md:text-[15px] tracking-tight whitespace-nowrap uppercase">
                      {feature.label}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-h-[400px] md:min-h-[500px] lg:h-full relative bg-slate-50 flex items-center justify-center py-10 md:py-16 lg:py-12 px-6 md:px-12 lg:px-10 overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-200">
          <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center">
            {FEATURES.map((feature, index) => {
              const status = getCardStatus(index);
              const isActive = status === "active";
              const isPrev = status === "prev";
              const isNext = status === "next";

              return (
                <motion.div
                  key={feature.id}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : isPrev ? -80 : isNext ? 80 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                    opacity: isActive ? 1 : isPrev || isNext ? 0.4 : 0,
                    rotate: isPrev ? -4 : isNext ? 4 : 0,
                    zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 25,
                    mass: 0.8,
                  }}
                  className="absolute inset-0 rounded-[2rem] md:rounded-[2.8rem] overflow-hidden border-4 md:border-[10px] border-white bg-white shadow-2xl origin-center"
                >
                  <img
                    src={feature.image}
                    alt={feature.label}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-700",
                      isActive
                        ? "grayscale-0 blur-0"
                        : "grayscale blur-[2px] brightness-75"
                    )}
                  />

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-x-0 bottom-0 p-6 md:p-8 pt-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end pointer-events-none"
                      >
                        <div className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.15em] w-fit shadow-lg mb-3 border border-white/30">
                          {index + 1} • {feature.label}
                        </div>
                        <p className="text-white font-medium text-base md:text-lg leading-relaxed drop-shadow-md tracking-tight">
                          {feature.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureCarousel;
