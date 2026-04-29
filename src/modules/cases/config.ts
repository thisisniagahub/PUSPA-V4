import { z } from 'zod'
import { CheckCircle2, ClipboardCheck, DollarSign, FileText, UserCheck, XCircle } from 'lucide-react'

// ============================================================
// Types
// ============================================================

export type Status =
  | 'draft'
  | 'submitted'
  | 'verifying'
  | 'verified'
  | 'scoring'
  | 'scored'
  | 'approved'
  | 'disbursing'
  | 'disbursed'
  | 'follow_up'
  | 'closed'
  | 'rejected';

export type Priority = 'urgent' | 'high' | 'normal' | 'low';

export type Category = 'zakat' | 'sedekah' | 'wakaf' | 'infak' | 'bantuan_kerajaan';

export type NoteType = 'note' | 'call' | 'visit' | 'assessment';

export interface CaseNote {
  id: string;
  type: NoteType;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface Disbursement {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
}

export interface CaseData {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  applicantName: string;
  applicantIC: string;
  applicantPhone: string;
  applicantAddress: string;
  programmeId: string | null;
  memberId: string | null;
  amountRequested: number | null;
  notes: CaseNote[];
  createdAt: string;
  updatedAt: string;
  disbursements: Disbursement[];
  statusHistory: { status: Status; date: string }[];
}

// ============================================================
// Constants
// ============================================================

export const ALL_STATUSES: { value: Status; label: string }[] = [
  { value: 'draft', label: 'Draf' },
  { value: 'submitted', label: 'Dihantar' },
  { value: 'verifying', label: 'Semakan' },
  { value: 'verified', label: 'Disahkan' },
  { value: 'scoring', label: 'Penilaian' },
  { value: 'scored', label: 'Dinilai' },
  { value: 'approved', label: 'Diluluskan' },
  { value: 'disbursing', label: 'Pembayaran' },
  { value: 'disbursed', label: 'Dibayar' },
  { value: 'follow_up', label: 'Tindakan Susulan' },
  { value: 'closed', label: 'Ditutup' },
  { value: 'rejected', label: 'Ditolak' },
];

export const STATUSES_MAP = Object.fromEntries(ALL_STATUSES.map((s) => [s.value, s.label]));

export const STATUSES_MAP_REVERSE = Object.fromEntries(
  ALL_STATUSES.map((s) => [s.label, s.value])
);

export const STATUS_WORKFLOW: Status[] = [
  'draft',
  'submitted',
  'verifying',
  'verified',
  'scoring',
  'scored',
  'approved',
  'disbursing',
  'disbursed',
  'follow_up',
  'closed',
];

export const NEXT_STATUS: Partial<Record<Status, Status[]>> = {
  draft: ['submitted', 'rejected'],
  submitted: ['verifying', 'rejected'],
  verifying: ['verified', 'rejected'],
  verified: ['scoring', 'rejected'],
  scoring: ['scored', 'rejected'],
  scored: ['approved', 'rejected'],
  approved: ['disbursing', 'rejected'],
  disbursing: ['disbursed'],
  disbursed: ['follow_up', 'closed'],
  follow_up: ['closed'],
  closed: [],
  rejected: [],
};

export const STATUS_COLORS: Record<Status, string> = {
  draft: 'bg-white/10 text-white/50 border-white/20',
  submitted: 'bg-primary/20 text-primary border-primary/30',
  verifying: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  verified: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
  scoring: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30',
  scored: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  approved: 'bg-primary/20 text-primary border-primary/30',
  disbursing: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
  disbursed: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
  follow_up: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  closed: 'bg-white/10 text-white/50 border-white/20',
  rejected: 'bg-destructive/20 text-destructive border-destructive/30',
};

export const STATUS_DOT_COLORS: Record<Status, string> = {
  draft: 'bg-gray-400',
  submitted: 'bg-blue-500',
  verifying: 'bg-amber-500',
  verified: 'bg-teal-500',
  scoring: 'bg-indigo-500',
  scored: 'bg-purple-500',
  approved: 'bg-green-500',
  disbursing: 'bg-cyan-500',
  disbursed: 'bg-emerald-500',
  follow_up: 'bg-orange-500',
  closed: 'bg-slate-500',
  rejected: 'bg-red-500',
};

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: 'bg-destructive/20 text-destructive border-destructive/30' },
  high: { label: 'Tinggi', color: 'bg-orange-500/20 text-orange-500 border-orange-500/30' },
  normal: { label: 'Normal', color: 'bg-primary/20 text-primary border-primary/30' },
  low: { label: 'Rendah', color: 'bg-white/10 text-white/50 border-white/20' },
};

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'zakat', label: 'Zakat' },
  { value: 'sedekah', label: 'Sedekah' },
  { value: 'wakaf', label: 'Wakaf' },
  { value: 'infak', label: 'Infak' },
  { value: 'bantuan_kerajaan', label: 'Bantuan Kerajaan' },
];

