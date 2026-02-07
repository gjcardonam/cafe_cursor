import { useMemo } from 'react';
import type { ProductAlert } from '../types/productAlert';

const CATEGORIES: ProductAlert['category'][] = ['FRU', 'GRN', 'TUB', 'VER'];
const MARKETS = [
  'Central Mayorista de Antioquia',
  'Plaza Minorista José María Villa',
  'Placita de Flórez',
];

const PRODUCTS_BY_CATEGORY: Record<ProductAlert['category'], string[]> = {
  FRU: ['Mango', 'Lulo', 'Mora', 'Maracuyá', 'Aguacate Hass', 'Banano', 'Papaya', 'Piña'],
  GRN: ['Frijol Cargamanto', 'Arroz', 'Lenteja', 'Garbanzo', 'Maíz', 'Trigo', 'Café', 'Cacao'],
  TUB: ['Papa Capira', 'Yuca', 'Plátano Hartón', 'Ñame', 'Papa Criolla', 'Batata', 'Malanga', 'Otoy'],
  VER: ['Tomate Chonto', 'Cebolla', 'Zanahoria', 'Pimentón', 'Lechuga', 'Repollo', 'Ahuyama', 'Pepino'],
};

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function generateHistory7d(currentPrice: number): number[] {
  const days: number[] = [];
  let prev = currentPrice;
  for (let i = 6; i >= 0; i--) {
    const variation = (Math.random() - 0.5) * currentPrice * 0.08;
    prev = Math.max(100, Math.round(prev + variation));
    days.push(prev);
  }
  return days.reverse();
}

export function useMockData(): ProductAlert[] {
  return useMemo(() => {
    const list: ProductAlert[] = [];
    let id = 1;
    let hasStarProduct = false;

    CATEGORIES.forEach((category) => {
      const names = pick(PRODUCTS_BY_CATEGORY[category], 4);
      names.forEach((name, idx) => {
        const market = MARKETS[idx % MARKETS.length];
        const averagePrice90d = 1000 + Math.floor(Math.random() * 8000);
        let savingsPercentage: number;
        if (!hasStarProduct && (category === 'FRU' || category === 'TUB')) {
          savingsPercentage = 20 + Math.floor(Math.random() * 15);
          hasStarProduct = true;
        } else {
          const roll = Math.random();
          if (roll < 0.25) savingsPercentage = 5 + Math.random() * 10;
          else if (roll < 0.5) savingsPercentage = 15 + Math.random() * 10;
          else savingsPercentage = Math.random() * 5;
        }
        const currentPrice = Math.round(
          averagePrice90d * (1 - savingsPercentage / 100)
        );
        const history7d = generateHistory7d(currentPrice);

        list.push({
          id: `p-${id++}`,
          name,
          category,
          market: market.replace('Central Mayorista de Antioquia', 'Mayorista').replace('Plaza Minorista José María Villa', 'Minorista').replace('Placita de Flórez', 'Placita de Flórez'),
          currentPrice,
          averagePrice90d,
          savingsPercentage: Math.round(savingsPercentage * 10) / 10,
          history7d,
        });
      });
    });

    return list.sort((a, b) => b.savingsPercentage - a.savingsPercentage);
  }, []);
}

export function useCosechaData(): ProductAlert[] {
  return useMockData();
}
