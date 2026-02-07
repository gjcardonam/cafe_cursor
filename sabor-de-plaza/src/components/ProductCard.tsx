import { Leaf, Carrot, Apple, Wheat } from 'lucide-react';
import type { ProductAlert } from '../types/productAlert';

const CATEGORY_ICONS = {
  FRU: Apple,
  GRN: Wheat,
  TUB: Carrot,
  VER: Leaf,
};

function formatCop(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function Badge({ savings }: { savings: number }) {
  if (savings > 15) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
        De Temporada 🌟
      </span>
    );
  }
  if (savings > 5) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
        Precio Justo ✅
      </span>
    );
  }
  return null;
}

interface ProductCardProps {
  product: ProductAlert;
}

export function ProductCard({ product }: ProductCardProps) {
  const Icon = CATEGORY_ICONS[product.category];
  return (
    <article className="rounded-xl border-2 border-emerald-600/20 bg-white p-4 shadow-sm hover:shadow-md hover:border-emerald-600/40 transition-all duration-300">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
        </div>
        <Badge savings={product.savingsPercentage} />
      </div>
      <p className="text-sm text-gray-500 mb-2">{product.market}</p>
      <p className="text-xl font-bold text-emerald-600">
        {formatCop(product.currentPrice)}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Ahorro {product.savingsPercentage}% vs promedio 90 días
      </p>
    </article>
  );
}
