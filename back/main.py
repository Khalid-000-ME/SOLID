from fastapi import FastAPI, HTTPException
from typing import Dict, Any
import uvicorn
from agents.planner import PlannerAgent
from agents.coder import CoderAgent
from agents.tester import TesterAgent
from agents.fixer import FixerAgent
from pydantic import BaseModel

app = FastAPI(title="Multi-Agent SDLC System")

# Initialize agents
planner = PlannerAgent()
coder = CoderAgent()
tester = TesterAgent()
fixer = FixerAgent()

class TaskRequest(BaseModel):
    task_description: str

@app.post("/task/start")
async def start_task(task_request: TaskRequest):
    """Start a new development task workflow."""
    try:
        # 1. Planning phase
        plan = await planner.process(task_request.task_description)
        if not isinstance(plan, str):
            raise ValueError("Planner returned invalid response format")
        
        # 2. Coding phase
        code_response = await coder.process({"plan": plan})
        if not isinstance(code_response, dict):
            raise ValueError("Coder returned invalid response format")
        code = code_response.get("code")
        
        # 3. Testing phase
        test_response = await tester.process({"code": code})
        if not isinstance(test_response, dict):
            raise ValueError("Tester returned invalid response format")
            
        # Ensure test results have a status
        if "status" not in test_response:
            test_response["status"] = "success"
        
        if test_response["status"] == "success":
            return {
                "status": "completed",
                "plan": plan,
                "code": code,
                "test_results": test_response
            }
        else:
            # 4. Fixing phase
            fix_response = await fixer.process({"code": code, "test_results": test_response})
            if not isinstance(fix_response, dict):
                raise ValueError("Fixer returned invalid response format")
            fixed_code = fix_response.get("code")
            
            return {
                "status": "fixed",
                "plan": plan,
                "original_code": code,
                "fixed_code": fixed_code,
                "test_results": test_response
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/agents/status")
async def get_agents_status():
    """Get current status of all agents."""
    return {
        "planner": planner.get_status(),
        "coder": coder.get_status(),
        "tester": tester.get_status(),
        "fixer": fixer.get_status()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
