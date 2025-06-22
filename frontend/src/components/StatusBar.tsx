'use client';

import React from 'react';
import { TaskStatus } from './MultiAgentSDLC';

interface StatusBarProps {
  taskStatus: TaskStatus;
  currentTask: string;
  fixAttempts: number;
  sessionActive: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  taskStatus, 
  currentTask, 
  fixAttempts, 
  sessionActive 
}) => {
  const getStatusColor = () => {
    switch (taskStatus) {
      case 'completed': return 'nintendo-status-success';
      case 'failed': return 'nintendo-status-error';
      case 'idle': return 'nintendo-status-idle';
      default: return 'nintendo-status-active';
    }
  };

  const getStatusText = () => {
    switch (taskStatus) {
      case 'idle': return 'SYSTEM READY';
      case 'planning': return 'PLANNING PHASE';
      case 'coding': return 'DEVELOPMENT PHASE';
      case 'testing': return 'TESTING PHASE';
      case 'fixing': return `FIXING PHASE (${fixAttempts}/2)`;
      case 'completed': return 'TASK COMPLETED!';
      case 'failed': return 'TASK FAILED!';
      default: return 'PROCESSING...';
    }
  };

  return (
    <div className="nintendo-status-bar">
      <div className="nintendo-status-container">
        {/* Status LED and Text */}
        <div className="nintendo-status-section">
          <div className={`nintendo-status-indicator ${getStatusColor()}`}>
            <div className="nintendo-led-core"></div>
            {sessionActive && <div className="nintendo-led-pulse"></div>}
          </div>
          <div className="nintendo-status-text">
            {getStatusText()}
          </div>
        </div>

        {/* Current Task Display */}
        {currentTask && (
          <div className="nintendo-task-section">
            <div className="nintendo-task-label">CURRENT TASK:</div>
            <div className="nintendo-task-display">
              <div className="nintendo-task-text">
                {currentTask}
              </div>
            </div>
          </div>
        )}

        {/* Session Info */}
        <div className="nintendo-info-section">
          {fixAttempts > 0 && (
            <div className="nintendo-fix-counter">
              <div className="nintendo-counter-label">FIXES:</div>
              <div className="nintendo-counter-display">
                {Array.from({length: 2}, (_, i) => (
                  <div 
                    key={i} 
                    className={`nintendo-counter-dot ${
                      i < fixAttempts ? 'nintendo-dot-filled' : 'nintendo-dot-empty'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          )}
          
          <div className="nintendo-session-indicator">
            <div className={`nintendo-session-status ${
              sessionActive ? 'nintendo-session-active' : 'nintendo-session-idle'
            }`}>
              {sessionActive ? '🟢 ACTIVE' : '⚫ STANDBY'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};