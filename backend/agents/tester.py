from typing import Dict, Any
from .base_agent import BaseAgent
from google.adk import AgentContext

class TesterAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="tester",
            description="Meticulous QA Inspector - Creates and runs comprehensive tests"
        )
        
        self.prompt = """You are an expert software tester. 
            Create comprehensive test cases for the following code:
            
            Code: {code}
            
            Please:
            1. Identify all testable functions and components
            2. Create unit tests for each component
            3. Include edge cases and error conditions
            4. Verify all requirements are met
            5. Document test results
            
            Return the test results in JSON format with clear sections."""

    async def process(self, context: AgentContext) -> Dict[str, Any]:
        self.status = "working"
        try:
            code = context.input.get("code")
            if not code:
                raise ValueError("code is required")
                
            prompt = self.prompt.format(code=code)
            logger.info(f"Generating tests for code: {code[:50]}...")
            response = await self.model.generate_text(prompt)
            
            # Ensure we return a dictionary with proper status
            if isinstance(response, str):
                # If we get a string response, create a dictionary
                return {
                    "status": "success",
                    "results": response
                }
            
            # If we already have a dictionary, ensure it has the right structure
            if not isinstance(response, dict):
                raise ValueError("Invalid response format")
                
            # Ensure status is set
            if "status" not in response:
                response["status"] = "success"
            
            self.status = response["status"]
            return response
        except Exception as e:
            logger.error(f"Error in tester process: {str(e)}")
            self.status = "failure"
            raise e
