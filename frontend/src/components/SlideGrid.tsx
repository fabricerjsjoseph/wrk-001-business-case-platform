import React, { useState } from 'react';
import { LiveSlide } from './LiveSlide';
import { useBusinessCaseStore } from '../store/businessCaseStore';
import './SlideGrid.css';

export const SlideGrid: React.FC = () => {
  const slides = useBusinessCaseStore((state) => state.slides);
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);

  return (
    <div className="slide-grid-container">
      <div className="slide-grid-header">
        <h2>Live Slides Preview</h2>
        <span className="slide-count">{slides.length} slides</span>
      </div>
      <div className="slide-grid">
        {slides.map((slide) => (
          <LiveSlide
            key={slide.id}
            slide={slide}
            isSelected={selectedSlide === slide.id}
            onClick={() => setSelectedSlide(slide.id === selectedSlide ? null : slide.id)}
          />
        ))}
      </div>
    </div>
  );
};
