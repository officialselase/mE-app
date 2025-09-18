// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import PageHeader from "./components/PageHeader";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Work from "./pages/Work";
import ThoughtsPage from "./pages/ThoughtsPage";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Learn from "./pages/Learn";
import ProjectsRepo from "./pages/ProjectsRepo"; // ✅ New repo page

const App = () => {
  const [cartCount, setCartCount] = useState(0);
  const [cart, setCart] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentPage = () => {
    const path = location.pathname.replace("/", "") || "home";
    return path;
  };

  const currentPage = getCurrentPage();

  const handleNavigate = (page) => {
    navigate(`/${page === "home" ? "" : page}`);
    window.scrollTo(0, 0);
  };

  const getPageBgClass = () => {
    switch (currentPage) {
      case "about":
        return "bg-green-100";
      case "work":
        return "bg-amber-800";
      case "home":
        return "bg-gray-900"; // Dark background for Home
      case "projects-repo":
        return "bg-gray-900"; // Light gray for ProjectsRepo
      default:
        return "bg-white"; // White for Thoughts, Shop, Cart, Learn, ProjectsRepo, etc.
    }
  };

  return (
    <div className={`min-h-screen ${getPageBgClass()}`}>
      {location.pathname !== "/projects" && (
        <PageHeader
          setCurrentPage={handleNavigate}
          currentPage={currentPage}
          cartCount={cartCount}
          className="bg-white"
        />
      )}
      <Routes>
        <Route
          path="/"
          element={
            <Home setCurrentPage={handleNavigate} currentPage={currentPage} />
          }
        />
        <Route
          path="/about"
          element={
            <About setCurrentPage={handleNavigate} currentPage={currentPage} />
          }
        />
        <Route path="/work" element={<Work />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/thoughts" element={<ThoughtsPage />} />
        <Route
          path="/shop"
          element={
            <Shop
              setCurrentPage={handleNavigate}
              currentPage={currentPage}
              cart={cart}
              setCart={setCart}
              cartCount={cartCount}
              setCartCount={setCartCount}
            />
          }
        />
        <Route
          path="/cart"
          element={
            <Cart
              setCurrentPage={handleNavigate}
              currentPage={currentPage}
              cart={cart}
              setCart={setCart}
              cartCount={cartCount}
              setCartCount={setCartCount}
            />
          }
        />
        <Route
          path="/learn"
          element={
            <Learn setCurrentPage={handleNavigate} currentPage={currentPage} />
          }
        />
        <Route
          path="/projects-repo"
          element={
            <ProjectsRepo
              setCurrentPage={handleNavigate}
              currentPage={currentPage}
            />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
