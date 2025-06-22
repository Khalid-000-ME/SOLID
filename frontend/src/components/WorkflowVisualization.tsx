'use client';

import React from 'react';
import { TaskStatus, Agent } from './MultiAgentSDLC';

interface WorkflowVisualizationProps {
  taskStatus: TaskStatus;
  fixAttempts: number;
  agents: Agent[];
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
  agents 
}) => {
  const getStepStatus = (stepId: string) => {
    const stepOrder = ['planning', 'coding', 'testing', 'fixing'];
    const currentIndex = stepOrder.indexOf(taskStatus);
    const stepIndex = stepOrder.indexOf(stepId);

    if (taskStatus === 'completed') {
      return stepIndex <= 2 ? 'completed' : 'skipped'; // Skip fixing if completed
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
      case 'completed': return 'bg-green-500 border-green-400';
      case 'active': return 'bg-blue-500 border-blue-400 animate-pulse';
      case 'pending': return 'bg-gray-600 border-gray-500';
      case 'skipped': return 'bg-gray-500 border-gray-400';
      default: return 'bg-gray-600 border-gray-500';
    }
  };

  if (taskStatus === 'idle') {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 pixel-text">
          Ready to start! Choose a task above to begin the workflow.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 pixel-border">
      <h3 className="text-white text-lg font-bold mb-4 pixel-text text-center">
        Workflow Progress
      </h3>

      {/* Status Message */}
      <div className="text-center mb-6">
        {taskStatus === 'completed' && (
          <div className="text-green-400 font-bold pixel-text animate-bounce">
            🎉 Task Completed Successfully! 🎉
          </div>
        )}
        {taskStatus === 'failed' && (
          <div className="text-red-400 font-bold pixel-text animate-pulse">
            ❌ Task Failed After {fixAttempts} Fix Attempts ❌
          </div>
        )}
        {fixAttempts > 0 && taskStatus !== 'completed' && taskStatus !== 'failed' && (
          <div className="text-yellow-400 pixel-text">
            🔄 Fix Attempt: {fixAttempts}/2
          </div>
        )}
      </div>

      {/* Workflow Steps */}
      <div className="flex justify-between items-center mb-6">
        {statusSteps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isActive = taskStatus === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              {/* Step Circle */}
              <div className={`
                w-16 h-16 rounded-full border-4 flex items-center justify-center
                ${getStepColor(status)}
                ${isActive ? 'scale-110' : ''}
                transition-all duration-300
              `}>
                <span className="text-2xl">{step.icon}</span>
              </div>
              
              {/* Step Label */}
              <div className="mt-2 text-center">
                <div className="text-white text-sm font-bold pixel-text">
                  {step.label}
                </div>
              </div>

              {/* Connection Line */}
              {index < statusSteps.length - 1 && (
                <div className="absolute mt-8">
                  <div className={`
                    w-16 h-1 
                    ${status === 'completed' ? 'bg-green-400' : 'bg-gray-600'}
                    transition-colors duration-300
                  `} style={{ marginLeft: '32px' }}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Agent Status Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className={`
            bg-gray-700 rounded-lg p-3 pixel-border text-center
            ${agent.isActive ? 'ring-2 ring-yellow-400' : ''}
            transition-all duration-300
          `}>
            <div className="text-lg mb-1">
              {agent.id === 'planner' && '☕'}
              {agent.id === 'coder' && '🎧'}
              {agent.id === 'tester' && '🔍'}
              {agent.id === 'fixer' && '🔧'}
            </div>
            <div className="text-white text-xs font-bold pixel-text">
              {agent.name}
            </div>
            <div className={`text-xs pixel-text mt-1 ${
              agent.status === 'working' ? 'text-blue-400' :
              agent.status === 'success' ? 'text-green-400' :
              agent.status === 'failure' ? 'text-red-400' :
              'text-gray-400'
            }`}>
              {agent.status === 'working' ? 'Working...' :
               agent.status === 'success' ? 'Success!' :
               agent.status === 'failure' ? 'Failed' :
               'Ready'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};