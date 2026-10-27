import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import { useAuthStore } from '../../../hooks/authStore';
import { usePermissions } from '../../../hooks/usePermissions';
import { useOrderResults, useSaveResults } from '../../../hooks/queries/useResults';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/field';
import { Panel, Skeleton } from '@/components/ui/panel';
import { StatusChip } from '@/components/ui/status';
import { cn, errorMessage, formatDateTime } from '@/lib/utils';

// los parámetros cuyo nombre empieza con "*" son títulos de sección (como en el PDF)
const isTitle = (param) => param.par_name?.startsWith('*');

/**
 * Texto de referencia del parámetro: los rangos por hombre/mujer/niño o el valor de referencia
 */
function referenceText(param) {
  if (!param.par_range) return param.par_reference_value || '';
  const range = (min, max) => (min || max ? `${min ?? ''}–${max ?? ''}` : null);
  return [
    ['Hombres', range(param.par_min_man, param.par_max_man)],
    ['Mujeres', range(param.par_min_woman, param.par_max_woman)],
    ['Niños', range(param.par_min_child, param.par_max_child)],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label} ${value}`)
    .join(' · ');
}

function ageOf(birthdate) {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) years--;
  return years;
}

/**
 * Estado editable a partir de la orden: valor y referencia por parámetro, observación por examen.
 * Un parámetro sin resultado arranca con su valor por defecto
 */
function initialState(order) {
  const values = {};
  const references = {};
  const observations = {};
  for (const exam of order?.exams ?? []) {
    for (const param of exam.parameters ?? []) {
      if (isTitle(param)) continue;
      values[param.par_id] = param.result ?? param.par_default_value ?? '';
      references[param.par_id] = param.reference ?? '';
    }
    observations[exam.exa_id] = (exam.parameters ?? []).find((p) => p.observation)?.observation ?? '';
  }
  return { values, references, observations };
}

/**
 * Registrar y corregir los resultados de una orden. Todo se guarda de una vez
 * (POST /results/batch); quien guarda un cambio en un examen pasa a firmarlo en el PDF
 */
export default function ResultsCapturePage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { can } = usePermissions();
  const { data: order, isLoading, isError, refetch } = useOrderResults(orderId);
  const saveResults = useSaveResults();

  const initial = useMemo(() => initialState(order), [order]);
  const [values, setValues] = useState({});
  const [references, setReferences] = useState({});
  const [observations, setObservations] = useState({});
  const [openExam, setOpenExam] = useState(null);
  const [editingReference, setEditingReference] = useState({});

  useEffect(() => {
    setValues(initial.values);
    setReferences(initial.references);
    setObservations(initial.observations);
  }, [initial]);

  const exams = useMemo(
    () =>
      (order?.exams ?? []).map((exam) => {
        const params = [...(exam.parameters ?? [])].sort((a, b) => (a.par_order ?? 0) - (b.par_order ?? 0));
        const fields = params.filter((p) => !isTitle(p));
        const filled = fields.filter((p) => String(values[p.par_id] ?? '').trim() !== '').length;
        return { ...exam, params, fields, filled };
      }),
    [order, values],
  );

  // abre el primer examen incompleto al cargar
  useEffect(() => {
    if (openExam === null && exams.length) setOpenExam((exams.find((e) => e.filled < e.fields.length) ?? exams[0]).exa_id);
  }, [exams, openExam]);

  // pendientes: lo editado y los valores (también los por defecto) que aún no se han guardado
  const changes = useMemo(() => {
    let count = 0;
    for (const exam of exams) {
      for (const param of exam.fields) {
        const id = param.par_id;
        const unsaved = !param.id_result && String(values[id] ?? '').trim() !== '';
        if (unsaved || values[id] !== initial.values[id] || references[id] !== initial.references[id]) count++;
      }
      if (observations[exam.exa_id] !== initial.observations[exam.exa_id]) count++;
    }
    return count;
  }, [exams, values, references, observations, initial]);

  // aviso al cerrar la pestaña con cambios sin guardar
  useEffect(() => {
    if (!changes) return undefined;
    const warn = (event) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [changes]);

  const completeExams = exams.filter((e) => e.fields.length > 0 && e.filled === e.fields.length).length;
  const patient = order?.customer;
  const age = ageOf(patient?.cus_birthdate);

  const onSave = () => {
    const results = exams.flatMap((exam) =>
      exam.fields
        // se envía lo que tiene valor o ya tenía resultado (para actualizar observación o referencia)
        .filter((param) => String(values[param.par_id] ?? '').trim() !== '' || param.id_result)
        .map((param) => ({
          exam: exam.exa_id,
          param: param.par_id,
          res_value: String(values[param.par_id] ?? '').trim(),
          res_observation: observations[exam.exa_id]?.trim() || undefined,
          res_reference: references[param.par_id]?.trim() || undefined,
        })),
    );
    if (!results.length) return toast.error('Escribe al menos un resultado.');

    saveResults.mutate(
      { order: orderId, results },
      {
        onSuccess: (response) => {
          toast.success(response.data.message);
          if (response.data.warning) {
            toast.warning(response.data.warning, { duration: 10000, action: { label: 'Mi perfil', onClick: () => navigate('/profile') } });
          }
        },
        onError: (error) => toast.error(errorMessage(error, 'No fue posible guardar los resultados. No se guardó ninguno: intenta de nuevo.')),
      },
    );
  };

  if (isError) {
    return (
      <LayoutDashboard title="Resultados">
        <Panel className="flex flex-col items-start gap-4 p-6">
          <p className="text-[15px]">No pudimos cargar la orden. Puede que no exista o que sea de otro laboratorio.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
            <Link to="/dashboard" className={buttonVariants({ variant: 'ghost' })}>
              Ir al inicio
            </Link>
          </div>
        </Panel>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard title={order ? `Resultados · orden ${order.ord_code}` : 'Resultados'}>
      {isLoading || !order ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : (
        <>
          <Panel className="flex flex-col gap-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col">
                <span className="text-lg font-bold">
                  {[patient?.cus_first_name, patient?.cus_second_name, patient?.cus_first_lastname, patient?.cus_second_lastname].filter(Boolean).join(' ')}
                </span>
                <span className="tabular text-[15px] text-muted">
                  {patient?.cus_document_number}
                  {age !== null && ` · ${age} años`}
                  {patient?.cus_gender && ` · ${patient.cus_gender === 'F' ? 'Mujer' : patient.cus_gender === 'M' ? 'Hombre' : patient.cus_gender}`}
                </span>
                <span className="tabular text-sm text-muted">Ingreso {formatDateTime(order.ord_created_at)}</span>
              </div>
              <StatusChip status={order.ord_status} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">
                {completeExams} de {exams.length} {exams.length === 1 ? 'examen completo' : 'exámenes completos'}
              </span>
              <div className="h-2 w-full overflow-hidden rounded-full bg-ground" aria-hidden="true">
                <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${exams.length ? (completeExams / exams.length) * 100 : 0}%` }} />
              </div>
            </div>
          </Panel>

          {!user?.has_signature && (
            <div role="note" className="flex flex-col gap-2 rounded-panel border border-cap-pend bg-chip-pend p-4 text-chip-pend-ink sm:flex-row sm:items-center">
              <Icon icon="mdi:draw-pen" className="size-6 shrink-0" aria-hidden="true" />
              <p className="flex-1 text-[15px]">Aún no tienes firma cargada: puedes guardar, pero los exámenes que firmes saldrán sin ella en el PDF.</p>
              <Link to="/profile" className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'max-md:h-11' })}>
                Cargar firma
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-3 pb-24">
            {exams.map((exam) => {
              const open = openExam === exam.exa_id;
              const complete = exam.fields.length > 0 && exam.filled === exam.fields.length;
              return (
                <Panel key={exam.exa_id} className="overflow-hidden">
                  <h2>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`examen-${exam.exa_id}`}
                      onClick={() => setOpenExam(open ? '' : exam.exa_id)}
                      className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left hover:bg-ground sm:px-5"
                    >
                      <Icon icon={open ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="size-6 shrink-0 text-muted" aria-hidden="true" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="font-bold">{exam.exa_name}</span>
                        {exam.signer && (
                          <span className="text-sm text-muted">
                            Firma: {exam.signer.nombre}
                            {exam.signer.cargo && ` · ${exam.signer.cargo}`}
                            {!exam.signer.has_signature && ' (sin firma cargada)'}
                          </span>
                        )}
                      </span>
                      <Badge tone={complete ? 'success' : exam.filled ? 'warning' : 'neutral'}>
                        {complete ? 'Completo' : `${exam.filled} de ${exam.fields.length}`}
                      </Badge>
                    </button>
                  </h2>

                  {open && (
                    <div id={`examen-${exam.exa_id}`} className="flex flex-col gap-1 border-t border-border px-4 py-4 sm:px-5">
                      {exam.params.map((param) =>
                        isTitle(param) ? (
                          <h3 key={param.par_id} className="pt-3 text-sm font-bold text-muted">
                            {param.par_name.slice(1)}
                          </h3>
                        ) : (
                          <div key={param.par_id} className="grid grid-cols-1 gap-x-4 gap-y-1.5 border-b border-border py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-center">
                            <div className="flex min-w-0 flex-col">
                              <label htmlFor={`valor-${param.par_id}`} className="font-semibold">
                                {param.par_name}
                              </label>
                              <span className="text-sm text-muted">
                                {references[param.par_id] ? `Referencia de esta orden: ${references[param.par_id]}` : referenceText(param) || 'Sin referencia'}
                              </span>
                              {editingReference[param.par_id] ? (
                                <Input
                                  aria-label={`Referencia de ${param.par_name} para esta orden`}
                                  placeholder="Referencia para esta orden"
                                  value={references[param.par_id] ?? ''}
                                  onChange={(e) => setReferences((prev) => ({ ...prev, [param.par_id]: e.target.value }))}
                                  className="mt-1.5 max-w-sm"
                                  maxLength={200}
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setEditingReference((prev) => ({ ...prev, [param.par_id]: true }))}
                                  className="min-h-11 self-start text-sm font-semibold text-primary hover:underline sm:min-h-0"
                                >
                                  Cambiar referencia
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                id={`valor-${param.par_id}`}
                                inputMode={param.par_range ? 'decimal' : 'text'}
                                autoComplete="off"
                                maxLength={500}
                                value={values[param.par_id] ?? ''}
                                onChange={(e) => setValues((prev) => ({ ...prev, [param.par_id]: e.target.value }))}
                                className={cn('tabular', values[param.par_id] !== initial.values[param.par_id] && 'border-primary')}
                              />
                              {param.par_unit_extent && <span className="w-16 shrink-0 text-sm text-muted">{param.par_unit_extent}</span>}
                            </div>
                          </div>
                        ),
                      )}
                      <label htmlFor={`obs-${exam.exa_id}`} className="pt-3 font-semibold">
                        Observaciones del examen
                      </label>
                      <Textarea
                        id={`obs-${exam.exa_id}`}
                        rows={2}
                        maxLength={1000}
                        value={observations[exam.exa_id] ?? ''}
                        onChange={(e) => setObservations((prev) => ({ ...prev, [exam.exa_id]: e.target.value }))}
                      />
                    </div>
                  )}
                </Panel>
              );
            })}
          </div>

          {/* guardar siempre a mano, también con el teclado del celular abierto */}
          <div className="sticky bottom-0 z-10 -mx-4 mt-auto flex items-center gap-3 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <span className="min-w-0 flex-1 text-sm text-muted sm:text-[15px]" aria-live="polite">
              {changes ? `${changes} ${changes === 1 ? 'cambio sin guardar' : 'cambios sin guardar'}` : 'Sin cambios pendientes'}
            </span>
            <Button size="lg" onClick={onSave} disabled={!changes || saveResults.isPending || !(can('results:create') || can('results:update'))}>
              <Icon icon="mdi:content-save-outline" className="size-5" aria-hidden="true" />
              {saveResults.isPending ? 'Guardando…' : 'Guardar resultados'}
            </Button>
          </div>
        </>
      )}
    </LayoutDashboard>
  );
}
