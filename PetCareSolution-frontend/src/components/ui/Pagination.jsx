// components/ui/Pagination.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-center space-x-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-brand-500 hover:border-brand-200 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-all duration-200"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`
            w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200
            ${currentPage === page
                            ? 'bg-brand-500 text-white shadow-soft pointer-events-none'
                            : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'}
          `}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-brand-500 hover:border-brand-200 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-all duration-200"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Pagination;
