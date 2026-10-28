import { useMemo, useState } from 'react';
import LayoutDashboard from './dashboard/LayoutDashboard';
import { useOrderActions } from './orders/useOrderActions';
import { useAuthStore } from '../hooks/authStore';
import { ACTIVE_STATUSES, useActiveOrders } from '../hooks/queries/useOrders';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Panel, PanelHeader, Skeleton } from '@/components/ui/panel';
import { StatusChip, TubeIcon } from '@/components/ui/status';
import { getOrderStatus } from '@/lib/order-status';
import { cn, formatDateTime } from '@/lib/utils';

const today = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Bogota' }).format(new Date());

function Dashboard() {
  const { user } = useAuthStore();
  const { data: orders = [], isLoading, isError, refetch } = useActiveOrders(user?.laboratory?.lab_id);
  const { renderActions, dialogs } = useOrderActions();

  const [filter, setFilter] = useState(null);

  // cantidad de órdenes por estado para la gradilla
  const counts = useMemo(
    () => Object.fromEntries(ACTIVE_STATUSES.map((s) => [s, orders.filter((o) => o.ord_status === s).length])),
    [orders],
  );
  const maxCount = Math.max(1, ...Object.values(counts));

  const rows = useMemo(
    () =>
      orders
        .filter((o) => !filter || o.ord_status === filter)
        .map((order) => ({
          ...order,
          // valores de texto para la búsqueda
          patient: [order.customer?.cus_first_name, order.customer?.cus_first_lastname].filter(Boolean).join(' '),
          document: order.customer?.cus_document_number ?? '',
          code: String(order.ord_code ?? ''),
          date: formatDateTime(order.ord_created_at),
        })),
    [orders, filter],
  );

  const columns = [
    { key: 'code', label: 'Orden', className: 'font-bold tabular', render: (row) => <span className="font-bold tabular">{row.code}</span> },
    {
      key: 'patient',
      label: 'Paciente',
      cardTitle: true,
      render: (row) => (
        <span className="flex flex-col">
          <span className="font-semibold">{row.patient || 'Sin nombre'}</span>
          <span className="tabular text-sm text-muted">{row.document}</span>
        </span>
      ),
    },
    { key: 'date', label: 'Ingreso', hideBelow: 'lg', render: (row) => <span className="tabular text-muted">{row.date}</span> },
    { key: 'ord_status', label: 'Estado', render: (row) => <StatusChip status={row.ord_status} /> },
    { key: 'actions', label: 'Acciones', render: (row) => renderActions(row) },
  ];

  return (
    <LayoutDashboard title="Órdenes en curso">
      <p className="-mt-1 text-[15px] text-muted first-letter:uppercase lg:-mt-3">
        {today} · {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'}
      </p>

      <section aria-label="Órdenes por estado" className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        {ACTIVE_STATUSES.map((status) => {
          const selected = filter === status;
          return (
            <button
              key={status}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(selected ? null : status)}
              className={cn(
                'flex items-center gap-3 rounded-panel bg-surface p-3 text-left transition-colors hover:bg-ground sm:gap-4 sm:p-4 lg:px-5',
                selected ? 'border-2 border-primary' : 'border border-border',
              )}
            >
              <TubeIcon status={status} level={counts[status] / maxCount} size="md" className="max-sm:scale-90" />
              <span className="flex flex-col">
                {isLoading ? (
                  <Skeleton className="h-7 w-10" />
                ) : (
                  <span className="tabular text-2xl leading-none font-bold sm:text-[28px] lg:text-[32px]">{counts[status]}</span>
                )}
                <span className="text-sm text-muted sm:text-[15px]">{getOrderStatus(status).label}</span>
              </span>
            </button>
          );
        })}
      </section>

      <Panel className="overflow-hidden">
        <PanelHeader
          title={filter ? getOrderStatus(filter).label : 'Todas las órdenes en curso'}
          description={filter ? `${counts[filter]} ${counts[filter] === 1 ? 'orden' : 'órdenes'}` : undefined}
          actions={
            filter && (
              <Button variant="ghost" size="sm" onClick={() => setFilter(null)}>
                Ver todas
              </Button>
            )
          }
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
            getRowKey={(row) => row.ord_id}
            caption="Órdenes en curso"
            searchPlaceholder="Buscar por paciente, documento u orden"
            emptyMessage={filter ? 'No hay órdenes en este estado.' : 'No hay órdenes en curso. Las nuevas órdenes aparecerán aquí.'}
          />
        )}
      </Panel>

      {dialogs}
    </LayoutDashboard>
  );
}

export default Dashboard;
