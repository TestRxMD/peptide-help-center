export type PeptideStatus = 'Research' | 'Approved (RU)' | 'FDA Approved' | 'Veterinary' | 'Approved (EU)';
export type AdminRoute = 'SubQ' | 'IM' | 'Intranasal' | 'Oral' | 'Topical' | 'IV' | 'Sublingual';

export interface Peptide {
  id: string;
  name: string;
  emoji: string;
  categoryId: string;
  status: PeptideStatus;
  shortDescription: string;
  description: string;
  halfLife?: string;
  dosageRange?: string;
  frequency?: string;
  routes?: AdminRoute[];
  benefits?: string[];
  sideEffects?: string[];
  contraindications?: string[];
  synergies?: string[];
  tags?: string[];
  components?: string[]; // for blends
  researchLinks?: string[];
}

export interface Category {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  color: string;
}

export type NavSection = 'home' | 'wiki' | 'recon' | 'stacks' | 'progress' | 'reminders' | 'guide' | 'ai' | 'dashboard' | 'community' | 'interaction-checker';

export interface CommunityPost {
  id: string;
  user_id: string;
  author_display: string;
  title: string;
  body: string;
  category: string;
  peptide_tags: string[];
  created_at: string;
  updated_at?: string;
  // client-computed
  score: number;
  comment_count: number;
  my_vote?: 1 | -1 | 0;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  author_display: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  // client-computed
  score: number;
  my_vote?: 1 | -1 | 0;
  replies?: CommunityComment[];
}

export interface LabDraw {
  id: string;
  drawn_date: string;
  marker: string;
  category?: string;
  value: number;
  unit: string;
  ref_low?: number;
  ref_high?: number;
  notes?: string;
  created_at?: string;
}

export interface Stack {
  id: string;
  name: string;
  description: string;
  peptides: string[];
  goal: string;
  createdAt: string;
}

export interface ProgressEntry {
  id: string;
  date: string;
  peptideId: string;
  dose: string;
  route: AdminRoute;
  notes: string;
  rating: number;
}

export interface Reminder {
  id: string;
  peptideId: string;
  time: string;
  days: string[];
  dose: string;
  route: AdminRoute;
  enabled: boolean;
  notify: boolean;  // whether this reminder fires a notification
  note: string;
}
