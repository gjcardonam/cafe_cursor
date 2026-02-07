export type Category = 'FRU' | 'GRN' | 'TUB' | 'VER';

export interface ProductAlert {
  id: string;
  name: string;
  category: Category;
  market: string;
  currentPrice: number;
  averagePrice90d: number;
  savingsPercentage: number;
  history7d: number[];
}
