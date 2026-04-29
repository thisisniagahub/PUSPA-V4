// PUSPA App Types

export type ViewId =
  | 'dashboard'
  | 'members'
  | 'cases'
  | 'programmes'
  | 'donations'
  | 'disbursements'
  | 'compliance'
  | 'admin'
  | 'reports'
  | 'activities'
  | 'ai'
  | 'volunteers'
  | 'donors'
  | 'documents'
  | 'openclaw-mcp'
  | 'openclaw-plugins'
  | 'openclaw-integrations'
  | 'openclaw-terminal'
  | 'openclaw-agents'
  | 'openclaw-models'
  | 'openclaw-automation'
  | 'openclaw-graph'
  | 'ekyc'
  | 'tapsecure'
  | 'agihan-bulan'
  | 'sedekah-jumaat'
  | 'docs'
  | 'ops-conductor'
  | 'asnafpreneur'
  | 'kelas-ai'
  | 'gudang-barangan'
  | 'settings'

export { VIEW_LABELS as viewLabels } from '@/lib/module-registry'

export interface NavItem {
  id: ViewId
  label: string
  icon: string
  group?: string
}

export interface DashboardStats {
  totalMembers: number
  activeProgrammes: number
  totalDonations: number
  activeVolunteers: number
  complianceScore: number
  totalCases: number
  pendingCases: number
  thisMonthDonations: number
}

export interface MonthlyDonation {
  month: string
  zakat: number
  sadaqah: number
  waqf: number
  infaq: number
  general: number
}

export interface MemberCategory {
  name: string
  value: number
  color: string
}

export interface RecentActivity {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

