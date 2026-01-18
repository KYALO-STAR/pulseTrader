import React, { useState, useEffect } from 'react';
import './app-loader.scss';

interface AppLoaderProps {
    onLoadingComplete: () => void;
    duration?: number; // Duration in milliseconds, default 12000ms (12 seconds)
}

const AppLoader: React.FC<AppLoaderProps> = ({ onLoadingComplete, duration = 12000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Initialize loading timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onLoadingComplete, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [onLoadingComplete, duration]);

  if (!isVisible) return null;

  return (
    <div className="georgetown-loader">
      <div className="chart-container">
        <img 
          alt="Stock chart with green and red candlesticks and glowing line graphs on a dark blue background" 
          className="chart-image" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlwZ8gCMl3KRFHNdk8aoezPXwir7eQp_t2gQqEZKth9w5FgHRG9IBataRrooqJA-hkppcqoKFPaX3uqldjanLaD3HVMUSiLybRMCFlfelzHz3on8_6VHW1KOhDITdkHCR2ZhsaDtrA368dKpOgdb7LPvOxsBCVYJiITGy1g-NayDqfpNZC2NjTTHHqRdhKOvGpayvau4L06gKjOQzjWWhx-TGEeP6U29mZChFVpctavS8a7WR-vMHuWG2XrQzdJ4FBVetapjyuJ_I"
        />
        <div className="chart-overlay"></div>
      </div>
      
      <div className="content-overlay">
        <div className="main-content">
          <h1 className="title-line">GEORGETOWN</h1>
          <h2 className="title-line">DELTAWAVE</h2>
          <h3 className="title-line">SYNTHETICS</h3>
        </div>
        
        <div className="footer-content">
          <div className="footer-left">
            <p className="footer-text">TELEGRMAMM MARKING</p>
            <p className="footer-text">1xCOSROOUS</p>
          </div>
          <div className="footer-icon">
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 11l5-5m0 0l5 5m-5-5v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLoader;