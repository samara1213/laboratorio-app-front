import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import PatientFormDialog, { GENDERS } from './PatientFormDialog';
import { useCustomers } from '../../../hooks/queries/useCustomers';
import { usePermissions } from '../../../hooks/usePermissions';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Panel, PanelHeader } from '@/components/ui/panel';

const PAGE_SIZES = [20, 50, 100];
const GENDER_LABEL = Object.fromEntries(GENDERS);

/**
 * Edad en años (o meses en menores de un año) a partir de la fecha de nacimiento
 */
function ageOf(birthdate) {
  if (!birthdate) return '';
  const [y, m, d] = String(birthdate).slice(0, 10).split('-').map(Number);
  const [ty, tm, td] = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }).split('-').map(Number);
  const months = (ty - y) * 12 + (tm - m) - (td < d ? 1 : 0);
  if (months < 0) return '';
  return months < 12 ? `${months} ${months === 1 ? 'mes' : 'meses'}` : `${Math.floor(months / 12)} años`;
}

/**
 * Pacientes del laboratorio: búsqueda en el servidor, registrar, editar y ver sus órdenes.
 * /customers/create abre el formulario (con ?documento= y ?volver=orden desde Crear orden)
 */
export default function PatientsPage() {
  const { can } = usePermissions();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const fromOrder = params.get('volver') === 'orden';
  const [text, setText] = useState('');
  const search = useDebouncedValue(text.trim());
  const [pageState, setPageState] = useState({ page: 1, search: '' });
  const [limit, setLimit] = useState(PAGE_SIZES[0]);
  // una búsqueda nueva vuelve a la página 1
  const page = pageState.search === search ? pageState.page : 1;
  const { data, isLoading, isFetching, isError, refetch } = useCustomers({ page, limit, search });
  const [editing, setEditing] = useState(() => (pathname === '/customers/create' && can('customers:create') ? {} : null));

  const rows = useMemo(
    () =>
      (data?.data ?? []).map((patient) => ({
        ...patient,
        name: [patient.cus_first_name, patient.cus_second_name, patient.cus_first_lastname, patient.cus_second_lastname].filter(Boolean).join(' '),
        document: `${patient.cus_document_type} ${patient.cus_document_number}`,
        age: ageOf(patient.cus_birthdate),
      })),
    [data],
  );
  const meta = data?.meta;

  const closeForm = () => {
    setEditing(null);
    if (pathname !== '/customers') navigate('/customers', { replace: true });
  };

  // registrado desde Crear orden: se vuelve a la orden con el paciente ya buscado
  const onSaved = (patient) => {
    if (!fromOrder || editing?.cus_id) return false;
    navigate(`/orders/create?documento=${encodeURIComponent(patient.cus_document_number)}`);
    return true;
  };

  const columns = [
    {
      key: 'name',
      label: 'Paciente',
      cardTitle: true,
      render: (row) => (
        <span className="flex flex-col">
          <span className="font-semibold">{row.name}</span>
          <span className="tabular text-sm text-muted">{row.document}</span>
        </span>
      ),
    },
    {
      key: 'age',
      label: 'Edad',
      render: (row) => (
        <span>
          {row.age}
          {row.cus_gender && <span className="text-muted"> · {GENDER_LABEL[row.cus_gender] ?? row.cus_gender}</span>}
        </span>
      ),
    },
    {
      key: 'contact',
      label: 'Contacto',
      hideBelow: 'lg',
      render: (row) => (
        <span className="flex flex-col text-sm">
          <span className="tabular">{row.cus_phone}</span>
          <span className="break-all text-muted">{row.cus_email || 'Sin correo'}</span>
        </span>
      ),
    },
    {
      key: 'orders_count',
      label: 'Órdenes',
      render: (row) =>
        row.orders_count > 0 && can('orders:view') ? (
          <Link to={`/orders/search?search=${encodeURIComponent(row.cus_document_number)}`} className="tabular font-semibold text-primary underline-offset-4 hover:underline">
            {row.orders_count} {row.orders_count === 1 ? 'orden' : 'órdenes'}
          </Link>
        ) : (
          <span className="tabular text-muted">{row.orders_count || 'Ninguna'}</span>
        ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <>
          {can('orders:create') && (
            <Button asChild variant="secondary" size="sm" className="max-md:h-11">
              <Link to={`/orders/create?documento=${encodeURIComponent(row.cus_document_number)}`}>Crear orden</Link>
            </Button>
          )}
          {can('customers:update') && (
            <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => setEditing(row)}>
              Editar
            </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <LayoutDashboard title="Pacientes">
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Pacientes del laboratorio"
          description={meta ? `${meta.total} ${meta.total === 1 ? 'paciente' : 'pacientes'}${isFetching && !isLoading ? ' · actualizando…' : ''}` : undefined}
          actions={
            can('customers:create') && (
              <Button onClick={() => setEditing({})}>
                <Icon icon="mdi:account-plus-outline" className="size-5" aria-hidden="true" />
                Registrar paciente
              </Button>
            )
          }
        />
        {isError ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <p className="text-[15px] text-muted">No pudimos cargar los pacientes.</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            getRowKey={(row) => row.cus_id}
            caption="Pacientes del laboratorio"
            searchPlaceholder="Buscar por nombre, documento o correo"
            searchValue={text}
            onSearchChange={setText}
            pageSizes={PAGE_SIZES}
            emptyMessage={search ? `Ningún paciente coincide con “${search}”.` : 'Aún no hay pacientes registrados.'}
            server={{
              page: meta?.page ?? page,
              pageSize: limit,
              total: meta?.total ?? 0,
              onPageChange: (next) => setPageState({ page: next, search }),
              onPageSizeChange: (size) => {
                setLimit(size);
                setPageState({ page: 1, search });
              },
            }}
          />
        )}
      </Panel>

      <PatientFormDialog
        open={editing !== null}
        onClose={closeForm}
        patient={editing?.cus_id ? editing : undefined}
        initialDocument={params.get('documento') ?? undefined}
        onSaved={onSaved}
      />
    </LayoutDashboard>
  );
}
