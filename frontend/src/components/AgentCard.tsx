'use client';

import React from 'react';
import { Agent } from './MultiAgentSDLC';

interface AgentCardProps {
  agent: Agent;
}

const agentSprites = {
  planner: {
    idle: '☕',
    working: '💼',
    success: '✨',
    failure: '😵'
  },
  coder: {
    idle: '🎧',
    working: '⌨️',
    success: '🚀',
    failure: '🐛'
  },
  tester: {
    idle: '🔍',
    working: '🧪',
    success: '✅',
    failure: '❌'
  },
  fixer: {
    idle: '🔧',
    working: '⚡',
    success: '🎯',
    failure: '💥'
  }
};

const agentColors = {
  planner: 'nintendo-orange',
  coder: 'nintendo-blue',
  tester: 'nintendo-green',
  fixer: 'nintendo-purple'
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const getCurrentSprite = () => {
    return agentSprites[agent.id][agent.status] || agentSprites[agent.id].idle;
  };

  const getStatusEffect = () => {
    switch (agent.status) {
      case 'working':
        return 'nintendo-working-animation';
      case 'success':
        return 'nintendo-success-animation';
      case 'failure':
        return 'nintendo-failure-animation';
      default:
        return '';
    }
  };

  return (
    <div className={`nintendo-agent-container ${getStatusEffect()}`}>
      {/* Nintendo DS Style Agent Card */}
      <div className={`nintendo-agent-card nintendo-${agentColors[agent.id]} ${
        agent.isActive ? 'nintendo-active-glow' : ''
      }`}>
        {/* Agent Sprite */}
        <div className="nintendo-agent-sprite">
          <div className="nintendo-sprite-pixel-art">
            {getCurrentSprite()}
          </div>
          
          {/* Working Indicator */}
          {agent.status === 'working' && (
            <div className="nintendo-working-indicator">
              <div className="nintendo-pixel-dot"></div>
              <div className="nintendo-pixel-dot"></div>
              <div className="nintendo-pixel-dot"></div>
            </div>
          )}
        </div>

        {/* Agent Status LED */}
        <div className={`nintendo-status-led nintendo-led-${agent.status}`}></div>

        {/* Active Pulse */}
        {agent.isActive && (
          <div className="nintendo-active-pulse"></div>
        )}
      </div>

      {/* Nintendo DS Style Name Plate */}
      <div className="nintendo-nameplate">
        <div className="nintendo-nameplate-content">
          <div className="nintendo-agent-name">{agent.name}</div>
          <div className="nintendo-agent-title">{agent.title}</div>
        </div>
      </div>

      {/* Status Effects */}
      {agent.status === 'success' && (
        <div className="nintendo-success-sparkles">
          <div className="nintendo-sparkle"></div>
          <div className="nintendo-sparkle"></div>
          <div className="nintendo-sparkle"></div>
        </div>
      )}

      {agent.status === 'failure' && (
        <div className="nintendo-failure-smoke">
          <div className="nintendo-smoke-puff"></div>
        </div>
      )}
    </div>
  );
};