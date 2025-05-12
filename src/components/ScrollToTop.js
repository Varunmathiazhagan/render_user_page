import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" // Use "instant" instead of "smooth" to avoid interference with other animations
    });
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;
