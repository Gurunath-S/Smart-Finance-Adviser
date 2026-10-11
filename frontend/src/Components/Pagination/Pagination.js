import React from 'react';
import styled from 'styled-components';

function Pagination({
    currentPage = 1,
    totalItems = 0,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 20]
}) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    if (totalItems <= 0) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }
            if (currentPage < totalPages - 2) pages.push('...');
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }
        return pages;
    };

    return (
        <PaginationStyled>
            <div className="pagination-info">
                <span>Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of <strong>{totalItems}</strong></span>
                {onPageSizeChange && (
                    <div className="size-selector">
                        <label htmlFor="pageSizeSelect">Per page:</label>
                        <select
                            id="pageSizeSelect"
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        >
                            {pageSizeOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="pagination-nav">
                <button
                    type="button"
                    className="nav-btn prev-btn"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    aria-label="Previous Page"
                >
                    <i className="fa-solid fa-chevron-left"></i>
                </button>

                <div className="page-numbers">
                    {getPageNumbers().map((page, index) => {
                        if (page === '...') {
                            return <span key={`ellipsis-${index}`} className="ellipsis">…</span>;
                        }
                        const isCurrent = page === currentPage;
                        return (
                            <button
                                key={`page-${page}`}
                                type="button"
                                className={`page-btn ${isCurrent ? 'active' : ''}`}
                                onClick={() => onPageChange(page)}
                                aria-current={isCurrent ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className="nav-btn next-btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    aria-label="Next Page"
                >
                    <i className="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        </PaginationStyled>
    );
}

const PaginationStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 1.5rem;
    padding: 0.8rem 1.2rem;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px);
    border: 1.5px solid #FFFFFF;
    border-radius: 16px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
    flex-wrap: wrap;
    gap: 1rem;

    @media (max-width: 640px) {
        flex-direction: column;
        justify-content: center;
        padding: 0.8rem 0.6rem;
        gap: 0.8rem;
    }

    .pagination-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: rgba(34, 34, 96, 0.75);
        font-size: 0.9rem;

        strong {
            color: #222260;
            font-weight: 700;
        }

        .size-selector {
            display: flex;
            align-items: center;
            gap: 0.4rem;

            select {
                background: #fff;
                border: 1px solid rgba(34, 34, 96, 0.2);
                border-radius: 8px;
                padding: 0.25rem 0.5rem;
                font-size: 0.85rem;
                color: #222260;
                font-weight: 600;
                outline: none;
                cursor: pointer;
                transition: border-color 0.2s ease;

                &:focus {
                    border-color: #6366f1;
                }
            }
        }
    }

    .pagination-nav {
        display: flex;
        align-items: center;
        gap: 0.4rem;

        .nav-btn {
            background: #fff;
            color: #222260;
            border: 1px solid rgba(34, 34, 96, 0.15);
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.03);

            &:hover:not(:disabled) {
                background: #6366f1;
                color: #fff;
                border-color: #6366f1;
                transform: translateY(-1px);
            }

            &:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }
        }

        .page-numbers {
            display: flex;
            align-items: center;
            gap: 0.3rem;

            .ellipsis {
                color: rgba(34, 34, 96, 0.5);
                padding: 0 0.3rem;
                font-weight: bold;
            }

            .page-btn {
                background: #fff;
                color: #222260;
                border: 1px solid rgba(34, 34, 96, 0.12);
                min-width: 36px;
                height: 36px;
                padding: 0 0.5rem;
                border-radius: 10px;
                font-weight: 600;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;

                &:hover:not(.active) {
                    background: rgba(99, 102, 241, 0.1);
                    color: #6366f1;
                    border-color: #6366f1;
                }

                &.active {
                    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                    color: #fff;
                    border-color: transparent;
                    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.35);
                }
            }
        }
    }
`;

export default Pagination;
