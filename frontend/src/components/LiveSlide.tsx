import React from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { SlideData } from '../types';
import './LiveSlide.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface LiveSlideProps {
  slide: SlideData;
  isSelected?: boolean;
  onClick?: () => void;
}

export const LiveSlide: React.FC<LiveSlideProps> = ({ slide, isSelected, onClick }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { size: 8 },
          boxWidth: 10,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 8 } },
      },
      y: {
        ticks: { 
          font: { size: 8 },
          callback: function(value: string | number) {
            if (typeof value === 'number') {
              return value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value;
            }
            return value;
          }
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { size: 8 },
          boxWidth: 10,
        },
      },
    },
  };

  const renderContent = () => {
    if (slide.type === 'title') {
      return (
        <div className="slide-title-content">
          <h3 className="slide-main-title">{slide.title}</h3>
          {slide.content && <p className="slide-subtitle">{slide.content}</p>}
        </div>
      );
    }

    if (slide.type === 'content') {
      return (
        <div className="slide-text-content">
          <h4 className="slide-header">{slide.title}</h4>
          <div className="slide-bullets">
            {slide.content?.split('\n').map((line, idx) => (
              <p key={idx} className="slide-bullet">{line}</p>
            ))}
          </div>
        </div>
      );
    }

    if (slide.type === 'chart' && slide.chartData) {
      return (
        <div className="slide-chart-content">
          <h4 className="slide-header">{slide.title}</h4>
          <div className="chart-container">
            {slide.chartType === 'line' ? (
              <Line data={slide.chartData} options={chartOptions} />
            ) : slide.chartType === 'pie' ? (
              <Pie data={slide.chartData} options={pieOptions} />
            ) : (
              <Bar data={slide.chartData} options={chartOptions} />
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div 
      className={`live-slide ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="slide-number">{slide.id}</div>
      <div className="slide-content">
        {renderContent()}
      </div>
    </div>
  );
};
