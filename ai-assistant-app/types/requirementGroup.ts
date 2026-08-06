export type RequirementGroup = {
  "id": string,
  "project_id": string,
  "name": string,
  "description": string | null,
  "created_at": string,
  "updated_at": string
}

export type RequirementGroupPayload = {
  "name": string,
  "description": string
}