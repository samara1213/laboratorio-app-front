import MuiLoaderCircle from './MuiLoaderCircle';

export default function MuiModalLoader({ text = 'Generando PDF...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10 flex flex-col items-center gap-6 border border-gray-200 w-[90vw] max-w-md min-h-[140px] sm:min-h-[160px] md:min-h-[180px]">
        <MuiLoaderCircle text={text} />
        <div className="text-gray-500 text-xs sm:text-sm text-center mt-2">
          Por favor, espera mientras procesamos tu solicitud.
          <br />
          No cierres ni recargues la página.
        </div>
      </div>
    </div>
  );
}
