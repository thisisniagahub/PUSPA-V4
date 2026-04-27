import type { ViewId } from '@/types'

export interface QuickAction {
  id: string
  label: string
  query: string
  category: 'query' | 'action' | 'navigate'
}

export const QUICK_ACTIONS: Partial<Record<string, QuickAction[]>> = {
  dashboard: [
    { id: 'da-1', label: '📊 Ringkasan organisasi', query: 'Berikan ringkasan keseluruhan PUSPA', category: 'query' },
    { id: 'da-2', label: '💰 Jumlah donasi', query: 'Berapa jumlah donasi yang diterima?', category: 'query' },
    { id: 'da-3', label: '📋 Kes tertunggak', query: 'Berapa kes yang masih menunggu tindakan?', category: 'query' },
    { id: 'da-4', label: '👥 Status ahli', query: 'Berapa jumlah ahli asnaf aktif?', category: 'query' },
  ],
  members: [
    { id: 'me-1', label: '📊 Status ahli', query: 'Berapa jumlah ahli aktif dan tidak aktif?', category: 'query' },
    { id: 'me-2', label: '🔍 Cari ahli', query: 'Cari ahli bernama ', category: 'query' },
    { id: 'me-3', label: '📈 Pendapatan purata', query: 'Apakah purata pendapatan ahli asnaf?', category: 'query' },
  ],
  cases: [
    { id: 'ca-1', label: '📊 Status kes', query: 'Berapa kes mengikut status?', category: 'query' },
    { id: 'ca-2', label: '🚨 Kes urgent', query: 'Senaraikan kes yang urgent', category: 'query' },
    { id: 'ca-3', label: '📋 Kes tertunggak', query: 'Senaraikan kes yang masih tertunggak', category: 'query' },
  ],
  donations: [
    { id: 'do-1', label: '💰 Ringkasan donasi', query: 'Berikan ringkasan donasi', category: 'query' },
    { id: 'do-2', label: '📅 Bulan ini', query: 'Berapa jumlah donasi bulan ini?', category: 'query' },
    { id: 'do-3', label: '📊 Mengikut jenis', query: 'Pecahan donasi mengikut jenis dana', category: 'query' },
  ],
  donors: [
    { id: 'dr-1', label: '📊 Ringkasan penderma', query: 'Berapa jumlah penderma aktif?', category: 'query' },
    { id: 'dr-2', label: '📈 Mengikut segmen', query: 'Penderma mengikut segmen', category: 'query' },
  ],
  programmes: [
    { id: 'pr-1', label: '📋 Program aktif', query: 'Senaraikan semua program aktif', category: 'query' },
    { id: 'pr-2', label: '💰 Bajet program', query: 'Berapa bajet dan perbelanjaan program?', category: 'query' },
  ],
  compliance: [
    { id: 'co-1', label: '📊 Status pematuhan', query: 'Apakah status pematuhan semasa?', category: 'query' },
    { id: 'co-2', label: '⚠️ Item tertunggak', query: 'Item pematuhan mana yang belum selesai?', category: 'query' },
  ],
  volunteers: [
    { id: 'vo-1', label: '📊 Status sukarelawan', query: 'Berapa jumlah sukarelawan aktif?', category: 'query' },
    { id: 'vo-2', label: '⏱️ Jumlah jam', query: 'Berapa jumlah jam sukarelawan?', category: 'query' },
  ],
}

export const UNIVERSAL_QUICK_ACTIONS: QuickAction[] = [
  { id: 'u-1', label: '❓ Bantuan modul ini', query: 'Terangkan apa yang boleh saya buat di modul ini', category: 'navigate' },
  { id: 'u-2', label: '🏠 Ke Dashboard', query: 'Bawa saya ke Dashboard', category: 'navigate' },
]

export function getQuickActions(viewId: string): QuickAction[] {
  const moduleActions = QUICK_ACTIONS[viewId] || []
  return [...moduleActions, ...UNIVERSAL_QUICK_ACTIONS]
}
