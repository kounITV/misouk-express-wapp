"use client";

import React, { useState } from 'react';
import ConfirmationPopup from './confirmation-popup';
import SuccessPopup from './success-popup';
import AlertPopup from './alert-popup';

interface EnhancedActionsDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
  onStatusUpdate: (status: string) => Promise<void>;
  align?: 'start' | 'end';
  isLastItems?: boolean; // New prop to determine if this is one of the last items
}

export const EnhancedActionsDropdown: React.FC<EnhancedActionsDropdownProps> = ({
  onEdit,
  onDelete,
  onStatusUpdate,
  align = 'end',
  isLastItems = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showStatusSubmenu, setShowStatusSubmenu] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedStatusLabel, setSelectedStatusLabel] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const statusOptions = [
    { value: 'AT_THAI_BRANCH', label: 'ສິນຄ້າຮອດໄທ' },
    { value: 'EXIT_THAI_BRANCH', label: 'ສິ້ນຄ້າອອກຈາກໄທ' },
    { value: 'AT_LAO_BRANCH', label: 'ສິ້ນຄ້າຮອດລາວ' },
    { value: 'COMPLETED', label: 'ລູກຄ້າຮັບເອົາສິນຄ້າ' }
  ];

  const handleStatusSelection = (status: string, label: string) => {
    setSelectedStatus(status);
    setSelectedStatusLabel(label);
    setShowConfirmation(true);
    setIsOpen(false);
    setShowStatusSubmenu(false);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!selectedStatus) return;

    setIsUpdating(true);
    try {
      await onStatusUpdate(selectedStatus);
      setShowConfirmation(false);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Status update error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'ຜິດພາດໃນການອັບເດດສະຖານະ');
      setShowConfirmation(false);
      setShowErrorPopup(true);
    } finally {
      setIsUpdating(false);
      setSelectedStatus('');
      setSelectedStatusLabel('');
    }
  };

  const handleCancelStatusUpdate = () => {
    setShowConfirmation(false);
    setSelectedStatus('');
    setSelectedStatusLabel('');
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Actions"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false);
              setShowStatusSubmenu(false);
            }}
          />
          <div className={`absolute z-20 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
            align === 'end' ? 'right-0' : 'left-0'
          } ${
            isLastItems ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}>
            <div className="py-1">
              {/* Edit Option */}
              <button
                onClick={() => {
                  onEdit();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                ແກ້ໄຂ
              </button>

              {/* Delete Option */}
              <button
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                ລຶບ
              </button>

              {/* Status Update Option */}
              <div 
                className="relative"
                onMouseEnter={() => setShowStatusSubmenu(true)}
                onMouseLeave={() => setShowStatusSubmenu(false)}
              >
                <button className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    ອັບເດດສະຖານະ
                  </div>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Status Submenu */}
                {showStatusSubmenu && (
                  <div className={`absolute right-full ml-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 ${
                    isLastItems ? 'bottom-0' : 'top-0'
                  }`}>
                    <div className="py-1">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusSelection(option.value, option.label)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Popup */}
      <ConfirmationPopup
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        title="ຢືນຢັນການອັບເດດສະຖານະ"
        message={`ທ່ານຕ້ອງການອັບເດດສະຖານະເປັນ "${selectedStatusLabel}" ແທ້ ຫຼື ບໍ່?`}
        onConfirm={handleConfirmStatusUpdate}
        onCancel={handleCancelStatusUpdate}
        confirmText="ອັບເດດ"
        cancelText="ຍົກເລີກ"
        loading={isUpdating}
      />

      {/* Success Popup */}
      <SuccessPopup
        open={showSuccessPopup}
        onOpenChange={setShowSuccessPopup}
        title="ສຳເລັດ!"
        message="ອັບເດດສະຖານະສຳເລັດແລ້ວ"
        autoCloseTimer={5000}
        showTimer={true}
      />

      {/* Error Popup */}
      <AlertPopup
        open={showErrorPopup}
        onOpenChange={setShowErrorPopup}
        title="ຜິດພາດ"
        message={errorMessage}
        type="error"
      />
    </div>
  );
};

export default EnhancedActionsDropdown;
