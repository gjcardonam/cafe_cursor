export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Criterios de precios
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex flex-wrap items-baseline gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
              De temporada
            </span>
            <span>
              El precio actual está más de un <strong>15%</strong> por debajo del promedio de los últimos 90 días. Son los mejores momentos para comprar.
            </span>
          </li>
          <li className="flex flex-wrap items-baseline gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
              Precio justo
            </span>
            <span>
              El precio actual está entre un <strong>5% y 15%</strong> por debajo del promedio de 90 días. Buena oportunidad de ahorro.
            </span>
          </li>
        </ul>
        <p className="mt-4 text-xs text-gray-400">
          Datos referidos a Central Mayorista de Antioquia, Plaza Minorista José María Villa y Placita de Flórez (Medellín).
        </p>
      </div>
    </footer>
  );
}
