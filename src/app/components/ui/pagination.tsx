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
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-700">
          ສະແດງ {startItem} ຫາ {endItem} ຈາກ {totalRecords} ລາຍການ
        </div>
        
        {/* Items per page selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">ສະແດງ:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c64b0] focus:border-[#0c64b0]"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option} ລາຍການຕໍ່ໜ້າ
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!prevPage}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          ກ່ອນໜ້າ
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-1 text-gray-500">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={`min-w-[40px] ${
                    currentPage === page 
                      ? "bg-[#0c64b0] text-white hover:bg-[#247dc9]" 
                      : "hover:bg-gray-50"
                  }`}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!nextPage}
          className="flex items-center gap-1"
        >
          ຖັດໄປ
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
