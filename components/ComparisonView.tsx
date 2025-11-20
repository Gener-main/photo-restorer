import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ComparisonViewProps {
  original: string;
  enhanced: string;
  fileName: string;
  onReset: () => void;
}

const getDownloadFileName = (originalFileName: string) => {
  const parts = originalFileName.split('.');
  const extension = parts.pop();
  const name = parts.join('.');
  return `${name}-улучшено.${extension}`;
};

export const ComparisonView: React.FC<ComparisonViewProps> = ({ original, enhanced, fileName, onReset }) => {
  const downloadFileName = getDownloadFileName(fileName);
  const [sliderPosition, setSliderPosition] = useState(50); // Initial position at 50%
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);
  
  const handleInteractionStart = useCallback((clientX: number) => {
      setIsDragging(true);
      handleMove(clientX);
  }, [handleMove]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleInteractionStart(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleInteractionStart(e.touches[0].clientX);
    }
  };
  
  const handleInteractionEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  }, [isDragging, handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
      if(isDragging && e.touches.length > 0) {
          handleMove(e.touches[0].clientX);
      }
  }, [isDragging, handleMove]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleInteractionEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [handleMouseMove, handleInteractionEnd, handleTouchMove]);


  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <h2 className="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-500">Слайдер сравнения</h2>
      <p className="mb-6 text-gray-400">Перетащите ползунок для сравнения изображений.</p>
      
      <div 
        ref={containerRef}
        className="relative w-full max-w-4xl rounded-lg overflow-hidden shadow-2xl select-none group"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ cursor: 'ew-resize' }}
      >
        {/* Original Image (Bottom Layer) - Establishes container dimensions */}
        <img 
          src={original} 
          alt="Оригинал" 
          className="block w-full h-auto pointer-events-none"
        />
        
        {/* Enhanced Image (Top Layer, clipped) - Absolutely positioned to overlay perfectly */}
        <img 
          src={enhanced} 
          alt="Улучшено" 
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
          style={{
            clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
          }}
        />
        
        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/60 text-white text-sm font-bold py-1 px-3 rounded-full pointer-events-none backdrop-blur-sm">
          Улучшено
        </div>
        <div className="absolute top-4 right-4 bg-black/60 text-white text-sm font-bold py-1 px-3 rounded-full pointer-events-none backdrop-blur-sm">
          Оригинал
        </div>
        
        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white/75 backdrop-blur-sm cursor-ew-resize flex items-center justify-center transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-black/50"
          style={{ left: `calc(${sliderPosition}% - 2px)` }}
        >
          <div className="bg-white rounded-full h-10 w-10 flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-800 rotate-90">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
        <a
          href={enhanced}
          download={downloadFileName}
          className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-full hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 shadow-lg transform hover:scale-105"
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Скачать улучшенное фото
        </a>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-700 text-gray-300 font-semibold rounded-full hover:bg-gray-600 hover:text-white transition-colors"
        >
          Улучшить другое фото
        </button>
      </div>
    </div>
  );
};

// The animation style from the original file is still needed.
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;
document.head.appendChild(style);