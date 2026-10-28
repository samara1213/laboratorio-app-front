import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import LayoutDashboard from '../../dashboard/LayoutDashboard';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import UploadTemplateDialog from './UploadTemplateDialog';
import TemplateGuideDialog from './TemplateGuideDialog';
import { usePdfPreview } from './PdfPreview';
import { usePermissions } from '../../../hooks/usePermissions';
import { useLaboratories } from '../../../hooks/queries/useAdmin';
import { useBasePdfTemplate, useDeletePdfTemplate, usePdfTemplates, useTogglePdfTemplate } from '../../../hooks/queries/usePdfTemplates';
import { getPdfTemplateDB, previewPdfTemplateDB, previewPdfTemplateFileDB } from '../../../services';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Field, Select } from '@/components/ui/field';
import { Panel, PanelHeader } from '@/components/ui/panel';
import { errorMessage, formatDateTime } from '@/lib/utils';

// orden en que el backend elige la plantilla de un laboratorio
const RESOLUTION = [
  { title: 'Plantilla del laboratorio', detail: 'La activa del laboratorio de la orden.' },
  { title: 'Plantilla del sistema', detail: 'La activa sin laboratorio, si el laboratorio no tiene una.' },
  { title: 'Plantilla base', detail: 'La incluida en el sistema, si no hay ninguna activa.' },
];

