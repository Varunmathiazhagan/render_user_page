import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom"; // Add this import
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaSpinner,
  FaTruck,
  FaBoxOpen,
  FaCreditCard,
  FaCheckCircle,
  FaArrowLeft,
  FaMoneyBillWave,
  FaDownload,
  FaTimes, // Added missing FaTimes icon
} from "react-icons/fa";
import { useState, useEffect } from "react";
// Removing axios since it's not used in this component directly
import Payment from "./Payment"; // Import the new Payment component
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Add this import for table support in PDF
import { FileText } from "lucide-react"; // or use another file icon

const CartPage = ({ cart, updateQuantity, removeFromCart, isLoading, user }) => {
  const [step, setStep] = useState("cart");
  // Updated shippingInfo to remove the email field
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    addressLine1: "",
    city: "",
    postalCode: "",
    phone: "", // Add phone field
  });
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const steps = ["cart", "shipping", "delivery", "payment", "confirmation"];
  const currentStepIndex = steps.indexOf(step);

  const [savedOrder, setSavedOrder] = useState(null);
  // Using setOrderProcessingError in new handleSuccessfulPayment function
  const [orderProcessingError, setOrderProcessingError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [progressAnimation, setProgressAnimation] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [orderReference, setOrderReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay"); // Add missing state
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Handle Back Button Click
  const handleBackClick = () => {
    const previousStepIndex = Math.max(currentStepIndex - 1, 0);
    setStep(steps[previousStepIndex]);
  };

  // Update progress animation
  useEffect(() => {
    const progress = ((currentStepIndex + 1) / steps.length) * 100;
    setProgressAnimation(progress);
  }, [currentStepIndex, steps.length]);

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Generate order reference
  useEffect(() => {
    if (step === "confirmation" && !orderReference) {
      setOrderReference(`ORD-${Math.floor(Math.random() * 1000000)}`);
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [step, orderReference]);

  // Handle successful payment - Modified to use setOrderProcessingError
  const handleSuccessfulPayment = (order, method) => {
    setSavedOrder(order);
    setPaymentMethod(method); // Store the payment method
    if (!order) {
      setOrderProcessingError("Order was processed but could not be saved. Please contact support with your reference number.");
    }
    setStep("confirmation");
  };

  // Animation variants - removing unused ones and keeping the ones we need
  const spinnerVariants = { 
    spin: { rotate: 360, transition: { repeat: Infinity, duration: 1 } }
  };
  
  const emptyCartVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };
  const checkoutButtonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" },
    tap: { scale: 0.95 },
  };
  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 },
  };
  const floatingAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1] },
    },
  };
  
  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.07 } },
  };
  const fadeInScale = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  };
  
  // Define confetti animation that was missing but used in renderConfetti
  const confettiAnimation = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: [0, 1, 1, 0],
      scale: [0.5, 1.2, 1],
      y: [0, -100, -50, 0],
      rotate: [0, 180, 360],
      transition: { duration: 2, ease: "easeOut" },
    },
  };
  
  const cartItemVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.3 } },
    hover: { scale: 1.02, boxShadow: "0px 3px 10px rgba(0,0,0,0.1)", backgroundColor: "rgba(249, 250, 251, 1)" },
  };
  const buttonTapVariants = { tap: { scale: 0.95 } };
  const quantityButtonVariants = {
    hover: { backgroundColor: "#dbeafe", scale: 1.05 },
    tap: { scale: 0.9 },
  };
  const formInputVariants = {
    focus: { scale: 1.01, boxShadow: "0px 0px 8px rgba(59, 130, 246, 0.5)", borderColor: "#3b82f6" },
  };
  const radioButtonVariants = { checked: { scale: 1.1 }, unchecked: { scale: 1 } };
  const stepIndicatorVariant = {
    inactive: { scale: 1, opacity: 0.7 },
    active: { scale: 1.1, opacity: 1, boxShadow: "0px 0px 8px rgba(37, 99, 235, 0.5)" },
    completed: { scale: 1, opacity: 1, backgroundColor: "#2563eb", color: "white" },
  };
  const progressBarVariant = {
    initial: { width: "0%" },
    animate: { width: `${progressAnimation}%`, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // Updated handleShippingInfoSubmit - no need to validate email since we use the user's email
  const handleShippingInfoSubmit = (e) => {
    e.preventDefault();
    const { fullName, addressLine1, city, postalCode, phone } = shippingInfo;

    // Basic validation for required fields
    if (!fullName || !addressLine1 || !city || !postalCode || !phone) {
      alert("Please fill in all fields.");
      return;
    }

    // If user is not signed in, they can't proceed (we need their email)
    if (!user || !user.email) {
      alert("Please sign in to continue with checkout.");
      return;
    }

    setStep("delivery");
  };

  const handleDeliverySelection = () => setStep("payment");

  // Render functions
  if (isLoading) {
    return (
      <motion.div className="text-center mt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          animate={spinnerVariants.spin}
          className="text-6xl mx-auto text-blue-500 mb-4"
        >
          <FaSpinner />
        </motion.div>
        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl font-semibold mb-4"
        >
          Loading your cart...
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-gray-500">
          Just a moment while we prepare your items
        </motion.p>
      </motion.div>
    );
  }

  // Modify the empty cart section with a Link 
  if (cart.length === 0) {
    return (
      <motion.div
        variants={emptyCartVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center"
      >
        <motion.div variants={floatingAnimation} animate="animate" className="mb-6 p-6 bg-blue-50 rounded-full">
          <FaShoppingCart className="text-6xl text-blue-400" />
        </motion.div>
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Looks like you haven't added anything to your cart yet. Browse our products and find something you'll love!
        </p>
        <Link to="/products">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <FaArrowLeft />
            <span>Continue Shopping</span>
          </motion.button>
        </Link>
      </motion.div>
    );
  }

  // Modify the cart items section with a Link
  const renderCartItems = () => (
    <div className={`${isMobile ? "overflow-x-auto" : ""}`}>
      <table className="w-full min-w-[768px]">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Product</th>
            <th className="text-left py-2">Price</th>
            <th className="text-left py-2">Tax</th>
            <th className="text-left py-2">Quantity</th>
            <th className="text-left py-2">Total</th>
            <th className="text-left py-2">Remove</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {cart.map((item, index) => (
              <motion.tr
                key={item.id}
                layout
                variants={cartItemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover="hover"
                className="border-b"
                transition={{ delay: index * 0.05 }}
              >
                <td className="py-4 flex items-center space-x-4">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="overflow-hidden rounded-lg">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-20 h-20 object-cover" />
                  </motion.div>
                  <span className="text-xl font-semibold">{item.name}</span>
                </td>
                <td className="py-4">₹{item.price.toFixed(2)}</td>
                <td className="py-4">₹0.00</td>
                <td className="py-4">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      variants={quantityButtonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="bg-gray-200 p-2 rounded-full transition-colors duration-200"
                    >
                      <FaMinus />
                    </motion.button>
                    <motion.span
                      key={item.quantity}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-xl font-semibold w-8 text-center"
                    >
                      {item.quantity}
                    </motion.span>
                    <motion.button
                      variants={quantityButtonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="bg-gray-200 p-2 rounded-full transition-colors duration-200"
                    >
                      <FaPlus />
                    </motion.button>
                  </div>
                </td>
                <td className="py-4 font-semibold">₹{(item.price * item.quantity).toFixed(2)}</td>
                <td className="py-4">
                  <motion.button
                    whileHover={{ scale: 1.2, color: "#ef4444" }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-600 transition-colors duration-200"
                  >
                    <FaTrash />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 flex justify-between items-center"
      >
        <Link to="/products">
          <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200">
            ← Return to shop
          </button>
        </Link>
        <div className="text-right">
          <span className="text-xl font-semibold">Subtotal: ₹{totalPrice.toFixed(2)}</span>
          <motion.button
            variants={checkoutButtonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setStep("shipping")}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-lg font-semibold mt-4"
          >
            Continue to Shipping
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  const renderShippingForm = () => (
    <motion.div
      variants={fadeInScale}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
        <FaTruck className="text-blue-600" /> <span>Shipping Address</span>
      </h2>
      
      {/* Always show user's email since it's required */}
      {user && user.email && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center">
          <div className="text-blue-700 mr-3">
            <FaCheckCircle />
          </div>
          <div>
            <p className="text-sm text-gray-700">Shipping to account email:</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>
      )}
      
      {/* Show message to sign in if not authenticated */}
      {(!user || !user.email) && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center">
          <div className="text-red-700 mr-3">
            <FaTimes />
          </div>
          <div>
            <p className="text-sm font-medium text-red-700">You must be signed in to checkout</p>
            <p className="text-sm text-red-600">Please sign in to continue with your purchase</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleShippingInfoSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <motion.input
            variants={formInputVariants}
            whileFocus="focus"
            type="text"
            placeholder="John Doe"
            value={shippingInfo.fullName}
            onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
            className="w-full p-3 border rounded-md focus:outline-none transition-all duration-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <motion.input
            variants={formInputVariants}
            whileFocus="focus"
            type="tel"
            placeholder="9876543210"
            value={shippingInfo.phone}
            onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
            className="w-full p-3 border rounded-md focus:outline-none transition-all duration-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <motion.input
            variants={formInputVariants}
            whileFocus="focus"
            type="text"
            placeholder="123 Main St"
            value={shippingInfo.addressLine1}
            onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })}
            className="w-full p-3 border rounded-md focus:outline-none transition-all duration-200"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <motion.input
              variants={formInputVariants}
              whileFocus="focus"
              type="text"
              placeholder="Mumbai"
              value={shippingInfo.city}
              onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
              className="w-full p-3 border rounded-md focus:outline-none transition-all duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <motion.input
              variants={formInputVariants}
              whileFocus="focus"
              type="text"
              placeholder="400001"
              value={shippingInfo.postalCode}
              onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
              className="w-full p-3 border rounded-md focus:outline-none transition-all duration-200"
              required
            />
          </div>
        </div>
        
        {/* Email field completely removed */}
        
        {isMobile && (
          <motion.div className="mt-2" initial={false} animate={{ height: showOrderSummary ? "auto" : "40px" }}>
            <button
              type="button"
              onClick={() => setShowOrderSummary(!showOrderSummary)}
              className="flex justify-between w-full py-2 font-semibold bg-gray-50 px-3 rounded-md"
            >
              <span>Order Summary</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </button>
            {showOrderSummary && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 font-semibold">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
        <div className="flex justify-between mt-6">
          <motion.button
            variants={buttonTapVariants}
            whileHover={{ scale: 1.05 }}
            whileTap="tap"
            type="button"
            onClick={handleBackClick}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center space-x-2"
          >
            <FaArrowLeft />
            <span>Back</span>
          </motion.button>
          <motion.button
            variants={buttonTapVariants}
            whileHover={{ scale: 1.05 }}
            whileTap="tap"
            type="submit"
            className={`${
              (!user || !user.email) 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            } text-white px-6 py-2 rounded-lg transition-colors duration-200`}
            disabled={!user || !user.email}
          >
            Continue to Delivery
          </motion.button>
        </div>
      </form>
    </motion.div>
  );

  const renderDeliveryOptions = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-lg shadow-md mt-6"
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
        <FaBoxOpen className="text-green-600" /> <span>Delivery Options</span>
      </h2>
      <p className="text-gray-600 mb-4">Select your preferred delivery method:</p>
      <div className="mt-4 space-y-4">
        <motion.label
          className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${
            deliveryMethod === "standard" ? "border-blue-500 bg-blue-50" : "border-gray-200"
          }`}
          whileHover={{ backgroundColor: "#f8fafc" }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setDeliveryMethod("standard")}
        >
          <motion.div animate={deliveryMethod === "standard" ? "checked" : "unchecked"} variants={radioButtonVariants}>
            <input
              type="radio"
              name="delivery"
              className="form-radio text-blue-600 h-5 w-5"
              checked={deliveryMethod === "standard"}
              onChange={() => setDeliveryMethod("standard")}
            />
          </motion.div>
          <div>
            <span className="font-medium block">Standard Delivery</span>
            <span className="text-sm text-gray-500">3-5 business days - Free</span>
          </div>
        </motion.label>
        <motion.label
          className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer ${
            deliveryMethod === "express" ? "border-blue-500 bg-blue-50" : "border-gray-200"
          }`}
          whileHover={{ backgroundColor: "#f8fafc" }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setDeliveryMethod("express")}
        >
          <motion.div animate={deliveryMethod === "express" ? "checked" : "unchecked"} variants={radioButtonVariants}>
            <input
              type="radio"
              name="delivery"
              className="form-radio text-blue-600 h-5 w-5"
              checked={deliveryMethod === "express"}
              onChange={() => setDeliveryMethod("express")}
            />
          </motion.div>
          <div>
            <span className="font-medium block">Express Delivery</span>
            <span className="text-sm text-gray-500">1-2 business days - ₹100.00</span>
          </div>
        </motion.label>
        {isMobile && (
          <motion.div className="mt-6" initial={false} animate={{ height: showOrderSummary ? "auto" : "40px" }}>
            <button
              type="button"
              onClick={() => setShowOrderSummary(!showOrderSummary)}
              className="flex justify-between w-full py-2 font-semibold bg-gray-50 px-3 rounded-md"
            >
              <span>Order Summary</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </button>
            {showOrderSummary && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 font-semibold">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>{deliveryMethod === "express" ? "₹100.00" : "Free"}</span>
                  </div>
                  <div className="flex justify-between text-lg mt-1">
                    <span>Total</span>
                    <span>₹{(totalPrice + (deliveryMethod === "express" ? 100 : 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
      <div className="flex justify-between mt-6">
        <motion.button
          variants={buttonTapVariants}
          whileHover={{ scale: 1.05 }}
          whileTap="tap"
          onClick={handleBackClick}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center space-x-2"
        >
          <FaArrowLeft />
          <span>Back</span>
        </motion.button>
        <motion.button
          variants={buttonTapVariants}
          whileHover={{ scale: 1.05 }}
          whileTap="tap"
          onClick={handleDeliverySelection}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Continue to Payment
        </motion.button>
      </div>
    </motion.div>
  );

  const confettiColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
  const renderConfetti = () => {
    if (!showConfetti) return null;
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => {
          const color = confettiColors[i % confettiColors.length];
          const left = `${Math.random() * 100}%`;
          const size = Math.random() * 1 + 0.5;
          const delay = Math.random() * 0.5;
          return (
            <motion.div
              key={i}
              initial="initial"
              animate="animate"
              variants={confettiAnimation}
              style={{
                position: "absolute",
                top: "-20px",
                left,
                width: `${size}rem`,
                height: `${size / 2}rem`,
                backgroundColor: color,
                borderRadius: "2px",
                transition: { duration: Math.random() * 2.5 + 2.5, delay, ease: "easeOut" }
              }}
            />
          );
        })}
      </div>
    );
  };

  const handleGenerateInvoice = () => {
    setIsGeneratingPdf(true);
    
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        
        // Define colors
        const primaryColor = [59, 130, 246]; // Blue
        const secondaryColor = [107, 114, 128]; // Gray
        const lightGray = [229, 231, 235];
        
        // Header section with store info
        doc.setFillColor(249, 250, 251); // Light background
        doc.rect(0, 0, 210, 40, "F");
        
        // Store Name and Logo
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("KSP YARNS", 105, 15, { align: "center" });
        
        // Store Address and Contact
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text("4-130 Gandhi Nagar, Karur Sukkaliyur", 105, 23, { align: "center" });
        doc.text("Tamil Nadu, India - 641006", 105, 28, { align: "center" });
        doc.text("Phone: +91 9994955782 | Email: kspyarnskarur@gmail.com", 105, 33, { align: "center" });
        
        // INVOICE title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("INVOICE", 105, 50, { align: "center" });
        
        // Invoice details
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        
        const today = new Date().toLocaleDateString();
        doc.text(`Date: ${today}`, 20, 60);
        doc.text(`Invoice #: ${savedOrder ? savedOrder.orderReference : orderReference}`, 20, 65);
        doc.text(`Payment Method: ${paymentMethod === "razorpay" ? "Online Payment" : "Cash on Delivery"}`, 20, 70);
        
        // Customer info - Updated to use user.email directly
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Bill To:", 140, 60);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`${shippingInfo.fullName}`, 140, 65);
        doc.text(`${shippingInfo.addressLine1}`, 140, 70);
        doc.text(`${shippingInfo.city}, ${shippingInfo.postalCode}`, 140, 75);
        doc.text(`Email: ${user ? user.email : "No email provided"}`, 140, 80);
        
        // Horizontal line
        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.5);
        doc.line(20, 85, 190, 85);
        
        // Order items table
        doc.autoTable({
          startY: 90,
          head: [["Item", "Quantity", "Price", "Total"]],
          body: cart.map(item => [
            item.name,
            item.quantity.toString(),
            `₹${item.price.toFixed(2)}`,
            `₹${(item.price * item.quantity).toFixed(2)}`
          ]),
          theme: "grid",
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontStyle: "bold"
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 30, halign: "center" },
            2: { cellWidth: 30, halign: "right" },
            3: { cellWidth: 30, halign: "right" }
          },
          styles: {
            font: "helvetica",
            fontSize: 10
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          }
        });
        
        // Get the Y position after the table
        const finalY = doc.lastAutoTable.finalY + 10;
        
        // Summary section
        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.5);
        
        // Create a right-aligned summary
        const summaryX = 120;
        const summaryWidth = 70;
        let currentY = finalY;
        
        // Add summary items
        doc.setFont("helvetica", "normal");
        doc.text("Subtotal:", summaryX, currentY);
        doc.text(`₹${totalPrice.toFixed(2)}`, summaryX + summaryWidth, currentY, { align: "right" });
        currentY += 7;
        
        doc.text("Delivery:", summaryX, currentY);
        doc.text(deliveryMethod === "express" ? "₹100.00" : "Free", summaryX + summaryWidth, currentY, { align: "right" });
        currentY += 7;
        
        // Total with bold style
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Total:", summaryX, currentY);
        doc.text(`₹${(totalPrice + (deliveryMethod === "express" ? 100 : 0)).toFixed(2)}`, summaryX + summaryWidth, currentY, { align: "right" });
        
        // Footer
        const pageHeight = doc.internal.pageSize.height;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text("Thank you for shopping with KSP Yarns!", 105, pageHeight - 30, { align: "center" });
        doc.text("We appreciate your business.", 105, pageHeight - 25, { align: "center" });
        
        // Save the PDF
        doc.save(`Invoice_${savedOrder ? savedOrder.orderReference : orderReference}.pdf`);
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 500);
  };

  // Update the confirmation section
  const renderConfirmation = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-white p-8 rounded-lg shadow-md mt-6 max-w-2xl mx-auto"
    >
      {renderConfetti()}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.7 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <FaCheckCircle className="text-green-600 text-5xl" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-2"
        >
          Order Confirmed!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600"
        >
          Thank you for your purchase
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-3 text-lg"
        >
          <p className="font-medium">
            Order Reference: <span className="font-bold bg-blue-50 px-2 py-1 rounded">{savedOrder ? savedOrder.orderReference : orderReference}</span>
          </p>
          <p className="text-sm mt-2 text-gray-600">
            {paymentMethod === "cod"
              ? `You will pay ₹${(totalPrice + (deliveryMethod === "express" ? 100 : 0)).toFixed(2)} when your order arrives.`
              : "Payment has been completed successfully."}
          </p>
        </motion.div>
      </div>
      
      {/* Enhanced order details card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-blue-200 rounded-full opacity-20"></div>
        <h3 className="font-semibold text-lg mb-4 text-blue-800 flex items-center">
          <FileText className="mr-2" /> Order Details
        </h3>
        
        <div className="space-y-4">
          {/* Items summary with improved layout */}
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h4 className="text-sm uppercase text-gray-500 mb-2">Items</h4>
            <div className="max-h-40 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="h-10 w-10 rounded object-cover" />
                    )}
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">₹{item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Delivery info - Updated to use user.email directly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h4 className="text-sm uppercase text-gray-500 mb-2">Shipping Address</h4>
              <p className="font-medium">{shippingInfo.fullName}</p>
              <p className="text-sm text-gray-600">{shippingInfo.addressLine1}</p>
              <p className="text-sm text-gray-600">{shippingInfo.city}, {shippingInfo.postalCode}</p>
              <p className="text-sm text-gray-600 mt-1">{user ? user.email : "No email provided"}</p>
            </div>
            
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h4 className="text-sm uppercase text-gray-500 mb-2">Delivery Method</h4>
              <p className="flex items-center font-medium">
                <FaTruck className="mr-2 text-blue-500" />
                {deliveryMethod === "express" ? "Express Delivery (1-2 days)" : "Standard Delivery (3-5 days)"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {deliveryMethod === "express" ? "Priority shipping with tracking" : "Free shipping with tracking"}
              </p>
            </div>
          </div>
          
          {/* Payment summary */}
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h4 className="text-sm uppercase text-gray-500 mb-2">Payment Summary</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className={deliveryMethod === "standard" ? "text-green-600" : ""}>
                  {deliveryMethod === "express" ? "₹100.00" : "Free"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="flex items-center">
                  {paymentMethod === "razorpay" ? (
                    <>
                      <FaCreditCard className="mr-1 text-blue-500" /> Online Payment
                    </>
                  ) : (
                    <>
                      <FaMoneyBillWave className="mr-1 text-green-500" /> Cash on Delivery
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blue-600">₹{(totalPrice + (deliveryMethod === "express" ? 100 : 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {orderProcessingError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-6"
        >
          <h3 className="font-semibold mb-1">Important Note:</h3>
          <p>{orderProcessingError}</p>
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="flex flex-col sm:flex-row justify-center gap-4 mt-6"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerateInvoice}
          disabled={isGeneratingPdf}
          className={`${
            isGeneratingPdf ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center`}
        >
          {isGeneratingPdf ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Generating Invoice...
            </>
          ) : (
            <>
              <FaDownload className="mr-2" />
              Download Invoice
            </>
          )}
        </motion.button>
        
        <Link to="/products">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
          >
            <FaArrowLeft className="mr-2" />
            Continue Shopping
          </motion.button>
        </Link>
      </motion.div>
      
      {/* Delivery estimate section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-gray-500">
          Estimated delivery: {
            deliveryMethod === "express" 
              ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()
              : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
          }
        </p>
        <p className="text-xs text-gray-400 mt-1">
          You will receive an email with your order details and tracking information.
        </p>
      </motion.div>
    </motion.div>
  );

  const renderCheckoutProgress = () => (
    <div className="mb-12">
      <div className="flex justify-between relative">
        {steps.map((stepName, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          let status = isCompleted ? "completed" : isCurrent ? "active" : "inactive";
          const getIcon = () => {
            switch (stepName) {
              case "cart":
                return <FaShoppingCart />;
              case "shipping":
                return <FaTruck />;
              case "delivery":
                return <FaBoxOpen />;
              case "payment":
                return <FaCreditCard />;
              case "confirmation":
                return <FaCheckCircle />;
              default:
                return null;
            }
          };
          return (
            <div key={stepName} className="flex flex-col items-center relative z-10">
              <motion.div
                initial="inactive"
                animate={status}
                variants={stepIndicatorVariant}
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  status === "completed"
                    ? "bg-blue-600 text-white"
                    : status === "active"
                    ? "bg-white text-blue-600 border-2 border-blue-600"
                    : "bg-gray-100 text-gray-500 border-2 border-gray-300"
                }`}
              >
                {getIcon()}
              </motion.div>
              <span
                className={`text-sm font-medium ${
                  status === "completed" || status === "active" ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {stepName.charAt(0).toUpperCase() + stepName.slice(1)}
              </span>
            </div>
          );
        })}
        <div className="absolute h-1 bg-gray-200 top-6 left-0 right-0 z-0" style={{ width: "100%", transform: "translateY(-50%)" }}>
          <motion.div variants={progressBarVariant} initial="initial" animate="animate" className="h-full bg-blue-600 rounded" />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div className="container mx-auto px-4 py-8 min-h-[60vh]" initial="initial" animate="animate" exit="exit" variants={pageTransition}>
      <motion.div className="mb-8" variants={fadeInScale}>
        {renderCheckoutProgress()}
      </motion.div>
      <AnimatePresence mode="wait">
        {step === "cart" && (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" exit="exit" className="bg-white p-6 rounded-lg shadow-md">
            {renderCartItems()}
          </motion.div>
        )}
        {step === "shipping" && renderShippingForm()}
        {step === "delivery" && renderDeliveryOptions()}
        
        {/* Pass cart items with productId to Payment */}
        {step === "payment" && (
          <Payment
            cart={cart.map(item => ({
              ...item,
              productId: item.id // Ensure productId is included
            }))}
            shippingInfo={shippingInfo}
            deliveryMethod={deliveryMethod}
            user={user}
            totalPrice={totalPrice}
            handleBackClick={handleBackClick}
            onSuccessfulPayment={handleSuccessfulPayment}
          />
        )}
        
        {step === "confirmation" && renderConfirmation()}
      </AnimatePresence>
    </motion.div>
  );
};

export default CartPage;