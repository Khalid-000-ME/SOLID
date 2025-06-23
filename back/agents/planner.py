from typing import Dict, Any
from .base_agent import BaseAgent
from google.adk import AgentContext
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PlannerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="planner",
            description="Strategic Architect - Creates comprehensive implementation plans"
        )
        
        self.prompt = """You are an expert software architect. 
            Create a detailed implementation plan for the following task:
            
            Task: {task_description}
            
            The plan should include:
            1. A clear problem statement
            2. A detailed solution approach
            3. Required functions and their parameters
            4. Any edge cases to consider
            5. Outline testing requirements
            
            Return the plan in JSON format with clear sections."""

    async def process(self, context: AgentContext) -> Dict[str, Any]:
        """Process the task description and create a plan."""
        task_description = context.input.get("task_description")
        if not task_description:
            raise ValueError("task_description is required")
            
        # Get the plan as a string
        plan_str = await self.create_plan(task_description)
        
        # Return as a dictionary
        return {
            "plan": plan_str
        }

    async def create_plan(self, task_description: str) -> str:
        """Create a detailed implementation plan for a task."""
        self.status = "working"
        try:
            logger.info(f"Generating plan for task: {task_description[:50]}...")
            prompt = self.prompt.format(task_description=task_description)
            logger.info(f"Prompt: {prompt[:100]}...")
            response = await self.model.generate_text(prompt)
            logger.info(f"Got response: {response[:100]}...")
            self.status = "success"
            return response
        except Exception as e:
            logger.error(f"Error in create_plan: {str(e)}")
            self.status = "failure"
            raise e
