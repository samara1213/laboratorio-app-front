import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import { useOrderActions } from '../../orders/useOrderActions';
import { useOrderSearch } from '../../../hooks/queries/useOrders';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Field, Input } from '@/components/ui/field';
import { Panel, PanelHeader } from '@/components/ui/panel';
import { StatusChip } from '@/components/ui/status';
import { ORDER_STATUS } from '@/lib/order-status';
import { cn, formatDateTime } from '@/lib/utils';

const STATUSES = Object.keys(ORDER_STATUS);
const PAGE_SIZES = [20, 50, 100];
const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

/**
 * Buscar órdenes: búsqueda por número de orden, documento o nombre del paciente, estados como
 * chips (con la cantidad de cada uno) y rango de fechas, paginada en el servidor. Los filtros
 * quedan en la URL (se pueden compartir y sobreviven al volver atrás)
 */
export default function SearchOrdersPage() {
  const [params, setParams] = useSearchParams();
  const [text, setText] = useState(params.get('search') ?? '');
  const search = useDebouncedValue(text.trim());
  const statuses = useMemo(() => (params.get('status') ?? '').split(',').filter((s) => STATUSES.includes(s)), [params]);
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const limit = PAGE_SIZES.includes(Number(params.get('limit'))) ? Number(params.get('limit')) : PAGE_SIZES[0];

  // la búsqueda escrita vuelve a la página 1 (se compara con la de la URL para no perder la página al volver atrás)
  const urlSearch = params.get('search') ?? '';
  const effectivePage = search === urlSearch ? page : 1;

  const { data, isFetching, isLoading, isError, refetch } = useOrderSearch({ page: effectivePage, limit, search, status: statuses, from, to });
  const { renderActions, dialogs } = useOrderActions();
  const orders = data?.data ?? [];
  const meta = data?.meta;
  const counts = meta?.status_counts ?? {};

  // actualiza la URL; cualquier filtro distinto de la página vuelve a la primera
  const update = (changes, keepPage = false) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries({ search, ...changes })) {
      if (value === '' || value === null || value === undefined || (Array.isArray(value) && !value.length)) next.delete(key);
      else next.set(key, Array.isArray(value) ? value.join(',') : String(value));
    }
    if (!keepPage) next.delete('page');
    setParams(next, { replace: true });
  };

  // la búsqueda escrita (ya estable) también queda en la URL
  useEffect(() => {
    if (search === urlSearch) return;
    const next = new URLSearchParams(params);
    if (search) next.set('search', search);
    else next.delete('search');
    next.delete('page');
    setParams(next, { replace: true });
  }, [search, urlSearch, params, setParams]);

  const toggleStatus = (status) => update({ status: statuses.includes(status) ? statuses.filter((s) => s !== status) : [...statuses, status] });
  const hasFilters = Boolean(text || statuses.length || from || to);
  const clear = () => {
    setText('');
    setParams(new URLSearchParams(), { replace: true });
  };

  const rows = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        code: String(order.ord_code),
        patient:
          [order.customer?.cus_first_name, order.customer?.cus_second_name, order.customer?.cus_first_lastname, order.customer?.cus_second_lastname]
            .filter(Boolean)
            .join(' ') || 'Sin nombre',
        document: [order.customer?.cus_document_type, order.customer?.cus_document_number].filter(Boolean).join(' '),
      })),
    [orders],
  );

  const columns = [
    { key: 'code', label: 'Orden', render: (row) => <span className="tabular font-bold">{row.code}</span> },
    {
      key: 'patient',
      label: 'Paciente',
      cardTitle: true,
      render: (row) => (
        <span className="flex flex-col">
          <span className="font-semibold">{row.patient}</span>
          <span className="tabular text-sm text-muted">{row.document}</span>
        </span>
      ),
    },
    { key: 'ord_created_at', label: 'Ingreso', hideBelow: 'lg', render: (row) => <span className="tabular text-muted">{formatDateTime(row.ord_created_at)}</span> },
    { key: 'ord_total_value', label: 'Total', hideBelow: 'xl', align: 'right', render: (row) => <span className="tabular">{money.format(row.ord_total_value ?? 0)}</span> },
    {
      key: 'ord_status',
      label: 'Estado',
      render: (row) => (
        <span className="flex flex-wrap items-center gap-1.5">
          <StatusChip status={row.ord_status} />
          {row.attachments_count > 0 && <Icon icon="mdi:paperclip" className="size-4 text-muted" aria-label="con adjunto" />}
        </span>
      ),
    },
    { key: 'actions', label: 'Acciones', render: (row) => renderActions(row) },
  ];

  return (
    <LayoutDashboard title="Buscar órdenes">
      <Panel className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_10.5rem_10.5rem] md:items-end">
          <Field label="Orden, documento o nombre del paciente">
            {(field) => (
              <div className="relative">
                <Icon icon="mdi:magnify" className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
                <Input type="search" inputMode="search" autoComplete="off" placeholder="Por ejemplo: 1048, 1020456781 o Ana Rojas" className="pl-10" value={text} onChange={(e) => setText(e.target.value)} {...field} />
              </div>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3 md:contents">
            <Field label="Desde">
              {(field) => <Input type="date" value={from} max={to || undefined} onChange={(e) => update({ from: e.target.value })} {...field} />}
            </Field>
            <Field label="Hasta">
              {(field) => <Input type="date" value={to} min={from || undefined} onChange={(e) => update({ to: e.target.value })} {...field} />}
            </Field>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Estados</legend>
            {STATUSES.map((status) => {
              const selected = statuses.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleStatus(status)}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-[15px] font-semibold transition-colors sm:min-h-10',
                    selected ? cn('border-transparent', ORDER_STATUS[status].chip) : 'border-border-strong bg-surface text-ink hover:bg-ground',
                  )}
                >
                  <span className={cn('size-2.5 rounded-full', ORDER_STATUS[status].cap)} aria-hidden="true" />
                  {ORDER_STATUS[status].label}
                  {meta && <span className="tabular font-normal opacity-80">{counts[status] ?? 0}</span>}
                  {selected && <Icon icon="mdi:check" className="size-4" aria-hidden="true" />}
                </button>
              );
            })}
          </fieldset>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="max-sm:h-11 sm:shrink-0" onClick={clear}>
              <Icon icon="mdi:filter-remove-outline" className="size-5" aria-hidden="true" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <PanelHeader
          title="Órdenes"
          description={meta ? `${meta.total} ${meta.total === 1 ? 'orden' : 'órdenes'}${isFetching && !isLoading ? ' · actualizando…' : ''}` : undefined}
        />
        {isError ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <p className="text-[15px] text-muted">No pudimos cargar las órdenes.</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            searchable={false}
            getRowKey={(row) => row.ord_id}
            caption="Órdenes encontradas"
            pageSizes={PAGE_SIZES}
            emptyMessage={hasFilters ? 'Ninguna orden coincide con los filtros.' : 'Aún no hay órdenes en el laboratorio.'}
            server={{
              page: meta?.page ?? effectivePage,
              pageSize: limit,
              total: meta?.total ?? 0,
              onPageChange: (next) => update({ page: next }, true),
              onPageSizeChange: (size) => update({ limit: size }),
            }}
          />
        )}
      </Panel>
      {dialogs}
    </LayoutDashboard>
  );
}
