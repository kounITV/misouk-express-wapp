export type Role = "super_admin" | "lao_admin" | "thai_admin";

export type Actions = "create" | "read" | "update" | "delete" | "manage";

export type Subjects =
  | "all"
  | "user"
  | "role"
  | "permission"
  | "order"
  | "product";
