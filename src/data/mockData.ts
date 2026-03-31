export interface Dish {
  id: string;
  name: string;
  description: string;
  pricePerPerson: number;
  originalPrice: number;
  servings: number;
  emoji: string;
  stores: string[];
  tag: string;
}

export interface Store {
  id: string;
  name: string;
  logo: string;
  savings: number;
  itemsOnSale: number;
}

export const weeklyDishes: Dish[] = [
  {
    id: '1',
    name: 'Spaghetti Bolognese',
    description: 'Klassisk italiensk pastaret med oksekød og tomatsovs',
    pricePerPerson: 18,
    originalPrice: 28,
    servings: 4,
    emoji: '🍝',
    stores: ['Netto', 'Lidl'],
    tag: 'Ugens bedste køb',
  },
  {
    id: '2',
    name: 'Kylling med rodfrugter',
    description: 'Saftig ovnkylling med sæsonens rodfrugter og rosmarin',
    pricePerPerson: 24,
    originalPrice: 38,
    servings: 4,
    emoji: '🍗',
    stores: ['Rema 1000', 'Fakta'],
    tag: 'Populær',
  },
  {
    id: '3',
    name: 'Laksepasta med fløde',
    description: 'Cremet pastaret med røget laks, dild og citronskal',
    pricePerPerson: 27,
    originalPrice: 42,
    servings: 2,
    emoji: '🐟',
    stores: ['Lidl', 'Aldi'],
    tag: 'Hurtigt & nemt',
  },
];

export const cheapestStores: Store[] = [
  {
    id: '1',
    name: 'Netto',
    logo: '🏪',
    savings: 87,
    itemsOnSale: 14,
  },
  {
    id: '2',
    name: 'Lidl',
    logo: '🏬',
    savings: 73,
    itemsOnSale: 11,
  },
  {
    id: '3',
    name: 'Rema 1000',
    logo: '🛒',
    savings: 61,
    itemsOnSale: 9,
  },
];
