import type { ViewId } from '@/types'
import type { UserRole } from '@/lib/puspa-auth'
import { canAccessView } from '@/lib/access-control'

export type ModuleRegistryEntry = {
  id: ViewId
  label: string
  group: string
  keywords: string[]
  visibleInSidebar: boolean
}

export const MODULE_REGISTRY: Record<ViewId, ModuleRegistryEntry> = {
  dashboard: { id: 'dashboard', label: 'Dashboard', group: 'Utama', keywords: ['home', 'utama', 'papan pemuka'], visibleInSidebar: true },
  members: { id: 'members', label: 'Ahli Asnaf', group: 'Utama', keywords: ['ahli', 'asnaf', 'member', 'penerima'], visibleInSidebar: true },
  cases: { id: 'cases', label: 'Kes Bantuan', group: 'Utama', keywords: ['kes', 'case', 'permohonan', 'application', 'bantuan'], visibleInSidebar: true },
  programmes: { id: 'programmes', label: 'Program Inkubasi', group: 'Bantuan & Program', keywords: ['program', 'aktiviti', 'projek', 'inkubasi'], visibleInSidebar: true },
  asnafpreneur: { id: 'asnafpreneur', label: 'Asnafpreneur', group: 'Bantuan & Program', keywords: ['asnafpreneur', 'ai saas', 'enterprise', 'startup', 'program digital', 'keusahawanan ai'], visibleInSidebar: true },
  'kelas-ai': { id: 'kelas-ai', label: 'Kelas AI & Vibe Coding', group: 'Bantuan & Program', keywords: ['kelas ai', 'vibe coding', 'kurikulum', 'sponsor', 'asnaf digital'], visibleInSidebar: true },
  'agihan-bulan': { id: 'agihan-bulan', label: 'Agihan Bulan', group: 'Bantuan & Program', keywords: ['agihan', 'bulan', 'makan ruji', 'staple food', 'distribusi'], visibleInSidebar: true },
  'sedekah-jumaat': { id: 'sedekah-jumaat', label: 'Sedekah Jumaat', group: 'Bantuan & Program', keywords: ['sedekah', 'jumaat', 'rumah kebajikan', 'mahad tahfiz', 'makanan tengahari'], visibleInSidebar: true },
  donations: { id: 'donations', label: 'Donasi', group: 'Kewangan & Gudang', keywords: ['donasi', 'sumbangan', 'derma', 'zakat'], visibleInSidebar: true },
  donors: { id: 'donors', label: 'Penderma', group: 'Kewangan & Gudang', keywords: ['penderma', 'donor', 'crm'], visibleInSidebar: true },
  disbursements: { id: 'disbursements', label: 'Pembayaran', group: 'Kewangan & Gudang', keywords: ['pembayaran', 'disbursement', 'bayar'], visibleInSidebar: true },
  'gudang-barangan': { id: 'gudang-barangan', label: 'Gudang Barangan', group: 'Kewangan & Gudang', keywords: ['gudang', 'barangan', 'pre-loved', 'inventori', 'stok', 'jualan', 'agihan barang'], visibleInSidebar: true },
  activities: { id: 'activities', label: 'Aktiviti', group: 'Operasi', keywords: ['aktiviti', 'activity', 'kanban', 'operasi'], visibleInSidebar: true },
  volunteers: { id: 'volunteers', label: 'Sukarelawan', group: 'Operasi', keywords: ['sukarelawan', 'volunteer', 'mentor'], visibleInSidebar: true },
  documents: { id: 'documents', label: 'Dokumen', group: 'Operasi', keywords: ['dokumen', 'document', 'fail', 'file'], visibleInSidebar: true },
  compliance: { id: 'compliance', label: 'Compliance', group: 'Pematuhan & Identiti', keywords: ['compliance', 'pematuhan', 'audit'], visibleInSidebar: true },
  ekyc: { id: 'ekyc', label: 'eKYC', group: 'Pematuhan & Identiti', keywords: ['ekyc', 'identiti', 'verification'], visibleInSidebar: true },
  tapsecure: { id: 'tapsecure', label: 'TapSecure', group: 'Pematuhan & Identiti', keywords: ['tapsecure', 'fingerprint', 'biometrik'], visibleInSidebar: true },
  reports: { id: 'reports', label: 'Laporan Kewangan', group: 'Laporan', keywords: ['laporan', 'report', 'kewangan', 'financial'], visibleInSidebar: true },
  admin: { id: 'admin', label: 'Pentadbiran', group: 'Laporan', keywords: ['admin', 'tetapan', 'settings', 'profil'], visibleInSidebar: true },
  'ops-conductor': { id: 'ops-conductor', label: 'Ops Conductor', group: 'Developer / AI Ops', keywords: ['conductor', 'ops', 'operasi', 'chat', 'task', 'work', 'reminder', 'trace'], visibleInSidebar: true },
  ai: { id: 'ai', label: 'Alat AI', group: 'Developer / AI Ops', keywords: ['ai', 'kecerdasan buatan', 'chatbot'], visibleInSidebar: true },
  'openclaw-mcp': { id: 'openclaw-mcp', label: 'Pelayan MCP', group: 'Developer / AI Ops', keywords: ['mcp', 'server', 'ai ops', 'dalaman'], visibleInSidebar: true },
  'openclaw-plugins': { id: 'openclaw-plugins', label: 'Sambungan', group: 'Developer / AI Ops', keywords: ['plugin', 'sambungan', 'ai ops', 'dalaman'], visibleInSidebar: true },
  'openclaw-integrations': { id: 'openclaw-integrations', label: 'Gateway & Channel', group: 'Developer / AI Ops', keywords: ['integrasi', 'integration', 'gateway', 'channel', 'ai ops'], visibleInSidebar: true },
  'openclaw-terminal': { id: 'openclaw-terminal', label: 'Console Operator', group: 'Developer / AI Ops', keywords: ['terminal', 'console', 'operator', 'ai ops'], visibleInSidebar: true },
  'openclaw-agents': { id: 'openclaw-agents', label: 'Ejen AI', group: 'Developer / AI Ops', keywords: ['agent', 'ejen', 'ai', 'automasi'], visibleInSidebar: true },
  'openclaw-models': { id: 'openclaw-models', label: 'Enjin Model', group: 'Developer / AI Ops', keywords: ['model', 'llm', 'engine', 'ai ops'], visibleInSidebar: true },
  'openclaw-automation': { id: 'openclaw-automation', label: 'Automasi', group: 'Developer / AI Ops', keywords: ['automasi', 'automation', 'cron', 'ai ops'], visibleInSidebar: true },
  'openclaw-graph': { id: 'openclaw-graph', label: 'Graf Visual', group: 'Developer / AI Ops', keywords: ['graph', 'graf', 'visual', 'topologi', 'ai ops'], visibleInSidebar: true },
  docs: { id: 'docs', label: 'Panduan', group: 'Bantuan Sistem', keywords: ['panduan', 'docs', 'help', 'bantuan sistem'], visibleInSidebar: true },
  settings: { id: 'settings', label: 'Tetapan', group: 'Bantuan Sistem', keywords: ['settings', 'tetapan', 'profil', 'akaun'], visibleInSidebar: true },
}

export const VIEW_LABELS = Object.fromEntries(
  Object.entries(MODULE_REGISTRY).map(([id, module]) => [id, module.label]),
) as Record<ViewId, string>

export const COMMAND_PALETTE_ITEMS = Object.values(MODULE_REGISTRY).filter((module) => module.visibleInSidebar)

export function getVisibleCommandItems(role: UserRole) {
  return COMMAND_PALETTE_ITEMS.filter((module) => canAccessView(module.id, role))
}
