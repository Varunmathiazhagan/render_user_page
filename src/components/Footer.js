import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaArrowUp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFileAlt, FaShieldAlt } from "react-icons/fa"
import { useTranslation } from "../utils/TranslationContext" // Fix the import path

const Footer = () => {
  const { t } = useTranslation(); // Use our custom translation hook
  const [email, setEmail] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(false)

  // Show scroll button when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  const socialIconVariants = {
    hover: {
      scale: 1.2,
      rotate: [0, -10, 10, 0],
      transition: {
        type: "spring",
        stiffness: 300
      }
    }
  }

  const handleSubscribe = (e) => {
    e.preventDefault()
    setSubscribeStatus(t('Subscribed successfully!', 'footer'))
    setEmail('')
    setTimeout(() => setSubscribeStatus(''), 3000)
  }

  // Schema.org JSON-LD for contact information
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "KSP Yarns",
    "url": "https://kspyarns.com",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91 9994955782",
      "email": "kspyarnskarur@gmail.com",
      "contactType": "customer service"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "4-130 Gandhi Nagar",
      "addressLocality": "Karur Sukkaliyur",
      "addressRegion": "Tamil Nadu",
      "addressCountry": "India"
    }
  };

  const links = [
    { name: t("Home", "navbar"), path: '/' },
    { name: t("Products", "navbar"), path: '/products' },
    { name: t("About", "navbar"), path: '/about' },
    { name: t("Contact", "navbar"), path: '/contact' },
    { name: t("Blog", "footer"), path: '/blog' }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 relative mt-auto" role="contentinfo" aria-label="Site footer">
      <script type="application/ld+json">
        {JSON.stringify(contactSchema)}
      </script>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Enhanced Scroll to top button with conditional rendering */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              onClick={scrollToTop}
              className="fixed right-8 bottom-8 z-50 bg-gradient-to-r from-teal-500 to-blue-500 p-3 rounded-full shadow-lg"
              whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(56, 178, 172, 0.6)" }}
              whileTap={{ scale: 0.9 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              aria-label="Scroll to top"
            >
              <FaArrowUp className="text-white text-xl" />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Company Info - Enhanced with contact details and animation */}
          <motion.div variants={itemVariants} className="space-y-4">
            <motion.h3 
              className="text-xl md:text-2xl font-bold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                {t("KSP Yarns", "footer")}
              </span>
            </motion.h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              {t("Providing high-quality yarns for all your textile needs since 2020", "footer")}
            </p>
            <div className="mt-6 space-y-3">
              <motion.a 
                href="tel:+919994955782" 
                whileHover={{ x: 5, color: "#4fd1c5" }} 
                className="flex items-center space-x-3 text-gray-300 hover:text-teal-400 transition-colors duration-300"
                aria-label="Phone number"
              >
                <FaPhone className="text-teal-400" />
                <span>+91 9994955782</span>
              </motion.a>
              <motion.a 
                href="mailto:kspyarnskarur@gmail.com" 
                whileHover={{ x: 5, color: "#4fd1c5" }} 
                className="flex items-center space-x-3 text-gray-300 hover:text-teal-400 transition-colors duration-300"
                aria-label="Email address"
              >
                <FaEnvelope className="text-teal-400" />
                <span>kspyarnskarur@gmail.com</span>
              </motion.a>
              <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-3 text-gray-300">
                <FaMapMarkerAlt className="text-teal-400" />
                <span>4-130 Gandhi Nagar Karur Sukkaliyur</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Links - Enhanced with better animation */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-xl font-bold text-white">{t("Quick Links", "footer")}</h3>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <motion.li 
                  key={link.name} 
                  variants={itemVariants} 
                  whileHover={{ x: 8, transition: { type: "spring", stiffness: 300 } }}
                >
                  <a 
                    href={link.path} 
                    className="text-gray-300 hover:text-teal-400 transition-colors duration-300 flex items-center space-x-2"
                    aria-label={link.name}
                  >
                    <span className="text-teal-400">→</span>
                    <span>{link.name}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Enhanced Social Links with better hover effects */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-xl font-bold text-white">{t("Connect With Us", "footer")}</h3>
            <div className="flex space-x-4">
              {[
                { Icon: FaFacebookF, url: 'https://facebook.com/kspyarns', gradient: 'from-blue-500 to-blue-600', label: 'Facebook' },
                { Icon: FaTwitter, url: 'https://twitter.com/kspyarns', gradient: 'from-blue-400 to-blue-500', label: 'Twitter' },
                { Icon: FaInstagram, url: 'https://instagram.com/kspyarns', gradient: 'from-pink-500 via-purple-500 to-indigo-500', label: 'Instagram' },
                { Icon: FaLinkedinIn, url: 'https://linkedin.com/company/kspyarns', gradient: 'from-blue-600 to-blue-700', label: 'LinkedIn' }
              ].map(({ Icon, url, gradient, label }, index) => (
                <motion.a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={socialIconVariants}
                  whileHover={{ 
                    scale: 1.2, 
                    rotate: [0, -10, 10, 0],
                    boxShadow: "0 0 15px rgba(56, 178, 172, 0.6)"
                  }}
                  className={`bg-gradient-to-r ${gradient} p-3 rounded-full shadow-lg transform transition-all duration-300`}
                  aria-label={label}
                >
                  <Icon className="text-xl md:text-2xl text-white" />
                </motion.a>
              ))}
            </div>
            
            {/* Added Legal Links */}
            <div className="mt-6 space-y-2">
              <motion.a
                href="/privacy-policy"
                whileHover={{ x: 5, color: "#4fd1c5" }}
                className="flex items-center space-x-2 text-gray-300 hover:text-teal-400 transition-colors duration-300"
              >
                <FaShieldAlt className="text-teal-400" />
                <span>{t("Privacy Policy", "footer")}</span>
              </motion.a>
              <motion.a
                href="/terms"
                whileHover={{ x: 5, color: "#4fd1c5" }}
                className="flex items-center space-x-2 text-gray-300 hover:text-teal-400 transition-colors duration-300"
              >
                <FaFileAlt className="text-teal-400" />
                <span>{t("Terms of Service", "footer")}</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Enhanced Newsletter with better feedback and animation */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-xl font-bold text-white">{t("Newsletter", "footer")}</h3>
            <p className="text-gray-300 text-sm">{t("Stay updated with our latest products and offers.", "footer")}</p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <motion.div 
                className="flex flex-col gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("Enter your email", "footer")}
                  className="px-4 py-2 bg-gray-700/50 backdrop-blur-sm rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-teal-400 
                           text-gray-200 transition-all duration-300
                           hover:bg-gray-700/70"
                  required
                  aria-label="Email for newsletter"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(56, 178, 172, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg 
                           transition-all duration-300 text-white font-semibold
                           shadow-lg hover:shadow-teal-500/50"
                >
                  {t("Subscribe", "footer")}
                </motion.button>
              </motion.div>
            </form>
            <AnimatePresence>
              {subscribeStatus && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-teal-400 text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {subscribeStatus}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Enhanced Copyright with year update animation and creator credits */}
        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-gray-700/50 text-center space-y-2"
        >
          <motion.p 
            className="text-gray-300 text-sm"
            whileHover={{ scale: 1.02 }}
          >
            © 2025 KSP Yarns. All rights reserved. Made with{' '}
            <motion.span 
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 1.2, 1],
                transition: { 
                  repeat: Infinity, 
                  repeatType: "loop", 
                  duration: 2,
                  repeatDelay: 1
                } 
              }}
              className="inline-block text-red-500"
            >
              ❤️
            </motion.span>{' '}
            for quality yarns.
          </motion.p>
          
          {/* Animated creator credits */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              delay: 0.5,
              ease: "easeOut"
            }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0"
          >
            <span className="text-gray-400 text-sm mr-2">Designed & Created by</span>
            <div className="flex flex-wrap justify-center gap-x-3">
              {["Niranjan", "Nithish", "Varun"].map((name, index) => (
                <motion.span
                  key={name}
                  className="text-sm bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.2 }}
                  whileHover={{ 
                    scale: 1.2,
                    textShadow: "0 0 8px rgba(79, 209, 197, 0.8)",
                    color: "#4fd1c5"
                  }}
                >
                  {name}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </footer>
  )
}

export default Footer