export const CATEGORIES_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

export const STAT_CATEGORIES = [
  {
    key: 'draft',
    label: 'Draf',
    icon: FileText,
    color: 'text-white/50',
    bg: 'bg-card',
    border: 'border-white/10',
    statuses: ['draft' as Status],
  },
  {
    key: 'semakan',
    label: 'Semakan',
    icon: ClipboardCheck,
    color: 'text-amber-500',
    bg: 'bg-card',
    border: 'border-white/10',
    statuses: ['submitted', 'verifying', 'verified', 'scoring', 'scored'] as Status[],
  },
  {
    key: 'diluluskan',
    label: 'Dilulusk',
    icon: CheckCircle2,
    color: 'text-primary',
    bg: 'bg-card',
    border: 'border-white/10',
    statuses: ['approved'] as Status[],
  },
  {
    key: 'pembayaran',
    label: 'Pembayaran',
    icon: DollarSign,
    color: 'text-cyan-500',
    bg: 'bg-card',
    border: 'border-white/10',
    statuses: ['disbursing', 'disbursed'] as Status[],
  },
  {
    key: 'selesai',
    label: 'Selesai',
    icon: UserCheck,
    color: 'text-white/70',
    bg: 'bg-card',
    border: 'border-white/10',
    statuses: ['closed', 'follow_up'] as Status[],
  },
  {
    key: 'ditolak',
    label: 'Ditolak',
    icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-card',
    border: 'border-white/10',
    statuses: ['rejected'] as Status[],
  },
];

export const PROGRAMMES = [
  { id: 'prog-001', name: 'Program Zakat Pendapatan 2025' },
  { id: 'prog-002', name: 'Tabung Kecemasan Keluarga' },
  { id: 'prog-003', name: 'Skim Bantuan Pendidikan' },
  { id: 'prog-004', name: 'Program Wakaf Produktif' },
  { id: 'prog-005', name: 'Bantuan Perubatan PUSPA' },
];

export const MEMBERS = [
  { id: 'mem-001', name: 'Ahmad bin Hassan' },
  { id: 'mem-002', name: 'Siti Aminah binti Omar' },
  { id: 'mem-003', name: 'Muhammad Ridzuan' },
  { id: 'mem-004', name: 'Nurul Izzah binti Ismail' },
  { id: 'mem-005', name: 'Ibrahim bin Mahmood' },
];

export const ITEMS_PER_PAGE = 8;

// ============================================================
// Initial Data (empty — populated from API)
// ============================================================

export const INITIAL_CASES: CaseData[] = []

// ============================================================
// Form Schema
// ============================================================

export const caseFormSchema = z.object({
  title: z.string().min(1, 'Tajuk kes diperlukan'),
  description: z.string().optional().default(''),
  category: z.enum(['zakat', 'sedekah', 'wakaf', 'infak', 'bantuan_kerajaan'], {
    message: 'Kategori diperlukan',
  }),
  priority: z.enum(['urgent', 'high', 'normal', 'low'], {
    message: 'Prioriti diperlukan',
  }),
  applicantName: z.string().min(1, 'Nama pemohon diperlukan'),
  applicantIC: z.string().min(8, 'No. KP / SSM diperlukan'),
  applicantPhone: z.string().min(8, 'No. telefon diperlukan'),
  applicantAddress: z.string().min(1, 'Alamat diperlukan'),
  programmeId: z.string().optional().default(''),
  memberId: z.string().optional().default(''),
  amountRequested: z.coerce.number().optional().default(0),
  notes: z.string().optional().default(''),
});

export type CaseFormData = z.infer<typeof caseFormSchema>;
