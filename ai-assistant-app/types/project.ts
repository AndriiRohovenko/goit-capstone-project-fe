export type ProjectStatus = "active" | "draft";

export type Project = {
  id: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  created_at?: string;
  updated_at?: string;
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
