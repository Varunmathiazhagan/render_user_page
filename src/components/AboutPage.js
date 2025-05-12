import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { FaHistory, FaLeaf, FaUsers, FaTrophy, FaQuoteLeft } from "react-icons/fa"; 
import { useInView } from "react-intersection-observer";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
// Import translation hook
import { useTranslation } from "../utils/TranslationContext";

// Text Reveal Component for Smooth Animations
const TextReveal = ({ children, delay }) => (
  <motion.span
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    className="inline-block"
  >
    {children}
  </motion.span>
);

// Improved Progress Bar Component with better animation
const ProgressBar = ({ label, percentage }) => {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  return (
    <div ref={ref} className="mb-5 sm:mb-6 px-2 sm:px-0">
      <div className="flex justify-between items-center mb-1.5 sm:mb-2">
        <motion.span 
          initial={{ x: -20, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.4 }}
          className="text-sm sm:text-base font-medium text-gray-700"
        >
          {label}
        </motion.span>
        <motion.span 
          initial={{ x: 20, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-sm sm:text-base font-semibold text-blue-600"
        >
          {percentage}%
        </motion.span>
      </div>
      <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
          initial={{ width: 0 }}
          animate={inView ? { width: `${percentage}%` } : {}}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
};

// Enhanced responsive StatCard with better animations
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
        <h4 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 
                     bg-clip-text text-transparent mb-2">
          {prefix}{count}{suffix}
        </h4>
        <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
          {t(label, "about")}
        </p>
        <div className="h-1 w-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mt-2 
                     group-hover:w-20 transition-all duration-500 ease-out" />
      </motion.div>
    </motion.div>
  );
};

// Improved responsive Timeline with enhanced animations
const Timeline = ({ events }) => {
  const { t } = useTranslation();
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  
  return (
    <div ref={ref} className="relative max-w-3xl mx-auto mt-10 sm:mt-16 mb-12 sm:mb-20 px-4 sm:px-2">
      {/* Mobile timeline (vertical) with enhanced animations */}
      <div className="md:hidden relative pl-10 space-y-8">
        <motion.div 
          className="absolute h-full w-1 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 
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
              className="absolute w-5 h-5 bg-blue-500 rounded-full left-0 -translate-x-[10px] mt-1.5 border-2 border-white shadow-md z-10"
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
            </motion.div>
            <motion.div 
              className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-all duration-500 group z-20"
              whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <motion.span 
                className="inline-block px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full font-bold 
                          mb-2 group-hover:bg-blue-100 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
              >
                {event.year}
              </motion.span>
              <motion.p 
                className="text-sm sm:text-base text-gray-700 group-hover:text-gray-900 transition-colors duration-300"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.3 + 0.3 }}
              >
                {t(event.description, "about")}
              </motion.p>
              <motion.div 
                className="h-1 w-0 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mt-3"
                animate={inView ? { width: "40%" } : { width: 0 }}
                transition={{ duration: 0.7, delay: index * 0.3 + 0.5, ease: "easeOut" }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
      
      {/* Desktop timeline (left-right) with significantly improved animation */}
      <div className="hidden md:block">
        <motion.div 
          className="absolute h-full w-1 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 
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
                  backgroundColor: "rgba(249, 250, 251, 1)"
                }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <motion.span 
                  className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold 
                            mb-2 group-hover:bg-blue-100 transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  // Use tween animation type instead of spring for multiple keyframes
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
                <motion.p 
                  className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.4 + 0.3 }}
                >
                  {t(event.description, "about")}
                </motion.p>
                <motion.div 
                  className="h-1 bg-gradient-to-r from-blue-300 to-blue-100 rounded-full mt-3 
                          group-hover:w-full transition-all duration-700 ease-out"
                  initial={{ width: "0%" }}
                  animate={inView ? { width: "70%" } : {}}
                  transition={{ duration: 0.8, delay: index * 0.4 + 0.5, ease: "easeOut" }}
                />
              </motion.div>
            </div>
            {/* Fixed animation - using separate animations instead of array with 3 values */}
            <motion.div 
              className={`absolute w-7 h-7 bg-blue-500 rounded-full left-1/2 transform -translate-x-1/2 mt-3 border-2 border-white shadow-lg z-10`}
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
              className={`absolute top-[1.45rem] h-0.5 bg-gradient-to-r ${index % 2 === 0 ? 'from-blue-500 to-transparent right-1/2' : 'from-transparent to-blue-500 left-1/2'} w-[5%]`}
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

