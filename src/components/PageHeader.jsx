import React from "react";
import { useAuth } from "../context/AuthContext";

const PageHeader = ({ setCurrentPage, currentPage, cartCount }) => {
  const { isAuthenticated, logout, user, isLoading } = useAuth();
  
  // Don't render anything while auth is loading
  if (isLoading) {
    return (
      <header className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48 mb-4" />
          <div className="h-6 bg-gray-300 rounded w-32" />
        </div>
      </header>
    );
  }

  const handleLogout = async () => {
    await logout();
    setCurrentPage("home");
    window.scrollTo(0, 0);
  };
  const mainTitleText = () => {
    switch (currentPage) {
      case "home":
        return "Hello, I'm Selase";
      case "about":
        return "Woezor";
      case "projects":
        return "Passion projects and fun little experiments";
      case "work":
        return "Work";
      case "thoughts":
        return "Thoughts & Ideas";
      case "shop":
        return "Shop.me";
      case "cart":
        return "Your Cart";
      case "learn":
        return "Mr ICT's Young Coders Community";
      case "projects-repo":
        return "Submit your assignments on time";
      default:
        return "Hello, I'm Selase";
    }
  };

  const mainTitleColorClass = () => {
    if (
      currentPage === "about" ||
      currentPage === "projects" ||
      currentPage === "shop" ||
      currentPage === "cart" ||
      currentPage === "thoughts" ||
      currentPage === "learn"
    ) {
      return "text-gray-900";
    }
    return "text-gray-100";
  };

  return (
    <header 
      className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center"
      role="banner"
    >
      <div
        className={`text-2xl sm:text-3xl font-medium ${mainTitleColorClass()} mb-4 sm:mb-0`}
      >
        <button
          onClick={() => {
            setCurrentPage("home");
            window.scrollTo(0, 0);
          }}
          className="flex items-center p-2 bg-transparent border-none text-inherit font-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded transition-all duration-200 hover:opacity-80"
          aria-label="Go to homepage"
        >
          {mainTitleText()}
        </button>
      </div>
      <nav 
        className="w-full sm:w-auto"
        role="navigation"
        aria-label="Main navigation"
      >
        <ul className="list-none m-0 p-0 flex flex-col items-end space-y-1 text-base font-medium">
          <li>
            <button
              onClick={() => {
                setCurrentPage("home");
                window.scrollTo(0, 0);
              }}
              className={`p-2 bg-transparent border-none text-inherit font-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded relative inline-flex items-center group transition-all duration-200 hover:opacity-80 ${
                currentPage === "home" ? "font-semibold" : ""
              }`}
              aria-label="Ghana flag - Go to homepage"
              aria-current={currentPage === "home" ? "page" : undefined}
            >
              <svg
                className="w-3 h-3 mr-2 align-middle inline-block"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="ghanaFlagGradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#CE1126" />
                    <stop offset="50%" stopColor="#FCD116" />
                    <stop offset="100%" stopColor="#006B3D" />
                  </linearGradient>
                </defs>
                <path d="M5 0L10 10H0L5 0Z" fill="url(#ghanaFlagGradient)" />
              </svg>
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setCurrentPage("about");
                window.scrollTo(0, 0);
              }}
              className={`p-2 bg-transparent border-none text-inherit font-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded relative inline-block hover:underline transition-all duration-200 ${
                currentPage === "about" ? "font-semibold" : ""
              }`}
              aria-current={currentPage === "about" ? "page" : undefined}
            >
              About
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setCurrentPage("projects");
                window.scrollTo(0, 0);
              }}
              className={`p-2 bg-transparent border-none text-inherit font-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded relative inline-block hover:underline transition-all duration-200 ${
                currentPage === "projects" ? "font-semibold" : ""
              }`}
              aria-current={currentPage === "projects" ? "page" : undefined}
            >
              Projects
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setCurrentPage("work");
                window.scrollTo(0, 0);
              }}
              className={`p-2 bg-transparent border-none text-inherit font-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded relative inline-block hover:underline transition-all duration-200 ${
                currentPage === "work" ? "font-semibold" : ""
              }`}
              aria-current={currentPage === "work" ? "page" : undefined}
            >
              Work
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setCurrentPage("thoughts");
                window.scrollTo(0, 0);
              }}
              className={`p-2 bg-transparent border-none text-inherit font-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded relative inline-block hover:underline transition-all duration-200 ${
                currentPage === "thoughts" ? "font-semibold" : ""
              }`}
              aria-current={currentPage === "thoughts" ? "page" : undefined}
            >
              Thoughts
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setCurrentPage("shop");
                window.scrollTo(0, 0);
              }}
              className={`p-2 bg-transparent border-none text-inherit font-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded relative inline-block hover:underline transition-all duration-200 ${
                currentPage === "shop" ? "font-semibold" : ""
              }`}
              aria-current={currentPage === "shop" ? "page" : undefined}
            >
              Shop
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setCurrentPage("cart");
                window.scrollTo(0, 0);
              }}
              className={`p-2 bg-transparent border-none text-inherit font-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded relative inline-block hover:underline transition-all duration-200 ${
                currentPage === "cart" ? "font-semibold" : ""
              }`}
              aria-current={currentPage === "cart" ? "page" : undefined}
              aria-label={`Shopping cart with ${cartCount || 0} items`}
            >
              Cart ({cartCount || 0})
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setCurrentPage("learn");
                window.scrollTo(0, 0);
              }}
              className={`p-2 bg-transparent border-none text-inherit font-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded relative inline-block hover:underline transition-all duration-200 ${
                currentPage === "learn" ? "font-semibold" : ""
              }`}
              aria-current={currentPage === "learn" ? "page" : undefined}
            >
              Learn
            </button>
          </li>
          {isAuthenticated ? (
            <>
              <li>
                <button
                  onClick={() => {
                    setCurrentPage("projects-repo");
                    window.scrollTo(0, 0);
                  }}
                  className={`p-2 bg-transparent border-none text-inherit font-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded relative inline-block hover:underline transition-all duration-200 ${
                    currentPage === "projects-repo" ? "font-semibold" : ""
                  }`}
                  aria-current={currentPage === "projects-repo" ? "page" : undefined}
                >
                  My Projects
                </button>
              </li>
              <li>
                <span 
                  className="text-sm opacity-75 px-2"
                  aria-label={`Logged in as ${user?.displayName || user?.email}`}
                >
                  {user?.displayName || user?.email}
                </span>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-transparent border-none text-inherit font-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded relative inline-block hover:underline transition-all duration-200"
                  aria-label="Log out of your account"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <button
                onClick={() => {
                  setCurrentPage("login");
                  window.scrollTo(0, 0);
                }}
                className={`p-2 bg-transparent border-none text-inherit font-inherit cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded relative inline-block hover:underline transition-all duration-200 ${
                  currentPage === "login" ? "font-semibold" : ""
                }`}
                aria-current={currentPage === "login" ? "page" : undefined}
              >
                Login
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default PageHeader;
