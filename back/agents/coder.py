from typing import Dict, Any
from .base_agent import BaseAgent
from google.adk import AgentContext

class CoderAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="coder",
            description="Focused Developer - Implements code according to specifications"
        )
        
        self.prompt = """You are an expert software developer. 
            Implement the code according to the following plan:
            
            Plan: {plan}
            
            Please:
            1. Write clean, well-documented code
            2. Follow best practices
            3. Include error handling
            4. Add appropriate comments
            5. Structure the code for maintainability
            
            Return the complete implementation in JSON format with clear sections."""

    async def process(self, context: AgentContext) -> Dict[str, Any]:
        self.status = "working"
        try:
            plan = context.input.get("plan")
            if not plan:
                raise ValueError("plan is required")
                
            prompt = self.prompt.format(plan=plan)
            logger.info(f"Generating code for plan: {plan[:50]}...")
            response = await self.model.generate_text(prompt)
            
            # Ensure we return a dictionary with the code
            if isinstance(response, str):
                return {"code": response}
            
            self.status = "success"
            return response
        except Exception as e:
            logger.error(f"Error in coder process: {str(e)}")
            self.status = "failure"
            raise e
