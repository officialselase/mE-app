import React, { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import MetaTags from "../components/MetaTags";

export const shopSummary = `
The Shop page showcases creative merchandise and digital offerings
connected to Selase’s journey. It links creativity, music, and tech,
and is designed to give visitors a way to support his work directly.
`;

const Shop = ({
  setCurrentPage,
  currentPage,
  cart,
  setCart,
  cartCount,
  setCartCount,
}) => {
  // Static products (to be replaced with backend data later)
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Shop is opening soon",
      price: "tay tuned",
      image_url:
        "https://cdn.dribbble.com/userupload/23993643/file/original-601a8616104136c31a2f826346c95a19.gif",
    },
  ]);
  const { success } = useToast();

  useEffect(() => {
    if (currentPage === "shop") {
      window.scrollTo(0, 0);
    }
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

  const addToCart = (product) => {
    setCart((prevCart) => {
      const exists = prevCart.find((item) => item.id === product.id);
      const newCart = exists
        ? prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevCart, { ...product, quantity: 1 }];
      success(`${product.name} added to cart!`);
      return newCart;
    });
  };

  return (
    <>
      <MetaTags
        title="Shop - Ransford Antwi"
        description="Coming soon! Explore creative merchandise and digital offerings from Ransford Antwi. Support his work through unique products and digital content."
        keywords="shop, merchandise, digital products, coming soon, Ransford Antwi, creative products"
        url={`${window.location.origin}/shop`}
      />
      <div className="flex flex-col min-h-screen">
      <section className="bg-white text-gray-900 py-10 px-4 sm:px-6 md:px-12 flex-grow">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-10">
            Nice things from me to you
          </h1>

          {/* Products */}
          {products.length === 0 ? (
            <p className="text-center text-gray-500">
              No products available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col group cursor-pointer"
                >
                  <div className="overflow-hidden rounded-md aspect-[4/3]">
                    <img
                      src={
                        product.image_url ||
                        "https://via.placeholder.com/400x300?text=No+Image"
                      }
                      alt={product.name}
                      className="w-full h-auto object-cover transform transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 flex flex-col space-y-1">
                    <h3 className="text-lg font-medium">{product.name}</h3>
                    <p className="text-gray-500">
                      $
                      {product.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <button
                      onClick={() => addToCart(product)}
                      className="text-sm text-blue-600 hover:underline self-start"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      Add to Cart
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
