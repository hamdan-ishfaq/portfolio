// types/index.ts
// CHANGED: Removed 'import { Timestamp } from firebase/firestore'
// All Timestamp fields replaced with Date | string

export type TechCategory = 'language' | 'framework' | 'tool' | 'cloud' | 'database';

export interface TechStackItem {
  tag: string;
  category: TechCategory;
}

/** Homepage hero tech grid (Material Symbols icon + label). */
export interface HeroTechItem {
  label: string;
  icon: string;
}

export type DevlogEntryType =
  | 'milestone'
  | 'daily_log'
  | 'issue'
  | 'fix'
  | 'architecture'
  | 'reflection';

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string; // snake_case to match Supabase columns
  full_description: string;
  cover_image_url: string | null;
  tech_stack: TechStackItem[];
  github_repo: string | null;
  loom_video_id_demo: string | null;
  loom_video_id_arch: string | null;
  linkedin_url: string | null;
  live_demo_url: string | null;
  project_start_date: string | null;
  project_end_date: string | null;
  is_ongoing: boolean;
  project_status: 'active' | 'completed' | 'archived';
  tier: 0 | 1 | 2 | 3;
  order: number;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DevlogEntry {
  id: string;
  project_id: string;
  type: DevlogEntryType;
  title: string;
  content: string;
  entry_date: string;
  linked_entry_id: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DevlogEntryVersion {
  id: string;
  entry_id: string;
  content: string;
  saved_at: string;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  author_name: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  ip_hash: string;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  type: 'academic' | 'corporate' | 'achievement';
  title: string;
  organization: string;
  location: string;
  date_range: string;
  start_date: string;
  end_date: string | null;
  description: string[];
  logo_url: string | null;
  order: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  status: 'unread' | 'read' | 'archived';
  email_delivered: boolean;
  ip_hash: string;
  user_agent: string;
  created_at: string;
}

export interface DemoRequest {
  id: string;
  project_id: string;
  name: string;
  email: string;
  message: string | null;
  status: 'pending' | 'processed';
  ip_hash: string;
  created_at: string;
}

export interface GlobalSettings {
  id: string;
  display_name: string;
  tagline: string;
  sub_headline: string;
  avatar_url: string;
  cv_file_url: string;
  email: string;
  github: string;
  linkedin: string;
  twitter: string | null;
  seo_title_suffix: string;
  meta_description: string;
  hero_tech_stack: HeroTechItem[];
  updated_at: string;
}

export type AuditEvent =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'project_tier_changed'
  | 'devlog_entry_created'
  | 'devlog_entry_updated'
  | 'devlog_entry_deleted'
  | 'comment_approved'
  | 'comment_deleted'
  | 'cv_uploaded'
  | 'settings_updated'
  | 'demo_request_submitted';

export interface AuditLogEntry {
  id: string;
  event: AuditEvent;
  admin_uid: string | null;
  ip_hash: string;
  user_agent: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