const formatSize = (bytes) => (bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`);

/**
 * Descarga un texto como archivo .html
 */
function downloadHtml(content, name) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const fileName = (name) => `${name.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase() || 'plantilla'}.html`;

/**
 * Plantillas del PDF de resultados (solo super administrador): subir, ver, activar,
 * desactivar, descargar y eliminar. Una activa por laboratorio y una del sistema
 */
export default function PdfTemplatesPage() {
  const { can } = usePermissions();
  const [filter, setFilter] = useState('');
  const { data: laboratories = [] } = useLaboratories();
  const { data: templates = [], isLoading, isError, refetch } = usePdfTemplates(filter || undefined);
  const { data: base } = useBasePdfTemplate();
  const toggle = useTogglePdfTemplate();
  const remove = useDeletePdfTemplate();
  const { open: openPreview, panel: previewPanel } = usePdfPreview();
  const [uploading, setUploading] = useState(false);
  const [guide, setGuide] = useState(false);
  const [toActivate, setToActivate] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const rows = useMemo(
    () =>
      templates.map((tpl) => ({
        ...tpl,
        scope: tpl.laboratory?.lab_name ?? 'Sistema',
        uploaded: formatDateTime(tpl.tpl_created_at),
      })),
    [templates],
  );

  // plantilla que dejaría de usarse al activar otra del mismo alcance
  const replaced = toActivate
    ? templates.find((tpl) => tpl.tpl_active && (tpl.laboratory?.lab_id ?? null) === (toActivate.laboratory?.lab_id ?? null))
    : null;

  const previewSaved = (tpl) => openPreview(`Vista previa · ${tpl.tpl_name}`, () => previewPdfTemplateDB(tpl.tpl_id));

  const previewBase = () =>
    base &&
    openPreview('Vista previa · Plantilla base', () =>
      previewPdfTemplateFileDB(new File([base.tpl_content], 'plantilla-base.html', { type: 'text/html' })),
    );

  const download = async (tpl) => {
    try {
      const response = await getPdfTemplateDB(tpl.tpl_id);
      downloadHtml(response.data.data.tpl_content, fileName(tpl.tpl_name));
    } catch (error) {
      toast.error(errorMessage(error, 'No fue posible descargar la plantilla.'));
    }
  };

  const setActive = (tpl, active) =>
    toggle.mutate(
      { id: tpl.tpl_id, active },
      {
        onSuccess: (response) => toast.success(response.data.message),
        onError: (error) => toast.error(errorMessage(error, 'No fue posible cambiar la plantilla.')),
        onSettled: () => setToActivate(null),
      },
    );

  const confirmDelete = () =>
    remove.mutate(toDelete.tpl_id, {
      onSuccess: (response) => toast.success(response.data.message),
      onError: (error) => toast.error(errorMessage(error, 'No fue posible eliminar la plantilla.')),
      onSettled: () => setToDelete(null),
    });

  const columns = [
    {
      key: 'tpl_name',
      label: 'Plantilla',
      cardTitle: true,
      render: (row) => (
        <span className="flex flex-col">
          <span className="font-semibold">{row.tpl_name}</span>
          {row.tpl_description && <span className="text-sm text-muted">{row.tpl_description}</span>}
        </span>
      ),
    },
    { key: 'scope', label: 'Para', render: (row) => <Badge tone={row.laboratory ? 'info' : 'primary'}>{row.scope}</Badge> },
    {
      key: 'tpl_active',
      label: 'Estado',
      render: (row) => <Badge tone={row.tpl_active ? 'success' : 'neutral'}>{row.tpl_active ? 'En uso' : 'Inactiva'}</Badge>,
    },
    {
      key: 'uploaded',
      label: 'Subida',
      hideBelow: 'lg',
      render: (row) => (
        <span className="flex flex-col text-sm">
          <span className="tabular">{row.uploaded}</span>
          <span className="text-muted">
            {row.created_by ?? '—'} · {formatSize(row.tpl_size)}
          </span>
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <>
          <Button variant="secondary" size="sm" className="max-md:h-11" onClick={() => previewSaved(row)}>
            <Icon icon="mdi:file-eye-outline" className="size-5" aria-hidden="true" />
            Vista previa
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon-sm" aria-label={`Más acciones de ${row.tpl_name}`} className="max-md:size-11 max-md:flex-none">
                <Icon icon="mdi:dots-horizontal" className="size-5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {can('pdf_templates:update') &&
                (row.tpl_active ? (
                  <DropdownMenuItem onSelect={() => setActive(row, false)}>
                    <Icon icon="mdi:pause-circle-outline" aria-hidden="true" />
                    Dejar de usar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={() => setToActivate(row)}>
                    <Icon icon="mdi:check-circle-outline" aria-hidden="true" />
                    Usar en los PDF
                  </DropdownMenuItem>
                ))}
              <DropdownMenuItem onSelect={() => download(row)}>
                <Icon icon="mdi:download-outline" aria-hidden="true" />
                Descargar .html
              </DropdownMenuItem>
              {can('pdf_templates:delete') && !row.tpl_active && (
                <DropdownMenuItem destructive onSelect={() => setToDelete(row)}>
                  <Icon icon="mdi:delete-outline" aria-hidden="true" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ),
    },
  ];

  return (
    <LayoutDashboard title="Plantillas PDF">
      <Panel className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-bold">Qué plantilla usa cada PDF</h2>
          <div className="flex flex-col gap-2 sm:flex-row [&>*]:w-full sm:[&>*]:w-auto">
            <Button variant="secondary" onClick={previewBase} disabled={!base}>
              <Icon icon="mdi:file-eye-outline" className="size-5" aria-hidden="true" />
              Ver plantilla base
            </Button>
            <Button variant="secondary" onClick={() => base && downloadHtml(base.tpl_content, 'plantilla-base.html')} disabled={!base}>
              <Icon icon="mdi:download-outline" className="size-5" aria-hidden="true" />
              Descargar base
            </Button>
            <Button variant="secondary" onClick={() => setGuide(true)}>
              <Icon icon="mdi:book-open-variant-outline" className="size-5" aria-hidden="true" />
              Guía de variables
            </Button>
          </div>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {RESOLUTION.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="tabular flex size-8 shrink-0 items-center justify-center rounded-full bg-tint font-bold text-primary" aria-hidden="true">
                {index + 1}
              </span>
              <span className="flex flex-col">
                <span className="font-semibold">{step.title}</span>
                <span className="text-sm text-muted">{step.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel className="overflow-hidden">
        <PanelHeader
          title="Plantillas"
          description="Cada laboratorio y el sistema tienen como máximo una en uso. Las demás quedan guardadas para volver a ellas."
          actions={
            can('pdf_templates:create') && (
              <Button onClick={() => setUploading(true)}>
                <Icon icon="mdi:upload-outline" className="size-5" aria-hidden="true" />
                Subir plantilla
              </Button>
            )
          }
        />
        <div className="border-b border-border px-4 pb-4 sm:px-5">
          <Field label="Mostrar" className="max-w-md">
            {(field) => (
              <Select {...field} value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="">Todas</option>
                <option value="system">Solo las del sistema</option>
                {laboratories.map((lab) => (
                  <option key={lab.lab_id} value={lab.lab_id}>
                    {lab.lab_name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        {isError ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <p className="text-[15px] text-muted">No pudimos cargar las plantillas.</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            getRowKey={(row) => row.tpl_id}
            caption="Plantillas del PDF de resultados"
            searchPlaceholder="Buscar por nombre o laboratorio"
            emptyMessage="No hay plantillas guardadas: los PDF usan la plantilla base. Sube una para personalizarlos."
          />
        )}
      </Panel>

      <UploadTemplateDialog
        open={uploading}
        onClose={() => setUploading(false)}
        laboratories={laboratories}
        defaultLabId={filter && filter !== 'system' ? filter : ''}
        preview={openPreview}
      />
      <TemplateGuideDialog open={guide} onClose={() => setGuide(false)} helpers={base?.helpers} />
      <ConfirmDialog
        open={Boolean(toActivate)}
        title={`Usar «${toActivate?.tpl_name ?? ''}»`}
        message={
          toActivate?.laboratory
            ? `Los próximos PDF de ${toActivate.laboratory.lab_name} se imprimirán con esta plantilla.${replaced ? ` Reemplaza a «${replaced.tpl_name}».` : ''} Los PDF ya generados no cambian.`
            : `Los próximos PDF de los laboratorios sin plantilla propia se imprimirán con esta plantilla.${replaced ? ` Reemplaza a «${replaced.tpl_name}».` : ''} Los PDF ya generados no cambian.`
        }
        confirmLabel="Usar en los PDF"
        confirmVariant="primary"
        loading={toggle.isPending}
        onConfirm={() => setActive(toActivate, true)}
        onCancel={() => setToActivate(null)}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Eliminar «${toDelete?.tpl_name ?? ''}»`}
        message="La plantilla se borra del sistema. Si la necesitas después, tendrás que subirla de nuevo."
        confirmLabel="Eliminar plantilla"
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
      {previewPanel}
    </LayoutDashboard>
  );
}
