from .planner import planner_agent
from .coder import coder_agent
from .tester import tester_agent
from .fixer import fixer_agent
from google.adk.agents import Agent
    
root_agent = Agent(
    name="root_agent",
    model="gemini-2.0-flash",
    sub_agents=[planner_agent, coder_agent, tester_agent, fixer_agent],
    instruction="Orchestrates the full software development pipeline.",
)