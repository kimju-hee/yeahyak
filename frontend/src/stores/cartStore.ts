import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem } from '../types/order.type';

interface CartState {
  items: CartItem[];

  addItem: (item: CartItem | CartItem[]) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (itemsToAdd) => {
        set((state) => {
          const newItems = Array.isArray(itemsToAdd) ? itemsToAdd : [itemsToAdd];
          let updatedItems = [...state.items];

          newItems.forEach((item) => {
            const existingItemIdx = updatedItems.findIndex((i) => i.productId === item.productId);
            if (existingItemIdx > -1) {
              updatedItems[existingItemIdx] = {
                ...updatedItems[existingItemIdx],
                quantity: updatedItems[existingItemIdx].quantity + item.quantity,
                subtotalPrice:
                  (updatedItems[existingItemIdx].quantity + item.quantity) * item.unitPrice,
              };
            } else {
              updatedItems.push(item);
            }
          });
          return { items: updatedItems };
        });
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId) }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
