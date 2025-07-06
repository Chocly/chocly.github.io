// src/components/ScrollToTop.jsx - Solution that waits for content to load
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll immediately (for pages without loading states)
    window.scrollTo(0, 0);
    
    // Watch for when content finishes loading
    const scrollAfterContent = () => {
      // Use requestAnimationFrame to wait for all DOM updates
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
        });
      });
    };
    
    // Multiple strategies to catch when content loads:
    
    // 1. Wait for any images to load
    const images = document.querySelectorAll('img');
    if (images.length > 0) {
      let loadedImages = 0;
      images.forEach(img => {
        if (img.complete) {
          loadedImages++;
        } else {
          img.onload = () => {
            loadedImages++;
            if (loadedImages === images.length) {
              scrollAfterContent();
            }
          };
        }
      });
      
      if (loadedImages === images.length) {
        scrollAfterContent();
      }
    }
    
    // 2. Watch for loading elements to disappear
    const checkForLoadingComplete = () => {
      const loadingElements = document.querySelectorAll('.loading-container, .loading-spinner, .loading-animation');
      
      if (loadingElements.length === 0) {
        // No loading elements found, content is ready
        scrollAfterContent();
      } else {
        // Keep checking until loading elements are gone
        setTimeout(checkForLoadingComplete, 100);
      }
    };
    
    // Start checking after a short delay
    setTimeout(checkForLoadingComplete, 50);
    
    // Backup scroll after reasonable time
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 1000);
    
  }, [pathname]);

  return null;
}

export default ScrollToTop;