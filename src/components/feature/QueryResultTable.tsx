
import { useState, useMemo } from 'react';
import { Button } from '../base/Button';

interface QueryResultTableProps {
  data: any[];
  onDownloadCSV: () => void;
}

export function QueryResultTable({ data, onDownloadCSV }: QueryResultTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const sortedData = useMemo(() => {
    if (!sortConfig || !data) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <i className="ri-database-line text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-600">0 rows returned</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <p className="text-sm text-gray-600">{data.length} rows returned</p>
        <Button size="sm" variant="outline" onClick={onDownloadCSV} className="w-full sm:w-auto">
          <i className="ri-file-text-line mr-2"></i>
          Download CSV
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-96 -webkit-overflow-scrolling-touch">
          <table className="w-full min-w-full">
            <thead className="bg-[#006E5B] text-white sticky top-0 z-10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    className="px-3 md:px-4 py-3 text-left font-medium cursor-pointer hover:bg-[#005A4A] transition-colors min-w-[120px] whitespace-nowrap"
                    onClick={() => handleSort(column)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm md:text-base">{column}</span>
                      {sortConfig?.key === column && (
                        <i className={`ri-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}-line text-sm`}></i>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                >
                  {columns.map((column) => (
                    <td key={column} className="px-3 md:px-4 py-3 text-sm text-gray-900 border-b border-gray-100 whitespace-nowrap min-w-[120px]">
                      <div className="truncate max-w-[200px]" title={row[column]?.toString() || '-'}>
                        {row[column]?.toString() || '-'}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
