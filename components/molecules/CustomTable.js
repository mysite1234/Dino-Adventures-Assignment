'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Shield,
  Star,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

// Status Badge Component
const StatusBadge = ({ status, variant = 'default' }) => {
  const variants = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-rose-50 text-rose-700 border-rose-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-orange-50 text-orange-700 border-orange-200',
    default: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  const icons = {
    active: <CheckCircle className="w-3 h-3" />,
    inactive: <XCircle className="w-3 h-3" />,
    pending: <AlertCircle className="w-3 h-3" />,
    completed: <CheckCircle className="w-3 h-3" />,
    warning: <AlertCircle className="w-3 h-3" />,
    default: null
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${variants[variant] || variants.default}`}>
      {icons[variant] && icons[variant]}
      <span className="text-xs font-medium capitalize">{status}</span>
    </div>
  );
};

// Action Menu Component
const ActionMenu = ({ row, actions = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick(row);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 hover:bg-gray-50 ${action.danger ? 'text-rose-600' : 'text-gray-700'}`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Main Table Component
export default function DynamicTable({
  // Data & Configuration
  data = [],
  columns = [],
  
  // Pagination
  pageSize = 10,
  showPagination = true,
  
  // Features
  sortable = true,
  searchable = true,
  filterable = false,
  selectable = false,
  actions = [],
  showActions = true,
  
  // Styling
  variant = 'default', // 'default', 'minimal', 'card'
  striped = true,
  hoverEffect = true,
  bordered = false,
  rounded = true,
  compact = false,
  
  // States
  loading = false,
  skeletonRows = 5,
  emptyState = null,
  
  // Real-time Features
  realTime = false,
  refreshInterval = 10000,
  autoRefresh = false,
  
  // Callbacks
  onRowClick = null,
  onSelectionChange = null,
  onSort = null,
  onSearch = null,
  onRefresh = null,
  
  // Customization
  className = '',
  headerClassName = '',
  rowClassName = '',
  cellClassName = '',
  
  // I18n
  emptyMessage = 'No data available',
  searchPlaceholder = 'Search...',
  
  // Analytics
  showStats = false,
  onExport = null
}) {
  // State Management
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [filters, setFilters] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localData, setLocalData] = useState(data);

  // Real-time Data Simulation
  useEffect(() => {
    if (realTime && autoRefresh) {
      const interval = setInterval(async () => {
        setIsRefreshing(true);
        try {
          if (onRefresh) {
            await onRefresh();
          } else {
            // Simulate data update
            await new Promise(resolve => setTimeout(resolve, 500));
            setLocalData(prev => [...prev.map(item => ({
              ...item,
              lastUpdated: new Date().toISOString()
            }))]);
          }
        } catch (error) {
          console.error('Refresh failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [realTime, autoRefresh, refreshInterval, onRefresh]);

  // Filter Data
  const filteredData = useMemo(() => {
    let result = [...localData];
    
    // Apply search
    if (searchTerm && searchable) {
      result = result.filter(item =>
        columns.some(col => {
          const value = item[col.key];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = result.filter(item =>
        Object.entries(filters).every(([key, value]) => {
          if (!value || value === 'all') return true;
          return item[key] === value;
        })
      );
    }
    
    return result;
  }, [localData, searchTerm, filters, columns, searchable]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortable || !sortConfig.key) return filteredData;
    
    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    if (onSort) onSort(sortConfig);
    return sorted;
  }, [filteredData, sortConfig, sortable, onSort]);

  // Paginate Data
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, showPagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const totalSelected = selectedRows.size;

  // Event Handlers
  const handleSort = useCallback((key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  }, [sortable, sortConfig]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    if (onSearch) onSearch(term);
    setCurrentPage(1);
  }, [onSearch]);

  const handleSelectAll = useCallback(() => {
    const newSelected = new Set();
    if (totalSelected < paginatedData.length) {
      paginatedData.forEach(row => newSelected.add(row.id));
    }
    setSelectedRows(newSelected);
    if (onSelectionChange) onSelectionChange(Array.from(newSelected));
  }, [paginatedData, totalSelected, onSelectionChange]);

  const handleSelectRow = useCallback((id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
    if (onSelectionChange) onSelectionChange(Array.from(newSelected));
  }, [selectedRows, onSelectionChange]);

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(sortedData);
    } else {
      // Default export behavior
      const csv = [
        columns.map(col => col.header).join(','),
        ...sortedData.map(row => 
          columns.map(col => JSON.stringify(row[col.key])).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export.csv';
      a.click();
    }
  }, [sortedData, columns, onExport]);

  // Skeleton Loader
  const renderSkeleton = () => (
    Array.from({ length: skeletonRows }).map((_, index) => (
      <tr key={index} className="animate-pulse">
        {selectable && (
          <td className="px-6 py-4">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
          </td>
        )}
        {columns.map((_, colIndex) => (
          <td key={colIndex} className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded"></div>
          </td>
        ))}
        {showActions && actions.length > 0 && (
          <td className="px-6 py-4">
            <div className="w-8 h-4 bg-gray-200 rounded"></div>
          </td>
        )}
      </tr>
    ))
  );

  // Empty State
  const renderEmptyState = () => {
    if (emptyState) return emptyState;
    
    return (
      <tr>
        <td colSpan={columns.length + (selectable ? 1 : 0) + (showActions ? 1 : 0)} className="px-6 py-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
            <p className="text-gray-500 mb-4">{emptyMessage}</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear search
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // Column render helper
  const renderCell = (column, row) => {
    if (column.render) return column.render(row[column.key], row);
    
    // Default formatters
    const value = row[column.key];
    
    switch (column.type) {
      case 'status':
        return <StatusBadge status={value} variant={value?.toLowerCase()} />;
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: column.currency || 'USD'
        }).format(value);
      case 'number':
        return new Intl.NumberFormat().format(value);
      case 'percentage':
        return `${value}%`;
      case 'rating':
        return (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
        );
      case 'trend':
        return (
          <div className="flex items-center gap-1">
            {value > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600">+{value}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-rose-500" />
                <span className="text-rose-600">{value}%</span>
              </>
            )}
          </div>
        );
      default:
        return value;
    }
  };

  // Table variants
  const tableVariants = {
    default: 'bg-white shadow-sm',
    minimal: 'bg-transparent',
    card: 'bg-white rounded-xl shadow-lg border border-gray-100'
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Controls */}
      {(searchable || filterable || showStats || onExport) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
          {/* Search */}
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          )}

          {/* Stats */}
          {showStats && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">{sortedData.length} items</span>
              {totalSelected > 0 && (
                <span className="font-medium text-blue-600">{totalSelected} selected</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {realTime && (
              <button
                onClick={() => onRefresh && onRefresh()}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}

            {onExport && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`${tableVariants[variant]} ${rounded ? 'rounded-lg' : ''} ${bordered ? 'border border-gray-200' : ''} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table Header */}
            <thead className={`bg-gray-50 ${headerClassName}`}>
              <tr>
                {/* Select All Checkbox */}
                {selectable && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={totalSelected === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}

                {/* Columns */}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width ? `w-${column.width}` : ''} ${column.align === 'center' ? 'text-center' : ''} ${column.align === 'right' ? 'text-right' : ''}`}
                    onClick={() => sortable && column.sortable !== false && handleSort(column.key)}
                    style={{ cursor: sortable && column.sortable !== false ? 'pointer' : 'default' }}
                  >
                    <div className={`flex items-center gap-2 ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''}`}>
                      {column.icon && <column.icon className="w-4 h-4" />}
                      <span>{column.header}</span>
                      {sortable && column.sortable !== false && (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                ))}

                {/* Actions Column */}
                {showActions && actions.length > 0 && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className={`divide-y divide-gray-200 ${striped ? 'even:bg-gray-50' : ''}`}>
              {loading ? (
                renderSkeleton()
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    className={`${hoverEffect ? 'hover:bg-gray-50' : ''} ${onRowClick ? 'cursor-pointer' : ''} ${rowClassName} transition-colors`}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {/* Row Selection Checkbox */}
                    {selectable && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}

                    {/* Row Data */}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 ${compact ? 'py-2' : ''} ${cellClassName} ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}`}
                      >
                        <div className={`flex items-center gap-2 ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''}`}>
                          {renderCell(column, row)}
                        </div>
                      </td>
                    ))}

                    {/* Action Menu */}
                    {showActions && actions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ActionMenu row={row} actions={actions} />
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                renderEmptyState()
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, sortedData.length)}
              </span>{' '}
              of <span className="font-medium">{sortedData.length}</span> results
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}