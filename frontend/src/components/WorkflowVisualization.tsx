'use client';

import React from 'react';
import { TaskStatus, Agent } from './MultiAgentSDLC';

interface WorkflowVisualizationProps {
  taskStatus: TaskStatus;
  fixAttempts: number;
  agents: Agent[];
  sessionActive: boolean;
  currentTask: string;
}

const statusSteps = [
  { id: 'planning', label: 'Planning', icon: '📋', agent: 'planner' },
  { id: 'coding', label: 'Coding', icon: '💻', agent: 'coder' },
  { id: 'testing', label: 'Testing', icon: '🧪', agent: 'tester' },
  { id: 'fixing', label: 'Fixing', icon: '🔧', agent: 'fixer' },
];

export const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ 
  taskStatus, 
  fixAttempts,
  agents,
  sessionActive,
  currentTask
}) => {
  const getStepStatus = (stepId: string) => {
    const stepOrder = ['planning', 'coding', 'testing', 'fixing'];
    const currentIndex = stepOrder.indexOf(taskStatus);
    const stepIndex = stepOrder.indexOf(stepId);

    if (taskStatus === 'completed') {
      return stepIndex <= 2 ? 'completed' : 'skipped';
    }
    
    if (taskStatus === 'failed') {
      return stepIndex <= 3 ? 'completed' : 'pending';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'pending': return 'bg-gray-600';
      case 'skipped': return 'bg-gray-500';
      default: return 'bg-gray-600';
    }
  };

  if (taskStatus === 'idle') {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-xs">
          READY TO START! CHOOSE A TASK TO BEGIN.
        </div>
      </div>
    );
  }
  
  return (
    <div className="font-['Press_Start_2P']">
      {/* Current Task Display */}
      {currentTask && (
        <div className="mb-4 p-3 bg-black/30 border border-white/10 rounded">
          <div className="text-xs text-white/70 mb-1">CURRENT TASK</div>
          <div className="text-white text-sm truncate">{currentTask}</div>
        </div>
      )}
      
      {/* Workflow Steps */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10"></div>
        
        <div className="space-y-6">
          {statusSteps.map((step) => {
            const status = getStepStatus(step.id);
            const color = getStepColor(status);
            const agent = agents.find(a => a.id === step.agent);
            const isActive = agent?.isActive;
            
            return (
              <div 
                key={step.id} 
                className={`relative flex items-start group ${status === 'skipped' ? 'opacity-50' : ''}`}
              >
                {/* Step Connector */}
                <div className="absolute left-4 top-6 bottom-0 w-0.5 bg-white/10"></div>
                
                {/* Step Indicator */}
                <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 border-white/20 bg-black/50 mr-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${color} transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
                    {step.icon}
                  </div>
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
                  )}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xs ${isActive ? 'text-white' : 'text-white/70'} uppercase tracking-wider`}>
                      {step.label}
                    </h3>
                    {status === 'completed' && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-1 text-xs text-white/50">
                    {agent?.name} • {agent?.title}
                  </div>
                  
                  {isActive && agent?.status === 'working' && (
                    <div className="mt-2 text-xs text-blue-400 flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1.5 animate-pulse"></span>
                      IN PROGRESS...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Status Message */}
      <div className="mt-6 p-4 rounded border border-white/10 bg-gradient-to-r from-black/30 to-black/10">
        {taskStatus === 'completed' ? (
          <div className="text-green-400 text-xs flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2"></span>
            TASK COMPLETED SUCCESSFULLY!
          </div>
        ) : taskStatus === 'failed' ? (
          <div className="text-red-400 text-xs">
            <div className="flex items-center mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-2"></span>
              TASK FAILED AFTER {fixAttempts} ATTEMPT{fixAttempts !== 1 ? 'S' : ''}
            </div>
            <div className="text-white/50 text-xs mt-1">
              THE FIXER WILL ATTEMPT TO RESOLVE THE ISSUES...
            </div>
          </div>
        ) : (
          <div className="text-white/70 text-xs">
            {sessionActive ? (
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
                WORKFLOW IN PROGRESS...
              </div>
            ) : (
              'AWAITING TASK...'
            )}
          </div>
        )}
      </div>
      
      {/* Agent Status Grid */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {agents.map((agent) => (
          <div 
            key={agent.id} 
            className={`p-3 rounded border-2 ${agent.isActive ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/10'} transition-all`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-lg mr-2">
                {agent.id === 'planner' && '📝'}
                {agent.id === 'coder' && '💻'}
                {agent.id === 'tester' && '🧪'}
                {agent.id === 'fixer' && '🔧'}
              </div>
              <div>
                <div className="text-white text-xs">{agent.name}</div>
                <div className="text-white/50 text-[10px] uppercase">{agent.title}</div>
              </div>
              <div className="ml-auto">
                {agent.status === 'working' && (
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                )}
                {agent.status === 'success' && (
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                )}
                {agent.status === 'failure' && (
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                )}
                {agent.status === 'idle' && (
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};