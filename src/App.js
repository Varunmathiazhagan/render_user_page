import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { TranslationProvider } from './utils/TranslationContext';
import axios from 'axios';
import './App.css';

// Lazy-loaded routes for code splitting & faster initial load
const Home = lazy(() => import("./components/HomePage"));
const Products = lazy(() => import("./components/ProductPage"));
const Recommendations = lazy(() => import("./components/RecommendationsPage"));
const About = lazy(() => import("./components/AboutPage"));
const Contact = lazy(() => import("./components/ContactPage"));
const Cart = lazy(() => import("./components/CartPage"));
const Login = lazy(() => import("./components/Login"));
const Signup = lazy(() => import("./components/Signup"));
const UserProfile = lazy(() => import("./components/UserProfile"));
const ChatBot = lazy(() => import("./components/ChatBot"));

// Lightweight loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Add ScrollProgress component
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
      style={{ scaleX }}
    />
  );
};

// Protected route component modified to redirect to home
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  
  // Check authentication status on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token) {
      setIsAuthenticated(true);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
        } catch (e) {
          console.error("Error parsing stored user data:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    if (tokenExpiry && new Date() > new Date(tokenExpiry)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("tokenExpiry");
      setIsAuthenticated(false);
      navigate("/login");
    }
  }, [setIsAuthenticated, navigate]);

  // Intercept 401 responses globally so expired tokens are caught mid-session
  useEffect(() => {
    const id = window.__axiosInterceptor401;
    if (id !== undefined) return; // already installed

    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('tokenExpiry');
          setIsAuthenticated(false);
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );
    window.__axiosInterceptor401 = interceptorId;

    return () => {
      axios.interceptors.response.eject(interceptorId);
      delete window.__axiosInterceptor401;
    };
  }, [setIsAuthenticated, navigate]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + product.quantity, item.stock || Infinity) }
            : item
        );
      } else {
        const maxQty = product.stock != null ? Math.min(product.quantity, product.stock) : product.quantity;
        return [...prevCart, { ...product, quantity: maxQty }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.min(newQuantity, item.stock || Infinity) }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  return (
    <TranslationProvider>
      <div className="min-h-screen flex flex-col">
        <ScrollProgress />
        <ScrollToTop /> {/* Add ScrollToTop component here */}
        <Navbar cart={cart} isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        <div className="flex-grow pt-16 pb-20">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/products" element={<Products addToCart={addToCart} isAuthenticated={isAuthenticated} />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Auth routes */}
            <Route 
              path="/login" 
              element={<Login setIsAuthenticated={setIsAuthenticated} />} 
            />
            <Route 
              path="/signup" 
              element={<Signup setIsAuthenticated={setIsAuthenticated} />} 
            />
            
            {/* Cart route - pass user data */}
            <Route
              path="/cart"
              element={
                <Cart
                  cart={cart}
                  setCart={setCart}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                  user={userData}
                />
              }
            />
            
            {/* User profile route */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
          </Routes>
          </Suspense>
        </div>
        <Footer />
        
        {/* Add ChatBot component so it appears on all pages */}
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </div>
    </TranslationProvider>
  );
};

export default App;