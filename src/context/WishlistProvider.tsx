'use client';

import type { ClothingItem } from "@/ai/flows/ai-style-recommendation";
import { createContext, useState, useEffect, ReactNode } from "react";

interface WishlistContextType {
  wishlistItems: ClothingItem[];
  addToWishlist: (item: ClothingItem) => void;
  removeFromWishlist: (itemId: string) => void;
  clearWishlist: () => void;
  itemCount: number;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<ClothingItem[]>([]);

  useEffect(() => {
    const storedWishlist = localStorage.getItem('wishlist');
    if (storedWishlist) {
      setWishlistItems(JSON.parse(storedWishlist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (item: ClothingItem) => {
    setWishlistItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (!existingItem) {
        return [...prevItems, item];
      }
      return prevItems; // Item already in wishlist
    });
  };

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prevItems => prevItems.filter(i => i.id !== itemId));
  };
  
  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const itemCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, clearWishlist, itemCount }}>
      {children}
    </WishlistContext.Provider>
  );
};
