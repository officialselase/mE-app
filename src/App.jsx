// src/App.jsx
import React, { useState, Suspense, lazy } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import PageHeader from "./components/PageHeader";
import AnimatedPageTransition from "./components/AnimatedPageTransition";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineDetector from "./components/OfflineDetector";
import ProtectedRoute from "./components/ProtectedRoute";
import SkeletonLoader from "./components/SkeletonLoader";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GeminiChatWidget from "./components/GeminiChatWidget"; // ✅ Gemini Chat Widget

// Lazy load route components for code splitting
const Projects = lazy(() => import("./pages/Projects"));
const Work = lazy(() => import("./pages/Work"));
const ThoughtsPage = lazy(() => import("./pages/ThoughtsPage"));
const Shop = lazy(() => import("./pages/Shop"));
const Cart = lazy(() => import("./pages/Cart"));
const Learn = lazy(() => import("./pages/Learn"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const ProjectsRepo = lazy(() => import("./pages/ProjectsRepo"));

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
    <AuthProvider>
      <ToastProvider>
        <AppContent
          cartCount={cartCount}
          cart={cart}
          setCart={setCart}
          setCartCount={setCartCount}
          handleNavigate={handleNavigate}
          currentPage={currentPage}
          getPageBgClass={getPageBgClass}
        />
      </ToastProvider>
    </AuthProvider>
  );
};

const AppContent = ({
  cartCount,
  cart,
  setCart,
  setCartCount,
  handleNavigate,
  currentPage,
  getPageBgClass,
}) => {
  const location = useLocation();

  return (
    <div className={`min-h-screen ${getPageBgClass()}`}>
      {location.pathname !== "/projects" &&
        location.pathname !== "/login" &&
        location.pathname !== "/register" && (
          <PageHeader
            setCurrentPage={handleNavigate}
            currentPage={currentPage}
            cartCount={cartCount}
            className="bg-white"
          />
        )}
      <ErrorBoundary>
        <AnimatedPageTransition>
          <Suspense fallback={<div className="p-8"><SkeletonLoader variant="card" count={3} /></div>}>
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

            {/* Protected Routes - Require Authentication */}
            <Route
              path="/learn"
              element={
                <ProtectedRoute>
                  <Learn
                    setCurrentPage={handleNavigate}
                    currentPage={currentPage}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn/courses/:courseId"
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects-repo"
              element={
                <ProtectedRoute>
                  <ProjectsRepo
                    setCurrentPage={handleNavigate}
                    currentPage={currentPage}
                  />
                </ProtectedRoute>
              }
            />

            {/* Auth Routes - Only accessible when not authenticated */}
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Register />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AnimatedPageTransition>
      </ErrorBoundary>

      {/* Gemini Chat Component - Always available */}
      <GeminiChatWidget />
      
      {/* Offline Detection Banner */}
      <OfflineDetector />
    </div>
  );
};

export default App;
