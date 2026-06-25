import type { IssueCategory, IssueStatus, UserRole } from "./types";

export const APP_NAME = "ResoluCity";
export const APP_DESCRIPTION = "Community Hero - Hyperlocal Problem Solver";

export const DEFAULT_CENTER = {
  lat: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT || "28.6139"),
  lng: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG || "77.2090"),
};

export const DEFAULT_ZOOM = 14;

export const ISSUE_CATEGORIES: { value: IssueCategory; label: string; icon: string }[] = [
  { value: "pothole", label: "Pothole", icon: "🕳️" },
  { value: "water_leak", label: "Water Leak", icon: "💧" },
  { value: "broken_streetlight", label: "Broken Streetlight", icon: "💡" },
  { value: "garbage", label: "Garbage / Waste", icon: "🗑️" },
  { value: "road_damage", label: "Road Damage", icon: "🚧" },
  { value: "drainage", label: "Drainage Issue", icon: "🌊" },
  { value: "electrical", label: "Electrical Hazard", icon: "⚡" },
  { value: "illegal_dumping", label: "Illegal Dumping", icon: "🚮" },
  { value: "noise_complaint", label: "Noise Complaint", icon: "🔊" },
  { value: "other", label: "Other", icon: "📋" },
];

export const ISSUE_STATUSES: { value: IssueStatus; label: string; color: string }[] = [
  { value: "open", label: "Open", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "verifying", label: "Verifying", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "in-progress", label: "In Progress", color: "bg-violet-100 text-violet-700 border-violet-200" },
  { value: "resolved", label: "Resolved", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "citizen", label: "Citizen" },
  { value: "moderator", label: "Moderator" },
  { value: "official", label: "Official" },
];

export const REPUTATION_ACTIONS = {
  REPORT_VERIFIED: 10,
  VERIFICATION_ALIGNED: 5,
  DUPLICATE_REPORT: 2,
  VERIFICATION_MINORITY: -2,
} as const;

export const CONSENSUS_THRESHOLDS = {
  AUTO_OPEN: 5,
  AUTO_COMPLAINT: 15,
} as const;

export const SEVERITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Minimal", color: "text-slate-500" },
  2: { label: "Minimal", color: "text-slate-500" },
  3: { label: "Low", color: "text-blue-500" },
  4: { label: "Low", color: "text-blue-500" },
  5: { label: "Moderate", color: "text-amber-500" },
  6: { label: "Moderate", color: "text-amber-500" },
  7: { label: "High", color: "text-orange-500" },
  8: { label: "High", color: "text-orange-500" },
  9: { label: "Critical", color: "text-rose-500" },
  10: { label: "Critical", color: "text-rose-600" },
};
