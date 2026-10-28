import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GUIDE_LAYOUT, GUIDE_RULES, GUIDE_VARIABLES } from './templateGuide';

const Code = ({ children }) => <code className="rounded bg-ground px-1.5 py-0.5 font-mono text-sm break-words text-ink">{children}</code>;

/**
 * Guía de variables, helpers y formato de las plantillas del PDF
 * @param {{ open: boolean, onClose: () => void, helpers?: string[] }} props
 */
export default function TemplateGuideDialog({ open, onClose, helpers = [] }) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent size="3xl" title="Cómo escribir una plantilla" description="HTML con Handlebars. Descarga la plantilla base y úsala como punto de partida.">
        <div className="flex flex-col gap-7 text-[15px] leading-relaxed">
          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-bold">Datos disponibles</h3>
            {GUIDE_VARIABLES.map((group) => (
              <div key={group.title} className="flex flex-col gap-2">
                <p className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold">{group.title}</span>
                  <Code>{group.path}</Code>
                </p>
                <dl className="grid gap-x-4 gap-y-1.5 border-l-2 border-border pl-3 sm:grid-cols-[minmax(10rem,auto)_1fr]">
                  {group.fields.map(([name, description]) => (
                    <div key={name} className="contents">
                      <dt>
                        <Code>{name}</Code>
                      </dt>
                      <dd className="pb-1 text-muted sm:pb-0">{description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-bold">Formato de la página</h3>
            <dl className="flex flex-col gap-2.5">
              {GUIDE_LAYOUT.map(([syntax, description]) => (
                <div key={syntax} className="flex flex-col gap-1">
                  <dt>
                    <Code>{syntax}</Code>
                  </dt>
                  <dd className="text-muted">{description}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-bold">Helpers</h3>
            <p className="text-muted">
              Bloques <Code>{'{{#if}}'}</Code>, <Code>{'{{#unless}}'}</Code>, <Code>{'{{#each}}'}</Code>, <Code>{'{{#with}}'}</Code> y estas funciones:
            </p>
            <p className="flex flex-wrap gap-1.5">
              {helpers
                .filter((h) => !['if', 'unless', 'each', 'with'].includes(h))
                .map((helper) => (
                  <Code key={helper}>{helper}</Code>
                ))}
            </p>
            <p className="text-muted">
              Ejemplo: <Code>{'{{#if (eq paciente.genero "FEMENINO")}}…{{/if}}'}</Code> · <Code>{'{{default paciente.telefono "—"}}'}</Code>
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-lg font-bold">Reglas</h3>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted">
              {GUIDE_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
