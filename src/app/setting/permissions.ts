 
import { type Actions, type Role, type Subjects } from "./interface";

export const rolePermissions: Record<Role, Array<{ action: Actions; subject: Subjects | Subjects[] }>> = {
  super_admin: [
    { action: "manage", subject: "all" }, // สิทธิ์เต็มระบบ
  ],

  lao_admin: [
    { action: "read", subject: "order" },
    { action: "read", subject: "role" },
    { action: "read", subject: "permission" },
    { action: "manage", subject: "order" },
    { action: "create", subject: "product" },
    { action: "read", subject: "product" },
    { action: "update", subject: "product" },
  ],

  thai_admin: [
    { action: "read", subject: "order" },
    { action: "read", subject: "role" },
    { action: "read", subject: "permission" },
    { action: "manage", subject: "order" },
  ],
};
