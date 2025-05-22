import React, { useRef, useState } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { FaHistory, FaLeaf, FaUsers, FaTrophy, FaLandmark, FaMapMarkerAlt, FaSeedling, FaWater, FaRecycle } from "react-icons/fa"; 
import { useInView } from "react-intersection-observer";
import { useTranslation } from "../utils/TranslationContext";


const StatCard = ({ number, label, prefix = "", suffix = "", icon }) => {
  const { t } = useTranslation();
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (inView) {
      const duration = 2000;
      const steps = 40;
      const increment = number / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
          setCount(number);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [inView, number]);

  return (
    <motion.div
      ref={ref}
      className="bg-white p-5 sm:p-6 rounded-lg shadow-md hover:shadow-lg 
                 transition-all duration-300 relative overflow-hidden group border border-gray-200"
      whileHover={{ scale: 1.02, y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 
                    group-hover:opacity-100 transition-opacity duration-500" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10"
      >
        <h4 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 
                     bg-clip-text text-transparent mb-2">
          {prefix}{count}{suffix}
        </h4>
        <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
          {t(label, "about")}
        </p>
        <div className="h-1 w-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mt-2 
                     group-hover:w-20 transition-all duration-500 ease-out" />
      </motion.div>
    </motion.div>
  );
};

// Improved responsive Timeline with enhanced animations and updated colors
const Timeline = ({ events }) => {
  const { t } = useTranslation();
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  
  return (
    <div ref={ref} className="relative max-w-3xl mx-auto mt-10 sm:mt-16 mb-12 sm:mb-20 px-4 sm:px-2">
      {/* Mobile timeline (vertical) with enhanced animations */}
      <div className="md:hidden relative pl-10 space-y-8">
        <motion.div 
          className="absolute h-full w-1 bg-gradient-to-b from-blue-300 via-blue-500 to-blue-300 
                    left-0 rounded-full" 
          initial={{ height: 0, opacity: 0 }}
          animate={inView ? { height: "100%", opacity: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        {events.map((event, index) => (
          <motion.div
            key={event.year}
            className="relative"
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ 
              duration: 0.7, 
              delay: index * 0.3, 
              type: "spring", 
              stiffness: 50,
              damping: 10
            }}
          >
            {/* Fixed animation - using separate animations instead of array with 3 values */}
            <motion.div 
              className="absolute w-5 h-5 bg-blue-600 rounded-full left-0 -translate-x-[10px] mt-1.5 border-2 border-white shadow-lg z-10"
              whileHover={{ scale: 1.4, boxShadow: "0 0 15px rgba(59, 130, 246, 0.7)" }}
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1, boxShadow: "0 0 5px rgba(59, 130, 246, 0.3)" } : {}}
              transition={{ 
                delay: index * 0.3 + 0.2,
                duration: 0.8,
                type: "spring",
                stiffness: 200
              }}
            >
              {/* Add glow effect with regular motion.div animation which supports multiple keyframes */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-blue-400 opacity-40"
                animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
              />
              {event.icon && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                  {event.icon}
                </div>
              )}
            </motion.div>
            <motion.div 
              className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-all duration-500 group z-20"
              whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <motion.div className="flex flex-col space-y-2">
                <motion.span 
                  className="inline-block px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full font-bold 
                          mb-2 group-hover:bg-blue-100 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                >
                  {event.year}
                </motion.span>
                {event.title && (
                  <h4 className="font-bold text-gray-800">{t(event.title, "about")}</h4>
                )}
                <motion.p 
                  className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 transition-colors duration-300"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.3 + 0.3 }}
                >
                  {t(event.description, "about")}
                </motion.p>
                {event.achievement && (
                  <div className="mt-2 px-3 py-1 bg-blue-50/50 border border-blue-100 rounded-md text-sm text-blue-800">
                    {t(event.achievement, "about")}
                  </div>
                )}
                <motion.div 
                  className="h-1 w-0 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mt-3"
                  animate={inView ? { width: "40%" } : { width: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.3 + 0.5, ease: "easeOut" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </div>
      
      {/* Desktop timeline with blue color scheme */}
      <div className="hidden md:block">
        <motion.div 
          className="absolute h-full w-1 bg-gradient-to-b from-blue-300 via-blue-500 to-blue-300 
                    left-1/2 transform -translate-x-1/2 rounded-full"
          initial={{ height: 0, opacity: 0 }}
          animate={inView ? { height: "100%", opacity: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        {events.map((event, index) => (
          <motion.div
            key={event.year}
            className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} mb-10`}
            initial={{ 
              opacity: 0, 
              x: index % 2 === 0 ? -100 : 100,
              scale: 0.9 
            }}
            animate={inView ? { 
              opacity: 1, 
              x: 0,
              scale: 1 
            } : {}}
            transition={{ 
              duration: 0.8, 
              delay: index * 0.4, 
              type: "spring", 
              stiffness: 40,
              damping: 15
            }}
          >
            <div className="w-1/2 px-6">
              <motion.div 
                className="bg-white p-5 rounded-lg shadow-md border border-gray-200
                        hover:shadow-xl transition-all duration-500 group"
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "rgba(239, 246, 255, 0.6)" // Light blue bg on hover
                }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <div className="flex items-center space-x-2 mb-3">
                  <motion.span 
                    className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-bold 
                              group-hover:bg-blue-100 transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    animate={{ 
                      y: [0, -3, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut", 
                      delay: index * 0.2,
                      times: [0, 0.5, 1] 
                    }}
                  >
                    {event.year}
                    {/* Add shadow animation as a separate element */}
                    <motion.div 
                      className="absolute inset-0 rounded-full"
                      animate={{ 
                        boxShadow: ["0 0 0 rgba(59, 130, 246, 0)", "0 3px 10px rgba(59, 130, 246, 0.2)"]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        repeatType: "reverse", 
                        ease: "easeInOut",
                        delay: index * 0.2
                      }}
                    />
                  </motion.span>
                  {event.icon && (
                    <motion.div
                      className="text-blue-600 text-xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.4 + 0.3, type: "spring" }}
                      whileHover={{ scale: 1.2, rotate: 15 }}
                    >
                      {event.icon}
                    </motion.div>
                  )}
                </div>
                
                {event.title && (
                  <h4 className="font-bold text-gray-800 mb-2">{t(event.title, "about")}</h4>
                )}

                <motion.p 
                  className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.4 + 0.3 }}
                >
                  {t(event.description, "about")}
                </motion.p>

                {event.achievement && (
                  <motion.div 
                    className="mt-3 px-3 py-1.5 bg-blue-50/50 border border-blue-100 rounded-md text-sm text-blue-800"
                    initial={{ opacity: 0, y: 5 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.4 + 0.5 }}
                  >
                    <div className="flex items-center space-x-1.5">
                      <FaTrophy className="text-amber-500" />
                      <span>{t(event.achievement, "about")}</span>
                    </div>
                  </motion.div>
                )}

                <motion.div 
                  className="h-1 bg-gradient-to-r from-blue-400 to-blue-200 rounded-full mt-3 
                          group-hover:w-full transition-all duration-700 ease-out"
                  initial={{ width: "0%" }}
                  animate={inView ? { width: "70%" } : {}}
                  transition={{ duration: 0.8, delay: index * 0.4 + 0.5, ease: "easeOut" }}
                />
              </motion.div>
            </div>
            {/* Blue dot in timeline */}
            <motion.div 
              className={`absolute w-7 h-7 bg-blue-600 rounded-full left-1/2 transform -translate-x-1/2 mt-3 border-2 border-white shadow-lg z-10`}
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1, boxShadow: "0 0 10px rgba(59, 130, 246, 0.4)" } : {}}
              transition={{ 
                delay: index * 0.4 + 0.2,
                duration: 1,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ 
                scale: 1.5, 
                boxShadow: "0 0 25px rgba(59, 130, 246, 0.8)"
              }}
            >
              {/* Icon in the timeline dot */}
              {event.icon && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                  {event.icon}
                </div>
              )}
              {/* Separate pulsing animation */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-blue-400 opacity-50"
                animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut", 
                  delay: index * 0.3,
                  times: [0, 0.5, 1]
                }}
              />
            </motion.div>
            {/* Connect line from dot to content */}
            <motion.div
              className={`absolute top-[1.45rem] h-0.5 bg-gradient-to-r ${index % 2 === 0 ? 'from-blue-600 to-transparent right-1/2' : 'from-transparent to-blue-600 left-1/2'} w-[5%]`}
              initial={{ width: "0%" }}
              animate={inView ? { width: "5%" } : {}}
              transition={{ duration: 0.3, delay: index * 0.4 + 0.6 }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Enhanced AnimatedSection with blue color scheme and improved animations
const AnimatedSection = ({ icon, title, children, delay }) => {
  const { t } = useTranslation();
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const iconColors = {
    FaHistory: "from-blue-500 to-indigo-600",
    FaLeaf: "from-teal-500 to-green-600",
    FaUsers: "from-cyan-500 to-blue-500",
    FaLandmark: "from-indigo-500 to-blue-600",
    FaMapMarkerAlt: "from-blue-400 to-blue-600"
  };

  return (
    <motion.section
      ref={ref}
      className="group mb-12 sm:mb-16 p-5 sm:p-7 bg-white rounded-xl shadow-lg 
                 hover:shadow-xl transition-all duration-300 border-l-4 border-transparent 
                 hover:border-blue-400 relative overflow-hidden mx-4 sm:mx-auto"
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 80 }}
      whileHover={{ y: -5 }}
    >
      {/* Enhanced background gradient effect with blue colors */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 
                    transition-all duration-500 ease-in-out -z-10" 
        style={{ background: icon ? `linear-gradient(to right, var(--${iconColors[icon.type.name] || "from-blue-400 to-blue-600"}))` : '' }} 
        animate={inView ? { scale: [0.9, 1.05, 1] } : {}}
        transition={{ duration: 1, delay: delay + 0.3 }}
      />

      <div className="relative z-10">
        <motion.div
          className="flex items-center gap-4 sm:gap-5 mb-4 sm:mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: delay + 0.2, type: "spring" }}
          whileHover={{ x: 5 }}
        >
          {icon &&
            React.cloneElement(icon, {
              className: `text-3xl sm:text-4xl bg-gradient-to-r ${iconColors[icon.type.name] || "from-blue-500 to-indigo-600"} 
                         bg-clip-text text-transparent transform transition-transform 
                         duration-500 group-hover:scale-105`,
            })}
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 
                       bg-clip-text text-transparent">
            {t(title, "about")}
          </h3>
        </motion.div>

        <motion.div
          className="pl-3 sm:pl-14 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: delay + 0.3 }}
        >
          <motion.div 
            className="h-1 w-16 bg-gradient-to-r from-blue-300 to-blue-400 
                       rounded-full group-hover:w-24 transition-all duration-500 ease-out"
          />
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
            {children}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

// Enhanced sustainability metric card
const SustainabilityMetricCard = ({ icon, label, percentage }) => {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  return (
    <motion.div 
      ref={ref}
      className="relative bg-white rounded-xl p-8 shadow-lg group overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      whileHover={{ y: -5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-transparent opacity-0 
                    group-hover:opacity-100 transition-all duration-500 ease-out" />
      <div className="relative z-10">
        {icon && React.cloneElement(icon, { 
          className: "text-5xl text-blue-600 mb-6 transform group-hover:scale-110 transition-transform duration-300"
        })}
        <h3 className="text-xl font-bold text-gray-800 mb-4">{label}</h3>
        <div className="w-full h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
            initial={{ width: 0 }}
            animate={inView ? { width: `${percentage}%` } : {}}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
        <motion.p 
          className="text-3xl font-bold text-blue-600"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {percentage}%
        </motion.p>
      </div>
    </motion.div>
  );
};

// NEW: Interactive Map Component to show Tamil Nadu presence
const InteractiveMap = () => {
  const [activeLocation, setActiveLocation] = useState(null);
  const locations = [
    { id: 1, name: "Coimbatore", x: 30, y: 70, details: "Main factory and headquarters" },
    { id: 2, name: "Chennai", x: 80, y: 25, details: "Sales office and design center" },
    { id: 3, name: "Karur", x: 50, y: 85, details: "Distribution center" },
    { id: 4, name: "Salem", x: 45, y: 45, details: "Manufacturing unit" }
  ];

  return (
    <motion.div 
      className="relative mx-auto max-w-2xl h-[400px] bg-blue-50 rounded-xl shadow-md overflow-hidden mb-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Tamil Nadu state silhouette would go here as a background image */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-white opacity-70"></div>
      <div className="relative w-full h-full">
        {locations.map(location => (
          <motion.div 
            key={location.id}
            className="absolute cursor-pointer"
            style={{ left: `${location.x}%`, top: `${location.y}%` }}
            whileHover={{ scale: 1.2 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            onClick={() => setActiveLocation(location)}
          >
            <motion.div 
              className="w-4 h-4 bg-blue-500 rounded-full relative"
              animate={{ boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.5)", "0 0 0 10px rgba(59, 130, 246, 0)"] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-blue-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {location.name}
            </div>
          </motion.div>
        ))}
        
        {/* Location details popup */}
        <AnimatePresence>
          {activeLocation && (
            <motion.div 
              className="absolute bottom-5 left-5 right-5 bg-white p-4 rounded-lg shadow-lg border border-blue-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-blue-800">{activeLocation.name}</h3>
                <button 
                  onClick={() => setActiveLocation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mt-1">{activeLocation.details}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// NEW: InfoCard component for quick facts
const InfoCard = ({ title, content, icon }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <motion.div 
      className="h-[200px] perspective-1000"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div 
        className="w-full h-full relative cursor-pointer"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 flex flex-col items-center justify-center text-white backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {icon && React.cloneElement(icon, { className: "text-4xl mb-3" })}
          <h3 className="text-xl font-bold text-center">{title}</h3>
          <div className="mt-4 text-sm text-blue-100">Click to learn more</div>
        </div>
        
        {/* Back of card */}
        <div 
          className="absolute inset-0 bg-white rounded-xl p-6 border border-blue-100 flex items-center justify-center backface-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-gray-700 text-center">{content}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AboutPage = () => {
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Reference for parallax effect
  const containerRef = useRef(null);
  
  // Updated and enhanced achievements for Tamil Nadu local company
  const achievements = [
    { 
      year: 2020, 
      title: "Company Foundation",
      description: "KSP Yarns was founded in Coimbatore with a vision to blend traditional Tamil Nadu textile heritage with modern manufacturing practices.",
      achievement: "Successfully established first production line with 25 employees",
      icon: <FaSeedling />
    },
    { 
      year: 2021, 
      title: "Market Expansion",
      description: "Secured partnerships with key Tamil Nadu retailers, expanding our reach to Chennai, Madurai, and Trichy markets. Introduced eco-friendly yarn variants.",
      achievement: "First major retail partnership with Chennai Textiles",
      icon: <FaUsers />
    },
    { 
      year: 2022, 
      title: "Quality Recognition",
      description: "Achieved Tamil Nadu Quality Certification for our manufacturing processes and product standards. Expanded our eco-friendly yarn offerings.",
      achievement: "Silver medal at Tamil Nadu Textile Exhibition",
      icon: <FaTrophy />
    },
    { 
      year: 2023, 
      title: "Manufacturing Excellence",
      description: "Recognized as the Best Local Textile Manufacturer in the annual Tamil Nadu Business Awards. Expanded production capacity by 40%.",
      achievement: "Best Local Textile Manufacturer Award",
      icon: <FaLandmark />
    },
    {
      year: 2024,
      title: "Sustainable Innovation",
      description: "Launched revolutionary water-conserving production methods, reducing water usage by 65%. Introduced new organic cotton yarn product line.",
      achievement: "Tamil Nadu Green Business Certification",
      icon: <FaLeaf />
    }
  ];

  // Define sustainability metrics
  const sustainabilityMetrics = [
    { icon: <FaSeedling />, label: t("Solar Energy Usage", "about"), percentage: 65 },
    { icon: <FaWater />, label: t("Water Conservation", "about"), percentage: 80 },
    { icon: <FaRecycle />, label: t("Waste Reduction", "about"), percentage: 75 }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/30 overflow-hidden">
      {/* Progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
        style={{ scaleX }}
      />
      
      {/* Header section */}
      <motion.div 
        className="relative max-w-6xl mx-auto text-center pt-24 pb-20 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 
                     bg-clip-text text-transparent relative inline-block"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          {t("About KSP Yarns", "about")}
          <motion.div 
            className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </motion.h1>
        <motion.p 
          className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {t("Tamil Nadu's premier textile manufacturer since 2020", "about")}
        </motion.p>
      </motion.div>

      {/* Statistics Section - With blue color scheme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto mb-14 sm:mb-20 px-4 sm:px-6">
        {[
          { number: 50, suffix: "+", label: "Product Varieties" },
          { number: 15, suffix: "+", label: "Districts Served in Tamil Nadu" },
          { number: 95, suffix: "%", label: "Customer Satisfaction" }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Quick Facts Section with flip cards */}
      <motion.div
        className="max-w-4xl mx-auto mb-16 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
          {t("Quick Facts", "about")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <InfoCard 
            title="Yarn Varieties" 
            content="We produce over 20 different yarn varieties including cotton, blended, and specialty yarns for various applications." 
            icon={<FaLeaf />}
          />
          <InfoCard 
            title="Local Sourcing" 
            content="We source 85% of our raw materials from within Tamil Nadu, supporting local farmers and reducing our carbon footprint." 
            icon={<FaMapMarkerAlt />}
          />
          <InfoCard 
            title="Traditional Methods" 
            content="Our production blends modern technology with traditional Tamil Nadu textile techniques passed down through generations." 
            icon={<FaLandmark />}
          />
        </div>
      </motion.div>

      {/* History Section */}
      <AnimatedSection icon={<FaHistory />} title="Our History" delay={0.1}>
        {t("Founded in 2020 in Coimbatore, KSP Yarns has quickly become one of Tamil Nadu's most respected textile manufacturers. What began as a small family workshop has grown into a significant regional producer of quality yarns, serving businesses throughout Tamil Nadu. Our journey reflects our deep commitment to Tamil craftsmanship and heritage.", "about")}
      </AnimatedSection>

      {/* Tamil Nadu Heritage Section */}
      <AnimatedSection icon={<FaLandmark />} title="Tamil Nadu Heritage" delay={0.2}>
        {t("Our roots in Tamil Nadu's rich textile tradition run deep. Drawing inspiration from the state's historic textile centers like Kanchipuram and Madurai, we combine traditional methods with modern technology. Our designs often incorporate elements of Tamil culture, creating products that honor our heritage while meeting contemporary needs.", "about")}
      </AnimatedSection>

      {/* Interactive location map */}
      <motion.div
        className="max-w-4xl mx-auto mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
          {t("Our Tamil Nadu Presence", "about")}
        </h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto px-4">
          {t("Explore our locations across Tamil Nadu. Click on a marker to learn more about each facility.", "about")}
        </p>
        <InteractiveMap />
      </motion.div>

      {/* Sustainability Section - REDESIGNED */}
      <motion.div
        className="max-w-4xl mx-auto mb-16 px-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-10 rounded-2xl shadow-lg"
          whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <FaLeaf className="text-3xl sm:text-4xl text-blue-500" />
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
              {t("Local Sustainability Initiatives", "about")}
            </h2>
          </div>
          
          <p className="text-gray-700 mb-8 text-lg">
            {t("At KSP Yarns, we're committed to preserving Tamil Nadu's natural beauty through sustainable manufacturing. Our Coimbatore facility utilizes solar energy, water conservation systems, and comprehensive waste reduction protocols. We source materials locally whenever possible, supporting Tamil Nadu's economy while reducing our carbon footprint.", "about")}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {sustainabilityMetrics.map((metric, index) => (
              <SustainabilityMetricCard 
                key={index}
                icon={metric.icon}
                label={metric.label}
                percentage={metric.percentage}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Achievement Timeline - Enhanced */}
      <motion.div 
        className="mb-14 sm:mb-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2 
          className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          {t("Our Tamil Nadu Journey", "about")}
        </motion.h2>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto px-4">
          {t("Explore our company's milestones as we've grown from a small Coimbatore workshop to one of Tamil Nadu's premier textile manufacturers.", "about")}
        </p>
        <Timeline events={achievements} />
      </motion.div>
      
      {/* Contact CTA section has been removed as requested */}
    </div>
  );
};

export default AboutPage;