import * as React from "react";
import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";

interface AuthScreenProps {
  mode: "login" | "register";
}

// Reusable Components
function StepItem({ number, text, active = false }: { number: number, text: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-white/20 backdrop-blur-md text-white border border-white/40 shadow-lg' : 'bg-black/20 backdrop-blur-sm text-white/80 border border-transparent'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${active ? 'bg-white text-[#0f3e68]' : 'bg-white/20 text-white'}`}>
        {number}
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}

function SocialButton({ icon, label }: { icon: string, label: string }) {
  return (
    <button type="button" className="flex items-center justify-center gap-2 w-full h-10 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
      <img src={icon} alt={label} className="w-4 h-4" />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </button>
  );
}

export function AuthScreen({ mode }: AuthScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;

    let bodyData: any = { email, password };
    let endpoint = "http://localhost:3000/auth/login";

    if (mode === "register") {
      const name = (e.currentTarget.elements.namedItem('name') as HTMLInputElement)?.value;
      const role = (e.currentTarget.elements.namedItem('role') as HTMLSelectElement)?.value;
      bodyData = { name, email, password, role };
      endpoint = "http://localhost:3000/auth/register";
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || (mode === "login" ? "Login failed" : "Registration failed"));
      }

      if (data.data?.token) {
        localStorage.setItem("bahari_token", data.data.token);
        localStorage.setItem("bahari_user", JSON.stringify(data.data.user));

        if (data.data.user.role === 'buyer') {
          window.location.href = '/marketplace';
        } else if (data.data.user.role === 'cooperative_admin') {
          window.location.href = '/dashboard';
        } else if (data.data.user.role === 'super_admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      setError(err.message || "Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-slate-50 text-slate-900 selection:bg-[#0a4595]/20 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4 font-sans antialiased">
      {/* Left Column (Hero & Video) */}
      <div className="relative hidden lg:flex flex-col items-center justify-center w-[52%] px-12 rounded-3xl overflow-hidden shadow-2xl h-full">
        {/* Subtle dark gradient to ensure text on image is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f3e68]/90 via-[#0f3e68]/40 to-[#0f3e68]/20 z-10 pointer-events-none"></div>

        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="https://www.pexels.com/download/video/31963909/" type="video/mp4" />
        </video>



        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1, 
              transition: { staggerChildren: 0.15, delayChildren: 0.2 } 
            }
          }}
          className="relative z-20 w-full max-w-md space-y-8"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
            <div className="mb-8">
              <img src="/logo-horizontal.png" alt="BAHARI Logo" className="h-10 object-contain brightness-0 invert drop-shadow-md" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold font-['Outfit'] tracking-tight text-white drop-shadow-lg leading-tight">
              Bergabunglah dengan BAHARI
            </h1>
            <p className="text-white/90 text-[15px] leading-relaxed mt-3 drop-shadow max-w-sm">
              Jadilah bagian dari ekosistem digital laut lestari melalui 3 langkah mudah.
            </p>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }} className="space-y-3">
            <StepItem number={1} text="Lengkapi Identitas" active={mode === 'register'} />
            <StepItem number={2} text="Pilih Peran Akses" active={false} />
            <StepItem number={3} text="Mulai Jelajahi Ekosistem" active={mode === 'login'} />
          </motion.div>
        </motion.div>
      </div>

      {/* Right Column (Form) */}
      <div className="flex-1 flex flex-col py-8 lg:py-6 px-4 sm:px-12 lg:px-12 xl:px-20 overflow-y-auto relative z-10 bg-slate-50">
        
        <div className="my-auto w-full max-w-xl mx-auto flex flex-col">
          {/* Mobile Logo */}
          <div className="flex lg:hidden justify-center mb-8 w-full">
            <img src="/logo-horizontal.png" alt="BAHARI Logo" className="h-8 object-contain" />
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full space-y-6 lg:space-y-4 sm:space-y-8"
          >
            <div className="text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold font-['Outfit'] tracking-tight text-[#0f3e68]">
              {mode === 'register' ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {mode === 'register' ? 'Masukkan detail dasar Anda untuk memulai perjalanan.' : 'Masukkan kredensial Anda untuk masuk ke sistem.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SocialButton icon="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" label="Google" />
            <SocialButton icon="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" label="Github" />
          </div>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 bg-slate-50 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Atau</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

            <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="name">Nama Lengkap</label>
                    <input id="name" name="name" type="text" placeholder="John Doe" required className="w-full bg-white border border-slate-200 shadow-sm rounded-xl h-11 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0a4595]/30 focus:border-[#0a4595] outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700" htmlFor="role">Peran</label>
                    <select id="role" name="role" required className="w-full bg-white border border-slate-200 shadow-sm rounded-xl h-11 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-[#0a4595]/30 focus:border-[#0a4595] outline-none appearance-none transition-all">
                      <option value="" disabled selected>Pilih Peran...</option>
                      <option value="buyer">Pembeli B2B</option>
                      <option value="cooperative_admin">Pengurus Koperasi Desa</option>
                      <option value="producer">Produsen (Nelayan/Petani)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" placeholder="nama@email.com" required className="w-full bg-white border border-slate-200 shadow-sm rounded-xl h-11 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0a4595]/30 focus:border-[#0a4595] outline-none transition-all" />
            </div>

            <div className="space-y-1.5 relative">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
                {mode === 'login' && <a href="#" className="text-xs font-medium text-[#0a4595] hover:underline transition-colors">Lupa password?</a>}
              </div>
              <div className="relative">
                <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required minLength={8} className="w-full bg-white border border-slate-200 shadow-sm rounded-xl h-11 pl-4 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0a4595]/30 focus:border-[#0a4595] outline-none transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>          

              {error && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full h-11 bg-[#0a4595] text-white font-semibold rounded-xl hover:bg-[#0f3e68] shadow-md shadow-[#0a4595]/20 active:scale-[0.98] transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? "Memproses..." : (mode === 'register' ? "Buat Akun Sekarang" : "Masuk ke Sistem")}
            </button>

            <div className="text-center text-[14px] text-slate-600 pt-2">
              {mode === 'register' ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
              <a href={mode === 'register' ? '/login' : '/register'} className="text-[#0a4595] font-semibold hover:underline">
                {mode === 'register' ? 'Masuk di sini' : 'Daftar sekarang'}
              </a>
            </div>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
