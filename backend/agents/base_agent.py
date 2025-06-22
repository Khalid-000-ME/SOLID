from typing import Dict, Any, Optional
from google.adk import BaseAgent
from google.adk.models import LiteLlm
import os
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class BaseAgent:
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        
        # Log API key configuration
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY environment variable not found")
            raise ValueError("GEMINI_API_KEY environment variable not found")
        
        try:
            # Initialize LiteLlm model
            self.model = LiteLlm(api_key=api_key, model_name='gemini-2.0-flash')
            self.status = "idle"
        except Exception as e:
            logger.error(f"Failed to initialize model: {str(e)}")
            raise

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process input data and return results."""
        raise NotImplementedError("This method should be implemented by subclasses")

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "status": self.status
        }

    async def generate_response(self, prompt: str, context: Dict[str, Any] = None) -> str:
        """Generate response using Gemini model."""
        try:
            logger.info(f"Generating response for prompt: {prompt[:100]}...")
            logger.info(f"Context: {context}")
            
            # Prepare the prompt
            full_prompt = f"{context}\n\n{prompt}" if context else prompt
            
            # Get the chat object from the model
            chat = self.model
            logger.info("Got chat object")
            
            # Send the message
            response = chat.generate_text(full_prompt)
            logger.info("Message sent")
            
            # Get the text from the response
            if hasattr(response, 'text'):
                text = response.text()
                logger.info(f"Got response text: {text[:100]}...")
                return text
            
            logger.error("Response object does not have text attribute")
            raise ValueError("Invalid response format from Gemini API")
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            logger.error(f"Full error: {str(e)}")
            raise
