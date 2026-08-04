export type ProjectStatus = "active" | "draft";

export type Project = {
  id: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  created_at?: string;
  updated_at?: string;
};

export type ProjectContext = {
  id: string;
  project_id: string;
  product_description: string;
  domain: string;
  user_roles: string[];
  business_rules: string[];
  authentication_type: string;
  supported_platforms: string[];
  additional_context: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CreateProjectPayload = {
  name: string;
  description?: string;
};

export type UpdateProjectPayload = {
  name?: string;
  description?: string;
  status?: ProjectStatus;
};

export type UpdateProjectContextPayload = {
  product_description: string;
  domain: string;
  user_roles: string[];
  business_rules: string[];
  authentication_type: string;
  supported_platforms: string[];
  additional_context: Record<string, unknown>;
};