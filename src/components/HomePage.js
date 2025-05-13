"use client"
import { motion, useScroll } from "framer-motion"
import { Link } from "react-router-dom" // Add this import
import { FaLeaf, FaRecycle, FaIndustry, FaChevronDown, FaQuoteLeft, FaImages, FaTshirt, FaCar, FaHospital, FaHome, FaCheckCircle, FaTools, FaMicroscope, FaAward, FaClipboardCheck } from "react-icons/fa"
import { useInView } from "react-intersection-observer"
import { useTranslation } from "../utils/TranslationContext" // Import the translation hook

// Add ScrollProgressBar component
const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll()
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 origin-left z-50"
      style={{ scaleX: scrollYProgress }}
    />
  )
}

// VideoBackground Component
const VideoBackground = () => {
  const { t } = useTranslation() // Add translation hook
  
  return (
    <div className="relative h-screen w-screen overflow-hidden -mt-16 md:-mt-[4.5rem]">
      <video 
        autoPlay 
        muted 
        loop 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover min-w-full min-h-full scale-105 transform-gpu"
      >
        <source src="/images/b.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
        <motion.div
          className="text-center px-4 pt-16 md:pt-[4.5rem]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {t("Welcome to", "home")} <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">{t("KSP Yarns", "footer")}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-100 mb-8">{t("Premium Quality Yarns for a Sustainable Future", "home")}</p>
          <Link to="/products">
            <motion.button
              className="group bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded-full font-semibold text-lg hover:from-blue-500 hover:to-blue-300 transition duration-300 shadow-lg hover:shadow-blue-500/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="inline-block transition-transform group-hover:-translate-y-1">
                {t("Explore Our Products", "home")}
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
      >
        <FaChevronDown className="text-white text-4xl" />
      </motion.div>
    </div>
  )
}

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      className="bg-gradient-to-b from-white to-blue-50 p-8 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div 
        className="flex items-center justify-center mb-6 text-6xl"
        whileHover={{ scale: 1.1 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl md:text-2xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  )
}

// Features Section
const FeaturesSection = () => {
  const { t } = useTranslation() // Add translation hook
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.section
      ref={ref}
      className="text-center px-4 md:px-16 py-16 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-6">
        {t("Discover", "home")} <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">{t("KSP Yarns", "footer")}</span>
      </h2>
      <p className="text-lg md:text-xl text-gray-600 mb-12">
        {t("Crafted for excellence, sustainability, and innovation in every thread.", "home")}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        <FeatureCard
          icon={<FaLeaf className="text-green-500" />}
          title={t("Eco-Friendly", "home")}
          description={t("Our yarns are produced using sustainable practices to minimize environmental impact.", "home")}
        />
        <FeatureCard
          icon={<FaRecycle className="text-blue-500" />}
          title={t("Recycled Fibers", "home")}
          description={t("We offer a range of yarns made from recycled materials, promoting circular economy.", "home")}
        />
        <FeatureCard
          icon={<FaIndustry className="text-purple-500" />}
          title={t("State-of-the-Art Production", "home")}
          description={t("Our modern facilities ensure consistent quality and efficient production.", "home")}
        />
      </div>
    </motion.section>
  )
}

