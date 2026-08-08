import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  deliveryFee: number;
  items: CartItem[];
  isDrawerOpen: boolean;

  addItem: (
    item: Pick<CartItem, 'id' | 'name' | 'price'>,
    restaurantId: string,
    restaurantName: string,
    deliveryFee: number,
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      deliveryFee: 0,
      items: [],
      isDrawerOpen: false,

      addItem: (item, restaurantId, restaurantName, deliveryFee) => {
        const { restaurantId: current, items } = get();

        // Switching restaurant → clear previous cart first
        if (current && current !== restaurantId) {
          set({
            restaurantId,
            restaurantName,
            deliveryFee,
            items: [{ ...item, quantity: 1 }],
          });
          return;
        }

        const existing = items.find(i => i.id === item.id);
        set({
          restaurantId,
          restaurantName,
          deliveryFee,
          items: existing
            ? items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
            : [...items, { ...item, quantity: 1 }],
        });
      },

      removeItem: (itemId) => {
        const { items } = get();
        const existing = items.find(i => i.id === itemId);
        if (!existing) return;

        const newItems = existing.quantity === 1
          ? items.filter(i => i.id !== itemId)
          : items.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);

        set({
          items: newItems,
          restaurantId: newItems.length === 0 ? null : get().restaurantId,
          restaurantName: newItems.length === 0 ? null : get().restaurantName,
          deliveryFee: newItems.length === 0 ? 0 : get().deliveryFee,
        });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          const newItems = get().items.filter(i => i.id !== itemId);
          set({
            items: newItems,
            restaurantId: newItems.length === 0 ? null : get().restaurantId,
            restaurantName: newItems.length === 0 ? null : get().restaurantName,
            deliveryFee: newItems.length === 0 ? 0 : get().deliveryFee,
          });
          return;
        }
        set({ items: get().items.map(i => i.id === itemId ? { ...i, quantity } : i) });
      },

      clearCart: () => set({
        items: [],
        restaurantId: null,
        restaurantName: null,
        deliveryFee: 0,
        isDrawerOpen: false,
      }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    {
      name: 'yamo-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        deliveryFee: state.deliveryFee,
        items: state.items,
        // isDrawerOpen intentionally NOT persisted
      }),
    },
  ),
);
