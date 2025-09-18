import React from "react";

const PageHeader = ({ setCurrentPage, currentPage, cartCount }) => {
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
    <header className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div
        className={`text-2xl sm:text-3xl font-medium ${mainTitleColorClass()} mb-4 sm:mb-0`}
      >
        <button
          onClick={() => {
            setCurrentPage("home");
            window.scrollTo(0, 0);
          }}
          className="flex items-center p-0 bg-transparent border-none text-inherit font-inherit cursor-pointer outline-none"
        >
          {mainTitleText()}
        </button>
      </div>
      <nav className="w-full sm:w-auto">
        <ul className="list-none m-0 p-0 flex flex-col items-end space-y-1 text-base font-medium">
          <li>
            <button
              onClick={() => {
                setCurrentPage("home");
                window.scrollTo(0, 0);
              }}
              className={`p-0 bg-transparent border-none text-inherit font-inherit cursor-pointer outline-none relative inline-flex items-center group ${
                currentPage === "home" ? "font-semibold" : ""
              }`}
            >
              <svg
                className="w-3 h-3 mr-2 align-middle inline-block"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
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
              className={`p-0 bg-transparent border-none text-inherit font-inherit cursor-pointer outline-none relative inline-block hover:underline ${
                currentPage === "about" ? "font-semibold" : ""
              }`}
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
              className={`p-0 bg-transparent border-none text-inherit font-inherit cursor-pointer outline-none relative inline-block hover:underline ${
                currentPage === "projects" ? "font-semibold" : ""
              }`}
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
              className={`p-0 bg-transparent border-none text-inherit font-inherit cursor-pointer outline-none relative inline-block hover:underline ${
                currentPage === "work" ? "font-semibold" : ""
              }`}
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
              className={`p-0 bg-transparent border-none text-inherit font-inherit cursor-pointer outline-none relative inline-block hover:underline ${
                currentPage === "thoughts" ? "font-semibold" : ""
              }`}
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
              className={`p-0 bg-transparent border-none text-inherit font-inherit cursor-pointer outline-none relative inline-block hover:underline ${
                currentPage === "shop" ? "font-semibold" : ""
              }`}
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
              className={`p-0 bg-transparent border-none text-inherit font-inherit cursor-pointer outline-none relative inline-block hover:underline ${
                currentPage === "cart" ? "font-semibold" : ""
              }`}
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
              className={`p-0 bg-transparent border-none text-inherit font-inherit cursor-pointer outline-none relative inline-block hover:underline ${
                currentPage === "learn" ? "font-semibold" : ""
              }`}
            >
              Learn
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default PageHeader;
