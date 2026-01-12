import React from 'react';

interface SplashScreenProps {
  isVisible: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 transition-opacity duration-1500">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-light tracking-[0.3em] text-black animate-fade-in" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontWeight: '100' }}>
          NOTORIous Year 2000s
        </h1>
        <div className="mt-8 w-32 h-0.5 bg-black mx-auto animate-slide-in"></div>
        <p className="mt-6 text-sm text-gray-600 tracking-[0.4em] font-light animate-fade-in opacity-0" style={{ animationDelay: '1.5s', animationFillMode: 'forwards', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
          LUXURY MILLENNIUM COLLECTION
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;