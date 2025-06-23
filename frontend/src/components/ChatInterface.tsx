'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Send, RotateCcw } from 'lucide-react';

interface ChatInterfaceProps {
  onStartTask: (task: string) => void;
  disabled: boolean;
  onReset: () => void;
  taskStatus: string;
}

interface FunctionResponse {
  result: any;
}

interface FunctionCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

interface EventContentPart {
  text?: string;
  functionResponse?: FunctionResponse;
  functionCall?: FunctionCall;
}

interface EventContent {
  parts: EventContentPart[];
}

interface AgentResponse {
  author: string;
  content: EventContent;
  timestamp: number;
  errorCode?: string;
}

interface Message {
  text: string;
  isUser: boolean;
  timestamp: number;
  type?: 'activity' | 'summary' | 'error' | 'code';
}

const quickTasks = [
  "Create a login system",
  "Build a todo app", 
  "Design a REST API",
  "Implement user authentication",
  "Create a dashboard",
  "Build a chat feature"
];

const AGENT_ICONS = {
  root_agent: '☕',
  planner_agent: '📋',
  coder_agent: '💻',
  tester_agent: '🧪',
  fixer_agent: '🔧'
};

function parseSSE(buffer: string): { events: string[], remaining: string } {
  const events: string[] = [];
  let currentIndex = 0;
  
  while (true) {
    const eventStart = buffer.indexOf('data: ', currentIndex);
    if (eventStart === -1) break;
    
    const eventEnd = buffer.indexOf('\n\n', eventStart);
    if (eventEnd === -1) break;
    
    const eventData = buffer.substring(eventStart + 6, eventEnd).trim();
    events.push(eventData);
    currentIndex = eventEnd + 2;
  }
  
  return {
    events,
    remaining: buffer.substring(currentIndex)
  };
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onStartTask, 
  disabled, 
  onReset, 
  taskStatus 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Hey there! I'm root agent, your SDLC team orchestrator! What would you like the team to build today?", 
      isUser: false, 
      timestamp: Date.now() 
    }
  ]);
  
  const [isAgentLoopActive, setIsAgentLoopActive] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [errorCount, setErrorCount] = useState(0);
  const [completionStatus, setCompletionStatus] = useState<'running' | 'completed' | 'error' | 'idle'>('idle');

  const addMessage = useCallback((message: Omit<Message, 'timestamp'>) => {
    setMessages(prev => [...prev, { ...message, timestamp: Date.now() }]);
  }, []);

  const processAgentEvent = useCallback((event: AgentResponse) => {
    const { author, content, errorCode } = event;
    
    if (errorCode) {
      addMessage({
        text: `⚠️ ${author}: ${errorCode}`,
        isUser: false,
        type: 'error'
      });
      setErrorCount(prev => prev + 1);
      return;
    }

    setCurrentAgent(author);

    content.parts.forEach((part) => {
      // Handle text responses
      if (part.text) {
        addMessage({
          text: `[${author}]: ${part.text}`,
          isUser: false,
          type: 'summary'
        });
      }
      
      // Handle function responses
      if (part.functionResponse) {
        const { result } = part.functionResponse;
        
        if (result === null) {
          addMessage({
            text: `❌ [${author}]: Tool execution failed`,
            isUser: false,
            type: 'error'
          });
        } else if (typeof result === 'string') {
          if (author === 'coder_agent' || author === 'fixer_agent') {
            setGeneratedCode(result);
            localStorage.setItem("generatedCode", result);
            addMessage({
              text: `💾 [${author}]: Code generated`,
              isUser: false,
              type: 'code'
            });
          }
        }
      }
      
      // Handle function calls
      if (part.functionCall) {
        const { name, args } = part.functionCall;
        const actionText = name === 'transfer_to_agent' 
          ? `Delegating to ${args.agent_name}`
          : `Calling tool: ${name}`;
        
        addMessage({
          text: `⚡ [${author}]: ${actionText}`,
          isUser: false,
          type: 'activity'
        });
      }
    });
  }, [addMessage]);

  const handleSubmit = async (task: string) => {
    if (!task.trim() || disabled || isAgentLoopActive) return;

    // Reset state
    setIsAgentLoopActive(true);
    setCompletionStatus('running');
    setCurrentAgent('root_agent');
    setGeneratedCode('');
    setErrorCount(0);

    addMessage({ text: task, isUser: true });
    setInputValue('');
    onStartTask(task);

    try {
      const res = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: task })
      });
      
      if (!res.ok) throw new Error('API request failed');
      
      const { messages: agentMessages } = await res.json();
      setMessages(prev => [
        ...prev,
        ...agentMessages.map((msg: any) => ({
          text: msg.text,
          isUser: false,
          timestamp: Date.now()
        }))
      ]);
    } catch (err) {
      const error = err as Error;
      addMessage({
        text: `❌ ${error.message}`,
        isUser: false,
        type: 'error'
      });
      setCompletionStatus('error');
    } finally {
      setIsAgentLoopActive(false);
    }
  };

  const handleQuickTask = (task: string) => {
    handleSubmit(task);
  };

  const getMessageIcon = (message: Message) => {
    if (message.isUser) return '👤';
    switch (message.type) {
      case 'activity': return '⚡';
      case 'summary': return '💬';
      case 'error': return '❌';
      case 'code': return '💻';
      default: return '🤖';
    }
  };

  return (
    <div className="nintendo-chat-container">
      {/* Header */}
      <div className="nintendo-chat-header">
        <div className="nintendo-manager-avatar">
          <div className="nintendo-avatar-sprite">
            {AGENT_ICONS[currentAgent as keyof typeof AGENT_ICONS] || '🤖'}
          </div>
          <div className={`nintendo-avatar-status ${
            isAgentLoopActive ? 'nintendo-status-busy' : 'nintendo-status-ready'
          }`}></div>
        </div>
        <div className="nintendo-chat-info">
          <div className="nintendo-chat-name">
            {currentAgent ? `${currentAgent.replace('_', ' ')}` : 'root agent - Root Agent'}
          </div>
          <div className="nintendo-chat-status">
            {isAgentLoopActive ? 'Agents working...' : 'Ready to orchestrate!'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="nintendo-chat-messages">
        <div className="nintendo-message-scroll">
          {messages.map((message, index) => (
            <div key={index} className={`nintendo-message ${
              message.isUser ? 'nintendo-message-user' : `nintendo-message-${message.type || 'system'}`
            }`}>
              <div className="nintendo-message-bubble">
                <div className="nintendo-message-icon">
                  {getMessageIcon(message)}
                </div>
                <div className="nintendo-message-text">
                  {message.text}
                </div>
              </div>
            </div>
          ))}
          
          {isAgentLoopActive && (
            <div className="nintendo-activity-indicator">
              <div className="nintendo-loading-dots">
                <span></span><span></span><span></span>
              </div>
              <span>{currentAgent} is working...</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="nintendo-status-bar">
        {generatedCode && <span className="status-item">💾 Code Ready</span>}
        {errorCount > 0 && <span className="status-item error">❌ {errorCount} Errors</span>}
      </div>

      {/* Quick Tasks */}
      <div className="nintendo-quick-tasks">
        <div className="nintendo-quick-tasks-grid">
          {quickTasks.map((task) => (
            <button
              key={task}
              onClick={() => handleQuickTask(task)}
              disabled={disabled || isAgentLoopActive}
              className="nintendo-quick-task-button"
            >
              {task}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="nintendo-input-area">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(inputValue)}
          placeholder={isAgentLoopActive ? "Agents are working..." : "Describe your task..."}
          disabled={disabled || isAgentLoopActive}
          className="nintendo-text-input"
        />
        <div className="nintendo-input-buttons">
          <button
            onClick={() => handleSubmit(inputValue)}
            disabled={disabled || !inputValue.trim() || isAgentLoopActive}
            className="nintendo-action-button"
          >
            <Send size={12} />
          </button>
          <button
            onClick={onReset}
            className="nintendo-action-button"
            disabled={isAgentLoopActive}
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
