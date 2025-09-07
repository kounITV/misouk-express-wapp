"use client";

import React, { memo } from 'react';
import { canUserAccessColumn, getRolePermissions } from '@/lib/utils/role-permissions';
import { Product } from '@/types/product';
import { formatDate, formatAmount, getStatusName, getStatusColor } from '@/lib/utils/product';
import EnhancedActionsDropdown from '@/components/ui/enhanced-actions-dropdown';

interface RoleBasedProductRowProps {
  product: Product;
  index: number;
  currentPage: number;
  itemsPerPage: number;
  loadingEditId: string | null;
  isSelected: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onSelect: (productId: string) => void;
  onStatusUpdate: (product: Product, status: string) => Promise<void>;
  totalItems: number;
  userRole: string | undefined | null;
}

export const RoleBasedProductRow = memo(({
  product,
  index,
  currentPage,
  itemsPerPage,
  loadingEditId,
  isSelected,
  onEdit,
  onDelete,
  onSelect,
  onStatusUpdate,
  totalItems,
  userRole
}: RoleBasedProductRowProps) => {
  const permissions = getRolePermissions(userRole);
  const isLastItems = index >= totalItems - 3;

  return (
    <tr key={product.id} className="hover:bg-gray-50">
      {/* Checkbox */}
      {canUserAccessColumn('checkbox', userRole) && (
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="checkbox"
            className="rounded"
            checked={isSelected}
            onChange={() => onSelect(product.id)}
          />
        </td>
      )}

      {/* ລຳດັບ */}
      {canUserAccessColumn('sequence', userRole) && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {((currentPage - 1) * itemsPerPage) + index + 1}
        </td>
      )}

      {/* ຊື່ລູກຄ້າ */}
      {canUserAccessColumn('client_name', userRole) && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {product.client_name}
        </td>
      )}

      {/* ລຫັດ */}
      {canUserAccessColumn('tracking_number', userRole) && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
          {product.tracking_number}
        </td>
      )}

      {/* ເບີໂທ */}
      {canUserAccessColumn('client_phone', userRole) && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {product.client_phone || '-'}
        </td>
      )}

      {/* ລາຄາ */}
      {canUserAccessColumn('amount', userRole) && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatAmount(product.amount)}
        </td>
      )}

      {/* ສະກຸນເງິນ */}
      {canUserAccessColumn('currency', userRole) && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {product.currency === 'LAK' ? 'ກີບ' : product.currency === 'THB' ? 'ບາດ' : product.currency}
        </td>
      )}

      {/* ສະຖານະ */}
      {canUserAccessColumn('status', userRole) && (
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
            {getStatusName(product.status)}
          </span>
        </td>
      )}

      {/* ການຊຳລະ */}
      {canUserAccessColumn('is_paid', userRole) && (
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            product.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {product.is_paid ? 'ຊຳລະແລ້ວ' : 'ຍັງບໍ່ຊຳລະ'}
          </span>
        </td>
      )}

      {/* ວັນທີອອກໃບບິນ */}
      {canUserAccessColumn('created_at', userRole) && (
        <td className="px-6 py-4 text-sm text-gray-900">
          <div className="whitespace-pre-line">
            {formatDate(product.created_at)}
          </div>
        </td>
      )}

      {/* ວັນທີແກ້ໄຂ */}
      {canUserAccessColumn('updated_at', userRole) && (
        <td className="px-6 py-4 text-sm text-gray-900">
          <div className="whitespace-pre-line">
            {formatDate(product.updated_at || product.created_at)}
          </div>
        </td>
      )}

      {/* ຈັດການ */}
      {canUserAccessColumn('actions', userRole) && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {loadingEditId === product.id ? (
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <EnhancedActionsDropdown
              onEdit={() => permissions.canEdit && onEdit(product)}
              onDelete={() => permissions.canDelete && onDelete(product)}
              onStatusUpdate={async (status) => permissions.canEdit && await onStatusUpdate(product, status)}
              align="end"
              isLastItems={isLastItems}
            />
          )}
        </td>
      )}
    </tr>
  );
});

RoleBasedProductRow.displayName = "RoleBasedProductRow";

export default RoleBasedProductRow;
