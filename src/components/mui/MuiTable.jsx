import { useState } from 'react';

/**
 * Componente de tabla reutilizable y responsive.
 * Props:
 * - columns: Array de objetos { key, label } para los encabezados.
 * - data: Array de objetos, cada uno representa una fila.
 * - className: clases adicionales opcionales.
 */
export default function MuiTable({ columns = [], data = [], className = '' }) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState('');

  // Filtrado por búsqueda
  const filteredData = data.filter(row =>
    columns.some(col => {
      const value = row[col.key];
      return value && value.toString().toLowerCase().includes(search.toLowerCase());
    })
  );

  const totalRows = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Buscador */}
      <div className="flex justify-end mb-4">
        <div className="relative w-full max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-[#00B4D8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 bg-gradient-to-r from-[#f8fafc] to-[#e0f7fa] text-sm shadow focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-[#00B4D8] transition-all duration-200"
          />
        </div>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="min-w-[600px] divide-y divide-gray-200 bg-white rounded-lg shadow-md text-xs sm:text-sm w-full">
          <thead className="bg-gradient-to-r from-[#232A34] to-[#29313B] animate-gradient-x">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 sm:px-6 py-3 sm:py-4 text-left font-extrabold text-white uppercase tracking-widest whitespace-nowrap shadow-lg border-b-4 border-[#00B4D8] first:rounded-tl-xl last:rounded-tr-xl drop-shadow-xl transition-all duration-200 hover:brightness-110 relative group"
                >
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#00B4D8] group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
                    {col.label}
                  </span>
                  <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-[#00B4D8] to-[#48CAE4] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl"></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-400">
                  Sin datos para mostrar
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50 transition group border-b border-gray-100 last:border-b-0">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-3 sm:px-4 py-2 sm:py-3 text-gray-700 whitespace-nowrap align-middle group-hover:text-blue-700 transition-colors duration-150 text-xs sm:text-sm font-medium group-hover:bg-blue-100/40 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        {/* Renderiza usando la función render si existe, si no el valor plano */}
                        {col.render
                          ? col.render(row)
                          : (col.key === 'accion'
                              ? <div className="flex justify-center items-center w-full">{row[col.key]}</div>
                              : <span className="break-words max-w-xs inline-block whitespace-pre-line">{row[col.key]}</span>
                            )
                        }
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-[#232A34] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-xs sm:text-sm text-gray-700">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-[#232A34] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-700">Filas por página:</span>
          <select
            value={rowsPerPage}
            onChange={handleRowsChange}
            className="border rounded px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
