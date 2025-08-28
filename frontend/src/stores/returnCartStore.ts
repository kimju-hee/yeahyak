import { create } from 'zustand';
import type { ReturnCartItem } from '../types';

interface ReturnCartState {
  items: ReturnCartItem[];

  addItem: (item: ReturnCartItem | ReturnCartItem[]) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useReturnCartStore = create<ReturnCartState>()((set, get) => ({
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
        item.productId === productId
          ? { ...item, quantity, subtotalPrice: quantity * item.unitPrice }
          : item,
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.subtotalPrice, 0);
  },
}));
