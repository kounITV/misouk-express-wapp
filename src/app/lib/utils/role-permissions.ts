export type UserRole = 'super_admin' | 'thai_admin' | 'lao_admin';

export interface RolePermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewAll: boolean;
  visibleColumns: string[];
  editableFields: string[];
  createFields: string[];
}

export const getRolePermissions = (role: string | undefined | null): RolePermissions => {
  const normalizedRole = normalizeRole(role);
  
  switch (normalizedRole) {
    case 'super_admin':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canViewAll: true,
        visibleColumns: [
          'checkbox',
          'sequence',
          'client_name',
          'tracking_number',
          'client_phone',
          'amount',
          'currency',
          'status',
          'is_paid',
          'remark',
          'created_at',
          'updated_at',
          'actions'
        ],
        editableFields: [
          'tracking_number',
          'client_name',
          'client_phone',
          'amount',
          'currency',
          'status',
          'is_paid',
          'remark'
        ],
        createFields: [
          'tracking_number',
          'client_name',
          'client_phone',
          'amount',
          'currency',
          'status',
          'remark'
        ]
      };
      
    case 'thai_admin':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canViewAll: false,
        visibleColumns: [
          'checkbox',
          'sequence',
          'client_name',
          'tracking_number',
          'client_phone',
          'status',
          'remark',
          'created_at',
          'updated_at',
          'actions'
        ],
        editableFields: [
          'status',
          'tracking_number',
          'client_name',
          'client_phone',
          'remark'
        ],
        createFields: [
          'tracking_number',
          'client_phone',
          'client_name',
          'remark'
        ]
      };
      
    case 'lao_admin':
      return {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canViewAll: false,
        visibleColumns: [
          'checkbox',
          'sequence',
          'client_name',
          'tracking_number',
          'client_phone',
          'amount',
          'currency',
          'status',
          'is_paid',
          'remark',
          'created_at',
          'updated_at',
          'actions'
        ],
        editableFields: [
          'status',
          'tracking_number',
          'client_name',
          'client_phone',
          'amount',
          'currency',
          'is_paid',
          'remark'
        ],
        createFields: [
          'tracking_number',
          'client_name',
          'client_phone',
          'amount',
          'currency',
          'status',
          'remark'
        ]
      };
      
    default:
      // Default to most restrictive permissions
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canViewAll: false,
        visibleColumns: [
          'sequence',
          'client_name',
          'tracking_number',
          'status',
          'created_at'
        ],
        editableFields: [],
        createFields: []
      };
  }
};

export const normalizeRole = (role: string | undefined | null): UserRole | null => {
  if (!role) return null;
  
  const roleStr = typeof role === 'string' ? role : (role as any)?.name || '';
  
  switch (roleStr.toLowerCase()) {
    case 'super_admin':
      return 'super_admin';
    case 'thai_admin':
      return 'thai_admin';
    case 'lao_admin':
      return 'lao_admin';
    default:
      return null;
  }
};

export const getRoleName = (role: string | undefined | null): string => {
  const normalizedRole = normalizeRole(role);
  
  switch (normalizedRole) {
    case 'super_admin':
      return 'ຊູບເປີແອັດມິນ';
    case 'thai_admin':
      return 'ແອັດມິນສາຂາໄທ';
    case 'lao_admin':
      return 'ແອັດມິນສາຂາລາວ';
    default:
      return role || '';
  }
};

export const canUserAccessColumn = (column: string, userRole: string | undefined | null): boolean => {
  const permissions = getRolePermissions(userRole);
  return permissions.visibleColumns.includes(column);
};

export const canUserEditField = (field: string, userRole: string | undefined | null): boolean => {
  const permissions = getRolePermissions(userRole);
  return permissions.editableFields.includes(field);
};

export const canUserCreateField = (field: string, userRole: string | undefined | null): boolean => {
  const permissions = getRolePermissions(userRole);
  return permissions.createFields.includes(field);
};
