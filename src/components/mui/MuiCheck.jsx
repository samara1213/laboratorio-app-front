/**
 * MuiCheck: Checkbox personalizado y accesible
 * Props:
 * - label: Texto a mostrar junto al checkbox
 * - name: Nombre del campo
 * - checked: Valor booleano controlado (opcional)
 * - onChange: Handler de cambio (opcional)
 * - error: Mensaje de error (opcional)
 * - className: Clases adicionales (opcional)
 * - ...rest: Otros props para el input
 */
export default function MuiCheck({
  label,
  name,
  checked,
  onChange,
  error = '',
  className = '',
  ...rest
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor={name} className="relative flex items-center cursor-pointer select-none group">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          className="peer appearance-none w-6 h-6 border-2 border-green-400 rounded-lg bg-gradient-to-br from-green-100 to-lime-200 shadow-inner checked:bg-gradient-to-br checked:from-green-500 checked:to-lime-500 checked:border-green-700 transition-all duration-200 focus:ring-2 focus:ring-green-300 focus:outline-none"
          {...rest}
        />
        <span className="absolute left-0 top-0 w-6 h-6 flex items-center justify-center pointer-events-none">
          <svg className="w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 drop-shadow group-hover:scale-110" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" className="text-lime-200 peer-checked:text-green-500 transition-colors duration-200" />
            <path d="M6 10l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </label>
      <label htmlFor={name} className="text-green-800 font-semibold cursor-pointer select-none group-hover:text-green-600 transition-colors duration-200">
        {label}
      </label>
      {error && <span className="ml-2 text-xs text-red-500">{error}</span>}
    </div>
  );
}
