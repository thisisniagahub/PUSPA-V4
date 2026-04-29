import { z } from 'zod'
import type * as React from 'react'
import { CheckCircle2, Clock, Package, RotateCcw, Truck, UserCheck, XCircle } from 'lucide-react'

// ─── Brand Color ──────────────────────────────────────────────────────
export const BRAND_COLOR = '#4B0082'

// ─── Types ───────────────────────────────────────────────────────────

export type Kawasan = 'cheras' | 'ampang' | 'gombak' | 'hulu_langat' | 'petaling' | 'klang' | 'sepang' | 'kuala_selangor'
export type KategoriAsnaf = 'fakir' | 'miskin' | 'amil' | 'muallaf' | 'gharim' | 'fisabillillah' | 'ibnus_sabil' | 'riqab'
export type DistributionStatus = 'dibahagi' | 'dalam_proses' | 'menunggu_kelulusan' | 'gagal'
export type DeliveryMethod = 'hantar_sendiri' | 'urus_kurier' | 'ambil_sendiri'

export type StockMovementType = 'masuk' | 'keluar' | 'pelarasan'
export type StockSource = 'derma' | 'pembelian' | 'pindahan' | 'pelarasan'

export interface StapleItem {
  id: string
  label: string
}

export interface Distribution {
  id: string
  refNo: string
  namaAsnaf: string
  noKP: string
  noTelefon: string
  alamat: string
  kawasan: Kawasan
  kategori: KategoriAsnaf
  bilTanggungan: number
  makananRuji: string[]
  catatan: string
  kaedahPenghantaran: DeliveryMethod
  status: DistributionStatus
  date: string
  expenditure: number
}

export interface DistributionFormData {
  namaAsnaf: string
  noKP: string
  noTelefon: string
  alamat: string
  kawasan: Kawasan
  kategori: KategoriAsnaf
  bilTanggungan: number
  makananRuji: string[]
  catatan: string
  kaedahPenghantaran: DeliveryMethod
  status: DistributionStatus
  date: string
}

export interface StockItem {
  id: string
  name: string
  unit: string
  currentStock: number
  minLevel: number
  unitPrice: number
}

export interface StockMovement {
  id: string
  refNo: string
  itemId: string
  itemName: string
  type: StockMovementType
  quantity: number
  source: StockSource
  date: string
  reference: string
  notes: string
  previousStock: number
  newStock: number
}

export interface StockInFormData {
  itemId: string
  quantity: number
  source: StockSource
  date: string
  reference: string
  notes: string
}

// ─── Constants ───────────────────────────────────────────────────────

export const KAWASAN_CONFIG: Record<Kawasan, { label: string }> = {
  cheras: { label: 'Cheras' },
  ampang: { label: 'Ampang' },
  gombak: { label: 'Gombak' },
  hulu_langat: { label: 'Hulu Langat' },
  petaling: { label: 'Petaling' },
  klang: { label: 'Klang' },
  sepang: { label: 'Sepang' },
  kuala_selangor: { label: 'Kuala Selangor' },
}

