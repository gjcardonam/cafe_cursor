import { TrendChart } from './TrendChart';
import { ProductCard } from './ProductCard';
import type { ProductAlert } from '../types/productAlert';

interface DashboardProps {
  products: ProductAlert[];
  onBack?: () => void;
}

export function Dashboard({ products, onBack }: DashboardProps) {
  const starProduct = products[0];
  const gridProducts = products.slice(0, 16);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-emerald-600/20 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-emerald-600">Sabor de Plaza</h1>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Volver
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Gráfico de tendencia - Producto estrella */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Tendencia – Producto estrella (mayor ahorro)
          </h2>
          <div className="bg-white rounded-xl border border-emerald-600/20 p-4 shadow-sm">
            {starProduct && (
              <TrendChart product={starProduct} />
            )}
          </div>
        </section>

        {/* Grid de oportunidades - 16 elegidos */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Oportunidades (Top 4 por categoría)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gridProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
