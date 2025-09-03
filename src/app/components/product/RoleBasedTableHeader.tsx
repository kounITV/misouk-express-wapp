"use client";

import React from 'react';
import { canUserAccessColumn } from '@/lib/utils/role-permissions';

interface RoleBasedTableHeaderProps {
  userRole: string | undefined | null;
  selectAll: boolean;
  onSelectAll: () => void;
}

export const RoleBasedTableHeader: React.FC<RoleBasedTableHeaderProps> = ({
  userRole,
  selectAll,
  onSelectAll
}) => {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        {/* Checkbox */}
        {canUserAccessColumn('checkbox', userRole) && (
          <th className="px-3 md:px-6 py-3 text-left">
            <input
              type="checkbox"
              className="rounded"
              checked={selectAll}
              onChange={onSelectAll}
            />
          </th>
        )}

        {/* ລຳດັບ */}
        {canUserAccessColumn('sequence', userRole) && (
          <th className="px-3 md:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
            <span className="hidden lg:inline">ລຳດັບ</span>
            <span className="lg:hidden">#</span>
          </th>
        )}

        {/* ຊື່ລູກຄ້າ */}
        {canUserAccessColumn('client_name', userRole) && (
          <th className="px-3 md:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
            <span className="hidden md:inline">ຊື່ລູກຄ້າ</span>
            <span className="md:hidden">ຊື່</span>
          </th>
        )}

        {/* ລຫັດ */}
        {canUserAccessColumn('tracking_number', userRole) && (
          <th className="px-3 md:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
            ລຫັດ
          </th>
        )}

        {/* ເບີໂທ */}
        {canUserAccessColumn('client_phone', userRole) && (
          <th className="px-3 md:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider hidden lg:table-cell">
            ເບີໂທ
          </th>
        )}

        {/* ລາຄາ */}
        {canUserAccessColumn('amount', userRole) && (
          <th className="px-3 md:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider hidden xl:table-cell">
            ລາຄາ
          </th>
        )}

        {/* ສະກຸນເງິນ */}
        {canUserAccessColumn('currency', userRole) && (
          <th className="px-3 md:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider hidden xl:table-cell">
            ສະກຸນເງິນ
          </th>
        )}

        {/* ສະຖານະ */}
        {canUserAccessColumn('status', userRole) && (
          <th className="px-3 md:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
            ສະຖານະ
          </th>
        )}

        {/* ການຊຳລະ */}
        {canUserAccessColumn('is_paid', userRole) && (
          <th className="px-3 md:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider hidden lg:table-cell">
            ການຊຳລະ
          </th>
        )}

        {/* ວັນທີອອກໃບບິນ */}
        {canUserAccessColumn('created_at', userRole) && (
          <th className="px-3 md:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider hidden xl:table-cell">
            <span className="hidden xl:inline">ວັນທີອອກໃບບິນ</span>
            <span className="xl:hidden">ວັນທີ</span>
          </th>
        )}

        {/* ວັນທີແກ້ໄຂ */}
        {canUserAccessColumn('updated_at', userRole) && (
          <th className="px-3 md:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider hidden 2xl:table-cell">
            ວັນທີແກ້ໄຂ
          </th>
        )}

        {/* ຈັດການ */}
        {canUserAccessColumn('actions', userRole) && (
          <th className="px-3 md:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
            ຈັດການ
          </th>
        )}
      </tr>
    </thead>
  );
};

export default RoleBasedTableHeader;
