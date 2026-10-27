import { useState } from 'react';
import { Icon } from '@iconify/react';
import { BrandMark } from '../dashboard/Sidebar';
import { Input } from '@/components/ui/field';
import { cn } from '@/lib/utils';

// gradilla decorativa: un tubo por estado de orden, con distinto nivel de llenado
const TUBES = [
  { cap: 'bg-cap-pend', height: 'h-[200px]', level: 'h-[55%]' },
  { cap: 'bg-cap-proc', height: 'h-[250px]', level: 'h-[70%]' },
  { cap: 'bg-cap-adj', height: 'h-[180px]', level: 'h-[40%]' },
  { cap: 'bg-cap-pdf', height: 'h-[230px]', level: 'h-[62%]' },
  { cap: 'bg-cap-fin', height: 'h-[210px]', level: 'h-[48%]' },
];

/**
 * Estructura de las pantallas de acceso: formulario a la izquierda y, desde portátil,
 * panel con la gradilla de tubos (los colores de los estados de orden)
 */
export default function AuthLayout({ title, description, children }) {
  return (
    <div className="grid min-h-dvh bg-ground lg:grid-cols-2">
      <main className="flex flex-col justify-center px-5 py-10 sm:px-12 lg:px-[min(120px,8vw)]">
        <div className="mx-auto flex w-full max-w-[420px] flex-col gap-8 lg:mx-0">
          <div className="flex items-center gap-3">
            <BrandMark className="size-11" />
            <span className="text-lg font-bold">Laboratorio clínico</span>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] leading-tight font-bold sm:text-[32px]">{title}</h1>
            {description && <p className="text-[17px] text-muted">{description}</p>}
          </div>
          {children}
        </div>
      </main>

      <aside className="relative hidden flex-col justify-end gap-10 overflow-hidden bg-[#34408C] px-20 py-[72px] text-white lg:flex" aria-hidden="true">
        <div className="flex items-end gap-[22px]">
          {TUBES.map((tube, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={cn('h-[22px] w-[52px] rounded-t-[6px] rounded-b-[3px]', tube.cap)} />
              <div className={cn('relative w-10 overflow-hidden rounded-b-[20px] border-2 border-t-0 border-white/55', tube.height)}>
                <div className={cn('absolute inset-x-0 bottom-0 bg-white/20', tube.level)} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex max-w-[460px] flex-col gap-3">
          <p className="text-[28px] leading-snug font-bold">Órdenes, resultados e informes del laboratorio en un solo lugar.</p>
          <p className="text-[17px] text-[#D6DAF0]">Cada color corresponde a un estado de la orden, como las tapas de los tubos que ya conoces.</p>
        </div>
      </aside>
    </div>
  );
}

/**
 * Campo de contraseña con botón para mostrarla u ocultarla
 */
export function PasswordInput({ invalid, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} invalid={invalid} className="h-12 pr-14" {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        className="absolute top-0.5 right-0.5 flex size-11 items-center justify-center rounded-control text-muted hover:text-ink"
      >
        <Icon icon={visible ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Campo de contraseña con etiqueta y error
 */
export function PasswordField({ id, label, error, hint, registration, autoComplete }) {
  const describedBy = [hint && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {label}
      </label>
      <PasswordInput id={id} autoComplete={autoComplete} invalid={Boolean(error)} aria-describedby={describedBy} {...registration} />
      {hint && !error && (
        <span id={`${id}-ayuda`} className="text-sm text-muted">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className="text-sm text-danger-ink">
          {error}
        </span>
      )}
    </div>
  );
}
