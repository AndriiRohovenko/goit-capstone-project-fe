export type Requirement = {
  id: string;
  project_id: string;
  group_id: string;
  title: string;
  description: string;
  acceptance_criteria: string[];
  business_rules: string[];
  requirement_type: string;
  priority: string;
  status: string;
  metadata: {
    additionalProp1: Record<string, unknown>;
  },
  created_at: string;
  updated_at: string;
}

export type PaginatedRequirements = {
  items: Requirement[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}


export type RequirementPayload = {
  "title": string,
  "description": string,
  "group_id": string,
  "acceptance_criteria": string[],
  "business_rules": string[],
  "requirement_type": string,
  "priority": string,
  "status": string,
  "metadata": {
    "additionalProp1": Record<string, unknown>
  }
}