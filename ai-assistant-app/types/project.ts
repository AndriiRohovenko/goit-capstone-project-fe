export type ProjectStatus = "active" | "draft";

export type Project = {
  id: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateProjectPayload = {
  name: string;
  description?: string;
};

export type UpdateProjectPayload = {
  name?: string;
  description?: string;
};
