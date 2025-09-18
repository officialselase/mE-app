import React, { useState, useEffect } from "react";

const Cart = ({
  setCurrentPage,
  currentPage,
  cart,
  setCart,
  cartCount,
  setCartCount,
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    // Load cart from localStorage on mount
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      setCartCount(parsedCart.reduce((sum, item) => sum + item.quantity, 0));
    }
  }, [currentPage, setCart, setCartCount]);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }, [cart, setCartCount]);

  // Handle quantity increase
  const increaseQuantity = (itemId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Handle quantity decrease (minimum 1)
  const decreaseQuantity = (itemId) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // Handle item removal
  const removeItem = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-white text-gray-900 py-10 px-4 sm:px-6 md:px-8 flex-grow">
        <div className="w-full max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6">Hi, shopper</h1>
          {cart.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty.</p>
          ) : (
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
                        onClick={() => decreaseQuantity(item.id)}
                        className="bg-gray-200 text-gray-900 px-2 rounded hover:bg-gray-300"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        -
                      </button>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="bg-gray-200 text-gray-900 px-2 rounded hover:bg-gray-300"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-2 text-red-600 hover:underline"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        Remove
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
  );
};

export default Cart;