export const KATEGORI_CONFIG: Record<KategoriAsnaf, { label: string; color: string; bgClass: string }> = {
  fakir: { label: 'Fakir', color: '#94a3b8', bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  miskin: { label: 'Miskin', color: '#f87171', bgClass: 'bg-red-500/10 text-red-400 border-red-500/20' },
  amil: { label: 'Amil', color: BRAND_COLOR, bgClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  muallaf: { label: 'Muallaf', color: '#34d399', bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  gharim: { label: 'Gharim', color: '#fbbf24', bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  fisabillillah: { label: 'Fisabillillah', color: '#60a5fa', bgClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  ibnus_sabil: { label: 'Ibnus Sabil', color: '#a78bfa', bgClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  riqab: { label: 'Riqab', color: '#22d3ee', bgClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
}

export const STATUS_CONFIG: Record<DistributionStatus, { label: string; color: string; bgClass: string; icon: React.ElementType }> = {
  dibahagi: { label: 'Dibahagi', color: '#34d399', bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  dalam_proses: { label: 'Dalam Proses', color: '#fbbf24', bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
  menunggu_kelulusan: { label: 'Menunggu Kelulusan', color: '#60a5fa', bgClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: RotateCcw },
  gagal: { label: 'Gagal', color: '#f87171', bgClass: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
}

export const DELIVERY_CONFIG: Record<DeliveryMethod, { label: string; icon: React.ElementType }> = {
  hantar_sendiri: { label: 'Hantar Sendiri', icon: Truck },
  urus_kurier: { label: 'Urus Kurier', icon: Package },
  ambil_sendiri: { label: 'Ambil Sendiri', icon: UserCheck },
}

export const MAKANAN_RUJI_ITEMS: StapleItem[] = [
  { id: 'beras', label: 'Beras (Rice)' },
  { id: 'minyak_masak', label: 'Minyak Masak (Cooking Oil)' },
  { id: 'gula', label: 'Gula (Sugar)' },
  { id: 'tepung', label: 'Tepung (Flour)' },
  { id: 'mie_spaghetti', label: 'Mie/Spaghetti' },
  { id: 'kacang_kekacang', label: 'Kacang/Kekacang (Beans/Legumes)' },
  { id: 'susu', label: 'Susu (Milk)' },
  { id: 'telur', label: 'Telur (Eggs)' },
]

export const ITEMS_PER_PAGE = 8
export const STOCK_MOVEMENTS_PER_PAGE = 8

// ─── Stock Inventory Constants ───────────────────────────────────────

export const STOCK_ITEMS: StockItem[] = [
  { id: 'beras', name: 'Beras', unit: 'kg', currentStock: 350, minLevel: 100, unitPrice: 3.50 },
  { id: 'minyak_masak', name: 'Minyak Masak', unit: 'botol', currentStock: 85, minLevel: 30, unitPrice: 8.00 },
  { id: 'gula', name: 'Gula', unit: 'kg', currentStock: 120, minLevel: 50, unitPrice: 3.20 },
  { id: 'tepung', name: 'Tepung', unit: 'kg', currentStock: 95, minLevel: 40, unitPrice: 2.80 },
  { id: 'mie_spaghetti', name: 'Mie/Spaghetti', unit: 'kotak', currentStock: 60, minLevel: 25, unitPrice: 5.50 },
  { id: 'kacang_kekacang', name: 'Kacang/Kekacang', unit: 'kg', currentStock: 40, minLevel: 20, unitPrice: 10.00 },
  { id: 'susu', name: 'Susu', unit: 'kotak', currentStock: 70, minLevel: 30, unitPrice: 7.50 },
  { id: 'telur', name: 'Telur', unit: 'tray', currentStock: 45, minLevel: 20, unitPrice: 12.00 },
]

export const STOCK_SOURCE_CONFIG: Record<StockSource, { label: string; bgClass: string }> = {
  derma: { label: 'Derma', bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  pembelian: { label: 'Pembelian', bgClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  pindahan: { label: 'Pindahan', bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  pelarasan: { label: 'Pelarasan', bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
}

// ─── Initial Data (empty — populated from API) ──────────────────────────

export const INITIAL_DISTRIBUTIONS: Distribution[] = []
export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = []

// ─── Zod Schema ──────────────────────────────────────────────────────

export const distributionFormSchema = z.object({
  namaAsnaf: z.string().min(1, 'Nama asnaf diperlukan'),
  noKP: z.string().min(1, 'No. KP diperlukan'),
  noTelefon: z.string().optional().default(''),
  alamat: z.string().optional().default(''),
  kawasan: z.enum([
    'cheras', 'ampang', 'gombak', 'hulu_langat', 'petaling', 'klang', 'sepang', 'kuala_selangor',
  ] as const),
  kategori: z.enum([
    'fakir', 'miskin', 'amil', 'muallaf', 'gharim', 'fisabillillah', 'ibnus_sabil', 'riqab',
  ] as const),
  bilTanggungan: z.coerce.number().min(0, 'Bilangan tidak boleh negatif').max(20, 'Maksimum 20 tanggungan'),
  makananRuji: z.array(z.string()).min(1, 'Sekurang-kurangnya satu item makanan ruji perlu dipilih'),
  catatan: z.string().optional().default(''),
  kaedahPenghantaran: z.enum(['hantar_sendiri', 'urus_kurier', 'ambil_sendiri'] as const),
  status: z.enum(['dibahagi', 'dalam_proses', 'menunggu_kelulusan', 'gagal'] as const),
  date: z.string().min(1, 'Tarikh diperlukan'),
})

export type DistributionFormValues = z.infer<typeof distributionFormSchema>

export const stockInFormSchema = z.object({
  itemId: z.string().min(1, 'Sila pilih item'),
  quantity: z.coerce.number().min(1, 'Kuantiti mesti sekurang-kurangnya 1'),
  source: z.enum(['derma', 'pembelian', 'pindahan', 'pelarasan'] as const),
  date: z.string().min(1, 'Tarikh diperlukan'),
  reference: z.string().min(1, 'No. rujukan diperlukan'),
  notes: z.string().optional().default(''),
})

export type StockInFormValues = z.infer<typeof stockInFormSchema>

export const productFormSchema = z.object({
  name: z.string().min(1, 'Nama produk diperlukan'),
  unit: z.string().min(1, 'Unit diperlukan'),
  initialStock: z.coerce.number().min(0, 'Stok tidak boleh negatif'),
  minLevel: z.coerce.number().min(1, 'Paras minimum mesti sekurang-kurangnya 1'),
  unitPrice: z.coerce.number().min(0.01, 'Harga mesti melebihi 0'),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

export const stockOutFormSchema = z.object({
  itemId: z.string().min(1, 'Sila pilih item'),
  quantity: z.coerce.number().min(1, 'Kuantiti mesti sekurang-kurangnya 1'),
  date: z.string().min(1, 'Tarikh diperlukan'),
  reference: z.string().min(1, 'No. rujukan diperlukan'),
  notes: z.string().optional().default(''),
})

export type StockOutFormValues = z.infer<typeof stockOutFormSchema>
