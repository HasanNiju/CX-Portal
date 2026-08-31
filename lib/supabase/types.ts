export type Role = "agent" | "admin" | "super_admin";
export type Status = "active" | "disabled" | "pending";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  status: Status;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface PresetCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Preset {
  id: string;
  category_id: string;
  title: string;
  short_description: string | null;
  content: string;
  language: "bn" | "en";
  tags: string[];
  is_active: boolean;
  sort_order: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalculatorConfig {
  id: string;
  name: string;
  config_json: any;
  is_active: boolean;
  version: number;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}
