export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateProjectPayload = {
  name: string;
  description?: string;
};
