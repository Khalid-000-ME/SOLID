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
    <div className="nintendo-ds-bg relative overflow-hidden">
      {/* Nintendo DS Style Background Pattern */}
      <div className="absolute inset-0 nintendo-grid-pattern opacity-10"></div>

      {/* Floating Pixel Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="nintendo-pixel-float nintendo-pixel-yellow"
          style={{ top: "10%", left: "5%" }}
        ></div>
        <div
          className="nintendo-pixel-float nintendo-pixel-cyan"
          style={{ top: "20%", right: "8%" }}
        ></div>
        <div
          className="nintendo-pixel-float nintendo-pixel-pink"
          style={{ bottom: "25%", left: "12%" }}
        ></div>
        <div
          className="nintendo-pixel-float nintendo-pixel-green"
          style={{ bottom: "15%", right: "6%" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 p-4 flex flex-col items-center">
        <div className="mb-8">
          <div className="nintendo-title-card mx-auto mb-4 text-center">
            <div className="nintendo-title-text">🤖 MULTI-AGENT SDLC</div>
            <div className="nintendo-subtitle-text">
              Automated Development Team Simulator
            </div>
          </div>
        </div>

        

        {/* Nintendo DS Style Status Bar */}
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <StatusBar
              taskStatus={taskStatus}
              currentTask={currentTask}
              fixAttempts={fixAttempts}
              sessionActive={sessionActive}
            />
          </div>
        </div>

        {/* Nintendo DS Dual Screen Layout */}
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <div className="nintendo-dual-screen-container">
              {/* Top Screen - Agent Circle */}
              <div className="nintendo-screen nintendo-top-screen px-4">
                <div className="nintendo-screen-header">
                  <div className="nintendo-screen-title">AGENT WORKSPACE</div>
                  <div className="nintendo-screen-status">
                    {sessionActive ? "🟢 ACTIVE" : "⚫ STANDBY"}
                  </div>
                </div>
                <div className="nintendo-screen-content">
                  <AgentCircle agents={agents} taskStatus={taskStatus} />
                </div>
              </div>

              {/* Bottom Screen - Chat Interface */}
              <div className="nintendo-screen nintendo-bottom-screen px-4">
                <div className="nintendo-screen-header">
                  <div className="nintendo-screen-title">COMMAND CENTER</div>
                  <div className="nintendo-screen-status">
                    {currentTask ? "📝 TASK ACTIVE" : "💬 READY"}
                  </div>
                </div>
                <div className="nintendo-screen-content">
                  <ChatInterface
                    onStartTask={startWorkflow}
                    disabled={sessionActive}
                    onReset={resetWorkflow}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nintendo DS Style Workflow Panel */}
        <div className="flex justify-center mt-8">
          <div className="w-full max-w-3xl">
            <div className="nintendo-workflow-panel">
              <WorkflowVisualization
                taskStatus={taskStatus}
                fixAttempts={fixAttempts}
                agents={agents}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
