import type { ViewId } from '@/types'

export const MODULE_DESCRIPTIONS: Record<string, { label: string; description: string }> = {
  dashboard: { label: 'Dashboard', description: 'Gambaran keseluruhan statistik dan aktiviti PUSPA' },
  members: { label: 'Ahli Asnaf', description: 'Pengurusan profil dan data ahli asnaf yang berdaftar' },
  cases: { label: 'Kes Bantuan', description: 'Permohonan dan pengurusan kes bantuan zakat, sedekah, wakaf' },
  programmes: { label: 'Program Inkubasi', description: 'Program pembangunan dan bantuan asnaf' },
  donations: { label: 'Donasi', description: 'Rekod dan pengurusan sumbangan kewangan (zakat, sedekah, wakaf, infak)' },
  donors: { label: 'Penderma', description: 'CRM dan pengurusan hubungan penderma' },
  disbursements: { label: 'Pembayaran', description: 'Pengurusan pembayaran bantuan kepada penerima' },
  volunteers: { label: 'Sukarelawan', description: 'Pengurusan sukarelawan dan penempatan' },
  activities: { label: 'Aktiviti', description: 'Pengurusan aktiviti dan operasi harian (Kanban board)' },
  compliance: { label: 'Pematuhan', description: 'Senarai semak pematuhan peraturan dan audit (ROS, LHDN, PDPA)' },
  documents: { label: 'Dokumen', description: 'Pengurusan dokumen organisasi' },
  reports: { label: 'Laporan Kewangan', description: 'Laporan dan analisis kewangan' },
  admin: { label: 'Pentadbiran', description: 'Tetapan dan konfigurasi sistem' },
  ekyc: { label: 'eKYC', description: 'Pengesahan identiti elektronik ahli (IC, selfie, liveness)' },
  tapsecure: { label: 'TapSecure', description: 'Keselamatan biometrik dan pengikatan peranti' },
  'agihan-bulan': { label: 'Agihan Bulan', description: 'Agihan makan ruji bulanan kepada asnaf' },
  'sedekah-jumaat': { label: 'Sedekah Jumaat', description: 'Pengurusan program Sedekah Jumaat' },
  'gudang-barangan': { label: 'Gudang Barangan', description: 'Inventori dan pengurusan barangan bantuan' },
  asnafpreneur: { label: 'Asnafpreneur', description: 'Program keusahawanan digital asnaf' },
  'kelas-ai': { label: 'Kelas AI', description: 'Kelas AI dan Vibe Coding untuk asnaf' },
  'ops-conductor': { label: 'Ops Conductor', description: 'Pengendali operasi berkuasa AI' },
  ai: { label: 'Alat AI', description: 'Alat AI dan analitik lanjutan' },
  docs: { label: 'Panduan', description: 'Dokumentasi dan panduan sistem' },
  'openclaw-mcp': { label: 'Pelayan MCP', description: 'MCP server management' },
  'openclaw-plugins': { label: 'Plugin', description: 'Plugin management' },
  'openclaw-integrations': { label: 'Sambungan', description: 'Gateway & integrasi saluran' },
  'openclaw-terminal': { label: 'Konsol Operator', description: 'Konsol terminal operator' },
  'openclaw-agents': { label: 'Ejen AI', description: 'Pengurusan ejen AI' },
  'openclaw-models': { label: 'Enjin Model', description: 'Pengurusan enjin model LLM' },
  'openclaw-automation': { label: 'Automasi', description: 'Automasi dan pengurusan cron' },
  'openclaw-graph': { label: 'Graf Visual', description: 'Penjelajah graf visual' },
}

export function getModuleDescription(viewId: string): { label: string; description: string } {
  return MODULE_DESCRIPTIONS[viewId] || { label: viewId, description: 'Modul tidak dikenali' }
}
