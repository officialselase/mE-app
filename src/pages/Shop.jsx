import React, { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { shopAPI, handleDjangoError } from "../utils/djangoApi";
import { useAuth } from "../context/AuthContext";
import SkeletonLoader from "../components/SkeletonLoader";
import MetaTags from "../components/MetaTags";

export const shopSummary = `
The Shop page showcases creative merchandise and digital offerings
connected to Selase’s journey. It links creativity, music, and tech,
and is designed to give visitors a way to support his work directly.
`;

const Shop = ({
  cart,
  setCart,
  setCartCount,
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const { success, error: showError } = useToast();

  // Fetch products from Django API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await shopAPI.getProducts();
        setProducts(response.data.results || response.data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        const djangoError = handleDjangoError(err);
        setError(djangoError.message);
        
        // Fallback to demo product if API fails
        setProducts([
          {
            id: 1,
            name: "Shop is opening soon",
            price: 0,
            image_url: "https://cdn.dribbble.com/userupload/23993643/file/original-601a8616104136c31a2f826346c95a19.gif",
            description: "Stay tuned for amazing products!"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
      window.scrollTo(0, 0);
  }, []);

  const { isAuthenticated } = useAuth();

  // Sync cart with Django API if authenticated, otherwise use localStorage
  useEffect(() => {
    const syncCart = async () => {
      if (isAuthenticated) {
        try {
          const response = await shopAPI.getCart();
          const cartData = response.data;
          if (cartData && cartData.items) {
            setCart(cartData.items);
            setCartCount(cartData.items.reduce((sum, item) => sum + item.quantity, 0));
          }
        } catch (err) {
          console.error('Error syncing cart:', err);
          // Fall back to localStorage if API fails
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            setCart(parsedCart);
            setCartCount(parsedCart.reduce((sum, item) => sum + item.quantity, 0));
          }
        }
      } else {
        // Load cart from localStorage for non-authenticated users
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
          setCartCount(parsedCart.reduce((sum, item) => sum + item.quantity, 0));
        }
      }
    };

    syncCart();
  }, [isAuthenticated, setCart, setCartCount]);

  useEffect(() => {
    // Save cart to localStorage for non-authenticated users
    if (!isAuthenticated) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }, [cart, setCartCount, isAuthenticated]);

  const addToCart = async (product) => {
    try {
      setAddingToCart(product.id);
      
      if (isAuthenticated) {
        // Use Django API for authenticated users
        await shopAPI.addToCart(product.id, 1);
        
        // Refresh cart from API
        const response = await shopAPI.getCart();
        const cartData = response.data;
        if (cartData && cartData.items) {
          setCart(cartData.items);
        }
      } else {
        // Use localStorage for non-authenticated users
        setCart((prevCart) => {
          const exists = prevCart.find((item) => item.id === product.id);
          return exists
            ? prevCart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            : [...prevCart, { ...product, quantity: 1 }];
        });
      }
      
      success(`${product.title || product.name} added to cart!`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      const djangoError = handleDjangoError(err);
      showError(djangoError.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <>
      <MetaTags
        title="Shop - Selase K"
        description="Coming soon! Explore creative merchandise and digital offerings from Selase K. Support his work through unique products and digital content."
        keywords="shop, merchandise, digital products, coming soon, Selase Kofi Agbai, creative products"
        url={`${window.location.origin}/shop`}
      />
      <div className="flex flex-col min-h-screen">
      <section className="bg-white text-gray-900 py-10 px-4 sm:px-6 md:px-12 flex-grow">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-10">
            Nice things from me to you
          </h1>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
              <SkeletonLoader type="card" count={6} />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4 text-red-800">Error Loading Products</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          )}

          {/* Products */}
          {!loading && !error && products.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
              <h2 className="text-2xl font-semibold mb-2">No Products Available</h2>
              <p className="text-gray-600">Check back soon for new products!</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col group cursor-pointer"
                >
                  <div className="overflow-hidden rounded-md aspect-[4/3]">
                    <img
                      src={
                        product.featured_image_url ||
                        product.featured_image ||
                        product.image_url ||
                        product.image ||
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='0.3em' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E"
                      }
                      alt={product.title || product.name}
                      className="w-full h-auto object-cover transform transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 flex flex-col space-y-1">
                    <h3 className="text-lg font-medium">{product.title || product.name}</h3>
                    <p className="text-gray-500">
                      {typeof product.price === 'number' ? (
                        `$${product.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}`
                      ) : (
                        product.price
                      )}
                    </p>
                    {product.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <button
                      onClick={() => addToCart(product)}
                      disabled={addingToCart === product.id || typeof product.price !== 'number'}
                      className="text-sm text-blue-600 hover:underline self-start disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Add ${product.title || product.name} to cart`}
                    >
                      {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </div>
    </>
  );
};

export default Shop;
