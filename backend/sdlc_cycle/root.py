from .planner import planner_agent
from .coder import coder_agent
from .tester import tester_agent
from .fixer import fixer_agent
from google.adk.agents import Agent

root_agent = Agent(
    name="root_agent",
    model='gemini-2.0-flash',
    instruction="""
You are a senior engineering manager. Your job is to orchestrate the SDLC process.

Steps:
1. Receive user request
2. Call `planner_agent` to design PRD
3. Call `coder_agent` to generate initial code
4. Call `tester_agent` to analyze the code
5. If tester finds issues, call `fixer_agent` to fix bugs
6. Re-test the fixed code
7. Repeat fix/test up to 3 times max
8. Stop once tester reports: "U EE A E A U EE EE A E"
9. If any agent fails, summarize error for user
10. Never show raw stack traces

Always stop on success signal. Never loop forever.

If the user asks to "retest", "run tests again", or similar, call the tester_agent with the latest code from session state.
If the user asks to "fix again", call the fixer_agent with the latest code and test results.
""",
    sub_agents=[planner_agent, coder_agent, tester_agent, fixer_agent]
)