// Enhanced WhyChooseUsSection with hover animations
const WhyChooseUsSection = () => {
  const { t } = useTranslation() // Add translation hook
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // Create translated list items
  const whyChooseItems = [
    t("Wide range of yarn types including recycled, OE, ring spun, and vortex yarns", "home"),
    t("Customizable options to meet your specific requirements and preferences", "home"),
    t("Commitment to delivering consistent quality and customer satisfaction", "home"),
    t("Sustainable practices and eco-friendly options", "home"),
    t("Competitive pricing with a focus on timely and reliable delivery", "home"),
  ];

  return (
    <motion.section
      ref={ref}
      className="bg-blue-50 py-16 px-6 md:px-16 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
        {t("Why Choose", "home")} <span className="text-blue-600">{t("KSP Yarns", "footer")}?</span>
      </h2>
      <ul className="list-disc list-inside space-y-4 text-gray-700 text-lg leading-relaxed">
        {whyChooseItems.map((item, index) => (
          <motion.li
            key={`item${index + 1}`}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 * (index + 1) }}
            whileHover={{ x: 10, color: '#2563eb' }}
            className="cursor-pointer transition-colors duration:300"
            role="listitem"
            aria-label={item}
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </motion.section>
  )
}

// New Testimonials Section
const TestimonialsSection = () => {
  const { t } = useTranslation(); // Add translation hook
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const testimonials = [
    {
      text: t("KSP Yarns has consistently delivered exceptional quality products that meet our high standards.", "home"),
      author: "John Smith",
      company: t("Fashion Limited", "home")
    },
    {
      text: t("Their commitment to sustainability aligns perfectly with our values. Excellent service!", "home"),
      author: "Maria Garcia",
      company: t("Eco Textiles", "home")
    },
    {
      text: t("The innovation and quality control at KSP Yarns is unmatched in the industry.", "home"),
      author: "David Chen",
      company: t("Global Fabrics", "home")
    }
  ];

  return (
    <motion.section
      ref={ref}
      className="py-16 px-6 md:px-16 bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        {t("What Our Clients Say", "home")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            className="bg-gray-50 p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            whileHover={{ y: -5 }}
          >
            <FaQuoteLeft className="text-blue-400 text-3xl mb-4" />
            <p className="text-gray-700 mb-4 italic">{testimonial.text}</p>
            <div className="border-t pt-4">
              <p className="font-semibold">{testimonial.author}</p>
              <p className="text-blue-600">{testimonial.company}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

// Sustainability Section
const SustainabilitySection = () => {
  const { t } = useTranslation(); // Add translation hook
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.section
      ref={ref}
      className="py-16 px-6 md:px-16 bg-gradient-to-br from-blue-50 to-white"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">
          {t("Our Commitment to Sustainability", "home")}
        </span>
      </h2>
      <p className="text-lg md:text-xl text-gray-600 text-center mb-8">
        {t("At KSP Yarns, we are dedicated to reducing our environmental footprint through innovative practices and sustainable materials.", "home")}
      </p>
      <div className="flex justify-center">
        <Link to="/about">
          <motion.button
            className="group bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold text-lg hover:from-green-600 hover:to-blue-600 transition duration-300 shadow-lg hover:shadow-green-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="inline-block transition-transform group-hover:-translate-y-1">
              {t("Learn More About Our Initiatives", "home")}
            </span>
          </motion.button>
        </Link>
      </div>
    </motion.section>
  );
};

// Revised SparkleEffect Component with adjusted timing and reduced particles
const SparkleEffect = () => {
  const sparkleCount = 35; // Reduced from 60 to 35 particles
  
  const createSparkles = () => {
    return Array.from({ length: sparkleCount }).map((_, i) => {
      const size = Math.random() * 12 + 6;
      const left = `${Math.random() * 100}%`;
      const top = `${Math.random() * 30}%`;
      const duration = Math.random() * 5 + 4; // Increased from 3+2 to 5+4 (4-9 seconds)
      const delay = Math.random() * 5; // Increased delay spread for more varied timing
      const isSquare = Math.random() > 0.6;
      const colors = [
        "from-blue-400 to-cyan-400", 
        "from-cyan-400 to-blue-500",
        "from-blue-300 to-indigo-400",
        "from-indigo-300 to-purple-400",
        "from-blue-200 to-blue-500"
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return (
        <div 
          key={`sparkle-${i}`}
          className="absolute"
          style={{
            left,
            top,
            zIndex: -1,
            animation: `fall ${duration}s linear ${delay}s infinite`
          }}
        >
          {isSquare ? (
            <div 
              className={`bg-gradient-to-br ${color} rotate-45 animate-pulse`}
              style={{ 
                width: `${size}px`, 
                height: `${size}px`,
                boxShadow: `0 0 ${size/1.5}px ${size/2}px rgba(59, 130, 246, 0.8)`,
                borderRadius: '2px'
              }}
            />
          ) : (
            <div 
              className={`bg-gradient-to-br ${color} rounded-full animate-pulse`}
              style={{ 
                width: `${size}px`, 
                height: `${size}px`,
                boxShadow: `0 0 ${size/1.5}px ${size/2}px rgba(59, 130, 246, 0.7)`,
              }}
            />
          )}
        </div>
      );
    });
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 0.7;
            transform: translateY(50vh) rotate(180deg) scale(1.2);
          }
          100% {
            transform: translateY(100vh) rotate(360deg) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -10 }}>
        {createSparkles()}
      </div>
    </>
  );
};

// New Product Showcase Section with image gallery
const ProductShowcaseSection = () => {
  const { t } = useTranslation() // Add translation hook
  const [ref, inView] = useInView({
    triggerOnce: false, // Changed to false to restart animation when revisiting
    threshold: 0.1,
  })

  const products = [
    { 
      name: t("Recycled Polyester Yarn", "home"), 
      image: "/images/rc.jpeg", 
      description: t("Eco-friendly yarn made from recycled plastic bottles", "home")
    },
    { 
      name: t("Organic Cotton Yarn", "home"), 
      image: "/images/co.jpeg", 
      description: t("100% organic cotton, sustainably harvested and processed", "home")
    },
    { 
      name: t("Ring Spun Yarn", "home"), 
      image: "/images/rs.jpeg", 
      description: t("Premium quality for high-performance textiles", "home")
    },
    { 
      name: t("Vortex Yarn", "home"), 
      image: "/images/v.jpeg", 
      description: t("Advanced technology for superior strength and comfort", "home")
    }
  ]

  return (
    <motion.section
      ref={ref}
      className="py-16 px-6 md:px-16 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Always render SparkleEffect but control animation with inView */}
      {inView && <SparkleEffect />}
      
      <div className="text-center mb-12 relative" style={{ zIndex: 1 }}>
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-4"
          animate={inView ? { 
            scale: [0.9, 1.05, 1],
            textShadow: ["0 0 0px rgba(59, 130, 246, 0)", "0 0 10px rgba(59, 130, 246, 0.3)", "0 0 0px rgba(59, 130, 246, 0)"]
          } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {t("Our Premium Products", "home")}
        </motion.h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          {t("Explore our wide range of high-quality yarns designed for various applications", "home")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative" style={{ zIndex: 1 }}>
        {products.map((product, index) => (
          <motion.div
            key={`product-${index}`}
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            whileHover={{ y: -5 }}
          >
            <div className="h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm">{product.description}</p>
              <Link to="/products">
                <motion.button
                  className="mt-4 text-blue-600 font-semibold text-sm inline-flex items-center group"
                  whileHover={{ x: 5 }}
                >
                  {t("View Details", "home")}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center mt-10 relative" style={{ zIndex: 1 }}>
        <Link to="/products">
          <motion.button
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/30 transition duration-300 inline-flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaImages className="mr-2" />
            {t("View Full Catalog", "home")}
          </motion.button>
        </Link>
      </div>
    </motion.section>
  )
}

// New Manufacturing Process Section
const ProcessSection = () => {
  const { t } = useTranslation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const steps = [
    {
      title: t("Raw Material Selection", "home"),
      description: t("We carefully source sustainable and high-quality raw materials for our yarns", "home"),
      icon: "01"
    },
    {
      title: t("Cleaning & Processing", "home"),
      description: t("Advanced techniques to clean and prepare fibers for spinning", "home"),
      icon: "02"
    },
    {
      title: t("Spinning & Quality Control", "home"),
      description: t("State-of-the-art spinning technology with rigorous quality checks", "home"),
      icon: "03"
    },
    {
      title: t("Finishing & Packaging", "home"),
      description: t("Precision finishing and eco-friendly packaging solutions", "home"),
      icon: "04"
    }
  ]

  return (
    <motion.section
      ref={ref}
      className="py-16 px-6 md:px-16 bg-gray-50"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        {t("Our Manufacturing Excellence", "home")}
      </h2>
      
      <div className="relative">
        {/* Connect line */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 transform -translate-x-1/2 z-0"></div>
        
        <div className="space-y-12 md:space-y-0 relative z-10">
          {steps.map((step, index) => (
            <motion.div
              key={`step-${index}`}
              className={`flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 * index }}
            >
              <div className="md:w-1/2 flex justify-center mb-6 md:mb-0">
                <motion.div 
                  className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {step.icon}
                </motion.div>
              </div>
              <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'} md:text-${index % 2 === 0 ? 'left' : 'right'}`}>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

// New Industry Applications Section
const IndustryApplicationsSection = () => {
  const { t } = useTranslation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const industries = [
    {
      name: t("Fashion & Apparel", "home"),
      icon: <FaTshirt className="text-pink-500" />,
      description: t("Premium yarns for high-quality garments and fashion accessories", "home")
    },
    {
      name: t("Automotive Textiles", "home"),
      icon: <FaCar className="text-blue-500" />,
      description: t("Durable and specialized yarns for automotive interiors and components", "home")
    },
    {
      name: t("Medical Textiles", "home"),
      icon: <FaHospital className="text-red-500" />,
      description: t("Antimicrobial and high-performance yarns for healthcare applications", "home")
    },
    {
      name: t("Home Furnishing", "home"),
      icon: <FaHome className="text-amber-500" />,
      description: t("Decorative and functional yarns for home textiles and upholstery", "home")
    },
  ]

  return (
    <motion.section
      ref={ref}
      className="py-16 px-6 md:px-16 bg-gradient-to-br from-gray-50 to-white"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("Industry Applications", "home")}</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t("Our versatile yarn solutions power innovations across multiple industries", "home")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {industries.map((industry, index) => (
            <motion.div
              key={`industry-${index}`}
              className="bg-white p-6 rounded-xl shadow-md flex items-start gap-5 hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-gray-50 p-4 rounded-full">
                <div className="text-4xl">{industry.icon}</div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{industry.name}</h3>
                <p className="text-gray-600">{industry.description}</p>
                <Link to="/about">
                  <motion.button
                    className="mt-3 text-blue-600 font-medium inline-flex items-center"
                    whileHover={{ x: 3 }}
                  >
                    {t("Learn more", "home")}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center p-1 px-2 bg-blue-50 rounded-full">
            <span className="px-3 py-1 text-sm font-medium text-blue-800">🌐 {t("Serving clients globally in over 30 countries", "home")}</span>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

// New Quality Assurance Section with interactive elements
const QualityAssuranceSection = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const qualitySteps = [
    {
      title: t("Material Inspection", "home"),
      description: t("Rigorous testing of all raw materials before entering production", "home"),
      icon: <FaClipboardCheck />
    },
    {
      title: t("Process Monitoring", "home"),
      description: t("Real-time quality monitoring throughout the manufacturing process", "home"),
      icon: <FaTools />
    },
    {
      title: t("Laboratory Testing", "home"),
      description: t("Comprehensive testing for tensile strength, color fastness, and durability", "home"),
      icon: <FaMicroscope />
    },
    {
      title: t("Certification", "home"),
      description: t("Meeting international quality standards with third-party verification", "home"),
      icon: <FaAward />
    }
  ];

  return (
    <motion.section
      ref={ref}
      className="py-16 px-6 md:px-16 bg-gradient-to-br from-blue-900 to-blue-950 text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={inView ? { scale: [0.8, 1.2, 1] } : {}}
            transition={{ duration: 0.8 }}
          >
            <FaCheckCircle className="inline-block text-5xl text-gradient-to-r from-blue-300 to-cyan-300 mb-4" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300">
              {t("Quality Assurance", "home")}
            </span>
          </h2>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            {t("Our comprehensive quality management system ensures every yarn meets the highest standards", "home")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {qualitySteps.map((step, index) => (
            <motion.div
              key={`quality-${index}`}
              className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-colors duration-300 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 * index }}
              whileHover={{ y: -3 }}
            >
              <div className="flex items-start space-x-4">
                <div className="text-cyan-300 text-2xl mt-1">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-blue-100">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-6">
          <div className="text-center md:text-right">
            <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300">99.8%</p>
            <p className="text-blue-200">{t("Quality Approval Rate", "home")}</p>
          </div>
          
          <div className="h-16 w-px bg-gradient-to-b from-blue-400 to-blue-600 hidden md:block"></div>
          
          <div className="text-center">
            <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300">ISO 9001</p>
            <p className="text-blue-200">{t("Certified Quality Management", "home")}</p>
          </div>
          
          <div className="h-16 w-px bg-gradient-to-b from-blue-400 to-blue-600 hidden md:block"></div>
          
          <div className="text-center md:text-left">
            <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300">24/7</p>
            <p className="text-blue-200">{t("Quality Monitoring", "home")}</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

// Update HomePage component
const HomePage = () => {
  return (
    <div className="relative">
      <ScrollProgressBar />
      <VideoBackground />
      <div className="space-y-16 bg-gradient-to-b from-white via-blue-50 to-gray-50">
        <FeaturesSection />
        <ProductShowcaseSection /> 
        <WhyChooseUsSection />
        <ProcessSection />
        <IndustryApplicationsSection />
        <QualityAssuranceSection />
        <TestimonialsSection />
        <SustainabilitySection />
      </div>
    </div>
  )
}

export default HomePage

