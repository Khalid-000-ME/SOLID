from typing import Dict, Any
from .base_agent import BaseAgent

class FixerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="fixer",
            description="Resourceful Intern - Fixes bugs and improves code quality"
        )
        
        self.prompt = """You are an expert bug fixer and code improver. 
            The following code has failed some tests:
            
            Code: {code}
            
            Test Results: {test_results}
            
            Please:
            1. Identify the issues based on test results
            2. Fix the bugs
            3. Improve code quality
            4. Add necessary comments
            5. Ensure all requirements are met
            
            Return the fixed code in JSON format with clear sections."""

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        self.status = "working"
        try:
            code = input_data.get("code")
            test_results = input_data.get("test_results")
            
            if not code or not test_results:
                raise ValueError("Both code and test_results are required")
                
            context = {
                "code": code,
                "test_results": test_results
            }
            prompt = self.prompt.format(**context)
            response = await self.generate_response(prompt)
            
            # Ensure we return a dictionary with the fixed code
            if isinstance(response, str):
                return {"code": response}
            
            self.status = "success"
            return response
        except Exception as e:
            logger.error(f"Error in fixer process: {str(e)}")
            self.status = "failure"
            raise e
