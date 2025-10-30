import React, { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { shopAPI, handleDjangoError } from "../utils/djangoApi";
import { useAuth } from "../context/AuthContext";
import SkeletonLoader from "../components/SkeletonLoader";
import MetaTags from "../components/MetaTags";

const Cart = ({
  setCurrentPage,
  currentPage,
  cart,
  setCart,

  setCartCount,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const { success, error: showError } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Sync cart with Django API or localStorage
  useEffect(() => {
    const syncCart = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (isAuthenticated) {
          // Fetch cart from Django API
          const response = await shopAPI.getCart();
          const cartData = response.data;
          if (cartData && cartData.items) {
            setCart(cartData.items);
            setCartCount(cartData.items.reduce((sum, item) => sum + item.quantity, 0));
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
      } catch (err) {
        console.error('Error syncing cart:', err);
        const djangoError = handleDjangoError(err);
        setError(djangoError.message);
        
        // Fallback to localStorage
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
          setCartCount(parsedCart.reduce((sum, item) => sum + item.quantity, 0));
        }
      } finally {
        setLoading(false);
      }
    };

    syncCart();
  }, [isAuthenticated, setCart, setCartCount]);

  useEffect(() => {
    // Save cart to localStorage for non-authenticated users
    if (!isAuthenticated && !loading) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }, [cart, setCartCount, isAuthenticated, loading]);

  // Handle quantity increase
  const increaseQuantity = async (item) => {
    try {
      setUpdating(item.id);
      
      if (isAuthenticated) {
        // Use Django API
        await shopAPI.updateCartItem(item.id, item.quantity + 1);
        // Refresh cart
        const response = await shopAPI.getCart();
        const cartData = response.data;
        if (cartData && cartData.items) {
          setCart(cartData.items);
        }
      } else {
        // Use localStorage
        setCart((prevCart) =>
          prevCart.map((cartItem) =>
            cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
          )
        );
      }
    } catch (err) {
      console.error('Error updating cart:', err);
      const djangoError = handleDjangoError(err);
      showError(djangoError.message || 'Failed to update cart');
    } finally {
      setUpdating(null);
    }
  };

  // Handle quantity decrease (minimum 1)
  const decreaseQuantity = async (item) => {
    if (item.quantity <= 1) {return;}
    
    try {
      setUpdating(item.id);
      
      if (isAuthenticated) {
        // Use Django API
        await shopAPI.updateCartItem(item.id, item.quantity - 1);
        // Refresh cart
        const response = await shopAPI.getCart();
        const cartData = response.data;
        if (cartData && cartData.items) {
          setCart(cartData.items);
        }
      } else {
        // Use localStorage
        setCart((prevCart) =>
          prevCart.map((cartItem) =>
            cartItem.id === item.id && cartItem.quantity > 1
              ? { ...cartItem, quantity: cartItem.quantity - 1 }
              : cartItem
          )
        );
      }
    } catch (err) {
      console.error('Error updating cart:', err);
      const djangoError = handleDjangoError(err);
      showError(djangoError.message || 'Failed to update cart');
    } finally {
      setUpdating(null);
    }
  };

  // Handle item removal
  const removeItem = async (item) => {
    try {
      setUpdating(item.id);
      
      if (isAuthenticated) {
        // Use Django API
        await shopAPI.removeFromCart(item.id);
        // Refresh cart
        const response = await shopAPI.getCart();
        const cartData = response.data;
        if (cartData && cartData.items) {
          setCart(cartData.items);
        }
      } else {
        // Use localStorage
        setCart((prevCart) => prevCart.filter((cartItem) => cartItem.id !== item.id));
      }
      
      success('Item removed from cart');
    } catch (err) {
      console.error('Error removing from cart:', err);
      const djangoError = handleDjangoError(err);
      showError(djangoError.message || 'Failed to remove item from cart');
    } finally {
      setUpdating(null);
    }
  };

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <MetaTags
        title="Shopping Cart - Sels"
        description="Review your cart items and proceed to checkout. Secure shopping experience with Selase K's digital products and merchandise."
        keywords="shopping cart, checkout, digital products, merchandise, Selase K."
        url={`${window.location.origin}/cart`}
      />
      <div className="flex flex-col min-h-screen">
        <section className="bg-white text-gray-900 py-10 px-4 sm:px-6 md:px-8 flex-grow">
          <div className="w-full max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6">Hi, shopper</h1>
            
            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                <SkeletonLoader type="card" count={3} />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4 text-red-800">Error Loading Cart</h2>
                <p className="text-red-600 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty Cart */}
            {!loading && !error && cart.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
                <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Add some products to get started!</p>
                <button
                  onClick={() => setCurrentPage("shop")}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Browse Products
                </button>
              </div>
            )}

            {/* Cart Items */}
            {!loading && !error && cart.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 flex items-center space-x-4"
                >
                  <div className="w-24 h-24 overflow-hidden rounded-md">
                    <img
                      src={
                        item.image_url ||
                        "https://via.placeholder.com/96x96?text=No+Image"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <p className="text-gray-500">
                      ${(item.price * item.quantity).toFixed(2)} (x
                      {item.quantity})
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => decreaseQuantity(item)}
                        disabled={updating === item.id || item.quantity <= 1}
                        className="bg-gray-200 text-gray-900 px-2 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        -
                      </button>
                      <button
                        onClick={() => increaseQuantity(item)}
                        disabled={updating === item.id}
                        className="bg-gray-200 text-gray-900 px-2 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item)}
                        disabled={updating === item.id}
                        className="ml-2 text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        {updating === item.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="md:col-span-2 mt-6">
                <div className="text-lg font-semibold mb-4">
                  Total: ${total.toFixed(2)}
                </div>
                <button
                  onClick={() =>
                    alert("Checkout will be handled by the backend soon! For now, contact me on Whatsapp or call 0555964195")
                  }
                  className="bg-yellow-600 text-white font-medium py-2 px-4 rounded hover:bg-yellow-700 disabled:opacity-50"
                  disabled={cart.length === 0}
                  aria-label="Proceed to Checkout"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => setCurrentPage("shop")}
            className="mt-6 text-yellow-600 font-medium hover:underline cursor-pointer outline-none"
            aria-label="Browse All Products"
          >
            Browse All Products →
          </button>
          </div>
        </section>
      </div>
    </>
  );
};

export default Cart;
