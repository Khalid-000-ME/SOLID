'use client';

import React from 'react';
import { AgentCard } from './AgentCard';
import { Agent, TaskStatus } from './MultiAgentSDLC';

interface AgentCircleProps {
  agents: Agent[];
  taskStatus: TaskStatus;
}

export const AgentCircle: React.FC<AgentCircleProps> = ({ agents, taskStatus }) => {
  const getAgentPosition = (index: number) => {
    const angle = (index * 90) - 45; // Start from top-right, go clockwise
    const radius = 120;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    return { x, y };
  };

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Central Hub */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 
                      rounded-lg border-4 border-white pixel-border
                      flex items-center justify-center">
        <div className="text-2xl animate-spin-slow">⚡</div>
      </div>

      {/* Task Flow Lines */}
      {taskStatus !== 'idle' && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
             refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#22d3ee" />
            </marker>
          </defs>
          
          {/* Flow lines between agents */}
          <g className="animate-pulse">
            {/* Planner to Coder */}
            <line x1="240" y1="100" x2="240" y2="160" 
                  stroke="#22d3ee" strokeWidth="3" strokeDasharray="5,5"
                  markerEnd="url(#arrowhead)" />
            
            {/* Coder to Tester */}
            <line x1="240" y1="200" x2="140" y2="260" 
                  stroke="#22d3ee" strokeWidth="3" strokeDasharray="5,5"
                  markerEnd="url(#arrowhead)" />
            
            {/* Tester to Fixer (if fixing) */}
            {(taskStatus === 'fixing') && (
              <line x1="100" y1="240" x2="100" y2="160" 
                    stroke="#f59e0b" strokeWidth="3" strokeDasharray="5,5"
                    markerEnd="url(#arrowhead)" />
            )}
            
            {/* Fixer back to Tester (if fixing) */}
            {(taskStatus === 'fixing') && (
              <line x1="120" y1="140" x2="120" y2="220" 
                    stroke="#10b981" strokeWidth="3" strokeDasharray="5,5"
                    markerEnd="url(#arrowhead)" />
            )}
          </g>
        </svg>
      )}

      {/* Agent Cards */}
      {agents.map((agent, index) => {
        const position = getAgentPosition(index);
        return (
          <div
            key={agent.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `calc(50% + ${position.x}px)`,
              top: `calc(50% + ${position.y}px)`,
            }}
          >
            <AgentCard agent={agent} />
          </div>
        );
      })}
    </div>
  );
};