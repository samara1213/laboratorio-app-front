
/**
 * Componente de select personalizado y responsivo.
 * Props:
 * - label: Etiqueta del campo
 * - name: Nombre del campo
 * - value: Valor del select
 * - onChange: Handler para el cambio
 * - error: Mensaje de error opcional
 * - className: Clases adicionales opcionales
 * - children: Opciones del select
 * - ...rest: Otros props para el select
 */
export default function MuiSelect({
  label,
  name,
  value,
  onChange,
  error = '',
  className = '',
  children,
  ...rest
}) {
  return (
    <div className={`w-full mb-4 ${className}`}>
      {label && (
        <label className="block text-gray-700 mb-2 font-medium" htmlFor={name}>
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 sm:px-4 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-sm bg-white transition shadow-sm ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#2563eb]'}`}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
    </div>
  );
}
