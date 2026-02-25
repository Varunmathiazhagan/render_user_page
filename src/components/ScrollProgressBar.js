import { motion, useScroll, useSpring } from "framer-motion";

const ScrollProgressBar = ({ gradient = "from-blue-600 via-purple-600 to-pink-500", smooth = false }) => {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-2 bg-gradient-to-r ${gradient} origin-left z-50`}
      style={{ scaleX: smooth ? smoothProgress : scrollYProgress }}
    />
  );
};

export default ScrollProgressBar;
