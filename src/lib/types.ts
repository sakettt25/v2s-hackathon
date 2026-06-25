export type UserRole = "citizen" | "moderator" | "official";

export type IssueStatus = "open" | "verifying" | "in-progress" | "resolved";

export type IssueCategory =
  | "pothole"
  | "water_leak"
  | "broken_streetlight"
  | "garbage"
  | "road_damage"
  | "drainage"
  | "electrical"
  | "illegal_dumping"
  | "noise_complaint"
  | "other";

export type VerificationStatus = "approve" | "dispute";

export type ActionType = "resolved" | "deferred" | "auto-complaint";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  reputation_points: number;
  created_at: string;
}

export interface Issue {
  id: string;
  reporter_id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity_score: number;
  status: IssueStatus;
  lat: number;
  lng: number;
  formatted_address: string | null;
  media_url: string | null;
  cluster_id: string | null;
  upvote_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  reporter?: Profile;
  verification_count?: number;
}

export interface Verification {
  id: string;
  issue_id: string;
  user_id: string;
  status: VerificationStatus;
  comment: string | null;
  created_at: string;
  // Joined
  user?: Profile;
}

export interface OfficialAction {
  id: string;
  issue_id: string;
  official_id: string;
  updates: string;
  action_type: ActionType;
  completed_at: string;
  // Joined
  official?: Profile;
}

// AI response types
export interface AICategorization {
  category: IssueCategory;
  severity_score: number;
  suggested_title: string;
  summary: string;
  tags: string[];
}

export interface PrivacyRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "face" | "license_plate";
}

export interface DeduplicationResult {
  is_duplicate: boolean;
  matching_issue_id: string | null;
  confidence: number;
  reason: string;
}

export interface ComplaintDocument {
  subject: string;
  body: string;
  evidence_summary: string;
  urgency_level: "low" | "medium" | "high" | "critical";
  recommended_department: string;
}

// Dashboard analytics
export interface DashboardMetrics {
  total_issues: number;
  resolved_count: number;
  avg_resolution_hours: number;
  active_reporters: number;
  top_categories: { category: string; count: number }[];
  daily_trend: { date: string; reported: number; resolved: number }[];
}
