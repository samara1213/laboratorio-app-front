import { useId, useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Skeleton } from './panel';

const ACTION_KEYS = new Set(['actions', 'accion', 'acciones']);

// clases literales para que Tailwind las genere
const HIDE_BELOW = { md: 'hidden md:table-cell', lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell' };

/**
 * Tabla responsive del sistema visual.
 * - Desde `md` (tablet) es una tabla; las columnas con `hideBelow` se ocultan en pantallas menores.
 * - En celular cada fila es una tarjeta: la primera columna (o la marcada `cardTitle`) es el título,
 *   las acciones van abajo y el resto como etiqueta/valor.
 * - Búsqueda y paginación en memoria, o en el servidor con `server` (la página llega ya filtrada:
 *   `data` es solo la página actual y la búsqueda se controla con `searchValue`/`onSearchChange`).
 *
 * @param {{
 *   columns: { key: string, label: string, render?: (row) => any, hideBelow?: 'md'|'lg'|'xl', cardTitle?: boolean,
 *              hideInCard?: boolean, align?: 'left'|'right', className?: string }[],
 *   data: object[], getRowKey?: (row, index) => string, loading?: boolean, searchable?: boolean,
 *   searchPlaceholder?: string, emptyMessage?: string, pageSizes?: number[], caption?: string, className?: string,
 *   server?: { page: number, pageSize: number, total: number, onPageChange: (page: number) => void,
 *              onPageSizeChange: (size: number) => void },
 *   searchValue?: string, onSearchChange?: (value: string) => void
 * }} props
 */
export function DataTable({
  columns = [],
  data = [],
  getRowKey,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Buscar…',
  emptyMessage = 'No hay registros para mostrar.',
  pageSizes = [10, 20, 50, 100],
  caption,
  className,
  server,
  searchValue,
  onSearchChange,
}) {
  const searchId = useId();
  const [localSearch, setLocalSearch] = useState('');
  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(pageSizes[0]);

  const actionColumn = columns.find((c) => ACTION_KEYS.has(c.key));
  const dataColumns = columns.filter((c) => !ACTION_KEYS.has(c.key));
  const titleColumn = dataColumns.find((c) => c.cardTitle) ?? dataColumns[0];

  const search = onSearchChange ? (searchValue ?? '') : localSearch;
  const page = server ? server.page : localPage;
  const pageSize = server ? server.pageSize : localPageSize;
  const setPage = server ? server.onPageChange : setLocalPage;
  const setPageSize = server ? server.onPageSizeChange : setLocalPageSize;
  const setSearch = (value) => {
    if (onSearchChange) onSearchChange(value);
    else setLocalSearch(value);
    if (!server) setLocalPage(1);
  };

  // la búsqueda en memoria solo compara valores de texto o número (las celdas con componentes se ignoran)
  const term = search.trim().toLowerCase();
  const filtered =
    server || !term
      ? data
      : data.filter((row) =>
          dataColumns.some((col) => {
            const value = row[col.key];
            return (typeof value === 'string' || typeof value === 'number') && String(value).toLowerCase().includes(term);
          }),
        );

  const total = server ? server.total : filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const rows = server ? data : filtered.slice(start, start + pageSize);

  const cell = (col, row) => (col.render ? col.render(row) : row[col.key]);
  const keyOf = (row, i) => (getRowKey ? getRowKey(row, i) : row.id ?? row.key ?? i);

  return (
    <div className={cn('flex w-full flex-col', className)}>
      {searchable && (
        <div className="px-4 pb-3 pt-4 sm:px-5">
          <label htmlFor={searchId} className="sr-only">
            {searchPlaceholder}
          </label>
          <div className="relative w-full sm:max-w-sm">
            <Icon icon="mdi:magnify" className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id={searchId}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 w-full rounded-control border border-border-strong bg-surface pr-3 pl-10 text-base text-ink placeholder:text-muted/80 focus-visible:border-primary"
            />
          </div>
        </div>
      )}

      {/* tabla: tablet en adelante */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-[15px]">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="text-left text-sm text-muted">
              {dataColumns.map((col) => (
                <th key={col.key} scope="col" className={cn('px-4 py-3 font-semibold first:pl-5', col.align === 'right' && 'text-right', HIDE_BELOW[col.hideBelow])}>
                  {col.label}
                </th>
              ))}
              {actionColumn && (
                <th scope="col" className="px-4 py-3 pr-5">
                  <span className="sr-only">{actionColumn.label || 'Acciones'}</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="border-t border-border">
                    {dataColumns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-4 first:pl-5', HIDE_BELOW[col.hideBelow])}>
                        <Skeleton className="h-4 w-3/4" />
                      </td>
                    ))}
                    {actionColumn && <td className="px-4 py-4 pr-5" />}
                  </tr>
                ))
              : rows.map((row, i) => (
                  <tr key={keyOf(row, i)} className="border-t border-border align-middle hover:bg-ground/60">
                    {dataColumns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-3 first:pl-5', col.align === 'right' && 'text-right', HIDE_BELOW[col.hideBelow], col.className)}>
                        {cell(col, row)}
                      </td>
                    ))}
                    {actionColumn && (
                      <td className="px-4 py-2 pr-5">
                        <div className="flex items-center justify-end gap-2">{cell(actionColumn, row)}</div>
                      </td>
                    )}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* tarjetas: celular */}
      <ul className="flex flex-col gap-3 px-4 pb-1 md:hidden">
        {loading
          ? Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="flex flex-col gap-3 rounded-panel border border-border p-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </li>
            ))
          : rows.map((row, i) => (
              <li key={keyOf(row, i)} className="flex flex-col gap-3 rounded-panel border border-border bg-surface p-4">
                {titleColumn && <div className="text-base font-semibold">{cell(titleColumn, row)}</div>}
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
                  {dataColumns
                    .filter((col) => col !== titleColumn && !col.hideInCard)
                    .map((col) => (
                      <div key={col.key} className="contents">
                        <dt className="text-muted">{col.label}</dt>
                        <dd className="min-w-0 break-words">{cell(col, row)}</dd>
                      </div>
                    ))}
                </dl>
                {actionColumn && <div className="flex flex-wrap gap-2 [&>*]:flex-1">{cell(actionColumn, row)}</div>}
              </li>
            ))}
      </ul>

      {!loading && total === 0 && (
        <p className="px-5 py-10 text-center text-[15px] text-muted">{search ? `No hay resultados para “${search}”.` : emptyMessage}</p>
      )}

      {total > 0 && (
        <div className="mt-2 flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span className="tabular">
            Mostrando {start + 1}–{Math.min(start + pageSize, total)} de {total}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2">
              <span>Filas</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  if (!server) setLocalPage(1);
                }}
                className="h-10 rounded-control border border-border-strong bg-surface px-2 text-base text-ink"
              >
                {pageSizes.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            {totalPages > 1 && (
              <span className="tabular">
                Página {currentPage} de {totalPages}
              </span>
            )}
            <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1 || loading}>
              Anterior
            </Button>
            <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages || loading}>
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
