"use client";

import React, { useState, useEffect } from "react";
import { AgentCircle } from "./AgentCircle";
import { ChatInterface } from "./ChatInterface";
import { WorkflowVisualization } from "./WorkflowVisualization";
import { StatusBar } from "./StatusBar";

export type AgentType = "planner" | "coder" | "tester" | "fixer";
export type AgentStatus =
  | "idle"
  | "working"
  | "success"
  | "failure"
  | "waiting";
export type TaskStatus =
  | "idle"
  | "planning"
  | "coding"
  | "testing"
  | "fixing"
  | "completed"
  | "failed";

export interface Agent {
  id: AgentType;
  name: string;
  title: string;
  status: AgentStatus;
  isActive: boolean;
}

export const MultiAgentSDLC: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "planner",
      name: "Max",
      title: "Overcaffeinated Manager",
      status: "idle",
      isActive: false,
    },
    {
      id: "coder",
      name: "Alex",
      title: "Focused Developer",
      status: "idle",
      isActive: false,
    },
    {
      id: "tester",
      name: "Sam",
      title: "Meticulous QA Inspector",
      status: "idle",
      isActive: false,
    },
    {
      id: "fixer",
      name: "Riley",
      title: "Resourceful Intern",
      status: "idle",
      isActive: false,
    },
  ]);

  const [taskStatus, setTaskStatus] = useState<TaskStatus>("idle");
  const [currentTask, setCurrentTask] = useState<string>("");
  const [fixAttempts, setFixAttempts] = useState<number>(0);
  const [sessionActive, setSessionActive] = useState<boolean>(false);

  const updateAgentStatus = (
    agentId: AgentType,
    status: AgentStatus,
    isActive: boolean,
  ) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId
          ? { ...agent, status, isActive }
          : { ...agent, isActive: false },
      ),
    );
  };

  const resetAllAgents = () => {
    setAgents((prev) =>
      prev.map((agent) => ({
        ...agent,
        status: "idle" as AgentStatus,
        isActive: false,
      })),
    );
  };

  const startWorkflow = async (task: string) => {
    setCurrentTask(task);
    setTaskStatus("planning");
    setSessionActive(true);
    setFixAttempts(0);

    // Planning phase
    updateAgentStatus("planner", "working", true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    updateAgentStatus("planner", "success", false);

    // Coding phase
    setTaskStatus("coding");
    updateAgentStatus("coder", "working", true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    updateAgentStatus("coder", "success", false);

    // Testing phase
    setTaskStatus("testing");
    updateAgentStatus("tester", "working", true);
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Random pass/fail for demonstration
    const testPassed = Math.random() > 0.4;

    if (testPassed) {
      updateAgentStatus("tester", "success", false);
      setTaskStatus("completed");
      setSessionActive(false);
    } else {
      updateAgentStatus("tester", "failure", false);
      startFixingLoop();
    }
  };

  const startFixingLoop = async () => {
    if (fixAttempts >= 2) {
      setTaskStatus("failed");
      setSessionActive(false);
      return;
    }

    setTaskStatus("fixing");
    setFixAttempts((prev) => prev + 1);

    // Fixing phase
    updateAgentStatus("fixer", "working", true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    updateAgentStatus("fixer", "success", false);

    // Re-testing phase
    setTaskStatus("testing");
    updateAgentStatus("tester", "working", true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Random pass/fail for re-test
    const retestPassed = Math.random() > 0.3;

    if (retestPassed) {
      updateAgentStatus("tester", "success", false);
      setTaskStatus("completed");
      setSessionActive(false);
    } else {
      updateAgentStatus("tester", "failure", false);
      startFixingLoop();
    }
  };

  const resetWorkflow = () => {
    setTaskStatus("idle");
    setCurrentTask("");
    setFixAttempts(0);
    setSessionActive(false);
    resetAllAgents();
  };

  return (
    <div className="relative">
      {/* Main Container */}
      <div className="relative z-10">
        {/* Status Bar */}
        <div className="mb-6">
          <StatusBar
            taskStatus={taskStatus}
            currentTask={currentTask}
            fixAttempts={fixAttempts}
            sessionActive={sessionActive}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Workspace */}
          <div className="bg-black/50 border-2 border-white/20 rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1">
              <div className="bg-black/90 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-sm font-['Press_Start_2P']">AGENT WORKSPACE</h2>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-['Press_Start_2P'] bg-blue-900/50 text-blue-300">
                    {sessionActive ? '🟢 ACTIVE' : '⚫ STANDBY'}
                  </span>
                </div>
                <AgentCircle agents={agents} taskStatus={taskStatus} />
              </div>
            </div>
          </div>

          {/* Command Center */}
          <div className="bg-black/50 border-2 border-white/20 rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1">
              <div className="bg-black/90 p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-sm font-['Press_Start_2P']">COMMAND CENTER</h2>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-['Press_Start_2P'] bg-purple-900/50 text-purple-300">
                    {currentTask ? '📝 TASK ACTIVE' : '💬 READY'}
                  </span>
                </div>
                <ChatInterface
                  onStartTask={startWorkflow}
                  disabled={sessionActive}
                  onReset={resetWorkflow}
                  taskStatus={taskStatus}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Visualization */}
        <div className="mt-6 bg-black/50 border-2 border-white/20 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-pink-600 to-red-600 p-1">
            <div className="bg-black/90 p-4">
              <h2 className="text-white text-sm font-['Press_Start_2P'] mb-4">WORKFLOW VISUALIZATION</h2>
              <WorkflowVisualization 
                taskStatus={taskStatus} 
                agents={agents} 
                fixAttempts={fixAttempts}
                sessionActive={sessionActive}
                currentTask={currentTask}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-5"></div>
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/20 rounded-full filter blur-3xl"></div>
      </div>
    </div>
  );
};
