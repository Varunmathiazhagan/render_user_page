import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./components/HomePage";
import Products from "./components/ProductPage";
import Recommendations from "./components/RecommendationsPage";
import About from "./components/AboutPage";
import Contact from "./components/ContactPage";
import Cart from "./components/CartPage";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Signup from "./components/Signup";
import UserProfile from "./components/UserProfile";
import ChatBot from "./components/ChatBot"; 
import ScrollToTop from "./components/ScrollToTop"; // Import the new component
import { TranslationProvider } from './utils/TranslationContext';
import './App.css';

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
  const [cart, setCart] = useState([]);
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

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      } else {
        return [...prevCart, product];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
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
        </div>
        <Footer />
        
        {/* Add ChatBot component so it appears on all pages */}
        <ChatBot />
      </div>
    </TranslationProvider>
  );
};

export default App;