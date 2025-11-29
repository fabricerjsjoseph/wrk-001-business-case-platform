import React from 'react';
import { Header } from './Header';
import { SlideGrid } from './SlideGrid';
import { DataDeck } from './DataDeck';
import { AIAuditor } from './AIAuditor';
import './MissionControl.css';

export const MissionControl: React.FC = () => {
  return (
    <div className="mission-control">
      <Header />
      <div className="mission-control-body">
        <div className="center-panel">
          <SlideGrid />
        </div>
        <div className="right-panel">
          <AIAuditor />
        </div>
      </div>
      <div className="bottom-panel">
        <DataDeck />
      </div>
    </div>
  );
};
