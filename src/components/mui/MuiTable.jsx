import { DataTable } from '@/components/ui/data-table';

/**
 * Tabla reutilizable y responsive (envoltura de DataTable para las pantallas existentes).
 * Props:
 * - columns: [{ key, label, render?, hideBelow?, cardTitle? }]
 * - data: filas
 * - loading: muestra esqueletos mientras carga
 * - className: clases adicionales
 */
export default function MuiTable({ columns = [], data = [], loading = false, className = '', ...rest }) {
  return <DataTable columns={columns} data={data} loading={loading} className={className} {...rest} />;
}
