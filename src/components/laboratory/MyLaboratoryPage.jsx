import { Icon } from '@iconify/react';
import LayoutDashboard from '../dashboard/LayoutDashboard';
import LogoField from './LogoField';
import { useMyLaboratory } from '../../hooks/queries/useLaboratoryProfile';
import { usePermissions } from '../../hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Panel, PanelHeader, Skeleton } from '@/components/ui/panel';

/**
 * "Mi laboratorio": datos del laboratorio que salen en el PDF y su logo
 */
export default function MyLaboratoryPage() {
  const { can } = usePermissions();
  const { data: lab, isLoading, isError, refetch } = useMyLaboratory();

  const rows = lab
    ? [
        ['NIT', lab.lab_dv ? `${lab.lab_nit}-${lab.lab_dv}` : lab.lab_nit],
        ['Representante legal', lab.lab_legal_representative],
        ['Correo', lab.lab_email],
        ['Teléfono', lab.lab_phone],
        ['Dirección', lab.lab_address],
      ]
    : [];

  return (
    <LayoutDashboard title="Mi laboratorio">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        <Panel>
          <PanelHeader title={lab?.lab_name ?? 'Datos del laboratorio'} description="Así aparece en el PDF de resultados." />
          <div className="p-4 sm:p-5">
            {isError ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-[15px] text-muted">No pudimos cargar los datos del laboratorio.</p>
                <Button variant="secondary" onClick={() => refetch()}>
                  Reintentar
                </Button>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <>
                <dl className="flex flex-col divide-y divide-border">
                  {rows.map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-0.5 py-2.5 first:pt-0 sm:flex-row sm:gap-4">
                      <dt className="text-sm text-muted sm:w-44 sm:shrink-0">{label}</dt>
                      <dd className="break-words text-[15px]">{value || '—'}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 flex items-start gap-2 text-sm text-muted">
                  <Icon icon="mdi:information-outline" className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  Para corregir estos datos, pídeselo al administrador del sistema.
                </p>
              </>
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Logo" />
          <div className="p-4 sm:p-5">
            <LogoField name={lab?.lab_name} canEdit={can('laboratory_profile:update')} />
          </div>
        </Panel>
      </div>
    </LayoutDashboard>
  );
}
