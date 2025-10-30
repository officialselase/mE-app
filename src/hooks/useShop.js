import { useState, useCallback } from 'react';
import { useCache, useCacheWithMutation, CacheManager } from './useCache';
import { shopAPI, handleDjangoError } from '../utils/djangoApi';

/**
 * Fetch products from Django API
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response data
 */
const fetchProducts = async (params = {}) => {
  const response = await shopAPI.getProducts(params);
  return response.data.results || response.data;
};

/**
 * Fetch cart from Django API
 * @returns {Promise} - API response data
 */
const fetchCart = async () => {
  const response = await shopAPI.getCart();
  return response.data;
};

/**
 * Custom hook for shop functionality with Django API integration
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to enable the queries
 * @returns {Object} - Shop state and actions
 */
export const useShop = ({ enabled = true } = {}) => {
  const [addingToCart, setAddingToCart] = useState(null);
  const [updatingCart, setUpdatingCart] = useState(null);
  const [cartError, setCartError] = useState(null);

  // Fetch products with caching
  const {
    data: products = [],
    loading: productsLoading,
    error: productsError,
    isStale: productsStale,
    refetch: refetchProducts,
  } = useCache(
    'shop_products',
    fetchProducts,
    {
      cacheType: 'shop',
      enabled,
      staleWhileRevalidate: true,
      onError: (err) => {
        console.error('Error fetching products:', err);
      },
    }
  );

  // Fetch cart with caching and mutation support
  const {
    data: cartData,
    loading: cartLoading,
    error: cartLoadError,
    isStale: cartStale,
    refetch: refetchCart,
    mutate: mutateCart,
  } = useCacheWithMutation(
    'shop_cart',
    fetchCart,
    {
      cacheType: 'shop',
      enabled,
      staleWhileRevalidate: true,
      onError: (err) => {
        console.error('Error fetching cart:', err);
      },
    }
  );

  // Add to cart function
  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      setAddingToCart(productId);
      setCartError(null);
      
      // Optimistic update - add item to cart immediately
      const optimisticCart = {
        ...cartData,
        items: cartData?.items ? [
          ...cartData.items.filter(item => item.product_id !== productId),
          {
            id: Date.now(), // Temporary ID
            product_id: productId,
            quantity: (cartData.items.find(item => item.product_id === productId)?.quantity || 0) + quantity,
            product: products.find(p => p.id === productId)
          }
        ] : []
      };
      
      const response = await mutateCart(
        () => shopAPI.addToCart(productId, quantity),
        optimisticCart
      );
      
      return response;
    } catch (err) {
      console.error('Error adding to cart:', err);
      const djangoError = handleDjangoError(err);
      setCartError(djangoError.message);
      throw new Error(djangoError.message);
    } finally {
      setAddingToCart(null);
    }
  }, [cartData, products, mutateCart]);

  // Update cart item quantity
  const updateCartItem = useCallback(async (itemId, quantity) => {
    try {
      setUpdatingCart(itemId);
      setCartError(null);
      
      // Optimistic update
      const optimisticCart = {
        ...cartData,
        items: cartData?.items?.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        ) || []
      };
      
      const response = await mutateCart(
        () => shopAPI.updateCartItem(itemId, quantity),
        optimisticCart
      );
      
      return response;
    } catch (err) {
      console.error('Error updating cart item:', err);
      const djangoError = handleDjangoError(err);
      setCartError(djangoError.message);
      throw new Error(djangoError.message);
    } finally {
      setUpdatingCart(null);
    }
  }, [cartData, mutateCart]);

  // Remove from cart
  const removeFromCart = useCallback(async (itemId) => {
    try {
      setUpdatingCart(itemId);
      setCartError(null);
      
      // Optimistic update
      const optimisticCart = {
        ...cartData,
        items: cartData?.items?.filter(item => item.id !== itemId) || []
      };
      
      const response = await mutateCart(
        () => shopAPI.removeFromCart(itemId),
        optimisticCart
      );
      
      return response;
    } catch (err) {
      console.error('Error removing from cart:', err);
      const djangoError = handleDjangoError(err);
      setCartError(djangoError.message);
      throw new Error(djangoError.message);
    } finally {
      setUpdatingCart(null);
    }
  }, [cartData, mutateCart]);

  // Helper function to invalidate all shop-related cache
  const invalidateShopCache = useCallback(() => {
    CacheManager.invalidateByType('shop');
  }, []);

  const loading = productsLoading || cartLoading;
  const error = productsError || cartLoadError;
  const isStale = productsStale || cartStale;

  const refetch = useCallback(async () => {
    await Promise.all([refetchProducts(), refetchCart()]);
  }, [refetchProducts, refetchCart]);

  return {
    // Products
    products,
    productsLoading,
    productsError: productsError?.message || null,
    
    // Cart
    cart: cartData?.items || [],
    cartTotal: cartData?.total || 0,
    cartCount: cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    cartLoading,
    cartError: cartError || cartLoadError?.message || null,
    
    // Actions
    addToCart,
    updateCartItem,
    removeFromCart,
    
    // State
    addingToCart,
    updatingCart,
    loading,
    error: error?.message || null,
    isStale,
    
    // Utilities
    refetch,
    invalidateShopCache,
  };
};

export default useShop;