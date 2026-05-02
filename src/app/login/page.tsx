'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Loader2, LockKeyhole, Mail, ArrowRight, ShieldCheck, 
  Fingerprint, Sparkles, Orbit, Cpu, Globe, Eye, EyeOff, 
  ChevronRight, Terminal, Activity, Zap, AlertTriangle
} from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/components/auth-provider'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

const Aurora = dynamic(() => import('@/components/Aurora'), { ssr: false });

function ScanningLine() {
  return (
    <motion.div 
      initial={{ top: "-10%", opacity: 0 }}
      animate={{ top: "110%", opacity: [0, 1, 1, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      className="absolute left-0 right-0 z-50 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent blur-[2px] pointer-events-none"
    />
  )
}

function TechBrackets() {
  return (
    <>
      <div className="absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl" />
      <div className="absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-primary/30 rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-primary/30 rounded-bl-2xl" />
      <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-primary/30 rounded-br-2xl" />
    </>
  )
}

function OrbitalElements() {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Dynamic Rings */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
        className="absolute h-[1000px] w-[1000px] rounded-full border border-white/[0.02]"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="absolute h-[800px] w-[800px] rounded-full border border-primary/[0.03] border-dashed"
      />
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute h-[600px] w-[600px] rounded-full border border-emerald-500/[0.05]"
      />
      
      {/* Core Glow */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]"
      />
    </div>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoadingRaw, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthTimeout, setIsAuthTimeout] = useState(false)

  useEffect(() => {
    if (!authLoadingRaw) return
    const timer = setTimeout(() => setIsAuthTimeout(true), 5000)
    return () => clearTimeout(timer)
  }, [authLoadingRaw])

  const authLoading = authLoadingRaw && !isAuthTimeout

  const callbackUrl = useMemo(() => {
    const value = searchParams.get('callbackUrl')
    return value && value.startsWith('/') && !value.startsWith('//') ? value : '/'
  }, [searchParams])

  useEffect(() => {
    if (user && !authLoading) {
      window.location.replace(callbackUrl)
    }
  }, [callbackUrl, user, authLoading])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || !password) {
      toast.error('Sila masukkan emel dan kata laluan anda.', {
        className: 'glass-toast'
      })
      return
    }
    setIsSubmitting(true)
    const result = await signIn(email.trim().toLowerCase(), password)
    setIsSubmitting(false)
    if (!result.success) {
      toast.error('Pengesahan gagal. Sila semak semula identiti anda.', {
        icon: <AlertTriangle className="h-4 w-4 text-destructive" />
      })
      return
    }
    router.replace(callbackUrl)
    router.refresh()
  }

  return (
    <div className="relative z-10 grid w-full max-w-[1400px] gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center px-6 lg:px-12">
      {/* Left: Branding & Core Stats */}
      <motion.div 
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        className="hidden lg:flex flex-col space-y-12"
      >
        <div className="space-y-8">
          <div className="inline-flex items-center gap-4 px-5 py-2 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-xl">
             <div className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
             </div>
             <span className="text-[11px] font-mono font-black uppercase tracking-[0.3em] text-primary">System Online: HK-Gombak-Node</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-7xl xl:text-8xl font-black tracking-tighter text-white leading-[0.9]">
              PUSPA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-emerald-400">CORE.</span>
            </h1>
            <div className="h-1.5 w-32 bg-gradient-to-r from-primary to-transparent rounded-full" />
          </div>
          
          <p className="text-2xl text-white/50 max-w-lg leading-relaxed font-medium">
            Menerajui masa depan kebajikan digital dengan kepintaran buatan termaju.
          </p>
        </div>

        {/* Feature Grid with hover effects */}
        <div className="grid grid-cols-2 gap-10 pt-8">
          {[
            { icon: Cpu, label: 'Neural Security', desc: 'Pemantauan masa-nyata', color: 'text-primary' },
            { icon: Globe, label: 'Global Sync', desc: 'Data terpusat 2026', color: 'text-emerald-400' },
            { icon: Zap, label: 'Flash Payout', desc: 'Disbursement sekelip mata', color: 'text-fuchsia-400' },
            { icon: Activity, label: 'Live Audit', desc: 'Telus & Terjamin', color: 'text-amber-400' },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ x: 10 }}
              className="flex items-start gap-5 group"
            >
               <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-500 shadow-2xl">
                 <feature.icon className={cn("h-7 w-7 transition-all duration-500 group-hover:scale-110", feature.color)} />
               </div>
               <div className="space-y-1">
                 <h3 className="text-white font-bold group-hover:text-primary transition-colors">{feature.label}</h3>
                 <p className="text-xs text-white/30 font-medium leading-normal">{feature.desc}</p>
               </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Right: The Login Portal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative mx-auto w-full max-w-[540px]"
      >
        {/* Portal Glow Rings */}
        <div className="absolute -inset-20 bg-primary/10 rounded-full blur-[100px] pointer-events-none opacity-50" />
        <div className="absolute -inset-10 border border-primary/20 rounded-[3rem] animate-pulse pointer-events-none" />
        
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.1] bg-black/40 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
          <ScanningLine />
          <TechBrackets />
          
          <div className="p-10 sm:p-16 relative z-10">
            <div className="flex flex-col items-center mb-12">
              <motion.div 
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white p-5 shadow-[0_0_50px_rgba(255,255,255,0.2)] border-4 border-white/10 mb-8"
              >
                <Image
                  src="/puspa-logo-official.png"
                  alt="PUSPA"
                  width={64}
                  height={64}
                  className="h-auto w-auto object-contain"
                  unoptimized
                />
              </motion.div>
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-black text-white tracking-tight uppercase">Portal Akses</h2>
                <div className="flex items-center justify-center gap-2">
                   <div className="h-1 w-8 bg-primary rounded-full" />
                   <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Authorized Personnel</p>
                   <div className="h-1 w-8 bg-primary rounded-full" />
                </div>
              </div>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div className="flex items-center gap-2 ml-1 text-white/40 group-focus-within:text-primary transition-colors">
                  <Terminal className="h-3.5 w-3.5" />
                  <Label htmlFor="email" className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">S_IDENTITY</Label>
                </div>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-white/10 transition-colors group-focus-within:text-primary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="E-MEL_IDENTITI"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-16 rounded-2xl border-white/[0.05] bg-white/[0.02] pl-16 text-white placeholder:text-white/5 focus:border-primary/50 focus:bg-white/[0.04] focus:ring-4 focus:ring-primary/10 transition-all font-mono text-sm tracking-wide"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <div className="flex items-center gap-2 text-white/40 group-focus-within:text-primary transition-colors">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <Label htmlFor="password" className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">S_PASSKEY</Label>
                  </div>
                  <button type="button" className="text-[10px] font-bold text-primary/60 hover:text-primary transition-all hover:tracking-widest">LUPA_KATA_LALUAN?</button>
                </div>
                <div className="relative group">
                  <LockKeyhole className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-white/10 transition-colors group-focus-within:text-primary" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-16 rounded-2xl border-white/[0.05] bg-white/[0.02] pl-16 pr-14 text-white placeholder:text-white/5 focus:border-primary/50 focus:bg-white/[0.04] focus:ring-4 focus:ring-primary/10 transition-all font-mono tracking-[0.2em]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                    aria-label={showPassword ? "Sembunyi kata laluan" : "Lihat kata laluan"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || authLoading}
                className="relative h-18 w-full overflow-hidden rounded-2xl bg-primary text-white font-black text-xl hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(124,58,237,0.4)] group/btn"
              >
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-4"
                    >
                      <Loader2 className="h-7 w-7 animate-spin" />
                      MENGESAHKAN...
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="normal"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-4"
                    >
                      MASUK_SISTEM
                      <ChevronRight className="h-7 w-7 group-hover/btn:translate-x-3 transition-transform duration-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Visual Scanner Effect on Button */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out" />
              </Button>
            </form>

            <div className="mt-20 pt-10 border-t border-white/[0.05] flex flex-wrap items-center justify-center gap-8 opacity-40">
               {[
                 { icon: ShieldCheck, label: 'E2E_SECURE' },
                 { icon: Fingerprint, label: 'BIO_AUTH' },
                 { icon: Orbit, label: 'NODE_V4.2' }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-2.5 text-[10px] font-mono font-black tracking-[0.2em]">
                   <item.icon className="h-4 w-4 text-primary" />
                   {item.label}
                 </div>
               ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020202] selection:bg-primary/40 selection:text-white">
      {/* Dynamic Visual Foundation */}
      <div className="absolute inset-0 z-0">
        <Aurora 
          colorStops={['#3b0764', '#020617', '#052e16']}
          amplitude={1.2}
          speed={0.2}
        />
        <OrbitalElements />
        <div className="absolute inset-0 bg-radial-vignette" 
             style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)' }} />
      </div>

      {/* Tech Grid Infrastructure */}
      <div className="absolute inset-0 z-1 opacity-[0.08] pointer-events-none" 
           style={{ 
             backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
             backgroundSize: '80px 80px'
           }} />

      <Suspense fallback={
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Establishing Node Link...</span>
        </div>
      }>
        <LoginContent />
      </Suspense>

      <Toaster position="bottom-center" theme="dark" richColors />
    </main>
  )
}
