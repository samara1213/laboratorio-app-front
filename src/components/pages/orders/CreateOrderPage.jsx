import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import { createOrderDB, searchCustomerByDocumentDB } from '../../../services';
import { usePermissions } from '../../../hooks/usePermissions';
import { useExams } from '../../../hooks/queries/useCatalog';
import { orderKeys } from '../../../hooks/queries/useOrders';
import { Button, buttonVariants } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Panel, PanelHeader, Skeleton } from '@/components/ui/panel';
import { cn, errorMessage } from '@/lib/utils';

const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 2 });

function ageOf(birthdate) {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) years--;
  return years;
}

/**
 * Crear una orden en tres pasos: paciente, exámenes y resumen con descuento y total.
 * En escritorio el resumen queda fijo a la derecha; en celular y tablet va abajo, con
 * el total y el botón de crear siempre a la vista
 */
export default function CreateOrderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const { data: exams = [], isLoading: loadingExams } = useExams();

  const [doc, setDoc] = useState('');
  const [searching, setSearching] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [examSearch, setExamSearch] = useState('');
  const [items, setItems] = useState([]); // [{ exa_id, exa_name, exa_price, quantity }]
  const [discount, setDiscount] = useState('0');

  const createOrder = useMutation({
    mutationFn: (data) => createOrderDB(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });

  const totals = useMemo(() => {
    const percent = Math.min(100, Math.max(0, Number(discount) || 0));
    const subtotal = items.reduce((sum, item) => sum + Number(item.exa_price || 0) * item.quantity, 0);
    const discountValue = Math.round(subtotal * percent) / 100;
    return { percent, subtotal, discountValue, total: subtotal - discountValue };
  }, [items, discount]);

  const filteredExams = useMemo(() => {
    const term = examSearch.trim().toLowerCase();
    const list = term ? exams.filter((e) => `${e.exa_name} ${e.exa_description ?? ''}`.toLowerCase().includes(term)) : exams;
    return list.slice(0, 50);
  }, [exams, examSearch]);

  const onSearch = async (event) => {
    event.preventDefault();
    if (!doc.trim()) return;
    setSearching(true);
    setNotFound(false);
    try {
      const response = await searchCustomerByDocumentDB({ cus_document_number: doc.trim() });
      if (response.data?.data) setCustomer(response.data.data);
      else setNotFound(true);
    } catch (error) {
      if (error?.response?.status === 404 || error?.response?.status === 400) setNotFound(true);
      else toast.error(errorMessage(error, 'No fue posible buscar el paciente.'));
    } finally {
      setSearching(false);
    }
  };

  const toggleExam = (exam) =>
    setItems((prev) =>
      prev.some((i) => i.exa_id === exam.exa_id)
        ? prev.filter((i) => i.exa_id !== exam.exa_id)
        : [...prev, { exa_id: exam.exa_id, exa_name: exam.exa_name, exa_price: Number(exam.exa_price) || 0, quantity: 1 }],
    );

  const changeQuantity = (exa_id, delta) =>
    setItems((prev) => prev.map((i) => (i.exa_id === exa_id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)));

  const reset = () => {
    setCustomer(null);
    setDoc('');
    setItems([]);
    setDiscount('0');
    setExamSearch('');
    setNotFound(false);
  };

  const onCreate = () => {
    if (!customer || !items.length) return;
    createOrder.mutate(
      {
        cus_id: customer.cus_id,
        exa_ids: items.map((i) => i.exa_id),
        ord_discount_percentage: totals.percent,
        ord_discount_value: totals.discountValue,
        ord_total_value: totals.total,
        ord_status: 'PENDIENTE',
      },
      {
        onSuccess: (response) => {
          toast.success(response?.data?.message || 'Orden creada', { action: { label: 'Ver en inicio', onClick: () => navigate('/dashboard') } });
          reset();
        },
        onError: (error) => toast.error(errorMessage(error, 'No fue posible crear la orden.')),
      },
    );
  };

  const fullName = customer
    ? [customer.cus_first_name, customer.cus_second_name, customer.cus_first_lastname, customer.cus_second_lastname].filter(Boolean).join(' ')
    : '';
  const age = ageOf(customer?.cus_birthdate);
  const canCreate = Boolean(customer) && items.length > 0 && !createOrder.isPending;

  return (
    <LayoutDashboard title="Crear orden">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="flex min-w-0 flex-col gap-5">
          {/* 1. paciente */}
          <Panel>
            <PanelHeader title="1. Paciente" description={customer ? undefined : 'Busca al paciente por su número de documento.'} />
            <div className="p-4 sm:p-5">
              {customer ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-col">
                    <span className="text-lg font-bold">{fullName}</span>
                    <span className="tabular text-[15px] text-muted">
                      {customer.cus_document_type} {customer.cus_document_number}
                      {age !== null && ` · ${age} años`}
                    </span>
                    <span className="text-sm break-all text-muted">{[customer.cus_phone, customer.cus_email].filter(Boolean).join(' · ')}</span>
                  </div>
                  <Button variant="secondary" onClick={reset}>
                    Cambiar paciente
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <Field label="Documento" className="sm:max-w-xs">
                    {(field) => (
                      <Input inputMode="numeric" autoComplete="off" autoFocus value={doc} onChange={(e) => setDoc(e.target.value)} maxLength={15} {...field} />
                    )}
                  </Field>
                  <Button type="submit" disabled={searching || !doc.trim()}>
                    <Icon icon="mdi:magnify" className="size-5" aria-hidden="true" />
                    {searching ? 'Buscando…' : 'Buscar'}
                  </Button>
                </form>
              )}
              {notFound && !customer && (
                <div role="status" className="mt-4 flex flex-col gap-3 rounded-panel border border-border bg-ground p-4 sm:flex-row sm:items-center">
                  <p className="flex-1 text-[15px]">No hay un paciente con el documento {doc}.</p>
                  {can('customers:create') && (
                    <Link to="/customers/create" className={buttonVariants({ variant: 'secondary' })}>
                      <Icon icon="mdi:account-plus-outline" className="size-5" aria-hidden="true" />
                      Registrar paciente
                    </Link>
                  )}
                </div>
              )}
            </div>
          </Panel>

          {/* 2. exámenes */}
          <Panel className={cn(!customer && 'opacity-60')} aria-disabled={!customer}>
            <PanelHeader title="2. Exámenes" description={customer ? 'Toca un examen para agregarlo o quitarlo.' : 'Primero elige el paciente.'} />
            {customer && (
              <div className="flex flex-col gap-3 p-4 sm:p-5">
                <div className="relative">
                  <Icon icon="mdi:magnify" className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <Input
                    type="search"
                    aria-label="Buscar examen"
                    placeholder="Buscar examen"
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                    className="pl-11"
                  />
                </div>
                {loadingExams ? (
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : filteredExams.length === 0 ? (
                  <p className="py-4 text-[15px] text-muted">{exams.length ? 'Ningún examen coincide con la búsqueda.' : 'El laboratorio no tiene exámenes registrados.'}</p>
                ) : (
                  <ul className="flex max-h-[28rem] flex-col overflow-y-auto rounded-panel border border-border" aria-label="Exámenes disponibles">
                    {filteredExams.map((exam) => {
                      const selected = items.some((i) => i.exa_id === exam.exa_id);
                      return (
                        <li key={exam.exa_id} className="border-b border-border last:border-b-0">
                          <button
                            type="button"
                            aria-pressed={selected}
                            onClick={() => toggleExam(exam)}
                            className={cn('flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-ground', selected && 'bg-tint hover:bg-tint')}
                          >
                            <Icon
                              icon={selected ? 'mdi:check-circle' : 'mdi:plus-circle-outline'}
                              className={cn('size-6 shrink-0', selected ? 'text-primary' : 'text-muted')}
                              aria-hidden="true"
                            />
                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="font-semibold">{exam.exa_name}</span>
                              {exam.exa_description && <span className="truncate text-sm text-muted">{exam.exa_description}</span>}
                            </span>
                            <span className="tabular shrink-0 font-semibold">{money.format(Number(exam.exa_price) || 0)}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </Panel>
        </div>

        {/* 3. resumen */}
        <Panel className="lg:sticky lg:top-24">
          <PanelHeader title="3. Resumen" />
          <div className="flex flex-col gap-4 p-4 sm:p-5">
            {items.length === 0 ? (
              <p className="text-[15px] text-muted">Aún no hay exámenes en la orden.</p>
            ) : (
              <ul className="flex flex-col gap-3" aria-label="Exámenes de la orden">
                {items.map((item) => (
                  <li key={item.exa_id} className="flex flex-col gap-2 border-b border-border pb-3 last:border-b-0">
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-semibold">{item.exa_name}</span>
                      <button
                        type="button"
                        onClick={() => toggleExam(item)}
                        aria-label={`Quitar ${item.exa_name}`}
                        className="-m-2 inline-flex size-11 shrink-0 items-center justify-center rounded-control text-muted hover:bg-ground hover:text-danger-ink"
                      >
                        <Icon icon="mdi:close" className="size-5" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1" role="group" aria-label={`Cantidad de ${item.exa_name}`}>
                        <Button variant="secondary" size="icon-sm" className="max-md:size-11" onClick={() => changeQuantity(item.exa_id, -1)} disabled={item.quantity <= 1} aria-label="Disminuir cantidad">
                          <Icon icon="mdi:minus" className="size-5" aria-hidden="true" />
                        </Button>
                        <span className="tabular w-8 text-center font-semibold" aria-live="polite">
                          {item.quantity}
                        </span>
                        <Button variant="secondary" size="icon-sm" className="max-md:size-11" onClick={() => changeQuantity(item.exa_id, 1)} aria-label="Aumentar cantidad">
                          <Icon icon="mdi:plus" className="size-5" aria-hidden="true" />
                        </Button>
                      </div>
                      <span className="tabular font-semibold">{money.format(item.exa_price * item.quantity)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <dl className="flex flex-col gap-2 border-t border-border pt-4 text-[15px]">
              <div className="flex items-center justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular">{money.format(totals.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>
                  <label htmlFor="descuento" className="text-muted">
                    Descuento (%)
                  </label>
                </dt>
                <dd className="flex items-center gap-2">
                  <Input
                    id="descuento"
                    inputMode="numeric"
                    value={discount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (/^\d{0,3}$/.test(value) && Number(value) <= 100)) setDiscount(value);
                    }}
                    onBlur={() => discount === '' && setDiscount('0')}
                    className="tabular w-20 text-right"
                  />
                </dd>
              </div>
              {totals.discountValue > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted">Valor del descuento</dt>
                  <dd className="tabular">−{money.format(totals.discountValue)}</dd>
                </div>
              )}
            </dl>

            {/* en celular y tablet el total y el botón quedan fijos abajo */}
            <div className="sticky bottom-0 -mx-4 -mb-4 flex items-center gap-3 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:-mb-5 sm:px-5 lg:static lg:m-0 lg:flex-col lg:items-stretch lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <div className="flex min-w-0 flex-1 flex-col lg:flex-row lg:items-baseline lg:justify-between">
                <span className="text-sm text-muted lg:text-[15px] lg:font-semibold lg:text-ink">Total a pagar</span>
                <span className="tabular text-xl font-bold lg:text-2xl">{money.format(totals.total)}</span>
              </div>
              <Button size="lg" onClick={onCreate} disabled={!canCreate}>
                {createOrder.isPending ? 'Creando…' : 'Crear orden'}
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </LayoutDashboard>
  );
}
