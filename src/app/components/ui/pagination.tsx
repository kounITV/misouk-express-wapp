"use client";

import React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalRecords,
  currentPage,
  totalPages,
  nextPage,
  prevPage,
  onPageChange,
  itemsPerPage = 50,
  onItemsPerPageChange,
}) => {
  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalRecords);

  const handlePrevious = () => {
    if (prevPage) {
      onPageChange(prevPage);
    }
  };

  const handleNext = () => {
    if (nextPage) {
      onPageChange(nextPage);
    }
  };

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const itemsPerPageOptions = [10, 20, 30, 50, 100];

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
    }
  };

  return (
    <div className="flex items-center justify-end px-4 py-3 bg-white border-t border-gray-200">
      {/* Items per page selector */}
      <div className="flex items-center mr-4">
        <select
          value={itemsPerPage}
          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
          className="border-2 border-gray-400 rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#0c64b0] focus:border-[#0c64b0] bg-white cursor-pointer"
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option} ລາຍການຕໍ່ໜ້າ
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!prevPage}
          className="flex items-center gap-1 text-black border-gray-300 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
          ກ່ອນໜ້າ
        </Button>

        {/* Page Info */}
        <div className="flex items-center space-x-2 px-4">
          <span className="text-sm text-black">
            ໜ້າ {currentPage} ຈາກ {totalRecords}
          </span>
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!nextPage}
          className="flex items-center gap-1 text-black border-gray-300 hover:bg-gray-50"
        >
          ຖັດໄປ
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
