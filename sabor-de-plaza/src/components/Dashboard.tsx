import { TrendChart } from './TrendChart';
import { ProductCard } from './ProductCard';
import { NotificationSection } from './NotificationSection';
import type { ProductAlert } from '../types/productAlert';
import type { Category } from '../types/productAlert';
import { Apple, Wheat, Carrot, Leaf } from 'lucide-react';

const CATEGORY_SECTIONS: { id: Category; title: string; subtitle: string; Icon: typeof Apple }[] = [
  { id: 'FRU', title: 'Frutas', subtitle: 'Frescas y con buen precio', Icon: Apple },
  { id: 'VER', title: 'Verduras', subtitle: 'Para tus ensaladas y guisos', Icon: Leaf },
  { id: 'TUB', title: 'Tubérculos', subtitle: 'Base de tu cocina', Icon: Carrot },
  { id: 'GRN', title: 'Granos', subtitle: 'Aprovecha en almacén', Icon: Wheat },
];

interface DashboardProps {
  products: ProductAlert[];
  onBack?: () => void;
}

function groupByCategory(products: ProductAlert[], limitPerCategory = 4): Map<Category, ProductAlert[]> {
  const grouped = new Map<Category, ProductAlert[]>();
  for (const p of products) {
    const list = grouped.get(p.category) ?? [];
    if (list.length < limitPerCategory) list.push(p);
    grouped.set(p.category, list);
  }
  return grouped;
}

export function Dashboard({ products, onBack }: DashboardProps) {
  const starProduct = products[0];
  const byCategory = groupByCategory(products, 4);

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
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Tendencia – Producto estrella (mayor ahorro)
          </h2>
          <div className="bg-white rounded-xl border border-emerald-600/20 p-4 shadow-sm">
            {starProduct && (
              <TrendChart product={starProduct} />
            )}
          </div>
        </section>

        {/* Oportunidades por categoría */}
        <section className="space-y-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Oportunidades por categoría
          </h2>
          <p className="text-gray-600 text-sm -mt-2 mb-6">
            Top 4 productos con mejor precio en cada sección
          </p>

          {CATEGORY_SECTIONS.map(({ id, title, subtitle, Icon }) => {
            const categoryProducts = byCategory.get(id) ?? [];
            if (categoryProducts.length === 0) return null;

            return (
              <div key={id} className="scroll-mt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <NotificationSection />
      </main>
    </div>
  );
}
