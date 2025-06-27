/**
 * Componente de input personalizado y reutilizable.
 * Props:
 * - label: Etiqueta del campo
 * - type: Tipo de input (text, password, email, etc)
 * - name: Nombre del campo
 * - value: Valor del input
 * - onChange: Handler para el cambio
 * - placeholder: Placeholder opcional
 * - error: Mensaje de error opcional
 * - className: Clases adicionales opcionales
 * - ...rest: Otros props para el input
 */
export default function MuiInput({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  error = '',
  className = '',
  ...rest
}) {
  return (
    <div className={`w-full mb-4 ${className}`}>
      {label && (
        <label className="block text-gray-700 mb-2 font-medium" htmlFor={name}>
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 sm:px-4 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#29313B] text-sm bg-white transition shadow-sm ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#29313B]'}`}
        {...rest}
      />
      {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
    </div>
  );
}