// Enhanced Responsive AnimatedSection with better effects
const AnimatedSection = ({ icon, title, children, delay }) => {
  const { t } = useTranslation();
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const iconColors = {
    FaHistory: "from-purple-500 to-pink-500",
    FaLeaf: "from-green-500 to-emerald-500",
    FaUsers: "from-blue-500 to-cyan-500"
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
      {/* Enhanced background gradient effect with improved animation */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 
                    transition-all duration-500 ease-in-out -z-10" 
        style={{ background: `linear-gradient(to right, var(--${iconColors[icon.type.name]}))` }} 
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
              className: `text-3xl sm:text-4xl bg-gradient-to-r ${iconColors[icon.type.name]} 
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
            className="h-1 w-16 bg-gradient-to-r from-gray-300 to-gray-400 
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

const AboutPage = () => {
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Reference for parallax effect
  const containerRef = useRef(null);
  
  const achievements = [
    { year: 2020, description: "Company founded" },
    { year: 2021, description: "First international export" },
    { year: 2022, description: "Sustainability certification" },
    { year: 2023, description: "Industry innovation award" },
  ];

  const sustainabilityMetrics = [
    { label: t("Renewable Energy Usage", "about"), percentage: 75 },
    { label: t("Water Recycling", "about"), percentage: 85 },
    { label: t("Waste Reduction", "about"), percentage: 90 }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50"
        style={{ scaleX }}
      />
      
      {/* Header section */}
      <motion.div 
        className="max-w-4xl mx-auto text-center pt-16 sm:pt-24 pb-10 sm:pb-16 px-4 relative"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
      >
        {/* Subtle background elements */}
        <motion.div 
          className="absolute top-10 right-10 w-20 h-20 rounded-full bg-blue-300/10 blur-2xl"
          animate={{ 
            y: [0, -10, 0], 
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-10 left-10 w-24 h-24 rounded-full bg-purple-300/10 blur-2xl"
          animate={{ 
            y: [0, 10, 0], 
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r 
                     from-blue-600 to-blue-800 bg-clip-text text-transparent"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {t("About KSP Yarns", "about")}
        </motion.h1>
        <motion.p 
          className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {t("Pioneering excellence in textile manufacturing since 2020", "about")}
        </motion.p>
      </motion.div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto mb-14 sm:mb-20 px-4 sm:px-6">
        {[
          { number: 100, suffix: "+", label: "Products Manufactured" },
          { number: 20, suffix: "+", label: "States Served" },
          { number: 98, suffix: "%", label: "Customer Satisfaction" }
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

      {/* History Section */}
      <AnimatedSection icon={<FaHistory />} title="Our History" delay={0.1}>
        {t("Founded in 2020, KSP Yarns has been at the forefront of textile excellence. What started as a small family-owned business has evolved into a globally recognized manufacturer of premium-quality yarns, trusted by industry leaders worldwide. Our journey reflects our commitment to quality and innovation.", "about")}
      </AnimatedSection>

      {/* Sustainability Section */}
      <AnimatedSection icon={<FaLeaf />} title="Our Commitment to Sustainability" delay={0.2}>
        {t("At KSP Yarns, sustainability is not just a buzzword—it's a core value. We embrace eco-friendly manufacturing processes, utilizing recycled materials and implementing energy-efficient production methods. Our comprehensive waste reduction strategies and green initiatives demonstrate our dedication to preserving our environment for future generations.", "about")}
        <div className="mt-8 sm:mt-10">
          {sustainabilityMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + (index * 0.15) }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <ProgressBar key={index} {...metric} />
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* Team Section */}
      <AnimatedSection icon={<FaUsers />} title="Our Team" delay={0.3}>
        {t("Our success is driven by our exceptional team. From expert technicians to visionary designers, every member of the KSP Yarns family brings unique skills and dedication to their role. We foster a culture of innovation, collaboration, and continuous learning, ensuring we stay at the cutting edge of textile manufacturing.", "about")}
      </AnimatedSection>

      {/* Achievement Timeline */}
      <motion.div 
        className="mb-14 sm:mb-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.h2 
          className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-10"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          {t("Our Journey", "home")}
        </motion.h2>
        <Timeline events={achievements} />
      </motion.div>
    </div>
  );
};

export default AboutPage;