export default function CardWithTitle({ title, loading, loadingText = 'Cargando...', children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl sm:text-2xl font-extrabold mb-4 text-[#1d4ed8] tracking-tight flex items-center gap-2">
        <span className="inline-block w-2 h-7 bg-gradient-to-b from-[#38bdf8] to-[#6366f1] rounded-full mr-1 shadow-md"></span>
        {title}
      </h2>
      {loading ? (
        <div className="text-center text-gray-500 py-10">{loadingText}</div>
      ) : (
        children
      )}
    </div>
  );
}
