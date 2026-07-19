import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import wishlistService from '../services/wishlistService';

const WishlistContext = createContext(null);

const GUEST_WISHLIST_KEY = 'viotor_guest_wishlist';

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  // wishlist: array of product objects (for guests) or product IDs (for logged-in)
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // ─── Guest helpers ────────────────────────────────────────────────────────────
  const getGuestWishlist = () => {
    try {
      return JSON.parse(localStorage.getItem(GUEST_WISHLIST_KEY) || '[]');
    } catch {
      return [];
    }
  };

  const saveGuestWishlist = (products) => {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(products));
  };

  // ─── Load wishlist based on auth state ──────────────────────────────────────
  const loadServerWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await wishlistService.getWishlist();
      const data = res.data?.data?.data || res.data?.data || res.data || [];
      const products = data.map(item => item.product || item);
      setWishlistProducts(products);
      setWishlistIds(new Set(products.map(p => String(p.id || p.uuid))));
    } catch (e) {
      console.error('Failed to load wishlist:', e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ─── Merge guest wishlist into server when user logs in ─────────────────────
  const mergeGuestWishlist = useCallback(async () => {
    const guestItems = getGuestWishlist();
    if (guestItems.length === 0) return;
    setSyncing(true);
    try {
      // For each guest item not already on server, toggle (add) it
      for (const product of guestItems) {
        const id = product.id || product.uuid;
        if (!wishlistIds.has(String(id))) {
          await wishlistService.toggleWishlist(id);
        }
      }
      // Clear guest wishlist after merge
      localStorage.removeItem(GUEST_WISHLIST_KEY);
      // Reload from server
      await loadServerWishlist();
    } catch (e) {
      console.error('Failed to merge guest wishlist:', e);
    } finally {
      setSyncing(false);
    }
  }, [wishlistIds, loadServerWishlist]);

  // ─── When auth state changes ─────────────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      loadServerWishlist().then(() => {
        // After loading server wishlist, merge any guest items
        const guestItems = getGuestWishlist();
        if (guestItems.length > 0) {
          mergeGuestWishlist();
        }
      });
    } else {
      // Not logged in — load from localStorage
      const guestItems = getGuestWishlist();
      setWishlistProducts(guestItems);
      setWishlistIds(new Set(guestItems.map(p => String(p.id || p.uuid))));
    }
  }, [isAuthenticated]); // eslint-disable-line

  // ─── Public API ─────────────────────────────────────────────────────────────
  const isWishlisted = useCallback((productId) => {
    return wishlistIds.has(String(productId));
  }, [wishlistIds]);

  const toggleWishlist = useCallback(async (product) => {
    const id = String(product.id || product.uuid);
    const alreadyWishlisted = wishlistIds.has(id);

    if (isAuthenticated) {
      // Optimistic update
      setWishlistIds(prev => {
        const next = new Set(prev);
        if (alreadyWishlisted) next.delete(id);
        else next.add(id);
        return next;
      });
      setWishlistProducts(prev =>
        alreadyWishlisted
          ? prev.filter(p => String(p.id || p.uuid) !== id)
          : [...prev, product]
      );
      try {
        await wishlistService.toggleWishlist(id);
      } catch (e) {
        // Rollback on failure
        setWishlistIds(prev => {
          const next = new Set(prev);
          if (alreadyWishlisted) next.add(id);
          else next.delete(id);
          return next;
        });
        setWishlistProducts(prev =>
          alreadyWishlisted
            ? [...prev, product]
            : prev.filter(p => String(p.id || p.uuid) !== id)
        );
      }
    } else {
      // Guest: manage via localStorage
      const guestItems = getGuestWishlist();
      let updated;
      if (alreadyWishlisted) {
        updated = guestItems.filter(p => String(p.id || p.uuid) !== id);
      } else {
        updated = [...guestItems, product];
      }
      saveGuestWishlist(updated);
      setWishlistProducts(updated);
      setWishlistIds(new Set(updated.map(p => String(p.id || p.uuid))));
    }
  }, [isAuthenticated, wishlistIds]);

  return (
    <WishlistContext.Provider value={{
      wishlistIds,
      wishlistProducts,
      wishlistCount: wishlistProducts.length,
      loading,
      syncing,
      isWishlisted,
      toggleWishlist,
      reloadWishlist: loadServerWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};

export default WishlistContext;
