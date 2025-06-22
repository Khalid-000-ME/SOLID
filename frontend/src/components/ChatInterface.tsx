'use client';

import React, { useState } from 'react';
import { Send, RotateCcw } from 'lucide-react';

interface ChatInterfaceProps {
  onStartTask: (task: string) => void;
  disabled: boolean;
  onReset: () => void;
}

const quickTasks = [
  "Create a login system",
  "Build a todo app", 
  "Design a REST API",
  "Implement user authentication",
  "Create a dashboard",
  "Build a chat feature"
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onStartTask, disabled, onReset }) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([
    { text: "Hey there! I'm Max, your Overcaffeinated Manager! ☕ What would you like the team to build today?", isUser: false }
  ]);

  const handleSubmit = (task: string) => {
    if (!task.trim() || disabled) return;

    setMessages(prev => [...prev, 
      { text: task, isUser: true },
      { text: "Got it! Let me rally the team and get this started! 🚀", isUser: false }
    ]);
    
    setInputValue('');
    onStartTask(task);
  };

  const handleQuickTask = (task: string) => {
    handleSubmit(task);
  };

  return (
    <div className="nintendo-chat-container">
      {/* Nintendo DS Style Chat Header */}
      <div className="nintendo-chat-header">
        <div className="nintendo-manager-avatar">
          <div className="nintendo-avatar-sprite">☕</div>
          <div className="nintendo-avatar-status nintendo-status-ready"></div>
        </div>
        <div className="nintendo-chat-info">
          <div className="nintendo-chat-name">Max - Team Manager</div>
          <div className="nintendo-chat-status">Ready to orchestrate!</div>
        </div>
        <div className="nintendo-chat-signal">
          <div className="nintendo-signal-bar"></div>
          <div className="nintendo-signal-bar"></div>
          <div className="nintendo-signal-bar"></div>
        </div>
      </div>

      {/* Nintendo DS Style Chat Messages */}
      <div className="nintendo-chat-messages">
        <div className="nintendo-message-scroll">
          {messages.map((message, index) => (
            <div key={index} className={`nintendo-message ${
              message.isUser ? 'nintendo-message-user' : 'nintendo-message-system'
            }`}>
              <div className="nintendo-message-bubble">
                <div className="nintendo-message-text">
                  {message.text}
                </div>
                <div className="nintendo-message-tail"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nintendo DS Style Quick Tasks */}
      <div className="nintendo-quick-tasks">
        <div className="nintendo-quick-tasks-header">
          <div className="nintendo-quick-tasks-title">QUICK TASKS</div>
        </div>
        <div className="nintendo-quick-tasks-grid">
          {quickTasks.map((task, index) => (
            <button
              key={task}
              onClick={() => handleQuickTask(task)}
              disabled={disabled}
              className="nintendo-quick-task-button"
            >
              <div className="nintendo-button-content">
                <div className="nintendo-button-icon">⚡</div>
                <div className="nintendo-button-text">{task}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Nintendo DS Style Input Area */}
      <div className="nintendo-input-area">
        <div className="nintendo-input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(inputValue)}
            placeholder="Describe your task..."
            disabled={disabled}
            className="nintendo-text-input"
          />
          <div className="nintendo-input-buttons">
            <button
              onClick={() => handleSubmit(inputValue)}
              disabled={disabled || !inputValue.trim()}
              className="nintendo-action-button nintendo-send-button"
            >
              <Send size={12} />
            </button>
            <button
              onClick={onReset}
              className="nintendo-action-button nintendo-reset-button"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};