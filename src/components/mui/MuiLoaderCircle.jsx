import React from 'react';

export default function MuiLoaderCircle({ text = 'Generando PDF...' }) {
  return (
    <span className="flex items-center gap-3 ml-2">
      <span className="inline-block w-7 h-7 sm:w-8 sm:h-8">
        <span className="block w-full h-full rounded-full border-4 border-blue-500 border-t-transparent animate-spin shadow-md"></span>
      </span>
      <span className="text-sm sm:text-base font-semibold text-blue-700 animate-pulse drop-shadow">{text}</span>
    </span>
  );
}
