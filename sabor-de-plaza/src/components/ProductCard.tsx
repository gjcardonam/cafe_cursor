import { Leaf, Carrot, Apple, Wheat } from 'lucide-react';
import type { ProductAlert } from '../types/productAlert';
import { getProductImage } from '../constants/images';

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
  const imageUrl = getProductImage(product.name, product.category);

  return (
    <article className="rounded-2xl overflow-hidden border border-emerald-200/60 bg-white shadow-sm hover:shadow-lg hover:border-fresh-leaf/50 transition-all duration-300">
      <div className="relative h-32 sm:h-36 bg-fresh-mint">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <Badge savings={product.savingsPercentage} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-fresh-mint text-fresh-forest">
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-2">{product.market}</p>
        <p className="text-xl font-bold text-fresh-forest">
          {formatCop(product.currentPrice)}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Ahorro {product.savingsPercentage}% vs promedio 90 días
        </p>
      </div>
    </article>
  );
}
