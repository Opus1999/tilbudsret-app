export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  price: number;
  checked: boolean;
  dish: string;
}

export interface StoreSection {
  store: string;
  emoji: string;
  items: ShoppingItem[];
}

export const shoppingList: StoreSection[] = [
  {
    store: 'Netto',
    emoji: '🏪',
    items: [
      { id: 'n1', name: 'Hakket oksekød 8-12%', quantity: '500 g', price: 29.95, checked: false, dish: 'Spaghetti Bolognese' },
      { id: 'n2', name: 'Spaghetti', quantity: '500 g', price: 8.95, checked: false, dish: 'Spaghetti Bolognese' },
      { id: 'n3', name: 'Hakkede tomater', quantity: '2 dåser', price: 11.90, checked: false, dish: 'Spaghetti Bolognese' },
      { id: 'n4', name: 'Løg', quantity: '3 stk.', price: 4.50, checked: false, dish: 'Spaghetti Bolognese' },
      { id: 'n5', name: 'Hvidløg', quantity: '1 fed', price: 3.95, checked: false, dish: 'Kylling med rodfrugter' },
      { id: 'n6', name: 'Pastanudler brede', quantity: '250 g', price: 7.95, checked: false, dish: 'Laksepasta med fløde' },
    ],
  },
  {
    store: 'Lidl',
    emoji: '🏬',
    items: [
      { id: 'l1', name: 'Røget laks', quantity: '200 g', price: 24.95, checked: false, dish: 'Laksepasta med fløde' },
      { id: 'l2', name: 'Piskefløde 38%', quantity: '2 dl', price: 9.95, checked: false, dish: 'Laksepasta med fløde' },
      { id: 'l3', name: 'Citron', quantity: '1 stk.', price: 3.50, checked: false, dish: 'Laksepasta med fløde' },
      { id: 'l4', name: 'Frisk dild', quantity: '1 bundt', price: 6.95, checked: false, dish: 'Laksepasta med fløde' },
      { id: 'l5', name: 'Rodfrugter (blanding)', quantity: '750 g', price: 14.95, checked: false, dish: 'Kylling med rodfrugter' },
    ],
  },
  {
    store: 'Rema 1000',
    emoji: '🛒',
    items: [
      { id: 'r1', name: 'Hel kylling', quantity: '1,4 kg', price: 49.95, checked: false, dish: 'Kylling med rodfrugter' },
      { id: 'r2', name: 'Rosmarin, frisk', quantity: '1 bundt', price: 7.95, checked: false, dish: 'Kylling med rodfrugter' },
      { id: 'r3', name: 'Olivenolie', quantity: '1 flaske', price: 29.95, checked: false, dish: 'Alle retter' },
      { id: 'r4', name: 'Salt & peber', quantity: '1 sæt', price: 12.95, checked: false, dish: 'Alle retter' },
      { id: 'r5', name: 'Parmesan, revet', quantity: '100 g', price: 16.95, checked: false, dish: 'Spaghetti Bolognese' },
    ],
  },
];

export function getTotalPrice(sections: StoreSection[]): number {
  return sections.flatMap((s) => s.items).reduce((sum, item) => sum + item.price, 0);
}

export function getCheckedCount(sections: StoreSection[]): number {
  return sections.flatMap((s) => s.items).filter((i) => i.checked).length;
}

export function getTotalCount(sections: StoreSection[]): number {
  return sections.flatMap((s) => s.items).length;
}
