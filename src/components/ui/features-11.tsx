import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Store, Anchor, Snowflake, Leaf, ShieldCheck, Wallet } from 'lucide-react'
import { motion } from 'motion/react'

export function Features() {
    return (
        <section className="bg-white py-16 md:py-24 overflow-hidden">
            <div className="mx-auto max-w-6xl px-4 md:px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center max-w-3xl mx-auto mb-12"
                >
                    <h2 className="text-3xl lg:text-4xl font-bold font-['Outfit'] text-[#0f3e68] mb-4 tracking-tight">
                        Gotong Royong Digital untuk Laut yang Lestari
                    </h2>
                    <p className="text-slate-600 text-lg">
                        BAHARI menghubungkan nelayan, koperasi, pasar, dan insentif lingkungan dalam satu ekosistem digital yang saling menguatkan.
                    </p>
                </motion.div>
                
                <div className="mx-auto grid gap-4 sm:grid-cols-5">
                    {/* Card 1: Koperasi Desa */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        className="sm:col-span-3"
                    >
                        <Card className="group overflow-hidden bg-slate-50 border-slate-200 h-full sm:rounded-3xl shadow-sm">
                            <CardHeader>
                                <div className="md:p-6 pb-0">
                                    <p className="font-bold text-xl text-[#0f3e68]">Digitalisasi Koperasi Desa</p>
                                    <p className="text-slate-600 mt-2 max-w-md text-[15px] leading-relaxed">Mencatat hasil tangkapan secara akurat dan transparan. Koperasi dapat memantau stok, memberikan pinjaman permodalan, dan mengelola anggota dengan mudah.</p>
                                </div>
                            </CardHeader>

                            <div className="relative h-fit pl-6 md:pl-12 mt-6">
                                <div className="absolute -inset-6 [background:radial-gradient(75%_95%_at_50%_0%,transparent,white_100%)] z-10"></div>

                                <div className="bg-white overflow-hidden rounded-tl-2xl border-l border-t border-slate-200 pl-2 pt-2 shadow-xl relative z-0">
                                    <img
                                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200"
                                        className="w-full h-[250px] md:h-[300px] object-cover rounded-tl-xl"
                                        alt="Koperasi Desa"
                                    />
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Card 2: Cold Chain */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                        className="sm:col-span-2"
                    >
                        <Card className="group overflow-hidden bg-slate-50 border-slate-200 h-full sm:rounded-3xl flex flex-col justify-between shadow-sm">
                            <div className="p-6 md:p-8 pb-0">
                                <p className="font-bold text-xl text-[#0f3e68]">Cold Chain & Kualitas</p>
                                <p className="text-slate-600 mt-2 text-[15px] leading-relaxed">Menjaga kesegaran ikan dengan fasilitas penyimpanan dingin komunal untuk meningkatkan nilai jual.</p>
                            </div>

                            <CardContent className="mt-auto h-fit p-6 md:p-8 pt-0">
                                <div className="relative mt-8">
                                    <div className="absolute -inset-6 [background:radial-gradient(50%_75%_at_75%_50%,transparent,white_100%)] z-10"></div>
                                    <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 shadow-lg relative z-0">
                                        <img
                                            src="https://images.unsplash.com/photo-1582216503943-7f311df83df7?q=80&w=1200"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            alt="Cold Chain"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    {/* Card 3: Akses Pasar & Finansial */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        className="sm:col-span-2"
                    >
                        <Card className="group p-6 bg-slate-50 border-slate-200 h-full sm:rounded-3xl md:p-8 flex flex-col justify-center items-center text-center shadow-sm">
                            <p className="mb-10 max-w-sm text-balance text-xl font-bold text-[#0f3e68]">Akses Pasar Langsung & Keuangan Inklusif</p>

                            <div className="flex justify-center gap-6 w-full">
                                <div className="bg-white flex flex-col items-center justify-center gap-3 aspect-square size-[100px] rounded-2xl border border-slate-200 shadow-md hover:-translate-y-2 transition-transform duration-300">
                                    <Store className="size-8 text-[#0a4595]" />
                                    <span className="text-xs font-bold tracking-tight text-slate-600 uppercase">B2B Market</span>
                                </div>
                                <div className="bg-white flex flex-col items-center justify-center gap-3 aspect-square size-[100px] rounded-2xl border border-slate-200 shadow-md hover:-translate-y-2 transition-transform duration-300">
                                    <Wallet className="size-8 text-[#0a4595]" />
                                    <span className="text-xs font-bold tracking-tight text-slate-600 uppercase">Finansial</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                    
                    {/* Card 4: Eco Point & Sirkular */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                        className="sm:col-span-3"
                    >
                        <Card className="group relative bg-slate-50 border-slate-200 h-full sm:rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                            <CardHeader className="p-6 md:p-8 pb-2">
                                <p className="font-bold text-xl text-[#0f3e68]">Ekonomi Sirkular & Eco Point</p>
                                <p className="text-slate-600 mt-2 max-w-md text-[15px] leading-relaxed">Masyarakat yang mengumpulkan sampah laut plastik akan mendapatkan Eco Point yang dapat ditukar dengan kebutuhan melaut atau sembako.</p>
                            </CardHeader>
                            <CardContent className="relative h-fit px-6 pb-6 md:px-8 md:pb-8 mt-6 md:mt-0">
                                <div className="grid grid-cols-4 gap-3 md:grid-cols-6 mt-4">
                                    <div className="rounded-xl aspect-square border-2 border-dashed border-slate-300"></div>
                                    <div className="rounded-xl bg-white flex aspect-square items-center justify-center border border-slate-200 shadow-sm p-4 hover:scale-110 transition-transform duration-300">
                                        <Leaf className="size-8 text-emerald-500" />
                                    </div>
                                    <div className="rounded-xl aspect-square border-2 border-dashed border-slate-300"></div>
                                    <div className="rounded-xl bg-[#0f3e68] flex aspect-square items-center justify-center border border-[#0f3e68] shadow-md p-4 hover:scale-110 transition-transform duration-300">
                                        <ShieldCheck className="size-8 text-white" />
                                    </div>
                                    <div className="rounded-xl aspect-square border-2 border-dashed border-slate-300 hidden md:block"></div>
                                    <div className="rounded-xl bg-white hidden md:flex aspect-square items-center justify-center border border-slate-200 shadow-sm p-4 hover:scale-110 transition-transform duration-300">
                                        <Anchor className="size-8 text-[#0a4595]" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
