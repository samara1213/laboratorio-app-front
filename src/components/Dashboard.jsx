import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import LayoutDashboard from './dashboard/LayoutDashboard';
import PreviewExamsModal from './dashboard/PreviewExamsModal';
import ConfirmDialog from './mui/ConfirmDialog';
import MuiFileUploadModal from './mui/MuiFileUploadModal';
import { useAuthStore } from '../hooks/authStore';
import { ACTIVE_STATUSES, useActiveOrders, useAttachFile, useCancelOrder } from '../hooks/queries/useOrders';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Panel, PanelHeader, Skeleton } from '@/components/ui/panel';
import { StatusChip, TubeIcon } from '@/components/ui/status';
import { getOrderStatus } from '@/lib/order-status';
import { cn, errorMessage, formatDateTime } from '@/lib/utils';
import { usePermissions } from '../hooks/usePermissions';

const today = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Bogota' }).format(new Date());

function Dashboard() {
  const { user } = useAuthStore();
  const { data: orders = [], isLoading, isError, refetch } = useActiveOrders(user?.laboratory?.lab_id);
  const { can } = usePermissions();
  const cancelOrder = useCancelOrder();
  const attachFile = useAttachFile();

  const [filter, setFilter] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [orderToPreview, setOrderToPreview] = useState(null);
  const [orderToUpload, setOrderToUpload] = useState(null);

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
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <>
          {can('results:create') && (
            <Button asChild variant="secondary" size="sm" className="max-md:h-11">
              <Link to={`/results/${row.ord_id}`}>Registrar resultados</Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon-sm" aria-label={`Más acciones de la orden ${row.code}`} className="max-md:size-11 max-md:flex-none">
                <Icon icon="mdi:dots-horizontal" className="size-5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setOrderToPreview(row)}>
                <Icon icon="mdi:eye-outline" aria-hidden="true" />
                Ver exámenes de la orden
              </DropdownMenuItem>
              {can('orders:update') && (
                <DropdownMenuItem onSelect={() => setOrderToUpload(row)}>
                  <Icon icon="mdi:paperclip" aria-hidden="true" />
                  Adjuntar archivo
                </DropdownMenuItem>
              )}
              {can('orders:delete') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive onSelect={() => setOrderToCancel(row)}>
                    <Icon icon="mdi:close-circle-outline" aria-hidden="true" />
                    Cancelar orden
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ),
    },
  ];

  const handleConfirmCancel = () => {
    cancelOrder.mutate(orderToCancel.ord_id, {
      onSuccess: (response) => toast.success(response?.data?.message || `Orden ${orderToCancel.ord_code} cancelada`),
      onError: (error) => toast.error(errorMessage(error, 'No fue posible cancelar la orden.')),
      onSettled: () => setOrderToCancel(null),
    });
  };

  const handleFileUpload = (file) => {
    attachFile.mutate(
      { orderId: orderToUpload.ord_id, file },
      {
        onSuccess: (response) => toast.success(response?.data?.message || 'Archivo adjuntado'),
        onError: (error) => toast.error(errorMessage(error, 'No fue posible adjuntar el archivo.')),
        onSettled: () => setOrderToUpload(null),
      },
    );
  };

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

      <PreviewExamsModal open={Boolean(orderToPreview)} onClose={() => setOrderToPreview(null)} orderId={orderToPreview?.ord_id} />
      <MuiFileUploadModal
        open={Boolean(orderToUpload)}
        onClose={() => setOrderToUpload(null)}
        onUpload={handleFileUpload}
        loading={attachFile.isPending}
        title={orderToUpload ? `Adjuntar archivo a la orden ${orderToUpload.ord_code}` : 'Adjuntar archivo'}
      />
      <ConfirmDialog
        open={Boolean(orderToCancel)}
        title={orderToCancel ? `Cancelar la orden ${orderToCancel.ord_code}` : 'Cancelar orden'}
        message="La orden quedará cancelada y saldrá de la lista de órdenes en curso."
        confirmLabel="Cancelar orden"
        loading={cancelOrder.isPending}
        onConfirm={handleConfirmCancel}
        onCancel={() => setOrderToCancel(null)}
      />
    </LayoutDashboard>
  );
}

export default Dashboard;
