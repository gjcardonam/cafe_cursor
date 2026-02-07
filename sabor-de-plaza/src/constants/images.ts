// Imágenes para una estética fresca de mercado (Unsplash, uso libre)

export const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80',
  categoryFruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&q=80',
  categoryVeggies: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
  categoryTubers: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
  categoryGrains: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  cardFruits: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80',
  cardVeggies: 'https://images.unsplash.com/photo-1597362925123-77861d3facaf?w=400&q=80',
  cardTubers: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
  cardGrains: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&q=80',
} as const;

export type CategoryImageKey = 'FRU' | 'VER' | 'TUB' | 'GRN';

export const CARD_IMAGES: Record<CategoryImageKey, string> = {
  FRU: IMAGES.cardFruits,
  VER: IMAGES.cardVeggies,
  TUB: IMAGES.cardTubers,
  GRN: IMAGES.cardGrains,
};

/** Imagen por producto (nombre exacto). Si no hay match, se usa la de la categoría. */
const W = '?w=400&q=80';
export const PRODUCT_IMAGES: Record<string, string> = {
  // Frutas
  Mango: `https://images.unsplash.com/photo-1553279768-865429fa0078${W}`,
  Lulo: `https://images.unsplash.com/photo-1619566636858-adf3ef46400b${W}`,
  Mora: `https://images.unsplash.com/photo-1498557850523-fd3d8b2f4f76${W}`,
  Maracuyá: `https://images.unsplash.com/photo-1585059895524-72359e06133a${W}`,
  'Aguacate Hass': `https://images.unsplash.com/photo-1523049673857-eb18f1d7b578${W}`,
  Banano: `https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e${W}`,
  Papaya: `https://images.unsplash.com/photo-1583224973288-4a6c2d2c6c6e${W}`,
  Piña: `https://images.unsplash.com/photo-1550258987-190a2d41a8ba${W}`,
  // Verduras
  'Tomate Chonto': `https://images.unsplash.com/photo-1592924357228-91a4daadcfea${W}`,
  Cebolla: `https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1${W}`,
  Zanahoria: `https://images.unsplash.com/photo-1598170845058-32b9d6a5da37${W}`,
  Pimentón: `https://images.unsplash.com/photo-1563565375-f3fdfdbefa83${W}`,
  Lechuga: `https://images.unsplash.com/photo-1622206151226-18ca2e9a4d95${W}`,
  Repollo: `https://images.unsplash.com/photo-1540420773420-3366772f4999${W}`,
  Ahuyama: `https://images.unsplash.com/photo-1570586437260-ab2bb7efff0a${W}`,
  Pepino: `https://images.unsplash.com/photo-1604977042946-077fd2e1e56f${W}`,
  // Tubérculos
  'Papa Capira': `https://images.unsplash.com/photo-1518977676601-b53f82aba655${W}`,
  Yuca: `https://images.unsplash.com/photo-1586201375761-83865001e31c${W}`,
  'Plátano Hartón': `https://images.unsplash.com/photo-1603833665858-e61d17a86224${W}`,
  Ñame: `https://images.unsplash.com/photo-1586201375761-83865001e31c${W}`,
  'Papa Criolla': `https://images.unsplash.com/photo-1518977676601-b53f82aba655${W}`,
  Batata: `https://images.unsplash.com/photo-1578645635735-7f85a9f2c168${W}`,
  Malanga: `https://images.unsplash.com/photo-1586201375761-83865001e31c${W}`,
  Otoy: `https://images.unsplash.com/photo-1518977676601-b53f82aba655${W}`,
  // Granos
  'Frijol Cargamanto': `https://images.unsplash.com/photo-1595855759920-86582396756a${W}`,
  Arroz: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64${W}`,
  Lenteja: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c${W}`,
  Garbanzo: `https://images.unsplash.com/photo-1544025162-d76694265947${W}`,
  Maíz: `https://images.unsplash.com/photo-1551754655-cd27e38d2076${W}`,
  Trigo: `https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b${W}`,
  Café: `https://images.unsplash.com/photo-1447933601403-0c6688de566e${W}`,
  Cacao: `https://images.unsplash.com/photo-1481391319762-47d2d9b625e2${W}`,
};

export function getProductImage(productName: string, category: CategoryImageKey): string {
  return PRODUCT_IMAGES[productName] ?? CARD_IMAGES[category];
}

export const SECTION_BANNER_IMAGES: Record<CategoryImageKey, string> = {
  FRU: IMAGES.categoryFruits,
  VER: IMAGES.categoryVeggies,
  TUB: IMAGES.categoryTubers,
  GRN: IMAGES.categoryGrains,
};
