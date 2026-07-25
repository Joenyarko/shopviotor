import React from 'react';

const DotPagination = ({ currentPage = 1, totalPages = 1, onPageChange, className = '' }) => {
  if (!totalPages || totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={`flex justify-center items-center gap-2 py-6 ${className}`}>
      {pages.map((page) => {
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            title={`Page ${page}`}
            aria-label={`Go to page ${page}`}
            className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
              isActive
                ? 'w-8 h-2.5 bg-primary-500 shadow-sm'
                : 'w-2.5 h-2.5 bg-secondary-300 dark:bg-secondary-700 hover:bg-secondary-400 dark:hover:bg-secondary-600'
            }`}
          />
        );
      })}
    </div>
  );
};

export default DotPagination;
export { DotPagination };
